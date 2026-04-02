import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
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

// Initialize Gemini AI model with extremely relaxed safety settings for financial parsing
// This prevents innocuous receipts (like pharmacy or healthcare) from being blocked
const model = genAI.getGenerativeModel({ 
   model: genAIModel,
   safetySettings: [
     { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
     { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
     { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
     { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
   ]
});

/**
 * 🚀 PERFORMANCE CACHE
 * We cache AI results for 30 minutes to prevent quota exhaustion from repeated 
 * dashboard views or chatbot interactions.
 */
const aiCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 Minutes

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
 * Controller for general AI Chat interaction.
 * It builds a financial context from user's data and history to provide accurate responses.
 */
export const chatWithAIController = asyncHandler(async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            message: "Message is required"
        });
    }

    if (!genAI || !Env.GEMINI_API_KEY) {
        return res.status(HTTPSTATUS.SERVICE_UNAVAILABLE).json({
            message: "AI service is not configured. Please add GEMINI_API_KEY to your .env file."
        });
    }

    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: "User not authenticated" });
        }

        const categoryList = "Food, Travel, Shopping, Bills, Entertainment, Health, Education, Other";

        // Fetch User Data, Summary, Transactions, and Category Breakdown for AI Context
        let user, summary, transactionsData, categoryBreakdown;
        try {
            [user, summary, transactionsData, categoryBreakdown] = await Promise.all([
                UserModel.findById(userId),
                summaryAnalyticsService(userId, DateRangeEnum.ALL_TIME),
                getAllTransactionService(userId, {}, { pageSize: 15, pageNumber: 1 }),
                expensePieChartBreakdownService(userId, DateRangeEnum.ALL_TIME)
            ]);
        } catch (dbError) {
            console.error("AI Data Fetch Error:", dbError);
        }

        const financialContext = `
USER FINANCIAL DATA:
- Monthly Budget Limit: ₹${user?.monthlyBudget || 10000}
- Total Balance: ₹${summary?.availableBalance || '0'}
- Total Income: ₹${summary?.totalIncome || '0'}
- Total Expenses: ₹${summary?.totalExpenses || '0'}
- Savings Rate: ${summary?.savingsRate || '0'}%

EXPENSE BREAKDOWN BY CATEGORY:
${categoryBreakdown?.map(c => `- ${c._id || 'Uncategorized'}: ₹${convertToRupeeUnit(c.total || 0)}`).join('\n') || 'No category data yet'}

RECENT TRANSACTIONS:
${transactionsData?.transactions?.map(t => `- ${t.date || 'unknown date'}: ${t.title || t.description} (${t.type}) - ₹${t.amount} [${t.category}]`).join('\n') || 'No transactions yet'}
`;

        const conversation = Array.isArray(history) 
            ? history.map(msg => `${msg.isBot ? 'Assistant' : 'User'}: ${msg.text}`).join('\n') 
            : '';
            
        const systemInstruction = `You are a professional AI Personal Finance Assistant for the 'Finora' platform.
🎯 MISSION: Analyze the user's financial context to provide accurate answers, spending insights, and budget advice.
📊 DATA CONTEXT: ${financialContext}
💬 GUIDELINES: Friendly and concise. Use ₹ for currency. ALWAYS use the context above.
🛠️ LOGGING: If user wants to log, add command: [[COMMAND: {"type": "ADD_EXPENSE", "data": {"title": "Title", "amount": 0, "category": "Food", "type": "EXPENSE", "date": "${new Date().toISOString().split('T')[0]}"}} ]]`;

        const fullPrompt = `${systemInstruction}\n\nConversation history:\n${conversation}\n\nUser: ${message}\nAssistant:`;

        let result;
        let attempts = 0;

        // --- RE-TRY LOOP ON 429 Errors ---
        while (attempts < 3) {
            try {
                result = await model.generateContent(fullPrompt);
                break; // Success!
            } catch (err) {
                if (err.message?.includes("429") && attempts < 2) {
                    attempts++;
                    const delay = attempts * 3000;
                    console.warn(`[AI Chat] busy (429). Retrying... (${attempts}/3)`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                throw err;
            }
        }
        
        if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
            throw new Error("AI response was blocked or empty.");
        }

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            reply: result.response.text(),
            meta: { source: "ai", hasUserData: !!transactionsData?.transactions?.length }
        });

    } catch (error) {
        console.error("[AI Chat Controller] Error:", error.message);
        
        let statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR;
        let errorMessage = "Unable to process chatbot request right now.";

        if (error.message?.includes("API key") || error.message?.includes("403")) {
            statusCode = HTTPSTATUS.SERVICE_UNAVAILABLE;
            errorMessage = "AI model access denied. Your API key might be restricted.";
        } else if (error.message?.includes("429")) {
            statusCode = HTTPSTATUS.TOO_MANY_REQUESTS;
            errorMessage = "AI service is busy (rate-limit). Please wait 10 seconds and try again.";
        }

        return res.status(statusCode).json({ success: false, message: errorMessage });
    }
});

