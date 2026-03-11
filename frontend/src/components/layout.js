import { navigate } from '../utils/router.js'
import { getCurrentUser } from '../utils/auth.js'

export const renderLayout = (currentPage) => {
  const sidebarContainer = document.getElementById('sidebar-container')
  
  if (!sidebarContainer) return
  
  const user = getCurrentUser()
  
  sidebarContainer.innerHTML = `
    <aside class="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div class="p-6 border-b border-slate-700">
        <h2 class="text-2xl font-bold text-blue-400">FinanceHub</h2>
      </div>
      
      <nav class="flex-1 p-4 space-y-2">
        <a href="/dashboard" class="nav-link ${currentPage === 'dashboard' ? 'active' : ''}">📊 Dashboard</a>
        <a href="/transactions" class="nav-link ${currentPage === 'transactions' ? 'active' : ''}">💳 Transactions</a>
        <a href="/accounts" class="nav-link ${currentPage === 'accounts' ? 'active' : ''}">🏦 Accounts</a>
        <a href="/reports" class="nav-link ${currentPage === 'reports' ? 'active' : ''}">📈 Reports</a>
        <a href="/settings" class="nav-link ${currentPage === 'settings' ? 'active' : ''}">⚙️ Settings</a>
      </nav>
      
      <div class="p-4 border-t border-slate-700">
        <div class="text-sm text-slate-400 mb-4 text-center">
          <p>${user?.name || 'User'}</p>
          <p class="text-xs">${user?.email || 'email@example.com'}</p>
        </div>
        <button id="logoutBtn" class="btn btn-danger w-full">Logout</button>
      </div>
    </aside>
  `
  
  // Add CSS for nav-link
  const style = document.createElement('style')
  style.textContent = `
    .nav-link {
      display: block;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      color: var(--text-secondary);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .nav-link:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    .nav-link.active {
      background-color: var(--primary);
      color: white;
    }
  `
  if (!document.querySelector('style[data-nav-link]')) {
    style.setAttribute('data-nav-link', 'true')
    document.head.appendChild(style)
  }
  
  setupNavigation(currentPage)
  setupLogout()
}

const setupNavigation = (currentPage) => {
  const links = document.querySelectorAll('.nav-link')
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      navigate(link.getAttribute('href'))
    })
  })
}

const setupLogout = () => {
  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    })
  }
}
