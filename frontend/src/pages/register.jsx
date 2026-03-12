import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';

const Register = () => {
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await authAPI.register({
                name: registerData.name,
                email: registerData.email,
                password: registerData.password
            });
            alert("Account created successfully. Please verify your email.");
            navigate('/verify-email', { state: { email: registerData.email } });
        } catch (error) {
            console.error("Registration failed:", error);
            alert(error.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfcfb] flex flex-col items-center justify-center p-6 font-['Inter'] selection:bg-blue-100 selection:text-blue-900">
            <Link to="/" className="mb-8 text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Finance <span className="text-blue-600">Archive_</span></Link>

            <div className="w-full max-w-[560px]">
                {/* Register Card */}
                <div className="bg-white rounded-[3.5rem] p-12 md:p-16 border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)]">
                    <div className="mb-12">
                        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-none italic uppercase">Initialize <br/> <span className="text-blue-600">Protocol_</span></h1>
                        <p className="text-slate-400 font-medium text-lg italic tracking-tight opacity-70">Begin your financial evolution_</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Rohit"
                                value={registerData.name}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Email ID</label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="vaishnavrohit013@gmail.com"
                                value={registerData.email}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-200"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                    value={registerData.password}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Confirm</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    placeholder="••••••••"
                                    value={registerData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-200"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs transition-all hover:bg-blue-700 active:scale-95 mt-6 flex justify-center items-center shadow-2xl shadow-blue-100 border-b-4 border-blue-800"
                        >
                            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Deploy Node_'}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-slate-400 font-medium">
                            Linked already? <Link to="/login" className="text-blue-600 font-black hover:underline uppercase tracking-[0.2em] text-[10px] ml-2">Authorize Access_</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;