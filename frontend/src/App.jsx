/**
 * Frontend Main Application Component
 * 
 * This file handles all routing for the application.
 * It defines which component should be shown for each URL path.
 */
import { Routes, Route } from "react-router-dom"

import Home from "./pages/home.jsx"
import Login from "./pages/login.jsx"
import Register from "./pages/register.jsx"
import Dashboard from "./pages/dashboard.jsx"
import Accounts from "./pages/accounts.jsx"
import Transactions from "./pages/transactions.jsx"
import AddTransaction from "./pages/add-transaction.jsx"
import Profile from "./pages/profile.jsx"
import Analytics from "./pages/analytics.jsx"
import Receipts from "./pages/receipts.jsx"
import Chat from "./pages/chat.jsx"

import ForgotPassword from "./pages/forgot-password.jsx"

import ProtectedRoute from "./components/ProtectedRoute.jsx"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/receipts" element={<Receipts />} />
        <Route path="/chat" element={<Chat />} />
      </Route>
    </Routes>
  )
}

export default App