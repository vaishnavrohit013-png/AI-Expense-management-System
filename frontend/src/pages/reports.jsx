import { renderLayout } from '../components/layout.js'
import { transactionAPI } from '../services/api.js'

export const renderReportsPage = async () => {
  const app = document.getElementById('app')
  
  app.innerHTML = `
    <div class="flex h-screen bg-slate-900">
      <div id="sidebar-container"></div>
      
      <main class="flex-1 overflow-auto">
        <header class="bg-slate-800 border-b border-slate-700 px-6 py-4 sticky top-0">
          <h1 class="text-3xl font-bold">Financial Reports</h1>
        </header>
        
        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card">
              <h2 class="text-xl font-bold mb-4">Monthly Summary</h2>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-slate-400">Total Income</span>
                  <span id="monthly-income" class="font-bold text-green-400">$0</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Total Expenses</span>
                  <span id="monthly-expense" class="font-bold text-red-400">$0</span>
                </div>
                <div class="border-t border-slate-700 pt-3 flex justify-between">
                  <span class="text-slate-300">Net Income</span>
                  <span id="monthly-net" class="font-bold text-xl text-blue-400">$0</span>
                </div>
              </div>
            </div>
            
            <div class="card">
              <h2 class="text-xl font-bold mb-4">Expense Breakdown</h2>
              <div id="expense-breakdown" class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-400">Food</span>
                  <span>$0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
  
  renderLayout('reports')
  
  try {
    const response = await transactionAPI.getAll()
    const transactions = response.data || []
    
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.createdAt)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    document.getElementById('monthly-income').textContent = `$${income.toFixed(2)}`
    document.getElementById('monthly-expense').textContent = `$${expenses.toFixed(2)}`
    document.getElementById('monthly-net').textContent = `$${(income - expenses).toFixed(2)}`
    
    // Expense breakdown by category
    const categoryBreakdown = {}
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'Other'
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + t.amount
      })
    
    const breakdownHtml = Object.entries(categoryBreakdown)
      .map(([category, amount]) => `
        <div class="flex justify-between">
          <span class="text-slate-400">${category}</span>
          <span>$${amount.toFixed(2)}</span>
        </div>
      `)
      .join('')
    
    document.getElementById('expense-breakdown').innerHTML = breakdownHtml || '<p class="text-slate-400">No expenses this month</p>'
  } catch (error) {
    console.error('Error loading reports:', error)
  }
}