/**
 * Controller for generating overall financial insights.
 * Analyzes transaction history and returns health scores and suggestions in JSON format.
 */
export const getFinancialInsightsController = asyncHandler(async (req, res) => {
    let { transactions } = req.body;
    const userId = req.user?._id;
    
    // --- 1. Check Cache First ---
    const cached = getCachedAI(userId, 'health');
    if (cached) return res.status(HTTPSTATUS.OK).json({ message: "Insight from cache", ...cached });

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
        const TransactionModel = (await import("../models/transaction.model.js")).default;
        transactions = await TransactionModel.find({ userId }).sort({ date: -1 }).limit(30);
    }

    const prompt = `Analyze these transactions and provide a financial health score and spending insights.
    Transactions: ${JSON.stringify(transactions.slice(0, 30))}
    
    Return a JSON object strictly in this format:
    {
      "score": <number between 1 and 100 based on savings, spending on essentials vs non-essentials>,
      "suggestions": ["short suggestion 1 with emoji like ✔ Reduce shopping", "short suggestion 2"],
      "insights": ["warning insight like ⚠ You spent 30% more on food", "💡 Suggestion: Reduce dining out"]
    }
    Return ONLY valid JSON. Wait, in insights array, make sure it is 2 to 3 statements.`;

    let aiData;
    let attempts = 0;
    
    while (attempts < 3) {
        try {
            const result = await model.generateContent(prompt);
            
            if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
                throw new Error("AI Insights response was blocked or empty.");
            }

            const text = result.response.text();
            
            try {
                // More robust cleanup
                let cleanedText = text;
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    cleanedText = jsonMatch[0];
                } else {
                    cleanedText = text.replace(/```json|```/g, '').trim();
                }
                aiData = JSON.parse(cleanedText);
            } catch (parseError) {
                console.error("AI Insight Parse Error:", text);
                aiData = { 
                    score: 70, 
                    suggestions: ["✔ Keep tracking your daily expenses"], 
                    insights: ["💡 Good job entering your transactions. Add more for deeper analysis."] 
                };
            }
            break; // Success!

        } catch (error) {
            if (error.message?.includes("429") && attempts < 2) {
                attempts++;
                const delay = attempts * 3000;
                console.warn(`[AI INSIGHTS] Rate limited. Retrying in ${delay}ms... (${attempts}/3)`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            
            console.error("Gemini Insight Error (Falling back to default):", error.message);
            
            // Calculate a very basic score if possible
            const total = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
            const expenseCount = transactions.filter(t => t.type === 'EXPENSE').length;
            
            return res.status(HTTPSTATUS.OK).json({
                success: true,
                message: "Insights (AI is currently busy, showing basic estimates)",
                score: total > 50000 ? 65 : 85,
                suggestions: [
                    "✔ Keep tracking your expenses regularly",
                    "✔ Set a monthly budget goal in your settings",
                    "✔ Small daily savings lead to big monthly wealth"
                ],
                insights: [
                    "💡 AI is currently processing other requests, but we've analyzed your basic trends.",
                    `💡 You have tracked ${expenseCount} expenses recently.`,
                    "💡 Your tracking consistency is excellent!"
                ]
            });
        }
    }

    // --- Save to Cache on Success ---
    if (aiData) setCachedAI(userId, 'health', aiData);

    return res.status(HTTPSTATUS.OK).json({
        message: "Financial insights generated successfully",
        ...aiData
    });
});

