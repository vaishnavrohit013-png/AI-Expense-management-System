import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import Receipt from "../models/receipt.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { Env } from "../config/env.config.js";
import { genAI, genAIModel } from "../config/google-ai.config.js";
import { summaryAnalyticsService, expensePieChartBreakdownService } from "../services/analytics.service.js";
import { getAllTransactionService, createTransactionService } from "../services/transaction.service.js";
import { DateRangeEnum } from "../enums/date-range.enum.js";
import { convertToRupeeUnit, formatCurrency } from "../utils/format-currency.js";
import UserModel from "../models/user.model.js";
import TransactionModel from "../models/transaction.model.js";
import { scanReceiptService } from "../services/transaction.service.js";
import { genAIModels } from "../config/google-ai.config.js";
import BudgetAlertModel from "../models/budget-alert.model.js";
import { updateUserService } from "../services/user.service.js";

// --- 🚀 UNIVERSAL AI FAILOVER UTILITY ---
const MODEL_NAMES = genAIModels;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithFailover = async (prompt, systemInstruction = "") => {
    let lastError;
    const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
    const MAX_RETRIES = 2;
    
    for (let retry = 0; retry <= MAX_RETRIES; retry++) {
        for (let i = 0; i < MODEL_NAMES.length; i++) {
            const modelName = MODEL_NAMES[i];
            try {
                const activeModel = genAI.getGenerativeModel({ 
                    model: modelName,
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                });

                if (retry > 0) console.log(`[AI Retry ${retry}] Attempting with ${modelName}...`);
                else console.log(`[AI Chat] Generating using ${modelName}...`);

                const result = await activeModel.generateContent(fullPrompt);
                const text = result?.response?.text?.();
                if (text && text.length > 0) return text;
                
                throw new Error("Empty response from AI");
            } catch (err) {
                lastError = err;
                const errMsg = err.message?.toLowerCase() || "";
                console.error(`[AI Error] ${modelName} failed (Retry ${retry}):`, err.message);

                if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('capacity')) {
                    if (i === MODEL_NAMES.length - 1) { // Only sleep if it's the last model
                        console.warn(`[AI Failover] Rate limit hit on all models. Waiting...`);
                        await sleep(2000 * (retry + 1));
                    }
                    continue; 
                }
            }
        }
    }

    console.error("[AI Chat] All models failed after retries. Last Error:", lastError?.message);
    throw new Error(`AI is temporarily unavailable. Error: ${lastError?.message || "Service failure"}`);
};

/**
 * Helper for Vision-based AI generation (Receipts).
 */
const generateVisionWithFailover = async (prompt, imagePart) => {
    let lastError;
    for (let i = 0; i < MODEL_NAMES.length; i++) {
        const model = MODEL_NAMES[i];
        if (model === "gemini-pro") continue;
        try {
            console.log(`[AI Vision] Attempt ${i + 1} using ${model}...`);
            const genModel = genAI.getGenerativeModel({ model });
            const result = await genModel.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();
            
            if (text) return text;
        } catch (err) {
            lastError = err;
            const isQuota = err.message?.includes('429') || err.message?.includes('quota');
            if (isQuota) {
                await sleep(2000);
                continue;
            }
            console.warn(`[AI Vision] ${model} failed:`, err.message);
        }
    }
    
    if (lastError?.message?.includes('429') || lastError?.message?.includes('quota')) {
        throw new Error("AI Scanners are currently over capacity. Please try manual entry or wait a moment!");
    }
    throw new Error(`AI Scan Error: ${lastError?.message || "Service failure"}`);
};

/**
 * 🚀 PERFORMANCE CACHE
 */
const aiCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 Minutes

const getCachedAI = (userId, type) => {
    const key = `${userId}_${type}`;
    const cached = aiCache.get(key);
    if (cached && Date.now() < cached.expiry) return cached.data;
    return null;
};

