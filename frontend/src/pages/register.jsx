import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await authAPI.register({
                name: registerData.name,
                email: registerData.email,
                password: registerData.password
            });
            
            const { accessToken, user } = response.data.data;
            login(accessToken, user);
            
            setSuccess(true);
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
        } catch (error) {
            console.error("Registration failed:", error);
            setError(error.response?.data?.message || "Error during account creation.");
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

            <div className="w-full max-w-[540px] relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="bg-black/80 backdrop-blur-xl rounded-[2rem] p-12 md:p-16 border border-white/5 shadow-2xl flex flex-col items-center">
                    <div className="text-center space-y-4 mb-20">
                        <h1 className="text-6xl font-black font-serif text-white tracking-tight">Create Account</h1>
                        {/* Sub-header text removed as per user request */}
                    </div>

                    {error && (
                        <div className="w-full mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-black uppercase tracking-widest text-center animate-in slide-in-from-top-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="w-full mb-8 p-4 bg-emerald-500/10 border border-emerald-100/20 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center animate-in slide-in-from-top-4">
                            ACCOUNT CREATED SUCCESSFULLY! REDIRECTING...
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="w-full space-y-16">
                        <div className="space-y-12">
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Enter Your Name"
                                value={registerData.name}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-white py-2 text-white placeholder:text-gray-500 outline-none focus:border-[#1e40af] transition-colors text-lg"
                            />
                            
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="Enter Your Email"
                                value={registerData.email}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-white py-2 text-white placeholder:text-gray-300 outline-none focus:border-[#1e40af] transition-colors text-lg"
                            />

                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="Enter Your Password"
                                value={registerData.password}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-white py-2 text-white placeholder:text-gray-500 outline-none focus:border-[#1e40af] transition-colors text-lg"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full py-5 bg-[#1e40af] text-white rounded-2xl font-black text-base tracking-widest transition-all hover:bg-blue-800 active:scale-[0.98] flex justify-center items-center shadow-xl shadow-blue-900/40 uppercase disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'SIGN UP'}
                        </button>
                    </form>

                    <div className="text-center mt-12">
                        <p className="text-sm font-medium text-gray-300">
                            Already have an account? <Link to="/login" className="text-white hover:text-blue-400 transition-colors ml-1 font-bold">Log in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;