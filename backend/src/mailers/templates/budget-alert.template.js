/**
 * Budget Alert Email Templates
 * Generates personalized plain-text and HTML emails for each threshold type.
 */

const currentYear = new Date().getFullYear();

/**
 * Returns { subject, text, html } for a given alert.
 * @param {Object} opts
 * @param {string}  opts.userName     - User's display name (fallback "User")
 * @param {string}  opts.category     - e.g. "Food" or "Overall Monthly"
 * @param {number}  opts.currentSpend - Amount spent in ₹ (rupees)
 * @param {number}  opts.budgetLimit  - Budget limit in ₹ (rupees)
 * @param {'80'|'100'|'exceeded'} opts.thresholdType
 */
export const getBudgetAlertEmailContent = ({
  userName,
  category,
  currentSpend,
  budgetLimit,
  thresholdType,
}) => {
  const name = userName?.trim() || "User";
  const spendStr = `₹${Number(currentSpend).toLocaleString("en-IN")}`;
  const limitStr = `₹${Number(budgetLimit).toLocaleString("en-IN")}`;

  let subject, heading, bodyLine1, bodyLine2, accentColor, emoji;

  if (thresholdType === "80") {
    subject = `Budget Warning: You have used 80% of your ${category} budget`;
    heading = "⚠️ Budget Warning";
    bodyLine1 = `You have used <strong>80%</strong> of your <strong>${category}</strong> budget for this month.`;
    bodyLine2 = "We recommend reviewing your expenses to avoid exceeding your budget.";
    accentColor = "#f59e0b";
    emoji = "⚠️";
  } else if (thresholdType === "100") {
    subject = `Budget Limit Reached: ${category} budget fully used`;
    heading = "🔴 Budget Limit Reached";
    bodyLine1 = `You have reached <strong>100%</strong> of your <strong>${category}</strong> budget for this month.`;
    bodyLine2 = "Please monitor your upcoming expenses carefully.";
    accentColor = "#ef4444";
    emoji = "🔴";
  } else {
    // exceeded
    subject = `Budget Exceeded: ${category} budget crossed`;
    heading = "🚨 Budget Exceeded";
    bodyLine1 = `You have <strong>exceeded</strong> your <strong>${category}</strong> budget for this month.`;
    bodyLine2 = "Consider adjusting your spending or updating your budget.";
    accentColor = "#dc2626";
    emoji = "🚨";
  }

  // ── Plain Text ──────────────────────────────────────────────────────────
  const text = `
Hello ${name},

${emoji} ${subject}

Your current spending is ${spendStr} out of ${limitStr}.

${bodyLine2}

Regards,
Expense Management Team
`.trim();

  // ── HTML ────────────────────────────────────────────────────────────────
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Inter',Arial,sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" width="100%"
               style="max-width:600px;margin:auto;background:#ffffff;border-radius:20px;
                      overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background:#1e293b;padding:32px 40px;">
              <div style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">
                💰 Finora
              </div>
              <div style="font-size:12px;color:#94a3b8;margin-top:4px;text-transform:uppercase;letter-spacing:0.1em;">
                Expense Management Platform
              </div>
            </td>
          </tr>

          <!-- Alert Badge -->
          <tr>
            <td style="padding:32px 40px 0;">
              <div style="display:inline-block;padding:8px 16px;background:${accentColor}18;
                          border:1.5px solid ${accentColor};border-radius:999px;
                          font-size:13px;font-weight:700;color:${accentColor};">
                ${heading}
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0 0 20px;font-size:16px;color:#0f172a;">
                Hello <strong>${name}</strong>,
              </p>

              <p style="margin:0 0 24px;font-size:15px;color:#334155;line-height:1.6;">
                ${bodyLine1}
              </p>

              <!-- Spend Card -->
              <table width="100%" style="border-collapse:collapse;margin-bottom:24px;">
                <tr>
                  <td style="width:50%;padding:20px;background:#f1f5f9;border-radius:12px 0 0 12px;
                             border-right:1px solid #e2e8f0;">
                    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;
                                letter-spacing:0.1em;margin-bottom:6px;">Current Spend</div>
                    <div style="font-size:24px;font-weight:900;color:${accentColor};">${spendStr}</div>
                  </td>
                  <td style="width:50%;padding:20px;background:#f1f5f9;border-radius:0 12px 12px 0;">
                    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;
                                letter-spacing:0.1em;margin-bottom:6px;">Budget Limit</div>
                    <div style="font-size:24px;font-weight:900;color:#0f172a;">${limitStr}</div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;font-size:15px;color:#334155;line-height:1.6;">
                ${bodyLine2}
              </p>

              <div style="border-top:1px solid #e2e8f0;padding-top:24px;">
                <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
                  Regards,<br />
                  <strong style="color:#1e293b;">Expense Management Team</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                &copy; ${currentYear} Finora &mdash; Budget Alert System<br/>
                This is an automated alert. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { subject, text, html };
};
