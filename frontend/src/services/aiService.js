import { aiAPI } from './api';

export const aiService = {
    async chatWithAI(userMessage, chatHistory = []) {
        try {
            const response = await aiAPI.chat({ 
                message: userMessage, 
                history: chatHistory 
            });
            return response.data.text || "Thinking mode active, but the matrix returned no data.";
        } catch (error) {
            console.error("AI Insight Error:", error);
            const errorMessage = error.response?.data?.message || "Neural link disrupted. Ensure your backend has a valid GEMINI_API_KEY.";
            return errorMessage;
        }
    },

    async getFinancialInsights(transactions) {
        try {
            const response = await aiAPI.getInsights(transactions);
            return response.data.insights || ["Analyze your recent spending patterns to optimize wealth."];
        } catch (error) {
            console.error("AI Insight Error:", error);
            return ["Analyze your recent spending patterns to optimize wealth.", "Consider boosting your emergency fund.", "Diversify your assets for long-term growth."];
        }
    }
};
