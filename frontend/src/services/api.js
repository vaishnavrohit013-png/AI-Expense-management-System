import axios from "axios"

const API_BASE_URL = "/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, config } = error.response || {};
    
    // Don't redirect if it's a 401 on login, register, or verify-otp endpoints
    const isAuthPath = config?.url?.includes('/auth/login') || 
                      config?.url?.includes('/auth/register') || 
                      config?.url?.includes('/auth/verify-otp') ||
                      config?.url?.includes('/auth/send-otp') ||
                      config?.url?.includes('/auth/status');

    if (status === 401 && !isAuthPath) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

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

export const reportAPI = {
  getAll: (params) => api.get("/reports/all", { params }),
  generate: (params) => api.get("/reports/generate", { params }),
  updateSettings: (data) => api.put("/reports/update-setting", data),
}

export const analyticsAPI = {
  getSummary: (params) => api.get("/analytics/summary", { params }),
  getChart: (params) => api.get("/analytics/chart", { params }),
  getExpenseBreakdown: (params) => api.get("/analytics/expense-breakdown", { params }),
}

export const userAPI = {
  updateProfile: (data) => api.put("/users/update", data),
  uploadProfilePicture: (formData) =>
    api.put("/users/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
}

export const aiAPI = {
  chat: (message, history) => api.post("/ai/chat", { message, history }),
  getInsights: (transactions) => api.post("/ai/insights", { transactions }),
  extractVoice: (text) => api.post("/ai/extract-voice", { text }),
}

export default api