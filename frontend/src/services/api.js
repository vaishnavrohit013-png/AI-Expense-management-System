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
    if (error.response?.status === 401) {
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
  getCurrentUser: () => api.get("/auth/current-user"),
  sendOTP: (email) => api.post("/auth/send-otp", { email }),
  verifyOTP: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },
}

export const transactionAPI = {
  getAll: () => api.get("/transaction"),
  create: (data) => api.post("/transaction", data),
  update: (id, data) => api.put(`/transaction/${id}`, data),
  delete: (id) => api.delete(`/transaction/${id}`),
}

export const reportAPI = {
  getAll: () => api.get("/report"),
  create: (data) => api.post("/report", data),
}

export const userAPI = {
  updateProfile: (data) => api.put("/user/update", data),
  uploadProfilePicture: (formData) =>
    api.put("/user/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
}

export const budgetAPI = {
  getMonthlyBudget: () => api.get("/report/budget"),
  setBudget: (amount) => api.post("/report/budget", { amount }),
  getBudgetUsage: () => api.get("/report/budget-usage"),
}

export default api