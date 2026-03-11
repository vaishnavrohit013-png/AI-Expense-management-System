import { useEffect, useRef } from "react"
import { userAPI } from '../services/api.js'
import { getCurrentUser, setCurrentUser } from '../utils/auth.js'
import { renderLayout } from '../components/layout.js'

export default function Settings() {
  const appRef = useRef(null)

  useEffect(() => {
    if (!appRef.current) return
    renderSettingsPage(appRef.current)
  }, [])

  return <div id="app" ref={appRef}></div>
}

const renderSettingsPage = (app) => {
  if (!app) app = document.getElementById('app')
  const user = getCurrentUser()
  
  app.innerHTML = `
    <div class="flex h-screen bg-slate-900">
      <div id="sidebar-container"></div>
      
      <main class="flex-1 overflow-auto">
        <header class="bg-slate-800 border-b border-slate-700 px-6 py-4 sticky top-0">
          <h1 class="text-3xl font-bold">Settings</h1>
        </header>
        
        <div class="p-6 max-w-2xl">
          <div class="card mb-6">
            <h2 class="text-2xl font-bold mb-6">Profile Settings</h2>
            
            <form id="profileForm" class="space-y-4">
              <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" value="${user?.name || ''}" />
              </div>
              
              <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" value="${user?.email || ''}" disabled />
              </div>
              
              <div id="success-message" class="hidden"></div>
              <div id="error-message" class="hidden"></div>
              
              <button type="submit" class="btn btn-primary">
                <span id="btn-text">Save Changes</span>
                <span id="btn-loader" class="loading hidden"></span>
              </button>
            </form>
          </div>
          
          <div class="card">
            <h2 class="text-2xl font-bold mb-6">Account Management</h2>
            
            <div class="space-y-4">
              <div class="p-4 bg-slate-800 rounded border border-slate-700">
                <h3 class="font-bold mb-2">Change Password</h3>
                <p class="text-slate-400 mb-4">Update your password to keep your account secure</p>
                <button class="btn btn-secondary">Change Password</button>
              </div>
              
              <div class="p-4 bg-slate-800 rounded border border-slate-700">
                <h3 class="font-bold mb-2">Two-Factor Authentication</h3>
                <p class="text-slate-400 mb-4">Add an extra layer of security to your account</p>
                <button class="btn btn-secondary">Enable 2FA</button>
              </div>
              
              <div class="p-4 bg-red-900/20 border border-red-700 rounded">
                <h3 class="font-bold text-red-400 mb-2">Delete Account</h3>
                <p class="text-slate-400 mb-4">Permanently delete your account and all associated data</p>
                <button class="btn btn-danger">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
  
  renderLayout('settings')
  
  document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate)
}

const handleProfileUpdate = async (e) => {
  e.preventDefault()
  
  const name = document.getElementById('name').value
  const successDiv = document.getElementById('success-message')
  const errorDiv = document.getElementById('error-message')
  const btnText = document.getElementById('btn-text')
  const btnLoader = document.getElementById('btn-loader')
  const submitBtn = document.querySelector('button[type="submit"]')
  
  successDiv.classList.add('hidden')
  errorDiv.classList.add('hidden')
  submitBtn.disabled = true
  btnText.style.display = 'none'
  btnLoader.classList.remove('hidden')
  
  try {
    const response = await userAPI.updateProfile({ name })
    const updatedUser = response.data
    
    setCurrentUser(updatedUser)
    
    successDiv.classList.remove('hidden')
    successDiv.className = 'alert alert-success'
    successDiv.innerHTML = `
      <span>✓</span>
      <span>Profile updated successfully</span>
    `
    
    submitBtn.disabled = false
    btnText.style.display = 'inline'
    btnLoader.classList.add('hidden')
  } catch (error) {
    errorDiv.classList.remove('hidden')
    errorDiv.className = 'alert alert-danger'
    errorDiv.innerHTML = `
      <span>⚠️</span>
      <span>${error.response?.data?.message || 'Failed to update profile'}</span>
    `
    
    submitBtn.disabled = false
    btnText.style.display = 'inline'
    btnLoader.classList.add('hidden')
  }
}
