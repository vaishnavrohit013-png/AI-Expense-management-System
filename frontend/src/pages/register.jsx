import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading]           = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);
    const [error, setError]               = useState('');
    const [success, setSuccess]           = useState('');
    const navigate = useNavigate();

    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            const res = await authAPI.register({ name: form.name, email: form.email, password: form.password });
            const { accessToken, user } = res.data.data || res.data;
            login(accessToken, user);
            setSuccess(`Account created successfully!`);
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inp = (extra = {}) => ({
        width: '100%', boxSizing: 'border-box',
        padding: '10px 12px',
        border: '1.5px solid #e5e7eb',
        borderRadius: '10px',
        fontSize: '13px', color: '#111827',
        outline: 'none', background: '#fff',
        transition: 'border-color 0.15s',
        fontFamily: "'Inter', sans-serif",
        ...extra,
    });
    const lbl = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' };
    const foc = (e) => { e.target.style.borderColor = '#3b5bdb'; e.target.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.08)'; };
    const blr = (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; };

    return (
        <div style={{
            width: '100%', minHeight: '100vh',
            background: '#d8cfc4',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', -apple-system, sans-serif",
            padding: '24px', boxSizing: 'border-box',
        }}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ 
                    fontFamily: "'Georgia', serif", 
                    fontWeight: '700', 
                    fontSize: '28px', 
                    color: '#1a1a1a',
                    letterSpacing: '-0.02em'
                }}>Spendly</span>
            </Link>

            {/* Card */}
            <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px', padding: '30px 28px 26px', boxSizing: 'border-box', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>

                <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700', color: '#111827' }}>Create Account</h1>
                <p style={{ margin: '0 0 22px', fontSize: '13px', color: '#9ca3af' }}>Sign up to get started</p>

                {/* Success Banner */}
                {success && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '18px' }}>
                        <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span style={{ fontSize: '13px', color: '#15803d', fontWeight: '500', lineHeight: '1.5' }}>{success}</span>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#ef4444', fontSize: '13px', marginBottom: '18px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} style={{ display: success ? 'none' : 'block' }}>
                    {/* Full Name */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={lbl}>Full Name</label>
                        <input type="text" name="name" required placeholder="John Doe" value={form.name} onChange={handleChange} style={inp()} onFocus={foc} onBlur={blr} />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={lbl}>Email</label>
                        <input type="email" name="email" required placeholder="you@example.com" value={form.email} onChange={handleChange} style={inp()} onFocus={foc} onBlur={blr} />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={lbl}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? 'text' : 'password'} name="password" required placeholder="••••••••" value={form.password} onChange={handleChange} style={inp({ paddingRight: '38px' })} onFocus={foc} onBlur={blr} />
                            <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div style={{ marginBottom: '22px' }}>
                        <label style={lbl}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" required placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} style={inp({ paddingRight: '38px' })} onFocus={foc} onBlur={blr} />
                            <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                        style={{ width: '100%', padding: '12px', background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
                        {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', margin: '18px 0 0', fontSize: '13px', color: '#6b7280' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#3b5bdb', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Register;
