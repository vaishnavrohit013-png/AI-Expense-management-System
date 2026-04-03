import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import Receipt from "../models/receipt.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { Env } from "../config/env.config.js";
import { genAI, genAIModel } from "../config/google-ai.config.js";
import { summaryAnalyticsService, expensePieChartBreakdownService } from "../services/analytics.service.js";
import { getAllTransactionService, createTransactionService } from "../services/transaction.service.js";
import { DateRangeEnum } from "../enums/date-range.enum.js";
import { convertToRupeeUnit } from "../utils/format-currency.js";
import UserModel from "../models/user.model.js";
import TransactionModel from "../models/transaction.model.js";
import { scanReceiptService } from "../services/transaction.service.js";
import { genAIModels } from "../config/google-ai.config.js";
import BudgetAlertModel from "../models/budget-alert.model.js";

// --- 🚀 UNIVERSAL AI FAILOVER UTILITY ---
const MODEL_NAMES = genAIModels;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithFailover = async (prompt, systemInstruction = "") => {
    let lastError;
    const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
    
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

            console.log(`[AI Failover] Attempt ${i + 1}/${MODEL_NAMES.length} using ${modelName}...`);
            const result = await activeModel.generateContent(fullPrompt);
            const text = result?.response?.text?.();
            if (text && text.length > 0) return text;
            
            throw new Error("Empty response");
        } catch (err) {
            lastError = err;
            const errMsg = err.message?.toLowerCase() || "";
            const isQuota = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('capacity');
            
            if (isQuota && i < MODEL_NAMES.length - 1) {
                console.warn(`[AI Failover] ${modelName} over-capacity, immediately trying next...`);
                // No wait, just keep moving for speed
                continue;
            }
            console.warn(`[AI Failover] ${modelName} failed, trying next...`);
        }
    }

    const finalMsg = lastError?.message?.toLowerCase() || "";
    if (finalMsg.includes('429') || finalMsg.includes('quota') || finalMsg.includes('capacity')) {
        throw new Error("All AI channels are currently busy. Please try again in moments!");
    }
    throw new Error(lastError?.message || "AI services temporarily unavailable.");
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
 * AI Chat Controller
 */
