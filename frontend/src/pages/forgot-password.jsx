import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import {
  Mail,
  ArrowLeft,
  Loader2,
  Lock,
  ArrowRight,
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.sendOTP(email);
      setSuccess(true);
    } catch (error) {
      console.error("Recovery failed:", error);
      alert("Strategic Error: Identification failed. Verify email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-['Inter']">
      <div className="w-full max-w-[480px]">
        {/* Recovery Card */}
        <div className="bg-white rounded-3xl p-10 md:p-14 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          {success ? (
            <div className="text-center space-y-10 animate-fade-in">
              <div className="flex justify-center">
                <div className="bg-emerald-50 p-8 rounded-[2rem] text-emerald-500 shadow-inner">
                  <CheckCircle2 size={48} />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Check Sequence</h2>
                <p className="text-slate-400 font-medium">Reset protocol sent to <span className="text-blue-600">{email}</span>. Verify within the next 10 minutes.</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-[#1d4ed8] text-white rounded-xl font-bold transition-all hover:bg-blue-700 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Return to Login <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] italic">
                   <Lock size={14} /> Security Recovery
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter leading-none italic uppercase">Forgot <span className="text-blue-600">Access_</span></h1>
                <p className="text-slate-400 font-medium italic opacity-70">Initialize credential recovery protocol_</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Account Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                      type="email"
                      required
                      placeholder="vaishnavrohit013@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-200 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] transition-all hover:bg-blue-700 active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-blue-100 border-b-4 border-blue-800"
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                      <>
                        <span>Initialize Protocol_</span>
                        <ArrowRight size={20} className="mt-[-1px]" />
                      </>
                    )}
                  </button>
                  <Link to="/login" className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors py-2">
                    <ArrowLeft size={16} /> Back to Entry
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
