import { Router } from "express";
import {
  getBudgetsController,
  setBudgetController,
  deleteBudgetController,
} from "../controllers/budget.controller.js";

const routes = Router();

// Get all category budgets for the current user
routes.get("/", getBudgetsController);

// Create or update a budget for a category
routes.post("/", setBudgetController);

// Delete a budget entry
routes.delete("/:id", deleteBudgetController);

export default routes;