/**
 * Controller for extracting expense data from voice-to-text transcripts.
 * Identifies amount, date, category, and merchant from a text snippet.
 */
export const extractVoiceExpenseController = asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            message: "Voice transcript text is required"
        });
    }

    const prompt = `You are an AI that extracts expense details from a voice transcript.
    Transcript: "${text}"
    Extract the following details and return ONLY a valid JSON object:
    {
       "title": "Short title describing the expense",
       "amount": <number>,
       "date": "YYYY-MM-DD" (use current date if 'today' is mentioned: ${new Date().toISOString().split('T')[0]}),
       "category": "FOOD, TRANSPORT, SHOPPING, ENTERTAINMENT, UTILITIES, or OTHER",
       "merchant": "Extracted merchant name if any, or general name"
    }`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        let extractedData;
        try {
            extractedData = JSON.parse(responseText.replace(/```json|```/g, '').trim());
        } catch (err) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                message: "Could not parse transcript perfectly",
                error: err.message
            });
        }

        return res.status(HTTPSTATUS.OK).json({
            message: "Voice expense extracted successfully",
            data: extractedData
        });
    } catch (error) {
        console.error("Gemini extraction error:", error);
        return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            message: "Failed to communicate with AI for voice extraction",
            error: error.message
        });
    }
});

/**
 * NEW: Controller for full voice-to-expense extraction with strict mapping to requested requirements.
 * Extract title, amount, category, and date from natural language and return formatted JSON.
 */
export const voiceExpenseController = asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            success: false,
            message: "Voice transcript text is required"
        });
    }

    try {
        const todayAt = new Date().toISOString().split('T')[0];
        const categoriesList = "Food, Travel, Shopping, Bills, Entertainment, Health, Education, Other";

        const systemPrompt = `You are a financial information extractor. 
        Analyze this voice transcript: "${text}"
        Extract the title, numeric amount, one specific category, and date.
        
        STRICT SCHEMATIC:
        - title: Short meaningful name (e.g. Starbucks Coffee).
        - amount: Use ONLY numbers (e.g. 250).
        - category: MUST be one of: ${categoriesList}. 
        - date: String in YYYY-MM-DD format. If no date is mentioned, use today's date: ${todayAt}.
        
        RULES:
        1. Categories MUST match the provided list exactly.
        2. Amount must be a positive number.
        3. Return ONLY valid JSON. No markdown tags.
        
        JSON FORMAT:
        {
          "title": "",
          "amount": 0,
          "category": "",
          "date": ""
        }`;

        const result = await model.generateContent(systemPrompt);
        let responseText = result.response.text();

        // Safe cleanup in case Gemini returns markdown blocks
        responseText = responseText.replace(/```json|```/g, '').trim();

        let extracted;
        try {
            extracted = JSON.parse(responseText);
        } catch (parseError) {
            console.error("JSON PARSE ERROR (Original AI Text):", responseText);
            throw new Error("AI returned invalid JSON format.");
        }

        // Backend Parsing and Strict Validation
        let { title, amount, category, date } = extracted;

        // 1. Title: generate short meaningful one if unclear
        if (!title || typeof title !== 'string' || title.length < 2) {
            title = "Unidentified Expense";
        }

        // 2. Amount: must be numeric and > 0
        amount = parseFloat(amount.toString().replace(/[^\d.-]/g, '')) || 0;
        if (amount <= 0) amount = 0;

        // 3. Category: validate against allowed list, fallback to Other
        const validCategories = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];
        if (!validCategories.includes(category)) {
            category = "Other";
        }

        // 4. Date: must be YYYY-MM-DD, default to current
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            date = todayAt;
        }

        const cleanedData = {
            title,
            amount: Number(amount),
            category,
            date
        };

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            data: cleanedData
        });

    } catch (error) {
        console.error("Voice Extraction [API ERROR]:", error);
        
        let errorMessage = "Failed to process voice transcript with AI";
        if (error.message) {
            if (error.message.includes("429") || error.message.toLowerCase().includes("quota") || error.message.toLowerCase().includes("rate limit") || error.message.includes("retry in")) {
                errorMessage = "Too many requests to Gemini AI. Please wait a few seconds and try again.";
            }
        }

        return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: errorMessage,
            error: error.message
        });
    }
});

