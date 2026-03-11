import { useEffect, useRef } from "react"
import { transactionAPI } from '../services/api.js'
import { navigate } from '../utils/router.js'
import { renderLayout } from '../components/layout.js'

export default function Transactions() {
  const appRef = useRef(null)

  useEffect(() => {
    if (!appRef.current) return
    renderTransactionsPage(appRef.current)
  }, [])

  return <div id="app" ref={appRef}></div>
}

const renderTransactionsPage = async (app) => {
  if (!app) app = document.getElementById('app')
  
  app.innerHTML = `
    <div class="flex h-screen bg-slate-900">
      <div id="sidebar-container"></div>
      
      <main class="flex-1 overflow-auto">
        <header class="bg-slate-800 border-b border-slate-700 px-6 py-4 sticky top-0">
          <div class="flex justify-between items-center">
            <h1 class="text-3xl font-bold">Transactions</h1>
            <a href="/add-transaction" class="btn btn-primary">+ Add Transaction</a>
          </div>
        </header>
        
        <div class="p-6">
          <div class="card mb-6">
            <div class="flex gap-4 flex-wrap">
              <input type="search" id="searchInput" placeholder="Search transactions..." class="flex-1 min-w-64" />
              <select id="categoryFilter" class="min-w-32">
                <option value="">All Categories</option>
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="entertainment">Entertainment</option>
                <option value="utilities">Utilities</option>
                <option value="salary">Salary</option>
                <option value="other">Other</option>
              </select>
              <select id="typeFilter" class="min-w-32">
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
          
          <div id="transactions-table" class="card">
            <div class="text-center py-8">
              <div class="loading mx-auto mb-4"></div>
              <p class="text-slate-400">Loading transactions...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
  
  renderLayout('transactions')
  
  try {
    const response = await transactionAPI.getAll()
    const allTransactions = response.data || []
    
    let filteredTransactions = allTransactions
    
    // Setup filters
    document.getElementById('searchInput').addEventListener('input', (e) => {
      filteredTransactions = filterTransactions(allTransactions, e.target.value, document.getElementById('categoryFilter').value, document.getElementById('typeFilter').value)
      renderTransactionsTable(filteredTransactions)
    })
    
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
      filteredTransactions = filterTransactions(allTransactions, document.getElementById('searchInput').value, e.target.value, document.getElementById('typeFilter').value)
      renderTransactionsTable(filteredTransactions)
    })
    
    document.getElementById('typeFilter').addEventListener('change', (e) => {
      filteredTransactions = filterTransactions(allTransactions, document.getElementById('searchInput').value, document.getElementById('categoryFilter').value, e.target.value)
      renderTransactionsTable(filteredTransactions)
    })
    
    renderTransactionsTable(allTransactions)
  } catch (error) {
    console.error('Error loading transactions:', error)
    document.getElementById('transactions-table').innerHTML = '<div class="alert alert-danger">Failed to load transactions</div>'
  }
}

const filterTransactions = (transactions, search, category, type) => {
  return transactions.filter(t => {
    const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !category || t.category === category
    const matchType = !type || t.type === type
    return matchSearch && matchCategory && matchType
  })
}

const renderTransactionsTable = (transactions) => {
  const container = document.getElementById('transactions-table')
  
  if (transactions.length === 0) {
    container.innerHTML = '<p class="text-center py-8 text-slate-400">No transactions found</p>'
    return
  }
  
  const html = `
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-700">
            <th class="text-left py-3 px-4 font-semibold">Description</th>
            <th class="text-left py-3 px-4 font-semibold">Category</th>
            <th class="text-left py-3 px-4 font-semibold">Date</th>
            <th class="text-right py-3 px-4 font-semibold">Amount</th>
            <th class="text-center py-3 px-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => `
            <tr class="border-b border-slate-700/50 hover:bg-slate-800/50 transition">
              <td class="py-3 px-4">${t.description || 'N/A'}</td>
              <td class="py-3 px-4">
                <span class="bg-slate-700 px-2 py-1 rounded text-sm">${t.category || 'Other'}</span>
              </td>
              <td class="py-3 px-4 text-slate-400">${new Date(t.createdAt).toLocaleDateString()}</td>
              <td class="py-3 px-4 text-right font-bold">
                <span class="${t.type === 'income' ? 'text-green-400' : 'text-red-400'}">
                  ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <button class="delete-btn text-red-400 hover:text-red-300" data-id="${t._id}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
  
  container.innerHTML = html
  
  // Setup delete handlers
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id')
      if (confirm('Are you sure you want to delete this transaction?')) {
        try {
          await transactionAPI.delete(id)
          renderTransactionsPage()
        } catch (error) {
          alert('Failed to delete transaction')
        }
      }
    })
  })
}
