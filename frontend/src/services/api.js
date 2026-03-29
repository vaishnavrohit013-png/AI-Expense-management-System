/**
 * Frontend API Service
 * 
 * This file handles all network requests to the backend.
 * We use 'axios' for easier data management and error handling.
 */
import axios from "axios"

// The base directory for all our backend API endpoints
const API_BASE_URL = "/api"

// Create a configured axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

/**
 * REQUEST INTERCEPTOR:
 * Automatically runs before every single HTTP request sent by 'api'.
 * We use it to attach the 'token' (saved during login) to the request header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * RESPONSE INTERCEPTOR:
 * Automatically runs whenever the backend sends a response back.
 * If the response is a 401 (Unauthorized/Token expired), we log the user out 
 * and redirect them to the login page (unless they are already on an auth page).
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, config } = error.response || {};
    
    // Check if the request was to an authentication-related endpoint
    const isAuthPath = config?.url?.includes('/auth/login') || 
                      config?.url?.includes('/auth/register') || 
                      config?.url?.includes('/auth/verify-otp') ||
                      config?.url?.includes('/auth/send-otp') ||
                      config?.url?.includes('/auth/status');

    // If unauthorized (401) and NOT on an auth page, clear data and redirect
    if (status === 401 && !isAuthPath) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

/**
 * Authentication Endpoints
 */
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  getCurrentUser: () => api.get("/users/current-user"),
  sendOTP: (email) => api.post("/auth/send-otp", { email }),
  verifyOTP: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  resetPassword: (email, otp, newPassword) => api.post("/auth/reset-password", { email, otp, newPassword }),
  getAuthStatus: () => api.get("/auth/status"),
  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },
}

/**
 * Transaction & Receipt Endpoints
 */
export const transactionAPI = {
  getAll: (params) => api.get("/transactions", { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post("/transactions", data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  duplicate: (id) => api.post(`/transactions/${id}/duplicate`),
  scanReceipt: (formData) =>
    api.post("/transactions/scan-receipt", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
}

/**
 * Report Generation Endpoints
 */
export const reportAPI = {
  getAll: (params) => api.get("/reports/all", { params }),
  generate: (params) => api.get("/reports/generate", { params }),
  updateSettings: (data) => api.put("/reports/update-setting", data),
}

/**
 * Analytics & Summary Endpoints
 */
export const analyticsAPI = {
  getSummary: (params) => api.get("/analytics/summary", { params }),
  getChart: (params) => api.get("/analytics/chart", { params }),
  getExpenseBreakdown: (params) => api.get("/analytics/expense-breakdown", { params }),
}

/**
 * User Profile Endpoints
 */
export const userAPI = {
  updateProfile: (data) => api.put("/users/update", data),
  uploadProfilePicture: (formData) =>
    api.put("/users/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
}

/**
 * AI & Smart Features Endpoints
 */
export const aiAPI = {
  chat: (message, history) => api.post("/ai/chat", { message, history }),
  getInsights: (transactions) => api.post("/ai/insights", { transactions }),
  extractVoice: (text) => api.post("/ai/extract-voice", { text }),
  scanReceipt: (formData) =>
    api.post("/ai/scan-receipt", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
}

export default api