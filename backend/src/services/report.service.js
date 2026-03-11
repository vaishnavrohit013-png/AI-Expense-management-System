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
  const results = await TransactionModel.aggregate([
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
  ]);

  if (!results.length) return null;

  const { totalIncome = 0, totalExpenses = 0 } = results[0];

  const availableBalance = totalIncome - totalExpenses;

  return {
    income: convertToRupeeUnit(totalIncome),
    expenses: convertToRupeeUnit(totalExpenses),
    balance: convertToRupeeUnit(availableBalance),
  };
};
