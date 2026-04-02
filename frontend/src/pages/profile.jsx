import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import Layout from '../components/Layout';

const Profile = () => {
    const { user, login } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [budget, setBudget] = useState(user?.monthlyBudget || 0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const initials = (user?.name || 'U')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');
        try {
            const res = await userAPI.updateProfile({ 
                name, 
                monthlyBudget: Number(budget) 
            });
            const updatedUser = res.data?.data?.user || res.data?.user || { ...user, name, monthlyBudget: Number(budget) };
            login(localStorage.getItem('token'), updatedUser);
            setSuccess('Profile updated successfully! New budget goals will reflect on dashboard.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '860px' }}>

                {/* Page Header */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: '0 0 4px' }}>
                        Settings
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        Manage your account and preferences
                    </p>
                </div>

                {/* Profile Information Card */}
                <div style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    padding: '28px 32px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px' }}>
                            Profile Information
                        </h2>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                            Update your personal details
                        </p>
                    </div>

                    {/* Avatar — initials only, no change button */}
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: '#b45309',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: '700',
                            userSelect: 'none',
                        }}>
                            {initials}
                        </div>
                    </div>

                    {/* Success / Error */}
                    {success && (
                        <div style={{
                            padding: '10px 14px',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            color: '#15803d',
                            fontSize: '13px',
                            marginBottom: '20px',
                        }}>
                            {success}
                        </div>
                    )}
                    {error && (
                        <div style={{
                            padding: '10px 14px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#ef4444',
                            fontSize: '13px',
                            marginBottom: '20px',
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Fields Row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px',
                            marginBottom: '24px',
                        }}>
                            {/* Full Name */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '6px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setSuccess(''); setError(''); }}
                                    required
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        padding: '10px 12px',
                                        border: '1.5px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        color: '#111827',
                                        background: '#fff',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        transition: 'border-color 0.15s',
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = '#3b5bdb'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                                />
                            </div>

                            {/* Email — read-only */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '6px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    readOnly
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        padding: '10px 12px',
                                        border: '1.5px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        background: '#f9fafb',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        cursor: 'default',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: loading ? '#93c5fd' : '#3b5bdb',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.15s',
                                fontFamily: 'inherit',
                            }}
                            onMouseEnter={(e) => { if (!loading) e.target.style.background = '#2f4acf'; }}
                            onMouseLeave={(e) => { if (!loading) e.target.style.background = '#3b5bdb'; }}
                        >
                            <Save size={16} />
                            {loading ? 'Saving…' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
