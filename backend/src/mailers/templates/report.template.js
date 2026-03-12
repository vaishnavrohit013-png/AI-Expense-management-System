import { formatCurrency } from "../../utils/format-currency.js";
import { capitalizeFirstLetter } from "../../utils/helper.js";

export const getReportEmailTemplate = (reportData) => {
  const {
    username,
    period,
    totalIncome,
    totalExpenses,
    availableBalance,
    savingsRate,
    topSpendingCategories,
    insights,
    frequency = "monthly"
  } = reportData;

  const reportTitle = `${capitalizeFirstLetter(frequency)} Wealth Intelligence`;

  const categoryList = topSpendingCategories
    ?.map(
      (cat) => `<tr style="border-bottom: 1px solid #f8fafc;">
      <td style="padding: 12px 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: 700;">${cat.name}</td>
      <td style="padding: 12px 0; font-size: 16px; color: #0f172a; text-align: right; font-weight: 900;">${formatCurrency(cat.amount)}</td>
      </tr>
    `
    )
    .join("") || "";

  const insightItems = typeof insights === 'string' 
    ? insights.split('\n').filter(i => i.trim()).map(i => `<div style="margin-bottom: 15px; padding: 15px; background: #f8faff; border-left: 4px solid #2563eb; border-radius: 8px; color: #334155; font-style: italic;">"${i.replace(/[*#]/g, '')}"</div>`).join('')
    : Array.isArray(insights) 
        ? insights.map(i => `<div style="margin-bottom: 15px; padding: 15px; background: #f8faff; border-left: 4px solid #2563eb; border-radius: 8px; color: #334155; font-style: italic;">"${i}"</div>`).join('')
        : `<div style="color: #64748b;">${insights}</div>`;

  const currentYear = new Date().getFullYear();

  return `
  <!DOCTYPE html>
 <html lang="en">
   <head>
     <meta charset="UTF-8" />
     <title>${reportTitle}</title>
     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
   </head>
   <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #fcfaf9; color: #0f172a;">
     <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #fcfaf9; padding: 40px 20px;">
       <tr>
         <td>
           <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; margin: auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
             <!-- Header -->
             <tr>
               <td style="background-color: #1e293b; padding: 40px; text-align: left;">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                    <div style="width: 35px; hieght: 35px; background: #2563eb; border-radius: 8px; color: white; text-align: center; line-height: 35px; font-weight: 900;">F</div>
                    <span style="color: white; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; font-style: italic; font-size: 18px; margin-left: 10px;">Finance Archive_</span>
                  </div>
                  <h1 style="margin: 0; font-size: 32px; color: #ffffff; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase; font-style: italic;">${reportTitle}</h1>
                  <p style="margin: 10px 0 0; font-size: 14px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em;">Neural Synthesis for ${period}</p>
               </td>
             </tr>
             
             <tr>
               <td style="padding: 40px;">
                 <p style="margin: 0 0 30px; font-size: 18px; font-weight: 500;">Hello <span style="font-weight: 900; color: #2563eb;">${username}</span>,</p>
                 <p style="margin: 0 0 40px; font-size: 16px; color: #64748b; line-height: 1.6;">Your high-fidelity financial audit for <strong>${period}</strong> is ready. We've synchronized your transaction nodes to generate these insights.</p>

                 <!-- Pulse Stats -->
                 <div style="margin-bottom: 40px;">
                   <table width="100%" style="border-collapse: collapse;">
                     <tr>
                       <td style="padding: 25px; background: #f8fafc; border-radius: 20px 0 0 20px; border-right: 1px solid #f1f5f9;">
                          <div style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">Income</div>
                          <div style="font-size: 22px; font-weight: 900; color: #0f172a;">${formatCurrency(totalIncome)}</div>
                       </td>
                       <td style="padding: 25px; background: #f8fafc; border-right: 1px solid #f1f5f9;">
                          <div style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">Expenses</div>
                          <div style="font-size: 22px; font-weight: 900; color: #0f172a;">${formatCurrency(totalExpenses)}</div>
                       </td>
                       <td style="padding: 25px; background: #0f172a; border-radius: 0 20px 20px 0; color: white;">
                          <div style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">Net Cashflow</div>
                          <div style="font-size: 22px; font-weight: 900; color: #ffffff;">${formatCurrency(availableBalance)}</div>
                       </td>
                     </tr>
                   </table>
                 </div>

                 <div style="padding: 25px; background: #eff6ff; border-radius: 20px; text-align: center; margin-bottom: 50px;">
                    <span style="font-size: 11px; font-weight: 900; color: #2563eb; text-transform: uppercase; letter-spacing: 0.2em;">Savings Velocity_</span>
                    <div style="font-size: 48px; font-weight: 900; color: #2563eb; margin: 5px 0;">${savingsRate.toFixed(1)}%</div>
                 </div>

                 <!-- Category Breakdown -->
                 <div style="margin-bottom: 50px;">
                    <h3 style="font-size: 18px; font-weight: 900; text-transform: uppercase; font-style: italic; margin-bottom: 25px; border-left: 4px solid #2563eb; padding-left: 15px;">Sector Analysis_</h3>
                    <table width="100%" style="border-collapse: collapse;">
                      ${categoryList}
                    </table>
                 </div>

                 <!-- Intelligence -->
                 <div style="margin-bottom: 40px; padding: 30px; background: #1e293b; border-radius: 24px;">
                    <h3 style="font-size: 16px; font-weight: 900; text-transform: uppercase; font-style: italic; color: #2563eb; margin: 0 0 20px;">AI Strategy Insights_</h3>
                    ${insightItems}
                 </div>

                 <div style="text-align: center; margin-top: 40px;">
                    <a href="#" style="display: inline-block; padding: 18px 40px; background: #2563eb; color: white; text-decoration: none; border-radius: 14px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; box-shadow: 0 20px 40px rgba(37,99,235,0.2);">View Full Matrix_</a>
                 </div>
               </td>
             </tr>
             
             <!-- Footer -->
             <tr>
               <td style="background-color: #f8fafc; text-align: center; padding: 30px; border-top: 1px solid #f1f5f9;">
                 <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em;">
                   &copy; ${currentYear} Finance Archive. Stratgeic Wealth Intelligence.
                 </p>
               </td>
             </tr>
           </table>
         </td>
       </tr>
     </table>
   </body>
 </html>
  `;
};
