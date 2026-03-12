import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Mail,
    ArrowRight,
    Loader2,
    ShieldCheck,
    Zap,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Clock
} from 'lucide-react';
import { authAPI } from '../services/api';

const VerifyEmail = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'user@example.com';
    const otpInputs = React.useRef([]);

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 5) {
            otpInputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            otpInputs.current[index - 1].focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the full 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await authAPI.verifyOTP(email, otpString);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error("Verification failed:", error);
            setError(error.response?.data?.message || "Invalid code sequence.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await authAPI.sendOTP(email);
            alert("New code dispatched to your email.");
        } catch (error) {
            alert("Failed to resend. Please try again later.");
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-['Inter']">
            <div className="w-full max-w-[520px]">
                {/* Verification Card */}
                <div className="bg-white rounded-3xl p-10 md:p-14 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                    {success ? (
                        <div className="text-center py-6 space-y-10 animate-fade-in">
                            <div className="flex justify-center">
                                <div className="bg-emerald-50 p-10 rounded-[2.5rem] text-emerald-500 shadow-inner">
                                    <CheckCircle2 size={64} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-slate-900">Success!</h2>
                                <p className="text-slate-400 font-medium">Your identity has been verified.<br/>Redirecting to Login...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-12">
                                <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] italic">
                                   <ShieldCheck size={14} /> Verification Protocol
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter leading-none italic uppercase">Check <span className="text-blue-600">Email_</span></h1>
                                <p className="text-slate-400 font-medium italic opacity-70">
                                    Sync the 6-digit sequence sent to <span className="text-blue-600 font-black">{email}</span>
                                </p>
                            </div>

                            {error && (
                                <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600 text-[11px] font-bold uppercase tracking-wider animate-shake">
                                    <AlertCircle size={20} />
                                    <p>{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleVerify} className="space-y-12">
                                <div className="flex justify-between gap-3 md:gap-4">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={el => otpInputs.current[idx] = el}
                                            type="text"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(idx, e)}
                                            className="w-full h-16 md:h-20 text-center text-3xl font-bold bg-blue-50/50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all shadow-inner text-slate-900"
                                        />
                                    ))}
                                </div>

                                <div className="space-y-8">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] transition-all hover:bg-blue-700 active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-blue-100 border-b-4 border-blue-800"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                            <>
                                                <span>Authorize Node_</span>
                                                <ArrowRight size={20} className="mt-[-1px]" />
                                            </>
                                        )}
                                    </button>

                                    <div className="flex flex-col items-center gap-6">
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors group"
                                        >
                                            <Clock size={16} /> Resend Access Token
                                        </button>
                                        <Link to="/register" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
                                            <ArrowLeft size={16} /> Back to Register
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