const setCachedAI = (userId, type, data) => {
    const key = `${userId}_${type}`;
    aiCache.set(key, { data, expiry: Date.now() + CACHE_TTL });
};

/**
 * 🛠️ ROBUST INTENT DETECTOR
 */
const detectIntent = (text) => {
    if (!text) return "general_finance_question";
    const msg = String(text).toLowerCase().trim();
    
    // A. Greeting
    if (/^(hi|hello|hey|yo|good morning|good evening|good afternoon)/i.test(msg)) return "greeting";
    
    // B. Casual
    if (/^(ok|okay|hmm|got it|fine|yes|no|sure|undestand|yup|nope)/i.test(msg)) return "casual_reply";
    
    // C. Help
    if (/^(help|what can you do|how to use|features|instruction|commands)/i.test(msg)) return "help";

    // F. Savings
    if (msg.includes("saving") || msg.includes("save")) return "savings_question";

    // D. Spending / Summary (Priority)
    const spendKeywords = ["breakdown", "summary", "category", "spent", "spending", "expense", "chart", "report", "total", "most", "view", "how much", "how many"];
    if (spendKeywords.some(k => msg.includes(k))) {
        if (msg.includes("add") || msg.includes("log") || msg.includes("saved") || msg.includes("added")) return "add_expense"; 
        return "spending_breakdown";
    }
    
    // BALANCE
    if (msg.includes("balance") || msg.includes("how much money") || msg.includes("left")) return "balance_check";

    // I. Navigation
    if (msg.includes("go to") || msg.includes("open") || msg.includes("navigate") || msg.includes("show me") || msg.includes("take me to")) {
        return "navigation_request";
    }

    // E/H. Budget
    if (msg.includes("budget") || msg.includes("monthly limit")) return "budget_update";
    
    // G. Add Transaction
    if (msg.includes("add") || msg.includes("log") || msg.includes("record") || msg.includes("save")) return "add_expense";

    return "general_finance_question";
};

