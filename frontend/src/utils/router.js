import { isAuthenticated } from './auth.js'

export const navigate = (path) => {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export const getCurrentPath = () => {
  return window.location.pathname
}

export const isProtectedRoute = (path) => {
  const protectedRoutes = ['/dashboard', '/transactions', '/accounts', '/reports', '/settings', '/add-transaction']
  return protectedRoutes.some(route => path.startsWith(route))
}

export const redirectIfNotAuthenticated = () => {
  if (!isAuthenticated() && isProtectedRoute(getCurrentPath())) {
    navigate('/login')
  }
}

export const redirectIfAuthenticated = () => {
  if (isAuthenticated() && (getCurrentPath() === '/login' || getCurrentPath() === '/register')) {
    navigate('/dashboard')
  }
}
