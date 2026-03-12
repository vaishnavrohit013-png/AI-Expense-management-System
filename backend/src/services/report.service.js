import mongoose from "mongoose";
import ReportSettingModel from "../models/report-setting.model.js";
import ReportModel from "../models/report.model.js";
import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model.js";

import { NotFoundException } from "../utils/app-error.js";
import { calulateNextReportDate } from "../utils/helper.js";

import { convertToRupeeUnit } from "../utils/format-currency.js";
import { format } from "date-fns";

import { genAI, genAIModel } from "../config/google-ai.config.js";
import { reportInsightPrompt } from "../utils/prompt.js";

const model = genAI.getGenerativeModel({ model: genAIModel });

/* -------------------------------------------------------------------------- */

export const getAllReportsService = async (userId, pagination) => {
  const query = { userId };
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [reports, totalCount] = await Promise.all([
    ReportModel.find(query).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
    ReportModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    reports,
    pagination: { pageSize, pageNumber, totalCount, totalPages, skip },
  };
};

/* -------------------------------------------------------------------------- */

export const updateReportSettingService = async (userId, body) => {
  const { isEnabled } = body;
  let nextReportDate = null;

  const existing = await ReportSettingModel.findOne({ userId });
  if (!existing) throw new NotFoundException("Report setting not found");

  if (isEnabled) {
    const currentNext = existing.nextReportDate;
    const now = new Date();

    if (!currentNext || currentNext <= now) {
      nextReportDate = calulateNextReportDate(existing.lastSentDate);
    } else {
      nextReportDate = currentNext;
    }
  }

  existing.set({ ...body, nextReportDate });
  await existing.save();
};

/* -------------------------------------------------------------------------- */

export const generateReportService = async (userId, fromDate, toDate) => {
  const [summaryResults, categoryResults] = await Promise.all([
    TransactionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: fromDate, $lte: toDate },
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
    ]),
    TransactionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: TransactionTypeEnum.EXPENSE,
          date: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: { $abs: "$amount" } },
        },
      },
      { $sort: { total: -1 } },
    ]),
  ]);

  if (!summaryResults.length) return null;

  const { totalIncome = 0, totalExpenses = 0 } = summaryResults[0];
  const availableBalance = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const topCategories = categoryResults.slice(0, 5).map((c) => ({
    name: c._id,
    amount: convertToRupeeUnit(c.total),
  }));

  const periodLabel = `${format(fromDate, "MMMM d")}–${format(
    toDate,
    "d, yyyy"
  )}`;

  // Generate AI Insights
  let insights = "No insights available for this period.";
  try {
    const prompt = reportInsightPrompt(
      convertToRupeeUnit(totalIncome),
      convertToRupeeUnit(totalExpenses),
      savingsRate,
      topCategories
    );
    const result = await model.generateContent(prompt);
    insights = result.response.text();
  } catch (error) {
    console.error("AI Insight generation failed:", error);
  }

  return {
    period: periodLabel,
    summary: {
      income: convertToRupeeUnit(totalIncome),
      expenses: convertToRupeeUnit(totalExpenses),
      balance: convertToRupeeUnit(availableBalance),
      savingsRate: Number(savingsRate.toFixed(2)),
      topCategories,
    },
    insights,
  };
};
