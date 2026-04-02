import { Router } from "express";
import multer from "multer";
import {
    chatWithAIController,
    getFinancialInsightsController,
    extractVoiceExpenseController,
    voiceExpenseController,
    scanReceiptController,
    getMonthlySummaryController,
    getBudgetAlertsController,
    getMonthlyInsightsController
} from "../controllers/ai.controller.js";
import { memoryUpload } from "../config/cloudinary.config.js";

/**
 * Express Router for AI-related functionality.
 * This handles all routes starting with /api/ai
 */
const routes = Router();

// Route for general AI chat interaction
routes.post("/chat", chatWithAIController);

// Route for generating high-level financial insights from transaction data
routes.post("/insights", getFinancialInsightsController);

// Route for extracting transaction details from voice transcription text
routes.post("/extract-voice", extractVoiceExpenseController);

// Route for full voice-to-expense extraction
routes.post("/voice-expense", voiceExpenseController);

// Route for scanning receipt images using Gemini Vision AI
// Uses in-memory multer — file buffer is sent directly to Gemini as base64
routes.post("/scan-receipt",
    (req, res, next) => {
        memoryUpload.single("receipt")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    message: err.code === "LIMIT_FILE_SIZE"
                        ? "File too large. Maximum size is 10 MB."
                        : `Upload error: ${err.message}`
                });
            }
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    scanReceiptController
);

// Monthly Summary and Budget Alerts
routes.get("/monthly-summary", getMonthlySummaryController);
routes.get("/budget-alerts", getBudgetAlertsController);

// AI Monthly Insights
routes.get("/monthly-insights", getMonthlyInsightsController);

export default routes;
