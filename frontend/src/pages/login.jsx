import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { authAPI } from "../services/api"
import { setToken, setCurrentUser } from "../utils/auth"

function Login() {

  const navigate = useNavigate()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [errorMessage,setErrorMessage] = useState("")
  const [loading,setLoading] = useState(false)

  const handleGoogleAuth = (e)=>{
    e.preventDefault()
    window.location.href="http://localhost:8000/api/auth/google"
  }

  const handleLogin = async(e)=>{
    e.preventDefault()

    setErrorMessage("")
    setLoading(true)

    try{

      const response = await authAPI.login(email,password)
      const {token,user} = response.data

      setToken(token)
      setCurrentUser(user)

      navigate("/dashboard")

    }catch(error){

      setErrorMessage(
        error.response?.data?.message || "Login failed"
      )

      setLoading(false)

    }

  }

  return(
    <div style={{
      minHeight:"100vh",
      display:"flex",
      justifyContent:"center",
      alignItems:"center"
    }}>

      <form onSubmit={handleLogin} style={{width:"320px"}}>

        <h2>Login</h2>

        <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        />

        <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        />

        {errorMessage && <p>{errorMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>

        <button onClick={handleGoogleAuth}>
          Login with Google
        </button>

        <p>
          Don't have account? <Link to="/register">Register</Link>
        </p>

      </form>

    </div>
  )

}

export default Login