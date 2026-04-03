import { PaymentMethodEnum } from "../models/transaction.model.js";

export const receiptPrompt = `
Analyze the provided receipt image and extract details into a valid JSON object.

JSON FORMAT:
{
  "title": "",
  "amount": 0,
  "date": "",
  "shopName": "",
  "category": "",
  "tax": 0,
  "paymentMethod": "",
  "notes": "",
  "fullText": "Write ALL the raw text you see on the receipt here"
}

RULES:
1. Read the full receipt carefully.
2. Identify the final total amount paid. Prefer values near words like: total, grand total, final total, payable, amount paid, net amount.
3. shopName means store/shop/business name at top of receipt.
4. category must be one of: Food, Travel, Shopping, Bills, Entertainment, Health, Education, Other.
5. paymentMethod must be one of: Cash, UPI, Card, Net Banking, Wallet, Other.
6. tax must be numeric only.
7. date must be YYYY-MM-DD.
8. notes can contain short extra info if useful.
9. if a field is unclear, return best guess instead of empty where possible.
10. return no explanation.
11. return no markdown.
12. return no code block.
13. return only valid JSON.
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
