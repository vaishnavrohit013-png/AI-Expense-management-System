import { Router } from "express";
import { chatWithAIController, getFinancialInsightsController } from "../controllers/ai.controller.js";

const routes = Router();

routes.post("/chat", chatWithAIController);
routes.post("/insights", getFinancialInsightsController);

export default routes;
