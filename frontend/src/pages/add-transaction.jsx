import { useEffect, useRef } from "react"
import { transactionAPI } from '../services/api.js'
import { navigate } from '../utils/router.js'
import { renderLayout } from '../components/layout.js'

export default function AddTransaction() {
  const appRef = useRef(null)

  useEffect(() => {
    if (!appRef.current) return
    renderAddTransactionPage(appRef.current)
  }, [])

  return <div id="app" ref={appRef}></div>
}

const renderAddTransactionPage = (app) => {
  if (!app) app = document.getElementById('app')
  
  app.innerHTML = `
    <div class="flex h-screen bg-slate-900">
      <div id="sidebar-container"></div>
      
      <main class="flex-1 overflow-auto">
        <header class="bg-slate-800 border-b border-slate-700 px-6 py-4 sticky top-0">
          <h1 class="text-3xl font-bold">Add Transaction</h1>
        </header>
        
        <div class="p-6 max-w-2xl">
          <form id="transactionForm" class="card space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label for="type">Transaction Type</label>
                <select id="type" required>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="category">Category</label>
                <select id="category" required>
                  <option value="">Select Category</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="utilities">Utilities</option>
                  <option value="salary">Salary</option>
                  <option value="bonus">Bonus</option>
                  <option value="investment">Investment</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="description">Description</label>
              <input type="text" id="description" placeholder="e.g., Grocery shopping" required />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label for="amount">Amount</label>
                <input type="number" id="amount" placeholder="0.00" step="0.01" min="0" required />
              </div>
              
              <div class="form-group">
                <label for="date">Date</label>
                <input type="date" id="date" required />
              </div>
            </div>
            
            <div class="form-group">
              <label for="account">Account</label>
              <input type="text" id="account" placeholder="e.g., Checking Account" />
            </div>
            
            <div id="error-message" class="hidden"></div>
            
            <div class="flex gap-4">
              <button type="submit" class="btn btn-primary">
                <span id="btn-text">Add Transaction</span>
                <span id="btn-loader" class="loading hidden"></span>
              </button>
              <button type="button" class="btn btn-secondary" onclick="window.history.back()">Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `
  
  renderLayout('add-transaction')
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0]
  document.getElementById('date').value = today
  
  document.getElementById('transactionForm').addEventListener('submit', handleAddTransaction)
}

const handleAddTransaction = async (e) => {
  e.preventDefault()
  
  const type = document.getElementById('type').value
  const category = document.getElementById('category').value
  const description = document.getElementById('description').value
  const amount = parseFloat(document.getElementById('amount').value)
  const date = document.getElementById('date').value
  const account = document.getElementById('account').value
  const errorDiv = document.getElementById('error-message')
  const btnText = document.getElementById('btn-text')
  const btnLoader = document.getElementById('btn-loader')
  const submitBtn = document.querySelector('button[type="submit"]')
  
  errorDiv.classList.add('hidden')
  submitBtn.disabled = true
  btnText.style.display = 'none'
  btnLoader.classList.remove('hidden')
  
  try {
    await transactionAPI.create({
      type,
      category,
      description,
      amount,
      date,
      account: account || 'Default'
    })
    
    navigate('/transactions')
  } catch (error) {
    errorDiv.classList.remove('hidden')
    errorDiv.className = 'alert alert-danger'
    errorDiv.innerHTML = `
      <span>⚠️</span>
      <span>${error.response?.data?.message || 'Failed to add transaction'}</span>
    `
    
    submitBtn.disabled = false
    btnText.style.display = 'inline'
    btnLoader.classList.add('hidden')
  }
}
