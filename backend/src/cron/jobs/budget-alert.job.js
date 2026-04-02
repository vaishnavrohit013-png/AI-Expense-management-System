import TransactionModel from "../../models/transaction.model.js";
import UserModel from "../../models/user.model.js";
import { checkAndSendBudgetAlerts } from "../../services/budget-alert.service.js";

/**
 * Daily Budget Alert Cron Job
 *
 * Runs once per day. Iterates all users with a monthly budget set and
 * re-checks their spending against thresholds. This catches cases where
 * the real-time trigger (after expense creation) may have missed something
 * (e.g. bulk imports, direct DB inserts).
 */
export const processDailyBudgetAlerts = async () => {
  console.log("🔔 Running daily budget alert check...");

  let checkedCount = 0;
  let errorCount = 0;

  try {
    // Only check users who have a budget configured
    const users = await UserModel.find({ monthlyBudget: { $gt: 0 } }).select(
      "_id name email monthlyBudget"
    );

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const user of users) {
      try {
        // Get a representative "last expense" for this month to trigger the check
        const latestExpense = await TransactionModel.findOne({
          userId: user._id,
          type: "EXPENSE",
          date: { $gte: firstDayOfMonth },
        }).sort({ date: -1 });

        if (!latestExpense) continue; // No spending this month

        await checkAndSendBudgetAlerts(user._id, latestExpense);
        checkedCount++;
      } catch (err) {
        errorCount++;
        console.error(
          `[DailyBudgetAlert] Error for user ${user._id}:`,
          err.message
        );
      }
    }

    console.log(
      `✅ Daily budget alert: ${checkedCount} users checked, ${errorCount} errors`
    );
    return { success: true, checkedCount, errorCount };
  } catch (err) {
    console.error("❌ Daily budget alert job failed:", err.message);
    return { success: false, error: err.message };
  }
};