export const chatWithAIController = asyncHandler(async (req, res) => {
    const { message, history } = req.body;
    if (!message) return res.status(HTTPSTATUS.BAD_REQUEST).json({ success: false, message: "No message provided." });

    const userId = req.user?._id;
    const msg = String(message).toLowerCase().trim();
    const intent = detectIntent(msg);

    console.log(`🔍 [AI Chat] User Message: "${message}" | Intent: ${intent}`);

    // --- 1. GATHER CONTEXT DATA (Only when needed) ---
    let contextData = { summary: null, categories: null, budget: 10000 };
    const needsData = ["spending_breakdown", "balance_check", "budget_update", "general_finance_question"].includes(intent);
    
    if (needsData) {
        try {
            const [user, summary, pie] = await Promise.all([
                UserModel.findById(userId).catch(() => null),
                summaryAnalyticsService(userId, DateRangeEnum.THIS_MONTH).catch(() => null),
                expensePieChartBreakdownService(userId, DateRangeEnum.THIS_MONTH).catch(() => null)
            ]);
            contextData = {
                budget: user?.monthlyBudget || 10000,
                summary: summary || { availableBalance: 0, totalIncome: 0, totalExpenses: 0 },
                categories: pie || [] 
            };
        } catch (err) {
            console.warn("⚠️ [AI Chat] Context gathering failed:", err.message);
        }
    }

    const balance = contextData.summary?.availableBalance || 0;
    const spent = contextData.summary?.totalExpenses || 0;
    const budget = contextData.budget || 0;

    // --- 2. SIMPLE RESPONSES ---
    if (intent === "greeting") return res.status(HTTPSTATUS.OK).json({ success: true, reply: "Hi! How can I help you manage your expenses today?" });
    if (intent === "thanks") return res.status(HTTPSTATUS.OK).json({ success: true, reply: "You're welcome! Happy to help." });
    if (intent === "casual_reply") return res.status(HTTPSTATUS.OK).json({ success: true, reply: "Got it. What would you like to do next?" });
    if (intent === "help") return res.status(HTTPSTATUS.OK).json({ success: true, reply: "You can ask me to add expenses, check spending, set budgets, or view reports." });
    if (intent === "savings_question") return res.status(HTTPSTATUS.OK).json({ success: true, reply: "Savings is the money left after your expenses are deducted from your income." });

    // --- 3. DATA RESPONSES ---
    if (intent === "spending_breakdown") {
        const spentVal = formatCurrency(spent).replace(/\.00$/, ''); 
        let topCat = "";
        if (contextData.categories && contextData.categories.length > 0) {
            topCat = ` Most of it is on ${contextData.categories[0]._id}.`;
        }
        return res.status(HTTPSTATUS.OK).json({
            success: true,
            reply: `You've spent ${spentVal} this month.${topCat}`
        });
    }

    if (intent === "balance_check") {
        return res.status(HTTPSTATUS.OK).json({
            success: true,
            reply: `Your current available balance is ${formatCurrency(balance)}.`
        });
    }

    // --- 4. ACTION RESPONSES ---
    if (intent === "navigation_request") {
        let target = "/dashboard";
        let pageName = "dashboard";
        if (msg.includes("profile") || msg.includes("account") || msg.includes("settings")) { target = "/profile"; pageName = "account"; }
        else if (msg.includes("transaction") || msg.includes("history")) { target = "/transactions"; pageName = "transactions"; }
        else if (msg.includes("report") || msg.includes("analytic")) { target = "/analytics"; pageName = "reports"; }
        else if (msg.includes("add") || msg.includes("new")) { target = "/add-transaction"; pageName = "add transaction"; }
        else if (msg.includes("receipt") || msg.includes("scan")) { target = "/receipts"; pageName = "receipts"; }
        else if (msg.includes("calendar")) { target = "/calendar"; pageName = "calendar"; }
        else if (msg.includes("bank") || msg.includes("accounts")) { target = "/accounts"; pageName = "accounts"; }

        return res.status(HTTPSTATUS.OK).json({ 
            success: true, 
            reply: `Opening your ${pageName} page.`,
            action: { type: "navigate", target }
        });
    }

    if (intent === "budget_update") {
        const amtMatch = msg.match(/(\d+)/);
        if (amtMatch) {
            const amount = parseInt(amtMatch[1]);
            await updateUserService(userId, { monthlyBudget: amount });
            return res.status(HTTPSTATUS.OK).json({
                success: true,
                reply: `Your budget is now set to ${formatCurrency(amount)}.`,
                action: { type: "budget_updated", amount }
            });
        }
        return res.status(HTTPSTATUS.OK).json({
            success: true,
            reply: `Your monthly budget is ${formatCurrency(budget)}. You've used ${Math.round((spent/budget)*100)}% of it.`
        });
    }

    if (intent === "add_expense") {
        const amtMatch = msg.match(/(\d+(?:\.\d+)?)/);
        if (amtMatch) {
            const amount = parseFloat(amtMatch[0]);
            let title = msg.replace(amtMatch[0], "").replace("add", "").replace("spent", "").replace("log", "").trim();
            title = title || "Other Expense";
            const { transaction } = await createTransactionService({ title, amount, category: "Other", type: "EXPENSE", date: new Date() }, userId);
            const amtStr = formatCurrency(amount).replace(/\.00$/, '');
            return res.status(HTTPSTATUS.OK).json({
                success: true,
                reply: `Done. I've added ${amtStr} under ${transaction.category}.`,
                action: { type: "transaction_added", data: transaction }
            });
        }
    }

    // --- 5. AI FALLBACK ---
    let conversationHistory = "";
    if (Array.isArray(history) && history.length > 0) {
        conversationHistory = history.slice(-3).map(h => `${h.isBot ? "Assistant" : "User"}: ${h.text}`).join("\n");
    }

    const systemPrompt = `Role: Helpful, simple finance assistant.
Style: Short (1-2 lines), plain text, simple English. No bold. No markdown.
Context: Balance ${formatCurrency(balance)}, Budget ${formatCurrency(budget)}, Spent ${formatCurrency(spent)}. 
History: ${conversationHistory}
Guideline: Do NOT mention UI. Use user data ONLY if asked. Answer user briefly.`;

    try {
        let reply = await generateWithFailover(`${systemPrompt}\n\nUser: ${message}`);
        reply = reply.replace(/\*|_|#/g, '').replace(/\*\*/g, '').trim(); // Strip markdown
        return res.status(HTTPSTATUS.OK).json({ success: true, reply });
    } catch (error) {
        console.error("❌ [AI Chat] Fallover Final Crash:", error.message);
        let errorReply = "I'm having a little trouble connecting right now. Please try again.";
        // If it's a general question or AI failed, still show helpful context
        if (intent === "general_finance_question" || intent === "spending_breakdown") {
            const spentVal = formatCurrency(spent).replace(/\.00$/, '');
            const budgetVal = formatCurrency(budget).replace(/\.00$/, '');
            errorReply = `I'm having connection issues, but you've spent ${spentVal} this month against your ${budgetVal} budget.`;
        }
        return res.status(HTTPSTATUS.OK).json({ success: true, reply: errorReply });
    }
});

/**
 * AI Financial Insights
 */
export const getFinancialInsightsController = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const cached = getCachedAI(userId, 'health');
    if (cached) return res.status(HTTPSTATUS.OK).json({ success: true, ...cached });

    // Gather raw data for fallback/manual calculation
    const [user, transactions, summary] = await Promise.all([
        UserModel.findById(userId),
        TransactionModel.find({ userId }).sort({ date: -1 }).limit(30),
        summaryAnalyticsService(userId, DateRangeEnum.THIS_MONTH).catch(() => null)
    ]);

    const budget = user?.monthlyBudget || 0;
    const spent = summary?.totalExpenses || 0;

    try {
        const prompt = `Analyze: ${JSON.stringify(transactions)}. User Budget: ${budget}, Spent: ${spent}. 
        Return JSON ONLY: {"score": number, "suggestions": [], "insights": []}. 
        Suggestions should be short advice. Insights should be short observations.`;

        const text = await generateWithFailover(prompt);
        let cleanedText = text.replace(/```json|```/g, '').trim();
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) cleanedText = jsonMatch[0];
        const aiData = JSON.parse(cleanedText);
        setCachedAI(userId, 'health', aiData);
        return res.status(HTTPSTATUS.OK).json({ success: true, ...aiData });
    } catch (error) {
        console.warn("[Health AI Fallback Active] Calculating manual score...");
        
        // --- DETERMINISTIC FALLBACK LOGIC ---
        let score = 85; // Starting healthy score
        let insights = [];
        let suggestions = [];

        if (budget > 0) {
            const usagePct = (spent / budget) * 100;
            if (usagePct > 100) {
                score = Math.max(10, 85 - (usagePct / 10)); // Drastic drop for overspending
                insights.push(`You've gone over your monthly budget by ${Math.round(usagePct - 100)}%.`);
                suggestions.push("Try to stop spending on extra things for the rest of the month.");
                suggestions.push("Think about increasing your budget if this happens often.");
            } else if (usagePct > 80) {
                score = 65;
                insights.push(`You've used ${Math.round(usagePct)}% of your budget.`);
                suggestions.push("You are close to your limit. Be careful with your next buys.");
            } else {
                score = 95;
                insights.push("You're doing great! You're spent less than your budget.");
                suggestions.push("Keep it up! You are on track to save money.");
            }
        } else {
            score = 70;
            insights.push("No budget set yet.");
            suggestions.push("Set a budget to see your health score.");
        }

        if (transactions.length < 5) {
            insights.push("Add more expenses to get better advice.");
        }

        const fallbackData = { 
            score: Math.round(score), 
            suggestions: suggestions.slice(0, 3), 
            insights: insights.slice(0, 3), 
            isAIFallback: true 
        };
        
        return res.status(HTTPSTATUS.OK).json({ success: true, ...fallbackData });
    }
});

