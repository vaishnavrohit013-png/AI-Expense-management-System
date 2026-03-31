import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
    const [loginData, setLoginData]   = useState({ email: '', password: '' });
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState('');
    const [success, setSuccess]       = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authAPI.login(loginData.email, loginData.password);
            const { accessToken, user } = response.data.data;
            login(accessToken, user);
            setSuccess(`Welcome back, ${user?.name?.split(' ')[0] || 'User'}! Redirecting to dashboard…`);
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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

    return (
        <div style={{
            width: '100%', minHeight: '100vh',
            background: '#d8cfc4',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', -apple-system, sans-serif",
            padding: '24px', boxSizing: 'border-box',
        }}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '40px', height: '40px', background: '#3b5bdb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px', boxShadow: '0 4px 14px rgba(59,91,219,0.35)' }}>E</div>
                <span style={{ fontWeight: '700', fontSize: '17px', color: '#1a1a1a' }}>ExpenseAI</span>
            </Link>

            {/* Card */}
            <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px', padding: '30px 28px 26px', boxSizing: 'border-box', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>

                <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700', color: '#111827' }}>Welcome Back</h1>
                <p style={{ margin: '0 0 22px', fontSize: '13px', color: '#9ca3af' }}>Sign in to continue</p>

                {/* Success Banner */}
                {success && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '18px' }}>
                        <CheckCircle2 size={16} color="#16a34a" />
                        <span style={{ fontSize: '13px', color: '#15803d', fontWeight: '500' }}>{success}</span>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#ef4444', fontSize: '13px', marginBottom: '18px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    {/* Email */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Email</label>
                        <input
                            type="email" name="email" required placeholder="you@example.com"
                            value={loginData.email} onChange={handleChange}
                            style={inp()}
                            onFocus={e => { e.target.style.borderColor = '#3b5bdb'; e.target.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.08)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '22px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '12px', color: '#3b5bdb', textDecoration: 'none', fontWeight: '500' }}>Forgot password?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'} name="password" required placeholder="••••••••"
                                value={loginData.password} onChange={handleChange}
                                style={inp({ paddingRight: '38px' })}
                                onFocus={e => { e.target.style.borderColor = '#3b5bdb'; e.target.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.08)'; }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                            />
                            <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading || !!success}
                        style={{ width: '100%', padding: '12px', background: success ? '#10b981' : '#3b5bdb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: (loading || success) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1, transition: 'background 0.3s' }}>
                        {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : success ? <><CheckCircle2 size={15} /> Signed In!</> : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', margin: '18px 0 0', fontSize: '13px', color: '#6b7280' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#3b5bdb', fontWeight: '600', textDecoration: 'none' }}>Create one</Link>
                </p>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Login;
