import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await authAPI.login(loginData.email, loginData.password);
            const { accessToken, user } = response.data.data;
            login(accessToken, user);
            setSuccess('LOGIN SUCCESSFULLY! REDIRECTING TO DASHBOARD...');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.response?.data?.message || "Invalid credentials provided.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 selection:bg-[#003399]/20 selection:text-[#003399]">
            {/* Background Layer */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/auth_background.png')" }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-brightness-50"></div>
            </div>

            <div className="w-full max-w-[520px] relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="bg-black/80 backdrop-blur-xl rounded-[2rem] p-12 md:p-16 border border-white/5 shadow-2xl flex flex-col items-center">
                    <div className="text-center space-y-4 mb-20">
                        <h1 className="text-6xl font-black font-serif text-white tracking-tight">FinanceAI</h1>
                        <p className="text-gray-300 text-sm font-medium italic opacity-80">Login to continue your journey</p>
                    </div>

                    {error && (
                        <div className="w-full mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-black uppercase tracking-widest text-center animate-in slide-in-from-top-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="w-full mb-8 p-4 bg-emerald-500/10 border border-emerald-100/20 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center animate-in slide-in-from-top-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="w-full space-y-16">
                        <div className="space-y-12">
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="Enter Your Email"
                                value={loginData.email}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-white py-2 text-white placeholder:text-gray-500 outline-none focus:border-[#1e40af] transition-colors text-lg"
                            />

                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="Enter Your Password"
                                value={loginData.password}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-white py-2 text-white placeholder:text-gray-500 outline-none focus:border-[#1e40af] transition-colors text-lg"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-[#1e40af] text-white rounded-2xl font-black text-base tracking-widest transition-all hover:bg-blue-800 active:scale-[0.98] flex justify-center items-center shadow-xl shadow-blue-900/40 uppercase"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'LOGIN'}
                        </button>
                    </form>

                    <div className="text-center mt-12">
                        <p className="text-sm font-medium text-gray-300">
                            Don't have an account? <Link to="/register" className="text-white hover:text-blue-400 transition-colors ml-1 font-bold">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;