/**
 * Voice Extraction
 */
export const extractVoiceExpenseController = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(HTTPSTATUS.BAD_REQUEST).json({ message: "Text required" });

    try {
        const prompt = `Transcript: "${text}". Extract JSON: {"title": "", "amount": 0, "date": "YYYY-MM-DD", "category": "", "merchant": ""}`;
        const responseText = await generateWithFailover(prompt);
        let cleaned = responseText.replace(/```json|```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/) || cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) cleaned = jsonMatch[0];
        const data = JSON.parse(cleaned);
        return res.status(HTTPSTATUS.OK).json({ success: true, data });
    } catch (error) {
        return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({ message: "AI Error", error: error.message });
    }
});

/**
 * Voice Expense Full
 */
export const voiceExpenseController = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(HTTPSTATUS.BAD_REQUEST).json({ success: false, message: "Text required" });

    try {
        const prompt = `Voice: "${text}". Extract JSON: {"title": "", "amount": 0, "category": "Food|Other...", "date": "YYYY-MM-DD"}`;
        const responseText = await generateWithFailover(prompt);
        let cleaned = responseText.replace(/```json|```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/) || cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) cleaned = jsonMatch[0];
        const extracted = JSON.parse(cleaned);
        return res.status(HTTPSTATUS.OK).json({ success: true, data: extracted });
    } catch (error) {
        return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
});

