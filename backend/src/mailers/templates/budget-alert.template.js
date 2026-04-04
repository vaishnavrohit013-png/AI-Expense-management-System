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
  const dashboardUrl = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

  let subject, badgeText, statusText, badgeColor, badgeBg, message;

  if (thresholdType === "50") {
    subject = `💡 Halfway There! – Your Overall Monthly Wallet Budget`;
    badgeText = "💡 Halfway There!";
    badgeColor = "#3b82f6";
    badgeBg = "#eff6ff";
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

  const text = `Hello ${name}, You've ${statusText} your ${category} budget. Spent: ${spendStr}, Limit: ${limitStr}. Always here to help, Spendly Team`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { background-color: #f8fafc; padding: 40px 20px; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; }
            .container { max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
            .header { background-color: #0f172a; padding: 30px; text-align: center; }
            .logo-text { color: #ffffff; font-size: 24px; font-weight: 800; display: inline-block; text-decoration: none; }
            .logo-icon { color: #fbbf24; margin-right: 8px; }
            .content { padding: 40px 30px; text-align: center; }
            .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; color: ${badgeColor}; background-color: ${badgeBg}; margin-bottom: 25px; }
            .greeting { color: #1e293b; font-size: 22px; font-weight: 800; margin: 0 0 12px 0; text-align: left; }
            .main-text { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0; text-align: left; }
            .card { border: 1px solid #f1f5f9; border-radius: 12px; margin-bottom: 30px; border-collapse: separate; border-spacing: 0; width: 100%; }
            .card-label { color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
            .stat-box { padding: 25px 20px; text-align: left; }
            .stat-value-spend { color: #2563eb; font-size: 20px; font-weight: 800; }
            .stat-value-limit { color: #1e293b; font-size: 20px; font-weight: 800; }
            .footer-msg { color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 35px; text-align: left; }
            .btn-wrap { margin-bottom: 40px; }
            .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 700; text-decoration: none; }
            .signature { border-top: 1px solid #f1f5f9; padding-top: 30px; text-align: left; }
            .signature-label { color: #64748b; font-size: 14px; margin: 0; }
            .signature-name { color: #1e293b; font-size: 15px; font-weight: 700; margin: 4px 0 0 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="logo-text"><span class="logo-icon">💰</span>Spendly</span>
            </div>
            <div class="content">
                <div class="badge">${badgeText}</div>
                <h2 class="greeting">Hi ${name},</h2>
                <p class="main-text">
                    You have <strong>${statusText}</strong> of your <strong>${category}</strong> budget.
                </p>

                <table class="card">
                    <tr>
                        <td class="stat-box" style="border-right: 1px solid #f1f5f9;">
                            <div class="card-label">CURRENT SPEND</div>
                            <div class="stat-value-spend">${spendStr}</div>
                        </td>
                        <td class="stat-box">
                            <div class="card-label">BUDGET LIMIT</div>
                            <div class="stat-value-limit">${limitStr}</div>
                        </td>
                    </tr>
                </table>

                <p class="footer-msg">
                    ${message}
                </p>

                <div class="btn-wrap">
                    <a href="${dashboardUrl}/dashboard" class="button">View Dashboard</a>
                </div>

                <div class="signature">
                    <p class="signature-label">Always here to help,</p>
                    <p class="signature-name">Spendly Team</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  return { subject, text, html };
};