export const chatWithAIController = asyncHandler(async (req, res) => {
    const { message, history } = req.body;
    if (!message) return res.status(HTTPSTATUS.BAD_REQUEST).json({ success: false, message: "No message provided." });

    const userId = req.user?._id;
    const msg = message.toLowerCase().trim();
    console.log(`🔍 [AI Chat] Incoming Message: "${msg}"`);

    // --- 🪄 1. SIMPLE INTENT DETECTION (Local Instant Replies) ---
    const greetings = ['hi', 'hello', 'hey', 'yo', 'good morning', 'good evening'];
    const thanks = ['thanks', 'thank you', 'thx', 'perfect', 'awesome', 'cool'];
    const casual = ['ok', 'okay', 'hmm', 'got it', 'fine', 'yes', 'no', 'sure'];
    const help = ['help', 'what can you do', 'how to use', 'features', 'instruction'];

    if (greetings.includes(msg)) {
        return res.status(HTTPSTATUS.OK).json({ success: true, reply: `Hi ${req.user?.name?.split(' ')[0] || "there"}! How can I help with your expenses today?` });
    }
    if (thanks.includes(msg)) {
        return res.status(HTTPSTATUS.OK).json({ success: true, reply: "You're welcome! Let me know if you need anything else." });
    }
    if (casual.includes(msg)) {
        return res.status(HTTPSTATUS.OK).json({ success: true, reply: "Got it. What's next on your list?" });
    }
    if (help.includes(msg)) {
        return res.status(HTTPSTATUS.OK).json({ success: true, reply: "I can help you add expenses, set budgets, view reports, or look up your spending history. What do you need help with right now?" });
    }

    // --- 🧠 2. GATHER FINANCIAL CONTEXT (Only for complex questions) ---
    let contextData = { summary: null, recentTransactions: [], categories: null, budget: 10000 };
    try {
        const [user, summary, txs, pie] = await Promise.all([
            UserModel.findById(userId).catch(() => null),
            summaryAnalyticsService(userId, DateRangeEnum.ALL_TIME).catch(() => null),
            TransactionModel.find({ userId }).sort({ date: -1 }).limit(10).catch(() => []),
            expensePieChartBreakdownService(userId, DateRangeEnum.THIS_MONTH).catch(() => null)
        ]);
        contextData = {
            budget: user?.monthlyBudget || 10000,
            summary: summary || { availableBalance: 0, totalIncome: 0, totalExpenses: 0 },
            recentTransactions: txs.map(t => `${t.title}: ₹${t.amount}`).join(", "),
            categories: pie?.categories || {}
        };
    } catch (ctxError) {
        console.warn("⚠️ [AI Chat] Context gathering partial failure:", ctxError.message);
    }

    // --- 🤖 3. GENERATE AI RESPONSE (Refined Prompt Logic) ---
    const systemInstruction = `You are Spendly, a smart and incredibly brief financial assistant. 

--- STRICT RESPONSE RULES ---
1. ANSWER THE QUESTION FIRST: Give a direct answer to the user's question in the very first sentence.
2. BREVITY: Keep your entire response under 2-4 sentences. NO long explanations.
3. NO REPETITION: Only mention current balance/budget if explicitly asked or if it is the answer to the question.
4. BE NATURAL: Speak like a human, not a scripted robot.
5. ACTION COMMANDS: If the user explicitly asks to "add" or "log" an expense, use this: [[COMMAND: {"type": "ADD_TRANSACTION", "data": {"title": "NAME", "amount": 0, "type": "EXPENSE", "category": "Food"}} ]]

--- DATA ---
Current Status: Balance ₹${contextData.summary?.availableBalance || 0}, Budget ₹${contextData.budget}, Spent this month ₹${contextData.summary?.totalExpenses || 0}.

Context: User is ${req.user?.name || "User"}. DO NOT navigate or switch pages. Answer here.`;

    try {
        const reply = await generateWithFailover(`${systemInstruction}\nUser Question: ${message}`);
        console.log(`🤖 [AI Chat] Gemini Reply: "${reply.substring(0, 50)}..."`);
        return res.status(HTTPSTATUS.OK).json({ success: true, reply: String(reply) });
    } catch (error) {
        return res.status(HTTPSTATUS.OK).json({ success: true, reply: "I'm having a little trouble connecting. Please try that again." });
    }
});

/**
 * AI Financial Insights
 */
export const getFinancialInsightsController = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const cached = getCachedAI(userId, 'health');
    if (cached) return res.status(HTTPSTATUS.OK).json({ success: true, ...cached });

    try {
        const transactions = await TransactionModel.find({ userId }).sort({ date: -1 }).limit(30);
        const prompt = `Analyze: ${JSON.stringify(transactions)}. Return JSON: {"score": number, "suggestions": [], "insights": []}. Use very simple words that anyone can understand. No complicated financial terms.`;

        const text = await generateWithFailover(prompt);
        let cleanedText = text.replace(/```json|```/g, '').trim();
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) cleanedText = jsonMatch[0];
        const aiData = JSON.parse(cleanedText);
        setCachedAI(userId, 'health', aiData);
        return res.status(HTTPSTATUS.OK).json({ success: true, ...aiData });
    } catch (error) {
        console.warn("[Health AI Fallback Active]", error.message);
        return res.status(HTTPSTATUS.OK).json({ 
            success: true, 
            score: 75, 
            suggestions: ["Keep recording your expenses to get smarter insights."], 
            insights: ["Our primary advisor is currently resting, showing your baseline score."],
            isAIFallback: true 
        });
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