/**
 * Receipt Scanner
 * PERMANENT FIX: Always returns 200 OK to prevent scary red alerts.
 * Let the frontend handle the 'Manual Entry Mode' based on the isAIFailed flag.
 */
export const scanReceiptController = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!req.file) return res.status(HTTPSTATUS.BAD_REQUEST).json({ message: "File required" });

    try {
        const extractedData = await scanReceiptService(req.file);

        const newReceipt = new Receipt({
            user: userId,
            imageUrl: extractedData.receiptUrl || "N/A",
            merchant: extractedData.title || extractedData.shopName || "Scanned Receipt",
            amount: Number(extractedData.amount) || 0,
            date: new Date(extractedData.date || new Date()),
            category: extractedData.category || 'Other',
            metadata: { 
              paymentMethod: extractedData.paymentMethod,
              description: extractedData.notes
            }
        });
        await newReceipt.save();

        const finalData = {
          title: extractedData.title || "Scanned Receipt",
          amount: extractedData.amount || 0,
          date: extractedData.date || new Date().toISOString().split('T')[0],
          shopName: extractedData.shopName || extractedData.merchant || "",
          category: extractedData.category || "Other",
          tax: extractedData.tax || 0,
          paymentMethod: extractedData.paymentMethod || "Other",
          notes: extractedData.notes || "Scanned from receipt"
        };

        console.log("[DEBUG] Final Scan Controller Response:", finalData);

        return res.status(HTTPSTATUS.OK).json({ 
          success: true, 
          partial: extractedData.partial || false,
          isAIFailed: extractedData.isAIFailed || false,
          data: finalData,
          receiptUrl: extractedData.receiptUrl || "N/A",
          message: extractedData.message || "Receipt scanned successfully."
        });
    } catch (error) {
        console.warn("[Receipt AI Fallback Active]", error.message);
        // Only trigger this if there's a complete unhandled crash like DB saving failure
        const fallbackData = {
            title: "New Receipt",
            shopName: "",
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            category: "Other",
            tax: 0,
            paymentMethod: "Other",
            notes: "AI extraction encountered a server error."
        };
        return res.status(HTTPSTATUS.OK).json({ 
            success: true, 
            partial: true,
            isAIFailed: true,
            data: fallbackData,
            message: "Unable to complete request. Please review details."
        });
    }
});

