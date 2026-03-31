import React, { useState, useEffect, useCallback } from 'react';
import {
    TrendingUp, TrendingDown, Wallet, Edit2, Mic, MicOff,
    Sparkles, Shield, CheckCircle2, FileText, CalendarDays,
    Loader2, ArrowRight, Plus, X, Trash2, Download,
    LightbulbIcon, LayoutDashboard, List, BarChart2,
    Settings, LogOut, AlertTriangle, ChevronDown
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import Layout from '../components/Layout';
import { transactionAPI, analyticsAPI, aiAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/* ─── Constants ──────────────────────────────────────────────── */
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];
const EXPENSE_CATS = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Rent', 'Other'];
const INCOME_CATS  = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];
const FILTER_OPTIONS = [
    { label: 'Daily', value: 'LAST_7_DAYS', chart: 'LAST_7_DAYS' },
    { label: 'Weekly', value: 'THIS_WEEK',  chart: 'LAST_4_WEEKS' },
    { label: 'Monthly', value: 'THIS_MONTH', chart: 'LAST_6_MONTHS' },
    { label: 'Yearly', value: 'THIS_YEAR',  chart: 'LAST_12_MONTHS' },
];

/* ─── Toast ───────────────────────────────────────────────────── */
const Toast = ({ toasts, remove }) => (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map(t => (
            <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px',
                background: t.type === 'success' ? '#f0fdf4' : t.type === 'error' ? '#fef2f2' : '#eff6ff',
                border: `1px solid ${t.type === 'success' ? '#bbf7d0' : t.type === 'error' ? '#fecaca' : '#bfdbfe'}`,
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                minWidth: '260px', maxWidth: '340px',
                fontFamily: "'Inter', sans-serif",
                animation: 'slideIn 0.2s ease',
            }}>
                {t.type === 'success' && <CheckCircle2 size={16} color="#16a34a" />}
                {t.type === 'error'   && <AlertTriangle size={16} color="#dc2626" />}
                {t.type === 'info'    && <LightbulbIcon size={16} color="#2563eb" />}
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#111827', flex: 1 }}>{t.msg}</span>
                <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                    <X size={14} />
                </button>
            </div>
        ))}
    </div>
);

function useToast() {
    const [toasts, setToasts] = useState([]);
    const add = useCallback((msg, type = 'success') => {
        const id = Date.now();
        setToasts(p => [...p, { id, msg, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
    }, []);
    const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
    return { toasts, add, remove };
}

/* ─── Confirm Dialog ──────────────────────────────────────────── */
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={18} color="#ef4444" />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>{title}</h3>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>{message}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} style={{ flex: 1, padding: '10px', background: '#ef4444', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: '#fff' }}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Transaction Modal ───────────────────────────────────────── */
const TxModal = ({ open, onClose, onSave, initial }) => {
    const isEdit = !!initial?._id;
    const [form, setForm] = useState({ type: 'EXPENSE', title: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), note: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            if (initial) {
                setForm({
                    type: initial.type || 'EXPENSE',
                    title: initial.title || '',
                    amount: initial.amount || '',
                    category: initial.category || 'Food',
                    date: initial.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
                    note: initial.note || '',
                });
            } else {
                setForm({ type: 'EXPENSE', title: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), note: '' });
            }
        }
    }, [open, initial]);

    if (!open) return null;

    const cats = form.type === 'INCOME' ? INCOME_CATS : EXPENSE_CATS;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return;
        setSaving(true);
        try {
            await onSave({ ...form, amount: Number(form.amount) }, isEdit ? initial._id : null);
        } finally {
            setSaving(false);
        }
    };

    const inp = {
        width: '100%', boxSizing: 'border-box', padding: '10px 12px',
        border: '1.5px solid #e5e7eb', borderRadius: '10px',
        fontSize: '13px', color: '#111827', outline: 'none', background: '#fff',
        fontFamily: "'Inter', sans-serif",
    };
    const lbl = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', overflowY: 'auto' }}>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', margin: 0 }}>
                        {isEdit ? 'Edit Transaction' : 'Add Transaction'}
                    </h3>
                    <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Type toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#f3f4f6', padding: '4px', borderRadius: '12px' }}>
                    {['EXPENSE', 'INCOME'].map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, type: t, category: t === 'INCOME' ? 'Salary' : 'Food' }))}
                            style={{
                                flex: 1, padding: '8px', border: 'none', borderRadius: '10px',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                background: form.type === t ? (t === 'INCOME' ? '#10b981' : '#ef4444') : 'transparent',
                                color: form.type === t ? '#fff' : '#6b7280',
                                transition: 'all 0.2s',
                            }}
                        >
                            {t === 'INCOME' ? '+ Income' : '− Expense'}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={lbl}>Title</label>
                        <input style={inp} required placeholder="e.g. Grocery shopping" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={lbl}>Amount (₹)</label>
                            <input style={inp} required type="number" min="1" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                        </div>
                        <div>
                            <label style={lbl}>Date</label>
                            <input style={inp} required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <label style={lbl}>Category</label>
                        <select style={{ ...inp, appearance: 'none' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                            {cats.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={lbl}>Note (optional)</label>
                        <textarea style={{ ...inp, resize: 'vertical', minHeight: '70px' }} placeholder="Additional details…" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: '12px', border: 'none', borderRadius: '12px',
                            background: form.type === 'INCOME' ? '#10b981' : '#3b5bdb',
                            color: '#fff', fontSize: '14px', fontWeight: '700',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            opacity: saving ? 0.7 : 1,
                        }}
                    >
                        {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : (isEdit ? 'Save Changes' : 'Add Transaction')}
                    </button>
                </form>
            </div>
        </div>
    );
};

