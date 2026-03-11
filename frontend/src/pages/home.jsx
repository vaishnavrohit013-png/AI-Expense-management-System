import { useEffect, useRef } from "react"

import hero from "../assets/image.png"
import planning from "../assets/home-page-img2.jpg"
import growth from "../assets/financial-growth.jpg"

export default function Home() {
  const appRef = useRef(null)

  useEffect(() => {
    if (!appRef.current) return
    renderHomePage(appRef.current)
  }, [])

  return <div id="app" ref={appRef}></div>
}

const renderHomePage = (app) => {

  app.innerHTML = `
  <div style="min-height:100vh;background:#fafbfc;font-family:system-ui">

  <nav style="background:white;padding:20px 40px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 5px rgba(0,0,0,0.05)">
  
  <h1 style="color:#e879a8;font-size:22px;font-weight:700">Finance Manager</h1>

  <div style="display:flex;gap:25px">
  <a href="#features" style="text-decoration:none;color:#111">Features</a>
  <a href="#how" style="text-decoration:none;color:#111">How It Works</a>
  <a href="#faq" style="text-decoration:none;color:#111">FAQ</a>
  <a href="/login" style="background:#ef4444;color:white;padding:8px 18px;border-radius:6px;text-decoration:none">Login</a>
  </div>

  </nav>

  <section style="display:flex;align-items:center;justify-content:space-between;padding:80px 40px;background:#111;color:white">

  <div style="max-width:50%">
  <h2 style="font-size:48px;font-weight:700;margin-bottom:20px">
  Manage Your Money Smarter
  </h2>

  <p style="opacity:.9;margin-bottom:30px">
  Track expenses, manage budgets, and improve your financial health with intelligent insights.
  </p>

  <a href="/register"
  style="background:#ef4444;padding:12px 30px;border-radius:8px;color:white;text-decoration:none;font-weight:600">
  Get Started
  </a>

  </div>

  <img src="${hero}" style="width:420px;border-radius:12px"/>

  </section>

  <section style="padding:80px 40px;background:#f9fafb">

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;max-width:1100px;margin:auto">

  <div>
  <h2 style="font-size:32px;margin-bottom:20px">
  Smart Financial Planning
  </h2>

  <p style="color:#666;line-height:1.6">
  Manage your money easily with intelligent budgeting tools,
  real-time insights, and advanced analytics.
  </p>
  </div>

  <img src="${planning}" 
  style="width:100%;height:320px;object-fit:cover;border-radius:12px"/>

  </div>

  </section>

  <section style="padding:80px 40px;background:white">

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;max-width:1100px;margin:auto">

  <img src="${growth}" 
  style="width:100%;height:320px;object-fit:cover;border-radius:12px"/>

  <div>

  <h2 style="font-size:32px;margin-bottom:20px">
  Watch Your Financial Growth
  </h2>

  <p style="color:#666;line-height:1.6">
  Visual charts and detailed reports help you understand your spending habits and improve savings.
  </p>

  </div>

  </div>

  </section>

  <footer style="background:#111;color:white;text-align:center;padding:30px">
  © 2025 Finance Manager
  </footer>

  </div>
  `;
}