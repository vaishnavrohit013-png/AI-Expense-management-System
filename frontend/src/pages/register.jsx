import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { authAPI } from "../services/api.js"
import { setToken, setCurrentUser } from "../utils/auth.js"

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGoogleAuth = (e) => {
    e.preventDefault()
    window.location.href = "http://localhost:8000/api/auth/google"
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    setErrorMessage("")

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.register({
        name,
        email,
        password,
      })

      const { token, user } = response.data

      setToken(token)
      setCurrentUser(user)

      navigate("/dashboard")
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Registration failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .register-input:focus {
            outline: none;
            border-color: #7cc8e5;
            box-shadow: 0 0 0 3px rgba(184, 224, 240, 0.5);
          }
          .register-btn:hover:enabled,
          .google-btn:hover,
          .link-btn:hover {
            opacity: 0.9;
            transform: translateY(-2px);
          }
        `}
      </style>

      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2
            style={{
              color: "#e879a8",
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            Logo Here
          </h2>
          <p style={{ color: "#666666", fontSize: "0.95rem" }}>Join us today !!!</p>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h1
            style={{
              color: "#1a1a1a",
              fontSize: "2.2rem",
              fontWeight: 700,
              marginBottom: "1.5rem",
            }}
          >
            Sign Up
          </h1>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  color: "#1a1a1a",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="register-input"
                style={{
                  padding: "0.875rem 1rem",
                  backgroundColor: "#b8e0f0",
                  border: "1px solid #9fd4ed",
                  borderRadius: "0.5rem",
                  color: "#1a1a1a",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  color: "#1a1a1a",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="register-input"
                style={{
                  padding: "0.875rem 1rem",
                  backgroundColor: "#b8e0f0",
                  border: "1px solid #9fd4ed",
                  borderRadius: "0.5rem",
                  color: "#1a1a1a",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  color: "#1a1a1a",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                }}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="register-input"
                style={{
                  padding: "0.875rem 1rem",
                  backgroundColor: "#b8e0f0",
                  border: "1px solid #9fd4ed",
                  borderRadius: "0.5rem",
                  color: "#1a1a1a",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  color: "#1a1a1a",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="register-input"
                style={{
                  padding: "0.875rem 1rem",
                  backgroundColor: "#b8e0f0",
                  border: "1px solid #9fd4ed",
                  borderRadius: "0.5rem",
                  color: "#1a1a1a",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                }}
              />
            </div>

            {errorMessage ? (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  borderRadius: "0.5rem",
                  fontSize: "0.9rem",
                }}
              >
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="register-btn"
              style={{
                padding: "0.875rem 1rem",
                backgroundColor: "#ef4444",
                color: "white",
                border: "1px solid #dc2626",
                borderRadius: "0.5rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.3s ease",
                marginTop: "0.5rem",
                fontSize: "1rem",
              }}
            >
              <span style={{ display: loading ? "none" : "inline" }}>SIGN UP</span>
              <span
                style={{
                  display: loading ? "inline-block" : "none",
                  width: "1rem",
                  height: "1rem",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </button>
          </form>

          <div style={{ marginTop: "2rem" }}>
            <p
              style={{
                textAlign: "center",
                color: "#666666",
                fontSize: "0.9rem",
                marginBottom: "1.25rem",
              }}
            >
              or continue with
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem" }}>
              <button
                onClick={handleGoogleAuth}
                className="google-btn"
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  borderRadius: "50%",
                  border: "1px solid #d4d4d4",
                  background: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  fontSize: "1.5rem",
                }}
              >
                <svg style={{ width: "1.5rem", height: "1.5rem" }} viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </button>
            </div>
          </div>

          <p
            style={{
              textAlign: "center",
              color: "#666666",
              fontSize: "0.9rem",
              marginTop: "1.75rem",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="link-btn"
              style={{
                color: "#e879a8",
                textDecoration: "none",
                fontWeight: 600,
                transition: "color 0.3s",
              }}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register