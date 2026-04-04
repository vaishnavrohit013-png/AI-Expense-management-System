import { aiAPI } from './api';

export const aiService = {
    async chatWithAI(userMessage, chatHistory = []) {
        try {
            const response = await aiAPI.chat(userMessage, chatHistory);
            return response.data;
        } catch (error) {
            console.error("AI Communication Error:", error);
            const errorMessage = error.response?.data?.message || "AI is temporarily unavailable. Please try again later.";
            return { success: false, reply: errorMessage };
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
