import { sendEmail } from "./mailer.js";
import { getBudgetAlertEmailContent } from "./templates/budget-alert.template.js";

/**
 * Sends a budget alert email to the user.
 * Uses the existing sendEmail (Resend) infrastructure.
 *
 * @param {Object} opts
 * @param {string} opts.email          - Recipient email address
 * @param {string} opts.userName       - Recipient's display name
 * @param {string} opts.category       - Budget category (e.g. "Food" or "Overall Monthly")
 * @param {number} opts.currentSpend   - Amount spent so far (in rupees)
 * @param {number} opts.budgetLimit    - Budget limit (in rupees)
 * @param {'80'|'100'|'exceeded'} opts.thresholdType
 */
export const sendBudgetAlertEmail = async ({
  email,
  userName,
  category,
  currentSpend,
  budgetLimit,
  thresholdType,
}) => {
  const { subject, text, html } = getBudgetAlertEmailContent({
    userName,
    category,
    currentSpend,
    budgetLimit,
    thresholdType,
  });

  return sendEmail({ to: email, subject, text, html });
};
