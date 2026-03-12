import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { DateRangePreset } from "../enums/date-range.enum.js";
import {
  chartAnalyticsService,
  expensePieChartBreakdownService,
  summaryAnalyticsService,
} from "../services/analytics.service.js";

export const summaryAnalyticsController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const { preset, from, to } = req.query;

  const stats = await summaryAnalyticsService(
    userId,
    preset,
    from ? new Date(from) : undefined,
    to ? new Date(to) : undefined
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Summary fetched successfully",
    data: stats,
  });
});

export const chartAnalyticsController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { preset, from, to } = req.query;

  const chartData = await chartAnalyticsService(
    userId,
    preset,
    from ? new Date(from) : undefined,
    to ? new Date(to) : undefined
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Chart fetched successfully",
    data: {
      chartData: chartData.map((item) => ({
        date: item._id,
        income: item.totalIncome / 100,
        expense: item.totalExpenses / 100,
      })),
    },
  });
});

export const expensePieChartBreakdownController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;
    const { preset, from, to } = req.query;

    const pieChartData = await expensePieChartBreakdownService(
      userId,
      preset,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined
    );

    const totalExpense = pieChartData.reduce((acc, curr) => acc + curr.total, 0);

    const categories = {};
    pieChartData.forEach((item) => {
      categories[item._id] = {
        amount: item.total / 100,
        percentage: totalExpense > 0 ? Number(((item.total / totalExpense) * 100).toFixed(2)) : 0,
      };
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Expense breakdown fetched successfully",
      data: { categories },
    });
  }
);