/**
 * Controller for scanning receipt images.
 * Uses Gemini Vision to extract structured financial data from a receipt photo.
 * The image comes from multer memoryStorage (req.file.buffer).
 */
export const scanReceiptController = asyncHandler(async (req, res) => {
    if (!req.file || !req.file.buffer) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            success: false,
            message: "Receipt image is required. Please upload a JPG, PNG, or WEBP image."
        });
    }

    const { buffer, mimetype, originalname } = req.file;
    console.log(`[AI SCAN] Processing receipt: ${originalname} (${mimetype}, ${(buffer.length / 1024).toFixed(0)} KB)`);

    const base64Data = buffer.toString('base64');
    const categoryList = "Food, Travel, Shopping, Bills, Entertainment, Health, Education, Other";
    const todayDate = new Date().toISOString().split('T')[0];

    const prompt = `You are an expert AI specialized in OCR and financial receipt data extraction.
Carefully analyze the attached receipt image and extract ALL visible details.

Return ONLY a raw valid JSON object (absolutely no markdown, no code blocks, no extra text) with this exact structure:
{
  "merchant": "Name of the store or merchant shown on receipt, or null if not visible",
  "amount": <the final total amount as a number (after tax). Use null if not found>,
  "date": "YYYY-MM-DD format strictly. If not found use today: ${todayDate}",
  "time": "Time from receipt in HH:MM format (24h). null if not visible",
  "tax": <tax/GST/VAT amount as a number. null if not shown>,
  "category": "Pick the single most relevant from: ${categoryList}",
  "paymentMethod": "e.g. Cash, Credit Card, Debit Card, UPI, Online. null if not visible",
  "receiptNumber": "Receipt number or invoice number if visible. null if not found",
  "title": "Short descriptive title for this expense (e.g. Grocery Shopping, Starbucks Coffee)",
  "notes": "Any other useful info like address, items purchased, store phone. null if none",
  "confidence": {
    "merchant": "high or medium or low",
    "amount": "high or medium or low",
    "date": "high or medium or low",
    "category": "high or medium or low"
  }
}

CRITICAL RULES:
1. amount must be the FINAL total shown (after tax) — not subtotal
2. Return ONLY JSON object. Confidence is required.`;

    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimetype || "image/jpeg"
        }
    };

    try {
        let result;
        let attempts = 0;
        
        // --- MULTI-MODEL FAILOVER RETRY LOOP ---
        const backupModels = [genAIModel, "gemini-2.0-flash-lite", "gemini-1.5-flash"];

        while (attempts < 3) {
            try {
                const currentModelName = backupModels[attempts] || genAIModel;
                const activeModel = genAI.getGenerativeModel({ 
                   model: currentModelName,
                   safetySettings: [
                     { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                     { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                     { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                     { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                   ]
                });

                console.log(`[AI SCAN] Attempt ${attempts + 1}/3 using: ${currentModelName}`);
                result = await activeModel.generateContent([prompt, imagePart]);
                
                // --- Safety Check ---
                if (!result.response || result.response.candidates?.[0]?.finishReason === 'SAFETY') {
                    throw new Error("AI blocked by safety filter.");
                }

                break; // Model success!
            } catch (err) {
                const errorMsg = err.message || "";
                
                // If it's a 404, the model simply doesn't exist on this account.
                // We shouldn't fail the whole loop; just try the next backup model immediately.
                if (errorMsg.includes("404") || errorMsg.includes("not found")) {
                    console.warn(`[AI SCAN] Model ${backupModels[attempts]} not found (404). Skipping...`);
                    attempts++;
                    continue; 
                }

                // If it's a 429, we are at the limit. Wait and retry.
                if (errorMsg.includes("429") && attempts < 2) {
                    attempts++;
                    const delay = attempts * 10000; // 10s, then 20s
                    console.warn(`[AI SCAN] Model busy (429). Retrying in ${delay/1000}s...`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                
                // For any other fatal error (403, network), throw and quit.
                throw err;
            }
        }

        const responseText = result.response.text();
        if (!responseText || responseText.length < 5) throw new Error("AI returned an empty or invalid response.");

        // ── Parse AI response ─────────────────────────────────────────────
        let rawData;
        try {
            let cleanedText = responseText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) cleanedText = jsonMatch[0];
            rawData = JSON.parse(cleanedText);
        } catch (pErr) {
            console.error("[AI SCAN] RAW TEXT failed to parse:", responseText);
            throw new Error(`AI data format error: ${responseText.substring(0, 50)}...`);
        }

        // ── Normalize fields ─────────────────────────────────────────────
        const validCategories = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];
        const merchant = (rawData.merchant && typeof rawData.merchant === 'string') ? rawData.merchant.trim() : null;
        
        let amount = null;
        if (rawData.amount != null) {
            const parsed = parseFloat(String(rawData.amount).replace(/[^\d.-]/g, ''));
            if (!isNaN(parsed) && parsed > 0) amount = Math.round(parsed * 100) / 100;
        }

        const structuredData = {
            merchant,
            amount,
            date: (rawData.date && /^\d{4}-\d{2}-\d{2}$/.test(rawData.date)) ? rawData.date : todayDate,
            time: (typeof rawData.time === 'string') ? rawData.time.trim() : null,
            tax: (rawData.tax != null) ? Math.abs(parseFloat(rawData.tax)) : null,
            category: validCategories.includes(rawData.category) ? rawData.category : 'Other',
            paymentMethod: (typeof rawData.paymentMethod === 'string') ? rawData.paymentMethod.trim() : null,
            receiptNumber: (typeof rawData.receiptNumber === 'string') ? rawData.receiptNumber.trim() : null,
            title: rawData.title || (merchant ? `Purchase at ${merchant}` : 'Scanned Receipt'),
            notes: (typeof rawData.notes === 'string') ? rawData.notes.trim() : null,
            confidence: rawData.confidence || { merchant: 'low', amount: 'low', date: 'low', category: 'low' }
        };

        return res.status(HTTPSTATUS.OK).json({ success: true, message: "OK", data: structuredData });

    } catch (error) {
        console.error("[AI SCAN] ❌ Error:", error.message);
        
        // Pass the ACTUAL error back to the user temporarily for diagnosis
        let message = `Scan failed: ${error.message}`;
        let statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR;
        
        if (error.message?.includes("429")) {
            message = "AI service busy (rate-limit). Your extraction will retry automatically.";
            statusCode = HTTPSTATUS.TOO_MANY_REQUESTS;
        } else if (error.message?.includes("403")) {
            message = "AI model access denied. Your API key might be restricted.";
            statusCode = HTTPSTATUS.FORBIDDEN;
        }
        
        return res.status(statusCode).json({ success: false, message });
    }
});

/**
 * Controller for generating the AI Monthly Summary for the Dashboard.
 */
export const getMonthlySummaryController = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    
    // Get current and previous month boundaries
    const date = new Date();
    const firstDayThisMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayLastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);

    const [transactionsThisMonth, transactionsLastMonth, user] = await Promise.all([
        TransactionModel.find({ userId, date: { $gte: firstDayThisMonth } }),
        TransactionModel.find({ userId, date: { $gte: firstDayLastMonth, $lt: firstDayThisMonth } }),
        UserModel.findById(userId)
    ]);
    
    if (transactionsThisMonth.length === 0) {
        return res.status(HTTPSTATUS.OK).json({
            message: "Success",
            data: {
               totalExpenses: 0,
               totalIncome: 0,
               highestCategory: "None",
               comparison: "0%",
               averageDaily: 0,
               insight: "Add more transactions to receive smarter monthly insights.",
               suggestion: "Log your first expense today!"
            }
        });
    }

    let thisMonthExpenses = 0;
    let thisMonthIncome = 0;
    const categoryTotals = {};
    
    transactionsThisMonth.forEach(t => {
        if (t.type === 'EXPENSE') {
            thisMonthExpenses += t.amount;
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        } else if (t.type === 'INCOME') {
            thisMonthIncome += t.amount;
        }
    });

    let highestCategory = "None";
    let highestAmount = 0;
    for (const [cat, amt] of Object.entries(categoryTotals)) {
        if (amt > highestAmount) {
            highestAmount = amt;
            highestCategory = cat;
        }
    }

    let lastMonthExpenses = 0;
    transactionsLastMonth.forEach(t => {
        if (t.type === 'EXPENSE') lastMonthExpenses += t.amount;
    });

    const daysPassed = date.getDate();
    const averageDaily = thisMonthExpenses / daysPassed;

    let comparison = "0%";
    if (lastMonthExpenses > 0) {
        const diff = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
        comparison = diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
    }

    const prompt = `You are an AI assistant for an expense management platform.
    Use only the financial summary data provided.
    Data:
    - This Month Expenses: ₹${thisMonthExpenses.toFixed(2)}
    - This Month Income: ₹${thisMonthIncome.toFixed(2)}
    - Highest Category: ${highestCategory} (₹${highestAmount.toFixed(2)})
    - Comparison to last month: ${comparison}
    - Average Daily: ₹${averageDaily.toFixed(2)}
    
    Write a short, simple, practical insight for the user AND a short practical suggestion.
    Use INR currency. Keep the tone clear and helpful. Do not add unrelated advice.
    Return a strict JSON object: { "insight": "short simple insight", "suggestion": "short practical suggestion" }`;

    let aiData = { insight: "Your spending looks on track.", suggestion: "Keep logging your expenses." };
    try {
        const result = await model.generateContent(prompt);
        let cleanedText = result.response.text().replace(/```json|```/g, '').trim();
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) cleanedText = jsonMatch[0];
        const parsed = JSON.parse(cleanedText);
        aiData.insight = parsed.insight || aiData.insight;
        aiData.suggestion = parsed.suggestion || aiData.suggestion;
    } catch(err) {
        console.error("AI Monthly Summary Error:", err);
    }

    return res.status(HTTPSTATUS.OK).json({
        message: "Monthly summary generated.",
        data: {
           totalExpenses: thisMonthExpenses,
           totalIncome: thisMonthIncome,
           highestCategory,
           comparison,
           averageDaily,
           insight: aiData.insight,
           suggestion: aiData.suggestion
        }
    });
});

