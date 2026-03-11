export const isAuthenticated = () => {
  return !!localStorage.getItem("token")
}

export const getToken = () => {
  return localStorage.getItem("token")
}

export const setToken = (token) => {
  localStorage.setItem("token", token)
}

export const removeToken = () => {
  localStorage.removeItem("token")
}

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  } catch {
    localStorage.removeItem("user")
    return null
  }
}

export const setCurrentUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}