import TransactionModel from "../models/transaction.model.js";
import UserModel from "../models/user.model.js";
import BudgetAlertModel from "../models/budget-alert.model.js";
import { sendBudgetAlertEmail } from "../mailers/budget-alert.mailer.js";
import { convertToRupeeUnit } from "../utils/format-currency.js";

/**
 * Determines which threshold type applies for a given percentage.
 * Returns null if no alert is needed.
 */
const getThresholdType = (pct) => {
  if (pct > 100) return "exceeded";
  if (pct >= 100) return "100";
  if (pct >= 80) return "80";
  return null;
};

/**
 * Checks whether an alert has already been sent for this combination.
 * Uses MongoDB's unique index for safety, but also pre-checks to avoid
 * unnecessary DB writes.
 */
const isAlertAlreadySent = async ({ userId, category, month, year, thresholdType }) => {
  const existing = await BudgetAlertModel.findOne({
    userId,
    category,
    month,
    year,
    thresholdType,
  });
  return Boolean(existing);
};

/**
 * Records that an alert was sent.
 * Uses upsert so a duplicate MongoDB unique-key error is silently handled.
 */
const recordAlertSent = async ({ userId, category, month, year, thresholdType }) => {
  await BudgetAlertModel.findOneAndUpdate(
    { userId, category, month, year, thresholdType },
    { $setOnInsert: { sentAt: new Date() } },
    { upsert: true, new: true }
  );
};

/**
 * Core budget alert check & email dispatch.
 *
 * Called after every new EXPENSE transaction is saved.
 * Checks the overall monthly budget and the per-category spend
 * against the user's monthlyBudget setting.
 *
 * @param {string|ObjectId} userId  - The user who created the expense
 * @param {Object} newTransaction   - The newly created transaction (raw Mongoose doc)
 */
export const checkAndSendBudgetAlerts = async (userId, newTransaction) => {
  try {
    // Only run for EXPENSE type
    if (newTransaction.type !== "EXPENSE") return;

    // ── Fetch user ──────────────────────────────────────────────────────
    const user = await UserModel.findById(userId);
    if (!user || !user.email) {
      console.log("[BudgetAlert] Skipping — user or email not found.");
      return;
    }

    const userName = user.name || "User";
    const userEmail = user.email;
    const monthlyBudget = user.monthlyBudget || 0;

    if (monthlyBudget <= 0) {
      console.log("[BudgetAlert] No monthly budget set. Skipping.");
      return;
    }

    const now = new Date();
    const month = now.getMonth() + 1; // 1-indexed
    const year = now.getFullYear();
    const firstDayOfMonth = new Date(year, now.getMonth(), 1);

    // ── Fetch this month's EXPENSE transactions ─────────────────────────
    const monthlyTransactions = await TransactionModel.find({
      userId,
      type: "EXPENSE",
      date: { $gte: firstDayOfMonth },
    });

    // ── 1. Overall Monthly Budget Check ─────────────────────────────────
    const totalSpentPaise = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalSpentRupees = convertToRupeeUnit(totalSpentPaise);
    const overallPct = (totalSpentRupees / monthlyBudget) * 100;
    const overallThreshold = getThresholdType(overallPct);

    console.log(
      `[BudgetAlert] Overall: ₹${totalSpentRupees} / ₹${monthlyBudget} = ${overallPct.toFixed(1)}% → threshold: ${overallThreshold || "none"}`
    );

    if (overallThreshold) {
      const alreadySent = await isAlertAlreadySent({
        userId,
        category: "overall",
        month,
        year,
        thresholdType: overallThreshold,
      });

      if (!alreadySent) {
        try {
          await sendBudgetAlertEmail({
            email: userEmail,
            userName,
            category: "Overall Monthly",
            currentSpend: totalSpentRupees,
            budgetLimit: monthlyBudget,
            thresholdType: overallThreshold,
          });
          await recordAlertSent({
            userId,
            category: "overall",
            month,
            year,
            thresholdType: overallThreshold,
          });
          console.log(
            `[BudgetAlert] ✅ Overall ${overallThreshold}% email sent to ${userEmail}`
          );
        } catch (mailErr) {
          console.error("[BudgetAlert] ❌ Overall email failed:", mailErr.message);
        }
      } else {
        console.log(
          `[BudgetAlert] Overall ${overallThreshold}% alert already sent this month.`
        );
      }
    }

    // ── 2. Per-Category Budget Check ────────────────────────────────────
    // We use a simple heuristic: if the user has a monthly budget, we split
    // it by known categories proportionally (or use 20% of total as per-cat limit).
    // This gives meaningful per-category alerts without requiring a separate
    // category budget model (which doesn't exist in this project yet).
    //
    // Category budget = 20% of overall monthly budget (configurable).
    const CATEGORY_BUDGET_RATIO = 0.20;
    const categoryBudgetLimit = monthlyBudget * CATEGORY_BUDGET_RATIO;

    // Group spending by category
    const categorySpend = {};
    for (const tx of monthlyTransactions) {
      const cat = tx.category || "Other";
      categorySpend[cat] = (categorySpend[cat] || 0) + tx.amount;
    }

    for (const [category, spentPaise] of Object.entries(categorySpend)) {
      const spentRupees = convertToRupeeUnit(spentPaise);
      const catPct = (spentRupees / categoryBudgetLimit) * 100;
      const catThreshold = getThresholdType(catPct);

      console.log(
        `[BudgetAlert] Category ${category}: ₹${spentRupees} / ₹${categoryBudgetLimit} = ${catPct.toFixed(1)}% → threshold: ${catThreshold || "none"}`
      );

      if (!catThreshold) continue;

      const alreadySent = await isAlertAlreadySent({
        userId,
        category,
        month,
        year,
        thresholdType: catThreshold,
      });

      if (!alreadySent) {
        try {
          await sendBudgetAlertEmail({
            email: userEmail,
            userName,
            category,
            currentSpend: spentRupees,
            budgetLimit: categoryBudgetLimit,
            thresholdType: catThreshold,
          });
          await recordAlertSent({
            userId,
            category,
            month,
            year,
            thresholdType: catThreshold,
          });
          console.log(
            `[BudgetAlert] ✅ ${category} ${catThreshold}% email sent to ${userEmail}`
          );
        } catch (mailErr) {
          console.error(
            `[BudgetAlert] ❌ ${category} email failed:`,
            mailErr.message
          );
        }
      } else {
        console.log(
          `[BudgetAlert] ${category} ${catThreshold}% alert already sent this month.`
        );
      }
    }
  } catch (err) {
    // Never crash the calling controller — just log
    console.error("[BudgetAlert] Unexpected error in budget alert system:", err.message);
  }
};