/* ─── Stat Card ───────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon, color, bg }) => (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>{label}</span>
            <div style={{ width: '30px', height: '30px', background: bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.cloneElement(icon, { size: 14, color })}
            </div>
        </div>
        <p style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 4px' }}>{value}</p>
        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{sub}</p>
    </div>
);

/* ─── Export to CSV/Excel ─────────────────────────────────────── */
const exportToExcel = (transactions) => {
    const headers = ['Date', 'Title', 'Category', 'Type', 'Amount (₹)', 'Note'];
    const rows = transactions.map(tx => [
        tx.date ? new Date(tx.date).toLocaleDateString('en-IN') : '',
        tx.title || tx.category || '',
        tx.category || '',
        tx.type || '',
        tx.amount || 0,
        tx.note || '',
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/* ─── Dashboard ───────────────────────────────────────────────── */
const Dashboard = () => {
    const { user } = useAuth();
    const { toasts, add: toast, remove: removeToast } = useToast();

    const [summary, setSummary]           = useState({ totalIncome: 0, totalExpenses: 0, availableBalance: 0, savingsRate: 0 });
    const [transactions, setTransactions] = useState([]);
    const [barData, setBarData]           = useState([]);
    const [pieData, setPieData]           = useState([]);
    const [budgetLimit, setBudgetLimit]   = useState(0);
    const [spentAmount, setSpentAmount]   = useState(0);
    const [isLoading, setIsLoading]       = useState(true);
    const [filterIdx, setFilterIdx]       = useState(2);           // default: Monthly
    const [chartLoading, setChartLoading] = useState(false);

    // AI Health
    const [healthScore, setHealthScore]         = useState(null);
    const [healthSuggestions, setHealthSuggestions] = useState([]);
    const [loadingHealth, setLoadingHealth]     = useState(false);

    // Voice
    const [listening, setListening]   = useState(false);
    const [voiceStatus, setVoiceStatus] = useState('');

    // Modals
    const [txModal, setTxModal]   = useState(false);
    const [editTx, setEditTx]     = useState(null);
    const [deleteTx, setDeleteTx] = useState(null);

    /* ── Fetch core data ── */
    const fetchDashboard = useCallback(async (fi = filterIdx) => {
        setIsLoading(true);
        try {
            const preset = FILTER_OPTIONS[fi].value;
            const chartPreset = FILTER_OPTIONS[fi].chart;

            const [txRes, summaryRes, chartRes, pieRes] = await Promise.all([
                transactionAPI.getAll({ limit: 50 }),
                analyticsAPI.getSummary({ preset }),
                analyticsAPI.getChart({ preset: chartPreset }),
                analyticsAPI.getExpenseBreakdown({ preset }),
            ]);

            const txList = txRes.data.data || [];
            setTransactions(txList);

            const s = summaryRes.data.data || {};
            setSummary({
                totalIncome: s.totalIncome || 0,
                totalExpenses: s.totalExpenses || 0,
                availableBalance: s.availableBalance || 0,
                savingsRate: s.savingsRate || 0,
            });
            setSpentAmount(s.totalExpenses || 0);
            setBudgetLimit(user?.monthlyBudget || 50000);

            const mapped = (chartRes.data.data?.chartData || []).map(item => ({
                name: new Intl.DateTimeFormat('en-US', { month: 'short', day: fi === 0 ? 'numeric' : undefined })
                    .format(new Date(item.date)),
                Income: item.income || 0,
                Expenses: item.expense || 0,
            }));
            setBarData(mapped);

            const cats = pieRes.data.data?.categories || {};
            const pie = Object.entries(cats)
                .map(([name, data]) => ({ name, value: data.amount || 0 }))
                .filter(p => p.value > 0)
                .sort((a, b) => b.value - a.value);
            setPieData(pie);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [filterIdx, user]);

    useEffect(() => { fetchDashboard(filterIdx); }, [filterIdx]);

    /* ── Chart-only refetch on filter change ── */
    const handleFilter = (idx) => {
        setFilterIdx(idx);
    };

    /* ── Add / Edit transaction ── */
    const handleSaveTx = async (data, id) => {
        try {
            if (id) {
                await transactionAPI.update(id, data);
                toast('Transaction updated successfully!', 'success');
            } else {
                await transactionAPI.create(data);
                toast(`${data.type === 'INCOME' ? 'Income' : 'Expense'} added successfully!`, 'success');
            }
            setTxModal(false);
            setEditTx(null);
            fetchDashboard(filterIdx);
        } catch (err) {
            toast(err.response?.data?.message || 'Something went wrong.', 'error');
        }
    };

    /* ── Delete transaction ── */
    const handleDelete = async () => {
        if (!deleteTx) return;
        try {
            await transactionAPI.delete(deleteTx._id);
            toast('Transaction deleted.', 'success');
            setDeleteTx(null);
            fetchDashboard(filterIdx);
        } catch {
            toast('Failed to delete transaction.', 'error');
        }
    };

    /* ── AI Health Score ── */
    const fetchHealthScore = async () => {
        setLoadingHealth(true);
        try {
            const res = await aiAPI.getFinancialHealth();
            const data = res.data?.data || res.data;
            setHealthScore(data.score ?? data.healthScore ?? null);
            setHealthSuggestions(data.suggestions || data.recommendations || []);
        } catch { toast('Could not load AI insights.', 'error'); }
        finally { setLoadingHealth(false); }
    };

    /* ── Voice Entry ── */
    const handleVoiceEntry = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { setVoiceStatus('Speech recognition not supported.'); return; }
        const rec = new SR();
        rec.lang = 'en-IN';
        setListening(true);
        setVoiceStatus('Listening… speak now');
        rec.start();
        rec.onresult = async (e) => {
            const t = e.results[0][0].transcript;
            setVoiceStatus(`Heard: "${t}" — processing…`);
            setListening(false);
            try {
                const r = await aiAPI.extractVoice(t);
                const d = r.data?.data || r.data;
                setVoiceStatus(`✅ ₹${d.amount || '?'} for ${d.category || 'unknown'}. Go to Add Transaction to confirm.`);
            } catch { setVoiceStatus('Could not extract. Try again.'); }
        };
        rec.onerror = () => { setListening(false); setVoiceStatus('Mic error. Allow microphone access.'); };
        rec.onend = () => setListening(false);
    };

    const budgetPct   = budgetLimit > 0 ? Math.min((spentAmount / budgetLimit) * 100, 100) : 0;
    const isNewUser   = !isLoading && transactions.length === 0;
    const scoreColor  = s => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <Layout>
            <style>{`
                @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                input, select, textarea { font-family: 'Inter', sans-serif; }
                input:focus, select:focus, textarea:focus { border-color: #3b5bdb !important; box-shadow: 0 0 0 3px rgba(59,91,219,0.08) !important; outline: none !important; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
            `}</style>

            <Toast toasts={toasts} remove={removeToast} />

            <TxModal
                open={txModal || !!editTx}
                onClose={() => { setTxModal(false); setEditTx(null); }}
                onSave={handleSaveTx}
                initial={editTx}
            />

            <ConfirmDialog
                open={!!deleteTx}
                title="Delete Transaction"
                message={`Are you sure you want to delete "${deleteTx?.title || deleteTx?.category || 'this transaction'}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTx(null)}
            />

            <div style={{ padding: '0', fontFamily: "'Inter', sans-serif" }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 4px' }}>
                            Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                        </h1>
                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Here's your financial overview for this month</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => { setEditTx(null); setTxModal(true); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Plus size={15} /> Add Transaction
                        </button>
                        <button
                            onClick={fetchHealthScore}
                            disabled={loadingHealth}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            {loadingHealth ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                            AI Insight Report
                        </button>
                        <button
                            onClick={() => exportToExcel(transactions)}
                            disabled={transactions.length === 0}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Download size={14} /> Export Data
                        </button>
                    </div>
                </div>

                {/* ── Monthly Budget ── */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 2px' }}>Monthly Budget (Default Account)</p>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                                ₹{spentAmount.toLocaleString('en-IN')} of ₹{budgetLimit.toLocaleString('en-IN')} spent
                                <button onClick={() => window.location.href = '/settings'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', marginLeft: '6px', verticalAlign: 'middle' }}>
                                    <Edit2 size={11} />
                                </button>
                            </p>
                        </div>
                        <span style={{
                            fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '8px',
                            background: budgetPct > 90 ? '#fef2f2' : '#eff6ff',
                            color: budgetPct > 90 ? '#ef4444' : '#2563eb',
                        }}>
                            {budgetPct.toFixed(1)}% used
                        </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: '999px',
                            width: `${budgetPct}%`,
                            background: budgetPct > 90 ? '#ef4444' : '#3b5bdb',
                            transition: 'width 0.7s ease',
                        }} />
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <StatCard label="Balance"    value={`₹${summary.availableBalance.toLocaleString('en-IN')}`} sub="Current account balance" icon={<Wallet />}       color="#6b7280" bg="#f9fafb" />
                    <StatCard label="Income"     value={`₹${summary.totalIncome.toLocaleString('en-IN')}`}     sub="This month"            icon={<TrendingUp />}    color="#10b981" bg="#f0fdf4" />
                    <StatCard label="Expenses"   value={`₹${summary.totalExpenses.toLocaleString('en-IN')}`}   sub="This month"            icon={<TrendingDown />}  color="#ef4444" bg="#fef2f2" />
                    <StatCard label="Savings Goal" value={`${summary.savingsRate || 0}%`}                      sub={isNewUser ? 'No data yet' : `₹${(summary.totalIncome - summary.totalExpenses).toLocaleString('en-IN')} saved`} icon={<Shield />} color="#2563eb" bg="#eff6ff" />
                </div>

                {/* ── Filter Tabs ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500', marginRight: '4px' }}>Filter:</span>
                    {FILTER_OPTIONS.map((f, i) => (
                        <button
                            key={f.value}
                            onClick={() => handleFilter(i)}
                            style={{
                                padding: '6px 16px', border: 'none', borderRadius: '999px',
                                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                background: filterIdx === i ? '#3b5bdb' : '#f3f4f6',
                                color: filterIdx === i ? '#fff' : '#6b7280',
                                transition: 'all 0.15s',
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* ── Charts Row ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', marginBottom: '20px' }}>

                    {/* Income vs Expenses Bar Chart */}
                    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 4px' }}>Income vs Expenses</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px' }}>
                            {FILTER_OPTIONS[filterIdx].label} trends
                        </p>
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                                <Loader2 size={24} color="#3b5bdb" style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : barData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={barData} barSize={14}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px' }} formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                                        <Bar dataKey="Income"   fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' }} /><span style={{ fontSize: '11px', color: '#6b7280' }}>Income</span></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444' }} /><span style={{ fontSize: '11px', color: '#6b7280' }}>Expenses</span></div>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#d1d5db' }}>
                                <BarChart2 size={32} style={{ marginBottom: '8px' }} />
                                <p style={{ fontSize: '13px' }}>No data for this period</p>
                            </div>
                        )}
                    </div>

                    {/* Expenses by Category Pie */}
                    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 4px' }}>Expenses by Category</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px' }}>Current period breakdown</p>
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                                <Loader2 size={24} color="#3b5bdb" style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : pieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ maxHeight: '120px', overflowY: 'auto', marginTop: '8px' }}>
                                    {pieData.map((item, i) => (
                                        <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < pieData.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                                                <span style={{ fontSize: '12px', color: '#6b7280' }}>{item.name}</span>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>₹{item.value.toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#d1d5db' }}>
                                <FileText size={32} style={{ marginBottom: '8px' }} />
                                <p style={{ fontSize: '13px' }}>No expense data this period</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── AI Health Score ── */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Shield size={16} color="#2563eb" />
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>AI Financial Health Score</span>
                    </div>
                    {!healthScore && !loadingHealth ? (
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>Click "AI Insight Report" to generate your financial health score</p>
                            <button onClick={fetchHealthScore} style={{ padding: '8px 20px', background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                Generate Score
                            </button>
                        </div>
                    ) : loadingHealth ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                            <Loader2 size={24} color="#3b5bdb" style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
                                <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: `4px solid ${scoreColor(healthScore)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', color: scoreColor(healthScore) }}>
                                    {healthScore}
                                </div>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: scoreColor(healthScore), marginTop: '6px' }}>
                                    {healthScore >= 75 ? 'Good' : healthScore >= 50 ? 'Fair' : 'Needs Work'}
                                </p>
                            </div>
                            <div style={{ flex: 1 }}>
                                {healthSuggestions.slice(0, 4).map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                                        <CheckCircle2 size={13} color="#10b981" style={{ marginTop: '1px', flexShrink: 0 }} />
                                        <p style={{ fontSize: '12px', color: '#4b5563', margin: 0, lineHeight: '1.6' }}>{typeof s === 'string' ? s : s.text || s.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Voice Entry ── */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '30px', height: '30px', background: '#faf5ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Mic size={14} color="#7c3aed" />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Voice Expense Entry</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>Say "Add 500 rupees for groceries today"</p>
                    <button
                        onClick={handleVoiceEntry}
                        disabled={listening}
                        style={{ padding: '9px 18px', background: listening ? '#ef4444' : '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        {listening ? <><MicOff size={13} /> Listening…</> : <><Mic size={13} /> Start Voice Entry</>}
                    </button>
                    {voiceStatus && (
                        <p style={{ fontSize: '12px', color: voiceStatus.startsWith('✅') ? '#16a34a' : '#6b7280', background: voiceStatus.startsWith('✅') ? '#f0fdf4' : '#f9fafb', padding: '8px 12px', borderRadius: '8px', marginTop: '10px' }}>
                            {voiceStatus}
                        </p>
                    )}
                </div>

                {/* ── Recent Transactions ── */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 2px' }}>Recent Transactions</p>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Latest financial activity</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { setEditTx(null); setTxModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                <Plus size={13} /> Add
                            </button>
                            <button onClick={() => window.location.href = '/transactions'} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                View All <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                            <Loader2 size={24} color="#3b5bdb" style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#d1d5db' }}>
                            <FileText size={36} style={{ marginBottom: '10px' }} />
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#9ca3af', margin: '0 0 4px' }}>No transactions yet</p>
                            <p style={{ fontSize: '12px', color: '#d1d5db', margin: '0 0 16px' }}>Add your first income or expense to get started</p>
                            <button onClick={() => setTxModal(true)} style={{ padding: '9px 20px', background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                + Add First Transaction
                            </button>
                        </div>
                    ) : (
                        <div>
                            {transactions.slice(0, 10).map((tx, i) => (
                                <div
                                    key={tx._id || i}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 8px', borderRadius: '12px',
                                        borderBottom: i < Math.min(transactions.length, 10) - 1 ? '1px solid #f9fafb' : 'none',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                                            background: tx.type === 'INCOME' ? '#f0fdf4' : '#fef2f2',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {tx.type === 'INCOME'
                                                ? <TrendingUp size={15} color="#10b981" />
                                                : <TrendingDown size={15} color="#ef4444" />
                                            }
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {tx.title || tx.category || 'Transaction'}
                                            </p>
                                            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                                                {tx.date ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(tx.date)) : '—'}
                                                {tx.category ? ` • ${tx.category}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                        <span style={{ fontSize: '14px', fontWeight: '700', color: tx.type === 'INCOME' ? '#10b981' : '#111827' }}>
                                            {tx.type === 'INCOME' ? '+' : '−'}₹{(tx.amount || 0).toLocaleString('en-IN')}
                                        </span>
                                        <button
                                            onClick={() => setEditTx(tx)}
                                            title="Edit"
                                            style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTx(tx)}
                                            title="Delete"
                                            style={{ background: '#fef2f2', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
};

export default Dashboard;
