import { renderLayout } from '../components/layout.js'

export const renderAccountsPage = () => {
  const app = document.getElementById('app')
  
  app.innerHTML = `
    <div class="flex h-screen bg-slate-900">
      <div id="sidebar-container"></div>
      
      <main class="flex-1 overflow-auto">
        <header class="bg-slate-800 border-b border-slate-700 px-6 py-4 sticky top-0">
          <div class="flex justify-between items-center">
            <h1 class="text-3xl font-bold">Accounts</h1>
            <button class="btn btn-primary">+ Add Account</button>
          </div>
        </header>
        
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="card">
              <h3 class="text-xl font-bold mb-2">Checking Account</h3>
              <p class="text-slate-400 mb-4">Primary account</p>
              <p class="text-3xl font-bold text-blue-400 mb-4">$5,234.50</p>
              <button class="btn btn-secondary w-full">Manage</button>
            </div>
            
            <div class="card">
              <h3 class="text-xl font-bold mb-2">Savings Account</h3>
              <p class="text-slate-400 mb-4">Emergency fund</p>
              <p class="text-3xl font-bold text-green-400 mb-4">$12,500.00</p>
              <button class="btn btn-secondary w-full">Manage</button>
            </div>
            
            <div class="card">
              <h3 class="text-xl font-bold mb-2">Investment Account</h3>
              <p class="text-slate-400 mb-4">Growth portfolio</p>
              <p class="text-3xl font-bold text-purple-400 mb-4">$28,750.75</p>
              <button class="btn btn-secondary w-full">Manage</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
  
  renderLayout('accounts')
}
