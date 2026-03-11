import { authAPI } from '../services/api.js'
import { setToken, setCurrentUser } from '../utils/auth.js'
import { navigate } from '../utils/router.js'

let otpStep = 'email' // 'email' or 'otp'
let userEmail = ''
let resendTimer = 0

export const renderOTPLoginPage = () => {
  const app = document.getElementById('app')
  
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 p-4">
      <div class="w-full max-w-md">
        <div class="card border-2 border-blue-500/30">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold">Finance Manager</h1>
            <p class="text-slate-400 mt-2">Secure Login with OTP</p>
          </div>

          <!-- Email Step -->
          <div id="email-step" class="transition-all duration-500">
            <form id="emailForm" class="space-y-4">
              <div class="form-group">
                <label for="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="you@example.com" 
                  required 
                  class="input-field"
                />
              </div>
              
              <div id="email-error" class="hidden text-red-400 text-sm p-3 bg-red-900/20 rounded"></div>
              
              <button type="submit" class="btn btn-primary w-full">
                <span id="email-btn-text">Send OTP</span>
                <span id="email-loader" class="loading hidden"></span>
              </button>

              <p class="text-center text-slate-400 text-sm">
                or use <a href="/login" class="text-blue-400 hover:text-blue-300">password login</a>
              </p>
            </form>
          </div>

          <!-- OTP Step -->
          <div id="otp-step" class="hidden transition-all duration-500">
            <div class="mb-6">
              <p class="text-center text-slate-300">
                Enter the 6-digit code sent to<br>
                <span class="font-semibold text-blue-400" id="display-email"></span>
              </p>
            </div>

            <form id="otpForm" class="space-y-6">
              <div class="flex justify-center gap-2" id="otp-inputs">
                <input type="text" maxlength="1" class="otp-input" autocomplete="off" />
                <input type="text" maxlength="1" class="otp-input" autocomplete="off" />
                <input type="text" maxlength="1" class="otp-input" autocomplete="off" />
                <input type="text" maxlength="1" class="otp-input" autocomplete="off" />
                <input type="text" maxlength="1" class="otp-input" autocomplete="off" />
                <input type="text" maxlength="1" class="otp-input" autocomplete="off" />
              </div>
              
              <div id="otp-error" class="hidden text-red-400 text-sm p-3 bg-red-900/20 rounded"></div>
              
              <button type="submit" class="btn btn-primary w-full">
                <span id="otp-btn-text">Verify OTP</span>
                <span id="otp-loader" class="loading hidden"></span>
              </button>
            </form>

            <div class="mt-6 text-center">
              <p class="text-slate-400 text-sm mb-3">Didn't receive the code?</p>
              <button 
                id="resend-btn" 
                class="text-blue-400 hover:text-blue-300 font-semibold transition"
                onclick="handleResendOTP()"
              >
                Resend OTP
              </button>
              <p id="resend-timer" class="text-slate-500 text-sm mt-2 hidden"></p>
            </div>

            <button 
              type="button" 
              class="w-full mt-6 px-4 py-2 text-slate-400 hover:text-slate-300 transition text-sm"
              onclick="backToEmail()"
            >
              ← Change email
            </button>
          </div>
        </div>

        <p class="text-center text-slate-400 text-sm mt-6">
          Don't have an account? 
          <a href="/register" class="text-blue-400 hover:text-blue-300">Sign up</a>
        </p>
      </div>
    </div>
  `

  setupEmailStep()
  setupOTPInputs()
}

const setupEmailStep = () => {
  const emailForm = document.getElementById('emailForm')
  emailForm.addEventListener('submit', handleSendOTP)
}

const handleSendOTP = async (e) => {
  e.preventDefault()
  
  const emailInput = document.getElementById('email')
  const email = emailInput.value.trim()
  const emailError = document.getElementById('email-error')
  const emailBtn = document.getElementById('email-btn-text')
  const emailLoader = document.getElementById('email-loader')
  
  // Validate email
  if (!email || !email.includes('@')) {
    emailError.textContent = 'Please enter a valid email address'
    emailError.classList.remove('hidden')
    return
  }
  
  emailError.classList.add('hidden')
  emailBtn.classList.add('hidden')
  emailLoader.classList.remove('hidden')
  
  try {
    await authAPI.sendOTP(email)
    
    userEmail = email
    document.getElementById('display-email').textContent = email
    
    // Transition to OTP step
    document.getElementById('email-step').classList.add('hidden')
    document.getElementById('otp-step').classList.remove('hidden')
    
    // Focus first OTP input
    const otpInputs = document.querySelectorAll('.otp-input')
    otpInputs[0].focus()
    
    // Start resend timer
    startResendTimer()
  } catch (error) {
    emailError.textContent = error.response?.data?.message || 'Failed to send OTP. Please try again.'
    emailError.classList.remove('hidden')
  } finally {
    emailBtn.classList.remove('hidden')
    emailLoader.classList.add('hidden')
  }
}

const setupOTPInputs = () => {
  const otpInputs = document.querySelectorAll('.otp-input')
  
  otpInputs.forEach((input, index) => {
    // Handle input
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1) {
        // Move to next input
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus()
        }
      }
      // Auto-submit if all fields are filled
      if (Array.from(otpInputs).every(inp => inp.value.length === 1)) {
        handleVerifyOTP()
      }
    })
    
    // Handle backspace
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && e.target.value === '') {
        if (index > 0) {
          otpInputs[index - 1].focus()
        }
      }
    })
    
    // Handle paste
    input.addEventListener('paste', (e) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
      otpInputs.forEach((inp, i) => {
        inp.value = pastedData[i] || ''
      })
      if (pastedData.length === 6) {
        handleVerifyOTP()
      }
    })
  })
  
  const otpForm = document.getElementById('otpForm')
  otpForm.addEventListener('submit', (e) => {
    e.preventDefault()
    handleVerifyOTP()
  })
}

const handleVerifyOTP = async () => {
  const otpInputs = document.querySelectorAll('.otp-input')
  const otp = Array.from(otpInputs).map(inp => inp.value).join('')
  const otpError = document.getElementById('otp-error')
  const otpBtn = document.getElementById('otp-btn-text')
  const otpLoader = document.getElementById('otp-loader')
  
  if (otp.length !== 6) {
    otpError.textContent = 'Please enter a 6-digit OTP'
    otpError.classList.remove('hidden')
    return
  }
  
  otpError.classList.add('hidden')
  otpBtn.classList.add('hidden')
  otpLoader.classList.remove('hidden')
  
  try {
    const response = await authAPI.verifyOTP(userEmail, otp)
    
    if (response.data.token) {
      setToken(response.data.token)
      if (response.data.user) {
        setCurrentUser(response.data.user)
      }
      navigate('/dashboard')
    }
  } catch (error) {
    otpError.textContent = error.response?.data?.message || 'Invalid OTP. Please try again.'
    otpError.classList.remove('hidden')
    
    // Clear inputs
    otpInputs.forEach(inp => inp.value = '')
    otpInputs[0].focus()
  } finally {
    otpBtn.classList.remove('hidden')
    otpLoader.classList.add('hidden')
  }
}

const handleResendOTP = async () => {
  const resendBtn = document.getElementById('resend-btn')
  resendBtn.disabled = true
  resendBtn.classList.add('opacity-50', 'cursor-not-allowed')
  
  try {
    await authAPI.sendOTP(userEmail)
    
    // Clear OTP inputs
    const otpInputs = document.querySelectorAll('.otp-input')
    otpInputs.forEach(inp => inp.value = '')
    otpInputs[0].focus()
    
    startResendTimer()
  } catch (error) {
    const otpError = document.getElementById('otp-error')
    otpError.textContent = 'Failed to resend OTP'
    otpError.classList.remove('hidden')
  }
}

const startResendTimer = () => {
  const resendBtn = document.getElementById('resend-btn')
  const resendTimer_el = document.getElementById('resend-timer')
  let seconds = 60
  
  resendBtn.disabled = true
  resendBtn.classList.add('opacity-50', 'cursor-not-allowed')
  resendTimer_el.classList.remove('hidden')
  
  const interval = setInterval(() => {
    seconds--
    resendTimer_el.textContent = `Resend in ${seconds}s`
    
    if (seconds === 0) {
      clearInterval(interval)
      resendBtn.disabled = false
      resendBtn.classList.remove('opacity-50', 'cursor-not-allowed')
      resendTimer_el.classList.add('hidden')
    }
  }, 1000)
}

window.handleResendOTP = handleResendOTP

const backToEmail = () => {
  document.getElementById('otp-step').classList.add('hidden')
  document.getElementById('email-step').classList.remove('hidden')
  const emailInput = document.getElementById('email')
  emailInput.focus()
  
  // Clear OTP inputs
  const otpInputs = document.querySelectorAll('.otp-input')
  otpInputs.forEach(inp => inp.value = '')
}

window.backToEmail = backToEmail
