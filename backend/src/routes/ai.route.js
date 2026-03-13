import { Router } from "express";
import { chatWithAIController, getFinancialInsightsController, extractVoiceExpenseController } from "../controllers/ai.controller.js";

const routes = Router();

routes.post("/chat", chatWithAIController);
routes.post("/insights", getFinancialInsightsController);
routes.post("/extract-voice", extractVoiceExpenseController);

export default routes;
