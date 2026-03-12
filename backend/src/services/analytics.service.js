import mongoose from "mongoose";
import { DateRangeEnum } from "../enums/date-range.enum.js";
import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model.js";
import { getDateRange } from "../utils/date.js";
import { convertToRupeeUnit } from "../utils/format-currency.js";

/* ---------------- SUMMARY ANALYTICS ---------------- */

export const summaryAnalyticsService = async (
  userId,
  dateRangePreset,
  customFrom,
  customTo
) => {
  const range = getDateRange(dateRangePreset, customFrom, customTo);
  const { from, to } = range;

  const [result] = await TransactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        ...(from &&
          to && {
          date: { $gte: from, $lte: to },
        }),
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [
              { $eq: ["$type", TransactionTypeEnum.INCOME] },
              { $abs: "$amount" },
              0,
            ],
          },
        },
        totalExpenses: {
          $sum: {
            $cond: [
              { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
              { $abs: "$amount" },
              0,
            ],
          },
        },
      },
    },
  ]);

  const totalIncome = result?.totalIncome || 0;
  const totalExpenses = result?.totalExpenses || 0;
  const availableBalance = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return {
    totalIncome: convertToRupeeUnit(totalIncome),
    totalExpenses: convertToRupeeUnit(totalExpenses),
    availableBalance: convertToRupeeUnit(availableBalance),
    savingsRate: Number(savingsRate.toFixed(2)),
  };
};

/* ---------------- CHART ANALYTICS ---------------- */

export const chartAnalyticsService = async (
  userId,
  dateRangePreset,
  customFrom,
  customTo
) => {
  const range = getDateRange(dateRangePreset, customFrom, customTo);
  const { from, to } = range;

  return TransactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        ...(from &&
          to && {
          date: { $gte: from, $lte: to },
        }),
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },

        totalIncome: {
          $sum: {
            $cond: [
              { $eq: ["$type", TransactionTypeEnum.INCOME] },
              { $abs: "$amount" },
              0,
            ],
          },
        },

        totalExpenses: {
          $sum: {
            $cond: [
              { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
              { $abs: "$amount" },
              0,
            ],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

/* ---------------- PIE CHART ANALYTICS ---------------- */

export const expensePieChartBreakdownService = async (
  userId,
  dateRangePreset,
  customFrom,
  customTo
) => {
  const range = getDateRange(dateRangePreset, customFrom, customTo);
  const { from, to } = range;

  return TransactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: TransactionTypeEnum.EXPENSE,
        ...(from &&
          to && {
          date: { $gte: from, $lte: to },
        }),
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: { $abs: "$amount" } },
      },
    },
    { $sort: { total: -1 } },
  ]);
};