/**
 * Monthly Summary
 */
export const getMonthlySummaryController = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const cached = getCachedAI(userId, 'monthly_summary');
    if (cached) return res.status(HTTPSTATUS.OK).json({ success: true, data: cached });

    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const transactions = await TransactionModel.find({ userId, date: { $gte: firstDay } });

    if (transactions.length === 0) return res.status(HTTPSTATUS.OK).json({ data: { totalExpenses: 0, insight: "No data." } });

    let total = 0;
    transactions.forEach(t => { if (t.type === 'EXPENSE') total += t.amount; });

    try {
        const prompt = `Spent ₹${total} this month. Give 1 line insight and 1 line suggestion in JSON: {"insight": "", "suggestion": ""}. Use simple, clear words. No jargon.`;
        const responseText = await generateWithFailover(prompt);
        const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());
        const data = { totalExpenses: total, ...parsed };
        setCachedAI(userId, 'monthly_summary', data);
        return res.status(HTTPSTATUS.OK).json({ success: true, data });
    } catch (err) {
        return res.status(HTTPSTATUS.OK).json({ data: { totalExpenses: total, insight: "Tracking well.", suggestion: "Keep it up." } });
    }
});

/**
 * Budget Alerts
 * Returns the list of real budget threshold alerts sent to the user this month.
 */
export const getBudgetAlertsController = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Fetch alerts sent this month from the database
    const alerts = await BudgetAlertModel.find({ userId, month, year }).sort({ sentAt: -1 });
    
    // Map to a user-friendly format for the dashboard popup
    const formattedAlerts = alerts.map(a => {
        let title = "Budget Alert";
        let message = "";
        
        if (a.thresholdType === "50") {
            title = "💡 50% Milestone";
            message = `You've used half of your ${a.category} budget.`;
        } else if (a.thresholdType === "80") {
            title = "⚠️ 80% Warning";
            message = `You're nearing your ${a.category} limit!`;
        } else if (a.thresholdType === "100") {
            title = "🔴 100% Reached";
            message = `You've reached your ${a.category} budget limit.`;
        } else if (a.thresholdType === "exceeded") {
            title = "🚨 Budget Exceeded";
            message = `You have exceeded your ${a.category} budget!`;
        }

        return {
            id: a._id,
            title,
            message,
            category: a.category,
            threshold: a.thresholdType,
            sentAt: a.sentAt
        };
    });

    return res.status(HTTPSTATUS.OK).json({ 
        success: true, 
        alerts: formattedAlerts 
    });
});

/**
 * Monthly Insights
 */
export const getMonthlyInsightsController = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const cached = getCachedAI(userId, 'monthly_insights');
    if (cached) return res.status(HTTPSTATUS.OK).json({ success: true, insights: cached });

    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const txs = await TransactionModel.find({ userId, date: { $gte: firstDay }, type: 'EXPENSE' });
    let total = txs.reduce((s, t) => s + t.amount, 0);

    try {
        const prompt = `Spent ₹${total}. Generate 3 insights as JSON array of strings. IMPORTANT: Use very simple language. Avoid words like "notable", "expenditure", "allocated", "diverted". Speak like a friend giving easy advice.`;
        const text = await generateWithFailover(prompt);
        let cleaned = text.replace(/```json|```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/) || cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) cleaned = jsonMatch[0];
        const insights = JSON.parse(cleaned);
        setCachedAI(userId, 'monthly_insights', insights);
        return res.status(HTTPSTATUS.OK).json({ success: true, insights });
    } catch (err) {
        return res.status(HTTPSTATUS.OK).json({ success: true, insights: [`Total spent: ₹${total}`] });
    }
});
