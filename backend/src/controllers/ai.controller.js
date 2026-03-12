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
        const chat = model.startChat({
            history: history?.map(msg => ({
                role: msg.isBot ? "model" : "user",
                parts: [{ text: msg.text }]
            })) || []
        });

        const result = await chat.sendMessage(message);
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

    const prompt = `Analyze these transactions and provide 3 short, strategic financial tips in first person (as a finance assistant). Keep each tip under 20 words.
    Transactions: ${JSON.stringify(transactions.slice(0, 10))}
    Return only the 3 tips as a JSON array of strings.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        let insights;
        try {
            insights = JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch {
            // Fallback if AI doesn't return clean JSON
            insights = text.split('\n').filter(line => line.trim()).slice(0, 3);
        }

        return res.status(HTTPSTATUS.OK).json({
            message: "Financial insights generated successfully",
            insights
        });
    } catch (error) {
        console.error("Gemini Insight Error:", error);
        return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            message: "Failed to generate financial insights",
            error: error.message
        });
    }
});
