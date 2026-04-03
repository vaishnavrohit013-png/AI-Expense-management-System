import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, Edit2, Mic, MicOff,
  Zap, Shield, ShieldCheck, CheckCircle2, FileText,
  Loader2, ArrowRight, Plus, X, Trash2, Download,
  LightbulbIcon, LayoutDashboard, List, BarChart2,
  Settings, LogOut, AlertTriangle, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import Layout from '../components/Layout';
import { transactionAPI, analyticsAPI, aiAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ─── Constants ──────────────────────────────────────────────── */
const CATEGORY_COLORS = {
  food: '#f59e0b', transport: '#3b82f6', shopping: '#ec4899', entertainment: '#8b5cf6',
  bills: '#ef4444', health: '#10b981', education: '#06b6d4', rent: '#f43f5e',
  salary: '#22c55e', freelance: '#84cc16', investment: '#0ea5e9', business: '#6366f1',
  gift: '#f472b6', interest: '#fbbf24', other: '#94a3b8'
};
const COLORS = ['#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#10b981', '#06b6d4', '#f43f5e', '#22c55e', '#84cc16'];
const getCategoryColor = (name, index) => {
  const normalized = String(name || '').toLowerCase().trim();
  return CATEGORY_COLORS[normalized] || COLORS[index % COLORS.length];
};
const EXPENSE_CATS = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Rent', 'Other'];
const INCOME_CATS = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];
const FILTER_OPTIONS = [
  { label: 'Daily', value: 'LAST_7_DAYS', chart: 'LAST_7_DAYS', slug: '7d' },
  { label: 'Weekly', value: 'THIS_WEEK', chart: 'LAST_4_WEEKS', slug: '1m' },
  { label: 'Monthly', value: 'THIS_MONTH', chart: 'LAST_6_MONTHS', slug: '6m' },
  { label: 'Yearly', value: 'THIS_YEAR', chart: 'LAST_12_MONTHS', slug: '1y' },
];

/* ─── Toast ───────────────────────────────────────────────────── */
const Toast = ({ toasts, remove }) => (
  <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, maxWidth: '400px' }}>
    {toasts.map(t => (
      <div
        key={t.id}
        style={{
          marginBottom: '10px',
          padding: '12px 16px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: t.type === 'success' ? '#f0fdf4' : t.type === 'error' ? '#fef2f2' : '#eff6ff',
          border: `1px solid ${t.type === 'success' ? '#bbf7d0' : t.type === 'error' ? '#fecaca' : '#bfdbfe'}`,
          color: t.type === 'success' ? '#16a34a' : t.type === 'error' ? '#dc2626' : '#1e40af',
          fontSize: '13px',
          fontWeight: '500',
          animation: 'slideIn 0.3s ease-out',
        }}
      >
        {t.type === 'success' && <CheckCircle2 size={16} />}
        {t.type === 'error' && <AlertTriangle size={16} />}
        {t.type === 'info' && <Zap size={16} />}
        {t.msg}
        <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, marginLeft: 'auto' }}>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '400px', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '24px' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['EXPENSE', 'INCOME'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: t, category: t === 'INCOME' ? 'Salary' : 'Food' }))}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  background: form.type === t ? (t === 'INCOME' ? '#10b981' : '#ef4444') : '#f3f4f6',
                  color: form.type === t ? '#fff' : '#6b7280',
                  transition: 'all 0.2s',
                }}
              >
                {t === 'INCOME' ? '+ Income' : '− Expense'}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Title</label>
            <input style={inp} type="text" placeholder="E.g., Groceries" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Amount (₹)</label>
            <input style={inp} type="number" placeholder="0" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Date</label>
            <input style={inp} type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Category</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Note (optional)</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: '80px' }} placeholder="Add notes..." value={form.note} onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
              background: saving ? '#d1d5db' : (form.type === 'INCOME' ? '#10b981' : '#ef4444'),
              color: '#fff', fontSize: '13px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : (isEdit ? 'Save Changes' : 'Add Transaction')}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─── ERROR BOUNDARY ─── */
class DashboardBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', textAlign: 'center', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
                    <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Interface Error</h1>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>{this.state.error?.message || 'Something went wrong.'}</p>
                    <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Reload Dashboard</button>
                </div>
            );
        }
        return this.props.children;
    }
}

