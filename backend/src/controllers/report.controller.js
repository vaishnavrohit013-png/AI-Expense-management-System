import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

import { HTTPSTATUS } from "../config/http.config.js";

import {
  generateReportService,
  getAllReportsService,
  updateReportSettingService,
} from "../services/report.service.js";

import { updateReportSettingSchema } from "../validators/report.validator.js";

/* -------------------------------------------------------------------------- */
/*                           GET ALL REPORTS                                  */
/* -------------------------------------------------------------------------- */

export const getAllReportsController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const pagination = {
    pageSize: parseInt(req.query.pageSize) || 20,
    pageNumber: parseInt(req.query.pageNumber) || 1,
  };

  const result = await getAllReportsService(userId, pagination);

  return res.status(HTTPSTATUS.OK).json({
    message: "Reports history fetched successfully",
    ...result,
  });
});

/* -------------------------------------------------------------------------- */
/*                       UPDATE REPORT SETTING                                */
/* -------------------------------------------------------------------------- */

export const updateReportSettingController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;
    const body = updateReportSettingSchema.parse(req.body);

    await updateReportSettingService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Reports setting updated successfully",
    });
  }
);

/* -------------------------------------------------------------------------- */
/*                          GENERATE REPORT                                   */
/* -------------------------------------------------------------------------- */

export const generateReportController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;
    const { from, to } = req.query;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const result = await generateReportService(
      userId,
      fromDate,
      toDate
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Report generated successfully",
      ...result,
    });
  }
);
