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
    data: chartData,
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

    return res.status(HTTPSTATUS.OK).json({
      message: "Expense breakdown fetched successfully",
      data: pieChartData,
    });
  }
);
