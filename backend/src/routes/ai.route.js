import { Router } from "express";
import { 
    chatWithAIController, 
    getFinancialInsightsController, 
    extractVoiceExpenseController, 
    scanReceiptController 
} from "../controllers/ai.controller.js";
import { upload } from "../config/cloudinary.config.js";

/**
 * Express Router for AI-related functionality.
 * This handles all routes starting with /api/ai
 */
const routes = Router();

// Route for general AI chat interaction
// It provides AI with financial context to answer user queries
routes.post("/chat", chatWithAIController);

// Route for generating high-level financial insights from transaction data
routes.post("/insights", getFinancialInsightsController);

// Route for extracting transaction details from voice transcription text
routes.post("/extract-voice", extractVoiceExpenseController);

// Route for scanning receipt images using OCR and AI
// 'upload.single("receipt")' is a middleware that handles the image upload to Cloudinary
routes.post("/scan-receipt", upload.single("receipt"), scanReceiptController);

export default routes;
