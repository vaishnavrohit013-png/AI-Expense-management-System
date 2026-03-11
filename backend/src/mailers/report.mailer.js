import { formatCurrency } from "../utils/format-currency.js";
import { getReportEmailTemplate } from "../mailers/templates/report.template.js";
import { sendEmail } from "./mailer.js";
export const sendReportEmail = async ({
  email,
  username,
  report,
  frequency,
}) => {
  const html = getReportEmailTemplate({
    username,
    report,
    frequency,
  });
  const text = `
Your ${frequency} Financial Report (${report.period})
Income: ${formatCurrency(report.totalIncome)}
Expenses: ${formatCurrency(report.totalExpenses)}
Balance: ${formatCurrency(report.availableBalance)}
Savings Rate: ${report.savingsRate.toFixed(2)}%
${report.insights?.join("\n")}
`;
  console.log(text, "text mail");
  return sendEmail({
    to: email,
    subject: `${frequency} Financial Report - ${report.period}`,
    text,
    html,
  });
};