/* ─── AI Health Modal ───────────────────────────────────────── */
const AIHealthModal = ({ open, onClose, score, suggestions, loading, error }) => {
  if (!open) return null;
  const scoreColor = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'slideIn 0.2s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>
            Insights
          </h2>
          <button onClick={onClose} style={{ background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '20px', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ×
          </button>
        </div>

        {loading ? (
             <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Loader2 size={32} className="animate-spin text-blue-500 mx-auto" />
                  <p style={{ fontSize: '14px', color: '#64748b', marginTop: '12px', fontWeight: '600' }}>Analyzing your data...</p>
             </div>
        ) : (
            <>
              {error ? (
                  <div style={{ textAlign: 'center', padding: '24px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px' }}>
                      <AlertTriangle size={28} className="mx-auto text-red-500 mb-3" />
                      <p style={{ fontSize: '14px', color: '#b91c1c', fontWeight: '600', margin: 0 }}>{error}</p>
                  </div>
              ) : (
                  <>
                      {score !== null && (
                        <div style={{ textAlign: 'center', marginBottom: '28px', padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '56px', fontWeight: '900', color: scoreColor, letterSpacing: '-2px' }}>{score}<span style={{fontSize:'18px', color:'#94a3b8', letterSpacing: '0'}}> SCORE</span></div>
                          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Financial Health</p>
                        </div>
                      )}

                      {suggestions && suggestions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recommendations</h3>
                          {suggestions.map((s, i) => (
                            <div key={i} style={{ padding: '16px', background: '#fff', borderRadius: '16px', fontSize: '14px', color: '#334155', border: '1px solid #f1f5f9', fontWeight: '600', lineHeight: '1.5', display: 'flex', gap: '12px', alignItems: 'flex-start', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                              <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', marginTop: '7px', flexShrink: 0 }} />
                              {typeof s === 'string' ? s : JSON.stringify(s)}
                            </div>
                          ))}
                        </div>
                      ) : (
                         <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                             No specific recommendations found.
                         </div>
                      )}
                  </>
              )}
            </>
        )}
      </div>
    </div>
  );
};

/* ─── Stat Card ───────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon, color, bg }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.3s',
    cursor: 'pointer',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)';
    e.currentTarget.style.borderColor = '#d1d5db';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.borderColor = '#e5e7eb';
  }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>{label}</label>
      <div style={{ background: bg, padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {React.cloneElement(icon, { size: 16, color })}
      </div>
    </div>
    <div>
      <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{sub}</div>
    </div>
  </div>
);

const exportToExcel = (transactions) => {
  if (!transactions || transactions.length === 0) return;
  const headers = ['Date', 'Title', 'Category', 'Type', 'Amount (₹)', 'Merchant', 'Payment Method', 'Description'];
  const rows = transactions.map(tx => [
    tx.date ? new Date(tx.date).toLocaleDateString('en-IN') : '',
    tx.title || '', tx.category || '', tx.type || '', tx.amount || 0, tx.merchant || '', tx.paymentMethod || '', tx.description || '',
  ]);
  const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spendly_data.csv`;
  a.click();
};

/* ─── Dashboard ───────────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const { toasts, add: toast, remove: removeToast } = useToast();

  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, availableBalance: 0, savingsRate: 0 });
  const [transactions, setTransactions] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [spentAmount, setSpentAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filterIdx, setFilterIdx] = useState(2);
  const [chartLoading, setChartLoading] = useState(false);

  const [healthScore, setHealthScore] = useState(null);
  const [healthSuggestions, setHealthSuggestions] = useState([]);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [healthError, setHealthError] = useState(null);

  const [txModal, setTxModal] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);

  const navigate = useNavigate();

  const fetchDashboard = useCallback(async (fi = filterIdx) => {
    setIsLoading(true);
    try {
      const preset = FILTER_OPTIONS[fi].value;
      const [txRes, summaryRes, chartRes, pieRes] = await Promise.all([
        transactionAPI.getAll({ limit: 50 }),
        analyticsAPI.getSummary({ preset }),
        analyticsAPI.getChart({ preset: FILTER_OPTIONS[fi].chart }),
        analyticsAPI.getExpenseBreakdown({ preset }),
      ]);

      const txList = txRes.data.transactions || txRes.data.data || [];
      setTransactions(Array.isArray(txList) ? txList : []);

      const s = summaryRes.data.data || {};
      setSummary({ totalIncome: s.totalIncome || 0, totalExpenses: s.totalExpenses || 0, availableBalance: s.availableBalance || 0, savingsRate: s.savingsRate || 0 });
      setSpentAmount(s.totalExpenses || 0);
      setBudgetLimit(user?.monthlyBudget || 50000);

      const mapped = (chartRes.data.data?.chartData || []).map(item => {
        const d = new Date(item.date);
        const name = isNaN(d.getTime()) ? '?' : new Intl.DateTimeFormat('en-US', { month: 'short', day: fi === 0 ? 'numeric' : undefined }).format(d);
        return { name, Income: item.income || 0, Expenses: item.expense || 0 };
      });
      setBarData(mapped);

      const cats = pieRes.data.data?.categories || {};
      setPieData(Object.entries(cats).map(([name, d]) => ({ name, value: d.amount || 0 })).filter(p => p.value > 0).sort((a,b)=>b.value-a.value));
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, [filterIdx, user]);

  useEffect(() => { fetchDashboard(filterIdx); }, [filterIdx]);

  const handleFilter = (idx) => setFilterIdx(idx);
  const handleSaveTx = async (data, id) => {
    try {
      const res = id ? await transactionAPI.update(id, data) : await transactionAPI.create(data);
      console.log("🚀 [Transaction Save] Response:", res.data);
      
      setTxModal(false); 
      setEditTx(null); 
      fetchDashboard(filterIdx);
      
      const alert = res.data?.budgetAlert;
      if (alert) {
        const title = alert.threshold === 'exceeded' ? 'LIMIT EXCEEDED!' : `${alert.threshold}% REACHED!`;
        toast(`⚠️ ${title} Check recorded for ${alert.category}. Please check your email for details.`, 'info');
      }
    } catch (err) { 
      console.error("❌ [Transaction Save] Error:", err);
      toast('Something went wrong.', 'error'); 
    }
  };
  const handleDelete = async () => {
    try { await transactionAPI.delete(deleteTx._id); setDeleteTx(null); fetchDashboard(filterIdx); }
    catch { toast('Failed to delete transaction.', 'error'); }
  };
  const fetchHealthScore = async () => {
    setShowHealthModal(true); setLoadingHealth(true); setHealthError(null);
    try {
      const res = await aiAPI.getFinancialHealth();
      const d = res.data?.data || res.data;
      setHealthScore(d.score || 75);
      setHealthSuggestions(d.suggestions || d.insights || []);
    } catch (err) { setHealthError('AI service is busy.'); }
    finally { setLoadingHealth(false); }
  };

  const isNewUser = !isLoading && transactions.length === 0;

  return (
    <DashboardBoundary>
    <Layout>
      <style>{`
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>

      <TxModal open={txModal} onClose={() => { setTxModal(false); setEditTx(null); }} onSave={handleSaveTx} initial={editTx} />
      <ConfirmDialog open={!!deleteTx} title="Delete?" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteTx(null)} />
      <AIHealthModal open={showHealthModal} onClose={() => setShowHealthModal(false)} score={healthScore} suggestions={healthSuggestions} loading={loadingHealth} error={healthError} />
      <Toast toasts={toasts} remove={removeToast} />

      <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: '800' }}>Welcome, {user?.name?.split(' ')[0] || 'User'}!</h1>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '20px' }}>Your Overview</p>
            
            {/* Budget Progress Bar */}
            {user?.monthlyBudget > 0 && (
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>Monthly Budget Progress</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: (summary.totalExpenses / user.monthlyBudget) > 1 ? '#ef4444' : '#3b82f6' }}>
                    {Math.round((summary.totalExpenses / user.monthlyBudget) * 100)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min((summary.totalExpenses / user.monthlyBudget) * 100, 100)}%`, 
                    height: '100%', 
                    background: (summary.totalExpenses / user.monthlyBudget) > 0.9 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 
                               (summary.totalExpenses / user.monthlyBudget) > 0.7 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 
                               'linear-gradient(90deg, #3b82f6, #60a5fa)',
                    borderRadius: '999px',
                    transition: 'width 0.5s ease-out'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>Spent: ₹{Math.round(summary.totalExpenses || 0).toLocaleString()}</span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>Target: ₹{user.monthlyBudget.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setTxModal(true)} style={{ padding: '10px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '999px', fontSize: '13px', fontWeight: '800' }}>Add Income or Expenses</button>
            <button onClick={fetchHealthScore} style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>AI Advisor</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <StatCard label="Balance" value={`₹${(summary.availableBalance || 0).toLocaleString('en-IN')}`} icon={<Wallet/>} bg="#f9fafb" color="#6b7280" />
          <StatCard label="Income" value={`₹${(summary.totalIncome || 0).toLocaleString('en-IN')}`} icon={<TrendingUp/>} bg="#f0fdf4" color="#10b981" />
          <StatCard label="Expenses" value={`₹${(summary.totalExpenses || 0).toLocaleString('en-IN')}`} icon={<TrendingDown/>} bg="#fef2f2" color="#ef4444" />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {FILTER_OPTIONS.map((f, i) => (
            <button key={f.label} onClick={() => handleFilter(i)} style={{ padding: '8px 16px', border: 'none', borderRadius: '999px', fontSize: '12px', fontWeight: '700', background: filterIdx === i ? '#3b5bdb' : '#f3f4f6', color: filterIdx === i ? '#fff' : '#6b7280' }}>{f.label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Trends</h3>
            {isLoading ? <Loader2 className="animate-spin mx-auto my-10"/> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" /> <XAxis dataKey="name" /> <YAxis /> <Tooltip /> <Legend />
                  <Bar dataKey="Income" fill="#10b981" radius={[8,8,0,0]} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Categories</h3>
            {isLoading ? <Loader2 className="animate-spin mx-auto my-10"/> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, index)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {!isNewUser && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Recent History</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid #e5e7eb' }}><th style={{ textAlign: 'left', padding: '12px' }}>Description</th><th style={{ textAlign: 'right', padding: '12px' }}>Amount</th><th style={{ textAlign: 'right', padding: '12px' }}>Actions</th></tr></thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx._id} style={{ borderBottom: '1px solid #f3f4f6' }} className="hover-bg-gray">
                      <td style={{ padding: '12px' }}><strong>{tx.title || tx.category}</strong><br/><small style={{ color: '#6b7280' }}>{tx.category} • {new Date(tx.date).toLocaleDateString()}</small></td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: tx.type === 'INCOME' ? '#10b981' : '#ef4444' }}>
                        {tx.type === 'INCOME' ? '+' : '−'}₹{Math.abs(tx.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => setDeleteTx(tx)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '6px', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
    </DashboardBoundary>
  );
};
export default Dashboard;