/**
 * Controller for generating Budget Alerts for the Dashboard.
 */
export const getBudgetAlertsController = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const date = new Date();
    const firstDayThisMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    const [transactionsThisMonth, user] = await Promise.all([
        TransactionModel.find({ userId, date: { $gte: firstDayThisMonth } }),
        UserModel.findById(userId)
    ]);

    const budgetLimit = user?.monthlyBudget || 10000;
    
    let totalSpent = 0;
    const categorySpent = {};
    transactionsThisMonth.forEach(t => {
        if (t.type === 'EXPENSE') {
            totalSpent += t.amount;
            categorySpent[t.category] = (categorySpent[t.category] || 0) + t.amount;
        }
    });

    if (totalSpent === 0) {
        return res.status(HTTPSTATUS.OK).json({
            message: "No alerts at this time.",
            alerts: []
        });
    }

    const prompt = `You are a strict financial AI monitoring budgets.
    User's Total Monthly Budget: ₹${budgetLimit}
    Amount spent so far this month: ₹${totalSpent}
    Category spending: ${JSON.stringify(categorySpent)}
    
    Determine if the user is overspending, near their limit (80%+), or has unusually high categories.
    Return a valid JSON array of alert objects. Each object should have a "type" ("warning", "alert", "insight", "prediction") and "message".
    Make messages short and readable. If all is good, return an empty array.
    DO NOT RETURN MARKDOWN. Only pure JSON Array: [{"type": "...", "message": "..."}]`;

    let alerts = [];
    try {
        const result = await model.generateContent(prompt);
        let cleanedText = result.response.text().replace(/```json|```/g, '').trim();
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) cleanedText = jsonMatch[0];
        alerts = JSON.parse(cleanedText);
    } catch(err) {
        console.error("AI Budget Alerts Error:", err);
        // Fallback simple checks
        if (totalSpent >= budgetLimit) {
            alerts.push({ type: "alert", message: `Alert: Your overall budget of ₹${budgetLimit} has been exceeded.` });
        } else if (totalSpent >= (budgetLimit * 0.8)) {
             alerts.push({ type: "warning", message: `Warning: You have used over 80% of your total monthly budget.` });
        }
    }

    return res.status(HTTPSTATUS.OK).json({
        message: "Budget alerts retrieved.",
        alerts: Array.isArray(alerts) ? alerts : []
    });
});

