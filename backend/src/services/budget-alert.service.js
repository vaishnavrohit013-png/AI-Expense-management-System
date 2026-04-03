import TransactionModel from "../models/transaction.model.js";
import UserModel from "../models/user.model.js";
import BudgetModel from "../models/budget.model.js";
import BudgetAlertModel from "../models/budget-alert.model.js";
import { sendBudgetAlertEmail } from "../mailers/budget-alert.mailer.js";
import { convertToRupeeUnit } from "../utils/format-currency.js";

/**
 * Determines which threshold type applies for a given percentage.
 * Returns only the HIGHEST crossed threshold that hasn't been sent.
 */
/**
 * Determines which threshold type applies.
 * User only wants: 80, 100, exceeded.
 */
const getThresholdType = (pct) => {
  if (pct > 100) return "exceeded";
  if (pct >= 100) return "100";
  if (pct >= 80) return "80";
  if (pct >= 50) return "50";
  return null;
};

const isAlertAlreadySent = async ({ userId, category, month, year, thresholdType }) => {
  const existing = await BudgetAlertModel.findOne({ userId, category, month, year, thresholdType });
  return Boolean(existing);
};

const recordAlertSent = async ({ userId, category, month, year, thresholdType }) => {
  await BudgetAlertModel.create({ userId, category, month, year, thresholdType });
};

/**
 * Core budget alert check. 
 * Simple: Check category budget first, then user monthly budget.
 */
export const checkAndSendBudgetAlerts = async (userId, newTransaction) => {
  try {
    if (newTransaction.type !== "EXPENSE") return null;
    const user = await UserModel.findById(userId);
    if (!user || !user.email) return null;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const firstDayOfMonth = new Date(year, now.getMonth(), 1);
    const monthlyTransactions = await TransactionModel.find({ userId, type: "EXPENSE", date: { $gte: firstDayOfMonth } });
    let alertInfo = null;
    // --- CATEGORY ---
    const category = newTransaction.category || "Other";
    const budget = await BudgetModel.findOne({ userId, category, month, year });
    if (budget && budget.amount > 0) {
      const catSpent = monthlyTransactions.filter(t => t.category === category).reduce((s, t) => s + t.amount, 0);
      const spentRupees = convertToRupeeUnit(catSpent);
      const threshold = getThresholdType((spentRupees / budget.amount) * 100);
      if (threshold && !(await isAlertAlreadySent({ userId, category, month, year, thresholdType: threshold }))) {
        await sendBudgetAlertEmail({ email: user.email, userName: user.name, category, currentSpend: spentRupees, budgetLimit: budget.amount, thresholdType: threshold });
        await recordAlertSent({ userId, category, month, year, thresholdType: threshold });
        alertInfo = { type: 'category', threshold, category };
      }
    }
    // --- OVERALL Monthly Budget ---
    if (user.monthlyBudget > 0) {
      const totalSpentPaise = monthlyTransactions.reduce((s, t) => s + t.amount, 0);
      const totalRupees = convertToRupeeUnit(totalSpentPaise);
      const pct = (totalRupees / user.monthlyBudget) * 100;
      const threshold = getThresholdType(pct);

      if (threshold) {
        const isSent = await isAlertAlreadySent({ 
          userId, 
          category: "overall", 
          month, 
          year, 
          thresholdType: threshold 
        });

        if (!isSent) {
          console.log(`[BudgetAlert] Triggering Overall ${threshold} alert for ${user.email} (${pct}%)`);
          await sendBudgetAlertEmail({ 
            email: user.email, 
            userName: user.name, 
            category: "Overall Monthly Wallet", 
            currentSpend: totalRupees, 
            budgetLimit: user.monthlyBudget, 
            thresholdType: threshold 
          });

          await recordAlertSent({ 
            userId, 
            category: "overall", 
            month, 
            year, 
            thresholdType: threshold 
          });
          
          // Return this as the priority alert for the dashboard
          alertInfo = alertInfo || { type: 'overall', threshold, category: "Monthly Budget" };
        }
      }
    }

    return alertInfo;
  } catch (err) {
    console.error("❌ [BudgetAlert Service Error]:", err);
    return null;
  }
};
