import BudgetModel from "../models/budget.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { NotFoundException } from "../utils/app-error.js";

/**
 * Get all budgets for the current user for a specific month/year.
 */
export const getBudgetsController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const month = parseInt(req.query.month) || now.getMonth() + 1;
  const year = parseInt(req.query.year) || now.getFullYear();

  const budgets = await BudgetModel.find({ userId, month, year });
  
  return res.status(HTTPSTATUS.OK).json({
    message: "Budgets fetched successfully",
    data: budgets,
  });
});

/**
 * Set (create or update) a budget for a category.
 */
export const setBudgetController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { category, amount, month, year } = req.body;
  
  const now = new Date();
  const m = month || now.getMonth() + 1;
  const y = year || now.getFullYear();

  // Upsert the budget
  const budget = await BudgetModel.findOneAndUpdate(
    { userId, category, month: m, year: y },
    { amount },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Budget set successfully",
    data: budget,
  });
});

/**
 * Delete a category budget.
 */
export const deleteBudgetController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const deleted = await BudgetModel.findOneAndDelete({ _id: id, userId });
  if (!deleted) throw new NotFoundException("Budget not found");

  return res.status(HTTPSTATUS.OK).json({
    message: "Budget deleted successfully",
  });
});
