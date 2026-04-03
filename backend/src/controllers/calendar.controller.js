import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http.config.js";
import Transaction from "../models/transaction.model.js";
import mongoose from "mongoose";

export const getCalendarExpensesController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { month, year } = req.query;

  const targetMonth = parseInt(month) || new Date().getMonth() + 1;
  const targetYear = parseInt(year) || new Date().getFullYear();

  // Create date range for the month
  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

  const transactions = await Transaction.find({
    userId,
    type: 'EXPENSE',
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });

  // Group by day manually for simplicity and custom logic
  const dailyData = {};
  
  transactions.forEach(tx => {
    const day = new Date(tx.date).toISOString().split('T')[0];
    if (!dailyData[day]) {
      dailyData[day] = {
        date: day,
        totalSpent: 0,
        transactionCount: 0,
        transactions: []
      };
    }
    dailyData[day].totalSpent += tx.amount;
    dailyData[day].transactionCount += 1;
    dailyData[day].transactions.push(tx);
  });

  const result = Object.values(dailyData);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: "Calendar expenses fetched successfully",
    data: result
  });
});
