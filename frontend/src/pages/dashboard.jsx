import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { transactionAPI, budgetAPI } from "../services/api.js"
import { getCurrentUser } from "../utils/auth.js"

function Dashboard() {
  const appRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!appRef.current) return

    try {
      renderDashboardPage(appRef.current)
      setupNavigation(appRef.current, navigate)
      setupLogout(appRef.current, navigate)
      loadDashboardData(appRef.current)
    } catch (error) {
      console.error("Dashboard render error:", error)
      appRef.current.innerHTML = `
        <div style="padding: 2rem; font-family: Arial, sans-serif;">
          <h1 style="color: #111827;">Dashboard loaded with an error</h1>
          <p style="color: #6b7280;">Check browser console for details.</p>
        </div>
      `
    }
  }, [navigate])

  return <div ref={appRef}></div>
}

export default Dashboard

function renderDashboardPage(app) {
  app.innerHTML = `
    <div style="min-height: 100vh; background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%); display: flex;">
      <aside style="width: 280px; background: white; border-right: 1px solid #d4d4d4; display: flex; flex-direction: column; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="padding: 1.5rem; border-bottom: 1px solid #d4d4d4;">
          <h2 style="color: #e879a8; font-size: 1.5rem; font-weight: 700;">FinanceHub</h2>
        </div>

        <nav style="flex: 1; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <a href="/dashboard" class="nav-link active" style="padding: 0.75rem 1rem; border-radius: 0.5rem; text-decoration: none; transition: all 0.3s; background-color: #e879a8; color: white; font-weight: 500;">📊 Dashboard</a>
          <a href="/transactions" class="nav-link" style="padding: 0.75rem 1rem; border-radius: 0.5rem; color: #666666; text-decoration: none; transition: all 0.3s;">💳 Transactions</a>
          <a href="/accounts" class="nav-link" style="padding: 0.75rem 1rem; border-radius: 0.5rem; color: #666666; text-decoration: none; transition: all 0.3s;">🏦 Accounts</a>
          <a href="/reports" class="nav-link" style="padding: 0.75rem 1rem; border-radius: 0.5rem; color: #666666; text-decoration: none; transition: all 0.3s;">📈 Reports</a>
          <a href="/settings" class="nav-link" style="padding: 0.75rem 1rem; border-radius: 0.5rem; color: #666666; text-decoration: none; transition: all 0.3s;">⚙️ Settings</a>
        </nav>

        <div style="padding: 1rem; border-top: 1px solid #d4d4d4;">
          <button id="logoutBtn" style="width: 100%; padding: 0.75rem 1rem; background-color: #ef4444; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">Logout</button>
        </div>
      </aside>

      <main style="flex: 1; overflow-y: auto; display: flex; flex-direction: column;">
        <header style="background: white; border-bottom: 1px solid #d4d4d4; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
          <h1 style="color: #1a1a1a; font-size: 1.875rem; font-weight: 700;">Dashboard</h1>
          <div style="color: #666666; font-size: 0.95rem;">
            <span id="userName">Loading...</span>
          </div>
        </header>

        <div style="flex: 1; padding: 2rem; overflow-y: auto;">
          <div id="stats-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: white; border-radius: 1rem; padding: 1.5rem; border: 1px solid #d4d4d4;">
              <p style="color: #666666;">Loading dashboard...</p>
            </div>
          </div>

          <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #d4d4d4; margin-bottom: 2rem;">
            <h3 style="color: #1a1a1a; font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem;">Financial Health Score</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center;">
              <div>
                <div style="background: linear-gradient(135deg, #b8e0f0, #7cc8e5); border-radius: 1rem; padding: 2rem; text-align: center; color: white;">
                  <p style="font-size: 0.9rem; margin-bottom: 0.5rem; opacity: 0.95;">Your Score</p>
                  <p id="healthScore" style="font-size: 3rem; font-weight: 700; margin: 0;">--</p>
                  <p style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.9;">out of 100</p>
                </div>
              </div>
              <div>
                <p id="healthMessage" style="color: #666666; line-height: 1.6; margin: 0;"></p>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #d4d4d4;">
              <h2 style="color: #1a1a1a; font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem;">Recent Transactions</h2>
              <div id="transactions-container">
                <p style="color: #666666; text-align: center; padding: 2rem;">Loading...</p>
              </div>
            </div>

            <div style="background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #d4d4d4;">
              <h2 style="color: #1a1a1a; font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem;">Quick Actions</h2>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <a href="/add-transaction" class="nav-link" style="display: block; padding: 0.875rem 1rem; background: #e879a8; color: white; text-decoration: none; border-radius: 0.5rem; text-align: center; font-weight: 600;">+ Add Transaction</a>
                <a href="/accounts" class="nav-link" style="display: block; padding: 0.875rem 1rem; background: #b8e0f0; color: #1a1a1a; text-decoration: none; border-radius: 0.5rem; text-align: center; font-weight: 600;">Manage Accounts</a>
                <a href="/reports" class="nav-link" style="display: block; padding: 0.875rem 1rem; background: #b8e0f0; color: #1a1a1a; text-decoration: none; border-radius: 0.5rem; text-align: center; font-weight: 600;">View Reports</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <style>
      .nav-link:hover {
        background-color: #f5f7fa !important;
        color: #e879a8 !important;
      }
      .nav-link.active {
        background-color: #e879a8 !important;
        color: white !important;
      }
    </style>
  `
}