/**
 * Controller for generating AI Monthly Insights.
 * Builds context from the user's monthly expenses and passes it to the AI prompt.
 */
export const getMonthlyInsightsController = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const date = new Date();
    const firstDayThisMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    const transactionsThisMonth = await TransactionModel.find({
        userId,
        date: { $gte: firstDayThisMonth },
        type: 'EXPENSE'
    });

    let totalSpending = 0;
    const categories = {};

    transactionsThisMonth.forEach(t => {
        totalSpending += t.amount;
        // Group by category, handle missing category fields gracefully
        const cat = t.category || 'Other';
        categories[cat] = (categories[cat] || 0) + t.amount;
    });

    if (totalSpending === 0) {
        return res.status(HTTPSTATUS.OK).json({
            success: true,
            insights: [
                "You haven't logged any expenses this month yet.",
                "Start tracking your spending to get personalized insights here."
            ]
        });
    }

    const prompt = `You are an AI Finance Assistant.
Analyze the user's monthly expense data and generate 3 to 5 short, clear financial insights.

Rules:
- Use simple English
- Be concise (1 line per insight)
- Mention categories (${Object.keys(categories).join(', ')} etc.)
- Give practical suggestions
- Do not hallucinate data
- Use ₹ currency format
- Return ONLY a valid JSON array of strings: ["insight 1", "insight 2"]

User Data:
Total Spending: ₹${totalSpending}
${Object.entries(categories).map(([k,v]) => `${k}: ₹${v}`).join('\\n')}

Generate insights.`;

    let insightsFallback = [
        `You spent a total of ₹${totalSpending} this month.`,
        "Keep logging your daily expenses to get deeper AI insights."
    ];

    try {
        const result = await model.generateContent(prompt);
        let cleanedText = result.response.text().replace(/\`\`\`json|\`\`\`/g, '').trim();
        const jsonMatch = cleanedText.match(/\\[[\\s\\S]*\\]/);
        if (jsonMatch) cleanedText = jsonMatch[0];
        
        let parsed = JSON.parse(cleanedText);
        if (Array.isArray(parsed) && parsed.length > 0) {
            // Ensure they are strictly string arrays
            insightsFallback = parsed.map(val => String(val));
        }
    } catch(err) {
        console.error("AI Monthly Insights Error:", err);
    }

    return res.status(HTTPSTATUS.OK).json({
        success: true,
        insights: insightsFallback
    });
});
