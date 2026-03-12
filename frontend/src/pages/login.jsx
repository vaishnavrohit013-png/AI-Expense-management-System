import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(loginData.email, loginData.password);
            navigate('/dashboard');
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfcfb] flex flex-col items-center justify-center p-6 font-['Inter'] selection:bg-blue-100 selection:text-blue-900">
            <Link to="/" className="mb-12 text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Finance <span className="text-blue-600">Archive_</span></Link>
            
            <div className="w-full max-w-[520px]">
                {/* Login Card */}
                <div className="bg-white rounded-[3rem] p-12 md:p-16 border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)]">
                    <div className="mb-12">
                        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-none italic uppercase">Authorize <br/> <span className="text-blue-600">Access_</span></h1>
                        <p className="text-slate-400 font-medium text-lg italic tracking-tight opacity-70">Sign in to your financial node_</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Email ID</label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="vaishnavrohit013@gmail.com"
                                value={loginData.email}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-200"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Password</label>
                                <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Recovery?</Link>
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="••••••••"
                                value={loginData.password}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-200"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs transition-all hover:bg-blue-700 active:scale-95 mt-6 flex justify-center items-center shadow-2xl shadow-blue-100 border-b-4 border-blue-800"
                        >
                            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Authorize Hub_'}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-slate-400 font-medium">
                            First time? <Link to="/register" className="text-blue-600 font-black hover:underline uppercase tracking-[0.2em] text-[10px] ml-2">Initialize Node_</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;