async function loadDashboardData(root) {
  try {
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null
    const userName = root.querySelector("#userName")
    if (userName) {
      userName.textContent = user?.name || "User"
    }

    const transactionResponse =
      transactionAPI && typeof transactionAPI.getAll === "function"
        ? await transactionAPI.getAll()
        : { data: [] }

    const transactions = Array.isArray(transactionResponse?.data) ? transactionResponse.data : []

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date)
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear
    })

    const totalIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    const totalExpense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    const totalBalance = totalIncome - totalExpense

    const healthScoreEl = root.querySelector("#healthScore")
    const healthMessageEl = root.querySelector("#healthMessage")

    if (healthScoreEl) healthScoreEl.textContent = "75"
    if (healthMessageEl) {
      healthMessageEl.textContent = "Dashboard is rendering correctly. Connect backend data step by step."
    }

    const statsContainer = root.querySelector("#stats-container")
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div style="background: white; border-radius: 1rem; padding: 1.5rem; border: 1px solid #d4d4d4;">
          <p style="color: #666666; font-size: 0.9rem;">Total Balance</p>
          <p style="color: #1a1a1a; font-size: 1.5rem; font-weight: 700;">$${totalBalance.toFixed(2)}</p>
        </div>
        <div style="background: white; border-radius: 1rem; padding: 1.5rem; border: 1px solid #d4d4d4;">
          <p style="color: #666666; font-size: 0.9rem;">Income</p>
          <p style="color: #10b981; font-size: 1.5rem; font-weight: 700;">$${totalIncome.toFixed(2)}</p>
        </div>
        <div style="background: white; border-radius: 1rem; padding: 1.5rem; border: 1px solid #d4d4d4;">
          <p style="color: #666666; font-size: 0.9rem;">Expenses</p>
          <p style="color: #ef4444; font-size: 1.5rem; font-weight: 700;">$${totalExpense.toFixed(2)}</p>
        </div>
      `
    }

    const transactionsContainer = root.querySelector("#transactions-container")
    if (transactionsContainer) {
      if (monthTransactions.length === 0) {
        transactionsContainer.innerHTML = `<p style="color: #666666; text-align: center; padding: 2rem;">No transactions this month</p>`
      } else {
        transactionsContainer.innerHTML = monthTransactions
          .slice(0, 5)
          .map(
            (t) => `
            <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="color: #1a1a1a; font-weight: 500; margin-bottom: 0.25rem;">${t.category || "Other"}</p>
                <p style="color: #666666; font-size: 0.85rem;">${new Date(t.date).toLocaleDateString()}</p>
              </div>
              <span style="color: ${t.type === "income" ? "#10b981" : "#ef4444"}; font-weight: 600;">
                ${t.type === "income" ? "+" : "-"}$${Number(t.amount || 0).toFixed(2)}
              </span>
            </div>
          `
          )
          .join("")
      }
    }

    if (budgetAPI && typeof budgetAPI.getMonthlyBudget === "function") {
      try {
        await budgetAPI.getMonthlyBudget()
      } catch {
      }
    }
  } catch (error) {
    console.error("Dashboard data error:", error)
  }
}

function setupNavigation(root, navigate) {
  const navLinks = root.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const href = link.getAttribute("href")
      if (href) navigate(href)
    })
  })
}

function setupLogout(root, navigate) {
  const logoutBtn = root.querySelector("#logoutBtn")
  if (!logoutBtn) return

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  })
}