/**
 * Premium Budget Alert Email Template
 * Optimized for a professional, card-based mobile-responsive design.
 */

export const getBudgetAlertEmailContent = ({
  userName,
  category,
  currentSpend,
  budgetLimit,
  thresholdType,
}) => {
  const name = userName?.split(' ')[0] || "User";
  const spendStr = `₹${Number(currentSpend).toLocaleString("en-IN")}`;
  const limitStr = `₹${Number(budgetLimit).toLocaleString("en-IN")}`;

  let subject, badgeText, statusText, badgeColor, badgeBg, message;

  if (thresholdType === "50") {
    subject = `💡 Halfway There! – Your ${category} Budget`;
    badgeText = "💡 Halfway There!";
    badgeColor = "#2563eb";
    badgeBg = "#dbeafe";
    statusText = "used 50% of";
    message = "You're doing great! Keep an eye on your spending to finish the month strong.";
  } else if (thresholdType === "80") {
    subject = `⚠️ Budget Alert – ${category} Budget 80% Used`;
    badgeText = "⚠️ Almost There";
    badgeColor = "#b45309";
    badgeBg = "#fef3c7";
    statusText = "used 80% of";
    message = "You've almost reached your limit. Better slow down a bit!";
  } else if (thresholdType === "100") {
    subject = `🚨 Budget Limit Reached – ${category}`;
    badgeText = "🚨 Limit Reached";
    badgeColor = "#b91c1c";
    badgeBg = "#fee2e2";
    statusText = "reached 100% of";
    message = "You have hit your limit. Any further spending will exceed your budget.";
  } else {
    subject = `❌ Critical Alert – ${category} Budget Exceeded`;
    badgeText = "❌ Limit Exceeded";
    badgeColor = "#7f1d1d";
    badgeBg = "#fef2f2";
    statusText = "exceeded";
    message = "You have gone over your budget. We recommend reviewing your recent transactions.";
  }

  const text = `
Hello ${name},
You have ${statusText} your ${category} budget.

Spent: ${spendStr}
Budget: ${limitStr}

${message}

Regards,
Spendly Team
`.trim();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .email-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 20px auto; background-color: #ffffff; }
            .header { background-color: #1e293b; padding: 24px; border-radius: 12px 12px 0 0; text-align: left; }
            .content { border: 1px solid #f1f5f9; border-top: none; padding: 32px 24px; border-radius: 0 0 12px 12px; }
            .logo { color: #ffffff; font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px; text-decoration: none; }
            .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; color: ${badgeColor}; background-color: ${badgeBg}; margin-bottom: 24px; }
            .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
            .main-text { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 24px 0; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #f1f5f9; border-radius: 8px; margin-bottom: 24px; }
            .stat-box { padding: 16px; border-right: 1px solid #f1f5f9; }
            .stat-box:last-child { border-right: none; }
            .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
            .stat-value { font-size: 20px; font-weight: 800; color: #2563eb; }
            .stat-value-limit { font-size: 20px; font-weight: 800; color: #0f172a; }
            .footer-msg { font-size: 14px; color: #64748b; margin-bottom: 32px; border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; }
            .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none; text-align: center; }
            .signature { margin-top: 32px; font-size: 13px; color: #64748b; }
            .signature-name { font-weight: 700; color: #0f172a; display: block; margin-top: 4px; }
        </style>
    </head>
    <body style="background-color: #f8fafc; padding: 20px; margin: 0;">
        <div class="email-container">
            <div class="header">
                <a href="#" class="logo">💰 Spendly</a>
            </div>
            <div class="content">
                <div class="badge">${badgeText}</div>
                <h2 class="greeting">Hi ${name},</h2>
                <p class="main-text">
                    You have <strong>${statusText}</strong> of your <strong>${category}</strong> budget.
                </p>

                <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #f1f5f9; border-radius: 8px; margin-bottom: 24px;">
                    <tr>
                        <td width="50%" style="padding: 16px; border-right: 1px solid #f1f5f9;">
                            <div class="stat-label">Current Spend</div>
                            <div class="stat-value">${spendStr}</div>
                        </td>
                        <td width="50%" style="padding: 16px;">
                            <div class="stat-label">Budget Limit</div>
                            <div class="stat-value-limit">${limitStr}</div>
                        </td>
                    </tr>
                </table>

                <p class="footer-msg">
                    ${message}
                </p>

                <div style="text-align: center; margin-bottom: 20px;">
                    <a href="https://your-dashboard-url.com" class="button">View Dashboard</a>
                </div>

                <div class="signature">
                    Always here to help,<br/>
                    <span class="signature-name">Spendly Team</span>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  return { subject, text, html };
};
