import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { genAI, genAIModel } from "../config/google-ai.config.js";
import { summaryAnalyticsService, expensePieChartBreakdownService } from "../services/analytics.service.js";
import { getAllTransactionService, createTransactionService } from "../services/transaction.service.js";
import { DateRangeEnum } from "../enums/date-range.enum.js";
import axios from "axios";
import { convertToRupeeUnit } from "../utils/format-currency.js";
import UserModel from "../models/user.model.js";

// Initialize Gemini AI model instance using configured settings
const model = genAI.getGenerativeModel({ model: genAIModel });

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

    try {
        const userId = req.user?._id;

        // Fetch User Data, Summary, Transactions, and Category Breakdown for AI Context
        const [user, summary, transactionsData, categoryBreakdown] = await Promise.all([
            UserModel.findById(userId),
            summaryAnalyticsService(userId, DateRangeEnum.ALL_TIME),
            getAllTransactionService(userId, {}, { pageSize: 15, pageNumber: 1 }),
            expensePieChartBreakdownService(userId, DateRangeEnum.ALL_TIME)
        ]);

        const financialContext = `
USER FINANCIAL DATA:
- Monthly Budget Limit: ₹${user?.monthlyBudget || 10000}
- Total Balance: ₹${summary.availableBalance}
- Total Income: ₹${summary.totalIncome}
- Total Expenses: ₹${summary.totalExpenses}
- Savings Rate: ${summary.savingsRate}%

EXPENSE BREAKDOWN BY CATEGORY:
${categoryBreakdown.map(c => `- ${c._id}: ₹${convertToRupeeUnit(c.total)}`).join('\n') || 'No data yet'}

RECENT TRANSACTIONS:
${transactionsData.transactions.map(t => `- ${t.date}: ${t.title} (${t.type}) - ₹${t.amount} [${t.category}]`).join('\n')}
`;

        const conversation = history?.map(msg => `${msg.isBot ? 'Answer' : 'User'}: ${msg.text}`).join('\n') || '';
        const systemInstruction = `You are an AI Personal Finance Assistant for an Expense Management App.
        
🎯 OVERVIEW:
You analyze a user's transaction data to answer their financial questions, provide personalized suggestions, and help them track their budget.

📊 CAPABILITIES:
1. RESPONSE TO QUERIES:
   - "How much did I spend this month?"
   - "Which category has the highest expense?"
   - "How much did I spend on food last week?"

2. SPENDING INSIGHTS:
   - Compare current spending with past behavior (e.g., "Your food expenses increased...").
   - Identify spending patterns (e.g., "Most of your money was spent on shopping").

3. BUDGET TRACKING:
   - Answer: "Am I close to my monthly budget?", "Can I still spend ₹2000 this week?"
   - Use the available context to calculate if they can afford purchases.

4. SMART SUGGESTIONS:
   - Give tips: "Try reducing online food orders", "Set a lower entertainment budget".

5. INTERACTIVE COMMANDS:
   - If a user says "Add ₹500 for food", use the technical JSON block provided below.

💬 CHAT STYLE:
- Friendly, professional, and encouraging.
- Simple language.
- Use ₹ symbol for all amounts.
- ABSOLUTELY NO FAKE DATA. If data is missing, say: "I don't have enough data to answer this."

--------------------------------------
🛠️ TECHNICAL INSTRUCTIONS
--------------------------------------
If the user's intent is to 'Add an expense', append exactly this JSON block at the very end of your response:
[[COMMAND: {"type": "ADD_EXPENSE", "data": {"title": "Title", "amount": 0, "category": "FOOD", "type": "EXPENSE", "date": "YYYY-MM-DD", "paymentMethod": "CASH"}} ]]

Replace values with extracted data. Category MUST be one of: FOOD, TRANSPORT, SHOPPING, ENTERTAINMENT, UTILITIES, or OTHER. Default date to today's date: ${new Date().toISOString().split('T')[0]}.`;

        const fullPrompt = `${systemInstruction}

${financialContext}

Current conversation:
${conversation}
User: ${message}
Answer:`;

        const result = await model.generateContent(fullPrompt);
        let responseText = result.response.text();

        // Handle Potential Commands
        const commandMatch = responseText.match(/\[\[COMMAND: (.*) \]\]/);
        if (commandMatch) {
            try {
                const command = JSON.parse(commandMatch[1]);
                if (command.type === "ADD_EXPENSE") {
                    await createTransactionService(command.data, userId);
                    // Clean the response text for the user
                    responseText = responseText.replace(/\[\[COMMAND: (.*) \]\]/, "").trim();
                }
            } catch (err) {
                console.error("AI Command Execution Error:", err);
            }
        }

        return res.status(HTTPSTATUS.OK).json({
            message: "AI response generated successfully",
            text: responseText
        });
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            message: "Failed to communicate with AI node",
            error: error.message
        });
    }
});

/**
 * Controller for generating overall financial insights.
 * Analyzes transaction history and returns health scores and suggestions in JSON format.
 */
export const getFinancialInsightsController = asyncHandler(async (req, res) => {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            message: "Transactions array is required"
        });
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

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        let aiData;
        try {
            aiData = JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch {
            aiData = { score: 70, suggestions: ["✔ Keep tracking expenses"], insights: ["💡 Good job entering data!"] };
        }

        return res.status(HTTPSTATUS.OK).json({
            message: "Financial insights generated successfully",
            ...aiData
        });
    } catch (error) {
        console.error("Gemini Insight Error:", error);
        return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            message: "Failed to generate financial insights",
            error: error.message
        });
    }
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
 * Controller for scanning receipt images.
 * Uses Gemini Vision (OCR) to extract structured financial data from a receipt photo.
 */
export const scanReceiptController = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            message: "Receipt image is required"
        });
    }

    const { path: imageUrl, mimetype } = req.file;
    console.log(`[AI SCAN] Processing file from Cloudinary: ${imageUrl} (${mimetype})`);

    try {
        // Fetch the image from Cloudinary and convert to base64
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const base64Data = Buffer.from(response.data).toString('base64');

        const prompt = `You are an AI specialized in OCR and financial data extraction. 
        Analyze the attached receipt image and extract the following details as a valid JSON object:
        {
          "title": "A short, descriptive title for the expense (e.g., Starbucks Coffee)",
          "amount": <number: total amount including tax>,
          "date": "YYYY-MM-DD" (Format strictly as YYYY-MM-DD. Use today's date if not found: ${new Date().toISOString().split('T')[0]}),
          "merchant": "Name of the merchant/store",
          "category": "Pick the most relevant: FOOD, TRANSPORT, SHOPPING, ENTERTAINMENT, UTILITIES, or OTHER"
        }
        Return ONLY the raw JSON object, no markdown, no explanation.`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimetype
            }
        };

        const result = await genAI.getGenerativeModel({ model: genAIModel }).generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        let extractedData;
        try {
            // Clean the response from markdown if AI included it
            const cleanedText = responseText.replace(/```json|```/g, '').trim();
            extractedData = JSON.parse(cleanedText);
        } catch (err) {
            console.error("JSON Parsing Error from Gemini:", responseText);
            return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
                message: "Failed to parse receipt data from AI response",
                rawResponse: responseText
            });
        }

        return res.status(HTTPSTATUS.OK).json({
            message: "Receipt scanned successfully",
            data: {
                ...extractedData,
                receiptUrl: imageUrl
            }
        });
    } catch (error) {
        console.error("Receipt Scanning Error:", error);
        return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            message: "Failed to scan receipt",
            error: error.message
        });
    }
});
