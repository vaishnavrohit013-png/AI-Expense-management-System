import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import mongoose from "mongoose";

import ReportSettingModel from "../../models/report-setting.model.js";
import ReportModel from "../../models/report.model.js";
import { generateReportService } from "../../services/report.service.js";
import { calulateNextReportDate } from "../../utils/helper.js";
import { sendReportEmail } from "../../mailers/report.mailer.js";

const { ReportStatusEnum } = ReportModel;

export const processReportJob = async () => {
  const now = new Date();

  let processedCount = 0;
  let failedCount = 0;

  // Run previous month report
  const from = startOfMonth(subMonths(now, 1));
  const to = endOfMonth(subMonths(now, 1));

  try {
    const reportSettingCursor = ReportSettingModel.find({
      isEnabled: true,
      nextReportDate: { $lte: now },
    })
      .populate("userId")
      .cursor();

    console.log("📊 Running report job...");

    for await (const setting of reportSettingCursor) {
      const user = setting.userId;

      if (!user) {
        console.log(`User not found for setting: ${setting._id}`);
        continue;
      }

      const session = await mongoose.startSession();

      try {
        const report = await generateReportService(user.id, from, to);

        let emailSent = false;

        if (report) {
          try {
            await sendReportEmail({
              email: user.email,
              username: user.name,
              report: {
                period: report.period,
                totalIncome: report.summary.income,
                totalExpenses: report.summary.expenses,
                availableBalance: report.summary.balance,
                savingsRate: report.summary.savingsRate,
                topSpendingCategories: report.summary.topCategories,
                insights: report.insights,
              },
              frequency: setting.frequency,
            });

            emailSent = true;
          } catch (error) {
            console.log(`❌ Email failed for ${user.id}`);
          }
        }

        await session.withTransaction(async () => {
          const bulkReports = [];
          const bulkSettings = [];

          if (report && emailSent) {
            bulkReports.push({
              insertOne: {
                document: {
                  userId: user.id,
                  sentDate: now,
                  period: report.period,
                  status: ReportStatusEnum.SENT,
                  createdAt: now,
                  updatedAt: now,
                },
              },
            });

            bulkSettings.push({
              updateOne: {
                filter: { _id: setting._id },
                update: {
                  $set: {
                    lastSentDate: now,
                    nextReportDate: calulateNextReportDate(now),
                    updatedAt: now,
                  },
                },
              },
            });
          } else {
            bulkReports.push({
              insertOne: {
                document: {
                  userId: user.id,
                  sentDate: now,
                  period:
                    report?.period ||
                    `${format(from, "MMMM d")}–${format(to, "d, yyyy")}`,
                  status: report
                    ? ReportStatusEnum.FAILED
                    : ReportStatusEnum.NO_ACTIVITY,
                  createdAt: now,
                  updatedAt: now,
                },
              },
            });

            bulkSettings.push({
              updateOne: {
                filter: { _id: setting._id },
                update: {
                  $set: {
                    lastSentDate: null,
                    nextReportDate: calulateNextReportDate(now),
                    updatedAt: now,
                  },
                },
              },
            });
          }

          await Promise.all([
            ReportModel.bulkWrite(bulkReports, { ordered: false }),
            ReportSettingModel.bulkWrite(bulkSettings, { ordered: false }),
          ]);
        });

        processedCount++;
      } catch (error) {
        console.log("❌ Failed to process report", error);
        failedCount++;
      } finally {
        await session.endSession();
      }
    }

    console.log(`✅ Processed: ${processedCount} reports`);
    console.log(`❌ Failed: ${failedCount} reports`);

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error) {
    console.error("❌ Error processing reports", error);

    return {
      success: false,
      error: "Report process failed",
    };
  }
};
