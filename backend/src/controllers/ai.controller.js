import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { genAI, genAIModel } from "../config/google-ai.config.js";

const model = genAI.getGenerativeModel({ model: genAIModel });

export const chatWithAIController = asyncHandler(async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            message: "Message is required"
        });
    }

    try {
        const conversation = history?.map(msg => `${msg.isBot ? 'AI' : 'User'}: ${msg.text}`).join('\n') || '';
        const fullPrompt = `You are a helpful and professional AI Finance Assistant inside an Expense Management System.
Current conversation:
${conversation}
User: ${message}
AI:`;

        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text();

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
