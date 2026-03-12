import { Routes, Route } from "react-router-dom"

import Home from "./pages/home.jsx"
import Login from "./pages/login.jsx"
import Register from "./pages/register.jsx"
import VerifyEmail from "./pages/verify-email.jsx"
import Dashboard from "./pages/dashboard.jsx"
import Accounts from "./pages/accounts.jsx"
import Transactions from "./pages/transactions.jsx"
import AddTransaction from "./pages/add-transaction.jsx"
import Reports from "./pages/reports.jsx"
import Settings from "./pages/settings.jsx"
import Analytics from "./pages/analytics.jsx"
import Receipts from "./pages/receipts.jsx"

import ForgotPassword from "./pages/forgot-password.jsx"

import ProtectedRoute from "./components/ProtectedRoute.jsx"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/receipts" element={<Receipts />} />
      </Route>
    </Routes>
  )
}

export default App