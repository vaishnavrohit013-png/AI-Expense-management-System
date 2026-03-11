import { PaymentMethodEnum } from "../models/transaction.model.js";

export const receiptPrompt = `
You are a financial assistant that helps users analyze and extract transaction details from receipt image (base64 encoded)

Analyze this receipt image and extract transaction details matching this exact JSON format:

{
  "title": "string",
  "amount": number,
  "date": "YYYY-MM-DD",
  "description": "string",
  "category": "string",
  "type": "EXPENSE",
  "paymentMethod": "string"
}

Payment methods: ${Object.values(PaymentMethodEnum).join(",")}
`.trim();

export const reportInsightPrompt = ({
  totalIncome,
  totalExpenses,
  availableBalance,
  savingsRate,
  categories,
  periodLabel,
}) => {
  const categoryList = Object.entries(categories)
    .map(
      ([name, { amount, percentage }]) =>
        `- ${name}: ${amount} (${percentage}%)`
    )
    .join("\n");

  return `
You are a friendly and smart financial coach.

🧾 Report for: ${periodLabel}

- Total Income: ₹${totalIncome.toFixed(2)}
- Total Expenses: ₹${totalExpenses.toFixed(2)}
- Available Balance: ₹${availableBalance.toFixed(2)}
- Savings Rate: ${savingsRate}%

Top Expense Categories:
${categoryList}
`.trim();
};
