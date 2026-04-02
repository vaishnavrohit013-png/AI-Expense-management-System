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
const INCOME_CATS = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];
const FILTER_OPTIONS = [
  { label: 'Daily', value: 'LAST_7_DAYS', chart: 'LAST_7_DAYS' },
  { label: 'Weekly', value: 'THIS_WEEK', chart: 'LAST_4_WEEKS' },
  { label: 'Monthly', value: 'THIS_MONTH', chart: 'LAST_6_MONTHS' },
  { label: 'Yearly', value: 'THIS_YEAR', chart: 'LAST_12_MONTHS' },
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
        {t.type === 'info' && <Sparkles size={16} />}
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

/* ─── AI Health Modal ───────────────────────────────────────── */
const AIHealthModal = ({ open, onClose, score, suggestions, loading, error }) => {
  if (!open) return null;
  const scoreColor = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', animation: 'slideIn 0.2s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#8b5cf6" /> Financial Health Report
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '24px' }}>
            ×
          </button>
        </div>

        {loading ? (
             <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Loader2 size={32} className="animate-spin text-purple-500 mx-auto" />
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px' }}>Analyzing your financial footprint...</p>
             </div>
        ) : (
            <>
              {error ? (
                  <div style={{ textAlign: 'center', padding: '20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
                      <AlertTriangle size={28} className="mx-auto text-red-500 mb-2" color="#ef4444" />
                      <p style={{ fontSize: '14px', color: '#b91c1c', fontWeight: '500', margin: 0 }}>{error}</p>
                  </div>
              ) : (
                  <>
                      {score !== null && (
                        <div style={{ textAlign: 'center', marginBottom: '24px', padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: '48px', fontWeight: '800', color: scoreColor }}>{score}<span style={{fontSize:'20px', color:'#9ca3af'}}>/100</span></div>
                          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', fontWeight: '500' }}>Overall Health Score</p>
                        </div>
                      )}

                      {suggestions && suggestions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Recommendations</h3>
                          {suggestions.map((s, i) => (
                            <div key={i} style={{ padding: '14px', background: '#faf5ff', borderRadius: '10px', fontSize: '13px', color: '#4c1d95', border: '1px solid #e9d5ff', display: 'flex', gap: '10px' }}>
                              <LightbulbIcon size={16} color="#9333ea" style={{flexShrink: 0, marginTop: '2px'}} />
                              <span style={{lineHeight: 1.4, fontWeight: '500'}}>{s}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                         <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '14px' }}>
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

  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');

  const [txModal, setTxModal] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);

  // AI Features State
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [loadingAI, setLoadingAI] = useState({ summary: true, alerts: true });

  /* ── Fetch AI Data ── */
  const fetchAIData = useCallback(async () => {
    setLoadingAI({ summary: true, alerts: true });
    try {
      const [summaryRes, alertsRes] = await Promise.all([
        aiAPI.getMonthlySummary(),
        aiAPI.getBudgetAlerts()
      ]);
      setMonthlySummary(summaryRes.data.data);
      setBudgetAlerts(alertsRes.data.alerts);
    } catch (err) {
      console.error("AI Data Fetch Error:", err);
    } finally {
      setLoadingAI({ summary: false, alerts: false });
    }
  }, []);

  /* ── Fetch AI Monthly Insights ── */
  const [monthlyInsights, setMonthlyInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const generateMonthlyInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await aiAPI.getMonthlyInsights();
      setMonthlyInsights(res.data.insights || []);
    } catch (err) {
      toast('Failed to generate AI insights. Please try again.', 'error');
      console.error('Insights Error:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  /* ── Fetch core data ── */
  const fetchDashboard = useCallback(async (fi = filterIdx) => {
    setIsLoading(true);
    fetchAIData(); // Trigger AI fetch
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
  }, [filterIdx, user, fetchAIData]);

  useEffect(() => { fetchDashboard(filterIdx); }, [filterIdx]);

  const handleFilter = (idx) => {
    setFilterIdx(idx);
  };

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
      // Forced refresh of both Core stats and AI insights after data change
      fetchDashboard(filterIdx, true); 
    } catch (err) {
      toast(err.response?.data?.message || 'Something went wrong.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTx) return;
    try {
      await transactionAPI.delete(deleteTx._id);
      toast('Transaction deleted.', 'success');
      setDeleteTx(null);
      // Refresh all dashboard metrics including AI after deletion
      fetchDashboard(filterIdx, true); 
    } catch {
      toast('Failed to delete transaction.', 'error');
    }
  };

  const fetchHealthScore = async () => {
    setShowHealthModal(true);
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const res = await aiAPI.getFinancialHealth();
      const data = res.data?.data || res.data;
      setHealthScore(data.score ?? data.healthScore ?? null);
      
      // The backend returns insights and suggestions arrays or a fallback string
      let suggestionsList = [];
      if (Array.isArray(data.suggestions)) suggestionsList.push(...data.suggestions);
      if (Array.isArray(data.insights)) suggestionsList.push(...data.insights);
      if (typeof data.recommendations === 'string') suggestionsList.push(data.recommendations);
      
      setHealthSuggestions(suggestionsList);
    } catch (err) { 
        toast('Could not load AI insights.', 'error'); 
        setHealthError(err.response?.data?.message || 'Error communicating with AI network. Please try again.');
    }
    finally { setLoadingHealth(false); }
  };

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

  const budgetPct = budgetLimit > 0 ? Math.min((spentAmount / budgetLimit) * 100, 100) : 0;
  const isNewUser = !isLoading && transactions.length === 0;
  const scoreColor = s => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';

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

      <TxModal open={txModal} onClose={() => { setTxModal(false); setEditTx(null); }} onSave={handleSaveTx} initial={editTx} />
      <ConfirmDialog open={!!deleteTx} title="Delete Transaction?" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteTx(null)} />
      <AIHealthModal open={showHealthModal} onClose={() => setShowHealthModal(false)} score={healthScore} suggestions={healthSuggestions} loading={loadingHealth} error={healthError} />
      <Toast toasts={toasts} remove={removeToast} />

      <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '6px', letterSpacing: '-0.5px' }}>
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Here&apos;s your financial overview for this month</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setEditTx(null); setTxModal(true); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#3b5bdb', color: '#fff',
                  border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59, 91, 219, 0.25)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2d47a8'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3b5bdb'}
              >
                <Plus size={16} /> Add Transaction
              </button>

              <button
                onClick={fetchHealthScore}
                disabled={loadingHealth}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                }}
                onMouseEnter={(e) => !loadingHealth && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !loadingHealth && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {loadingHealth ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                AI Insight Report
              </button>

              <button
                onClick={() => exportToExcel(transactions)}
                disabled={transactions.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#f0fdf4', color: '#16a34a',
                  border: '1.5px solid #bbf7d0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: transactions.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', opacity: transactions.length === 0 ? 0.5 : 1,
                }}
              >
                <Download size={14} /> Export Data
              </button>
            </div>
          </div>
        </div>

        {/* ── AI Monthly Summary Section ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
             {/* AI Summary Card */}
             <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                padding: '28px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
             }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
                    <Sparkles size={120} />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ padding: '8px', background: '#3b82f6', borderRadius: '10px', color: '#fff' }}>
                        <Sparkles size={18} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>AI Monthly Summary</h3>
                </div>

                {loadingAI.summary ? (
                    <div style={{ padding: '20px 0', textAlign: 'center' }}>
                         <Loader2 size={24} className="animate-spin text-blue-500 mx-auto" />
                         <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>Generating smart insights...</p>
                    </div>
                ) : monthlySummary ? (
                    <div style={{ spaceY: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                             <div style={{ background: '#fff', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                 <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Highest Spend</p>
                                 <p style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{monthlySummary.highestCategory}</p>
                             </div>
                             <div style={{ background: '#fff', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                 <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Trend</p>
                                 <p style={{ fontSize: '15px', fontWeight: '800', color: monthlySummary.comparison.startsWith('+') ? '#ef4444' : '#10b981', margin: 0 }}>{monthlySummary.comparison}</p>
                             </div>
                        </div>
                        <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '16px', border: '1px left-solid #3b82f6', borderLeftWidth: '4px' }}>
                             <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', lineHeight: '1.5', margin: 0 }}>{monthlySummary.insight}</p>
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div style={{ padding: '4px', background: '#10b981', borderRadius: '50%', color: '#fff' }}>
                                 <CheckCircle2 size={12} />
                             </div>
                             <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{monthlySummary.suggestion}</p>
                        </div>
                    </div>
                ) : (
                    <p style={{ fontSize: '14px', color: '#64748b' }}>No summary available yet.</p>
                )}
             </div>

             {/* Budget Alerts Section */}
             <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                padding: '28px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
             }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ padding: '8px', background: '#f59e0b', borderRadius: '10px', color: '#fff' }}>
                        <AlertTriangle size={18} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Budget Monitoring</h3>
                </div>

                {loadingAI.alerts ? (
                    <div style={{ padding: '20px 0', textAlign: 'center' }}>
                         <Loader2 size={24} className="animate-spin text-amber-500 mx-auto" />
                    </div>
                ) : budgetAlerts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                         {budgetAlerts.map((alert, idx) => (
                             <div key={idx} style={{ 
                                padding: '14px 16px', 
                                background: alert.type === 'alert' ? '#fef2f2' : alert.type === 'warning' ? '#fffbeb' : '#f0f9ff',
                                border: '1px solid',
                                borderColor: alert.type === 'alert' ? '#fecaca' : alert.type === 'warning' ? '#fef3c7' : '#e0f2fe',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                             }}>
                                {alert.type === 'alert' ? <Shield size={18} color="#dc2626" /> : <AlertTriangle size={18} color="#d97706" />}
                                <p style={{ 
                                    fontSize: '13px', 
                                    fontWeight: '600', 
                                    color: alert.type === 'alert' ? '#991b1b' : alert.type === 'warning' ? '#92400e' : '#075985',
                                    margin: 0
                                }}>
                                    {alert.message}
                                </p>
                             </div>
                         ))}
                    </div>
                ) : (
                    <div style={{ padding: '20px 0', textAlign: 'center', background: '#f0fdf4', borderRadius: '16px', border: '1px dashed #bbf7d0' }}>
                         <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
                         <p style={{ fontSize: '13px', fontWeight: '700', color: '#065f46', margin: 0 }}>Your budget is safe!</p>
                         <p style={{ fontSize: '11px', color: '#166534', marginTop: '4px' }}>No alerts or overspending detected yet.</p>
                    </div>
                )}
             </div>
        </div>

        {/* ── AI Monthly Insights ── */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '24px',
          marginBottom: '24px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', borderRadius: '10px', color: '#fff' }}>
                <LightbulbIcon size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>AI Monthly Insights</h3>
            </div>
            <button
              onClick={generateMonthlyInsights}
              disabled={loadingInsights}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#f3f4f6', color: '#374151',
                border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: loadingInsights ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => !loadingInsights && (e.currentTarget.style.background = '#e5e7eb')}
              onMouseLeave={(e) => !loadingInsights && (e.currentTarget.style.background = '#f3f4f6')}
            >
              {loadingInsights ? <Loader2 size={16} className="animate-spin text-purple-600" /> : <Sparkles size={16} className="text-purple-600" />}
              {monthlyInsights ? 'Refresh Insights' : 'Generate Insights'}
            </button>
          </div>

          <div style={{ minHeight: '100px' }}>
            {loadingInsights ? (
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 0' }}>
                   <Loader2 size={32} className="animate-spin text-purple-500 mb-3" />
                   <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Analyzing your transactions...</p>
               </div>
            ) : monthlyInsights === null ? (
               <div style={{ textAlign: 'center', padding: '30px 0' }}>
                   <p style={{ fontSize: '14px', color: '#6b7280' }}>Click "Generate Insights" to discover personalized financial trends.</p>
               </div>
            ) : monthlyInsights.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '30px 0' }}>
                   <p style={{ fontSize: '14px', color: '#6b7280' }}>Not enough data to generate insights for this month.</p>
               </div>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'slideIn 0.4s ease-out' }}>
                   {monthlyInsights.map((insight, idx) => (
                       <div key={idx} style={{
                           padding: '16px', background: '#faf5ff', border: '1px solid #f3e8ff',
                           borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px'
                       }}>
                           <div style={{ marginTop: '2px', color: '#9333ea' }}>
                               <CheckCircle2 size={18} />
                           </div>
                           <p style={{ fontSize: '14px', color: '#4c1d95', fontWeight: '500', margin: 0, lineHeight: '1.5' }}>
                               {insight}
                           </p>
                       </div>
                   ))}
               </div>
            )}
          </div>
        </div>

        {/* ── Monthly Budget ── */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px',
          marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>Monthly Budget (Default Account)</h3>
              <button onClick={() => window.location.href = '/settings'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db' }}>
                <Edit2 size={14} />
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, marginBottom: '12px' }}>
              ₹{spentAmount.toLocaleString('en-IN')} of ₹{budgetLimit.toLocaleString('en-IN')} spent
            </p>
            <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: budgetPct > 90 ? '#ef4444' : '#3b5bdb',
                width: `${budgetPct}%`, transition: 'width 0.7s ease',
              }} />
            </div>
          </div>
          <div style={{
            marginLeft: '20px', padding: '12px 16px', background: budgetPct > 90 ? '#fef2f2' : '#eff6ff',
            borderRadius: '10px', color: budgetPct > 90 ? '#ef4444' : '#2563eb', fontWeight: '600', fontSize: '13px'
          }}>
            {budgetPct.toFixed(1)}% used
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <StatCard
            label="Balance"
            value={`₹${summary.availableBalance.toLocaleString('en-IN')}`}
            sub="Current account balance"
            icon={<Wallet />}
            color="#6b7280"
            bg="#f9fafb"
          />
          <StatCard
            label="Income"
            value={`₹${summary.totalIncome.toLocaleString('en-IN')}`}
            sub="This month"
            icon={<TrendingUp />}
            color="#10b981"
            bg="#f0fdf4"
          />
          <StatCard
            label="Expenses"
            value={`₹${summary.totalExpenses.toLocaleString('en-IN')}`}
            sub="This month"
            icon={<TrendingDown />}
            color="#ef4444"
            bg="#fef2f2"
          />
          <StatCard
            label="Savings Goal"
            value={`${summary.savingsRate || 0}%`}
            sub={`₹${(summary.totalIncome - summary.totalExpenses).toLocaleString('en-IN')} saved this month`}
            icon={<Shield />}
            color="#2563eb"
            bg="#eff6ff"
          />
        </div>

        {/* ── Filter Tabs ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter:</span>
          {FILTER_OPTIONS.map((f, i) => (
            <button
              key={f.label}
              onClick={() => handleFilter(i)}
              style={{
                padding: '8px 16px', border: 'none', borderRadius: '999px',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Income vs Expenses Bar Chart */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Income vs Expenses</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
              {FILTER_OPTIONS[filterIdx].label} trends for the past {filterIdx === 0 ? '7 days' : filterIdx === 1 ? '4 weeks' : filterIdx === 2 ? '6 months' : '12 months'}
            </p>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                <Loader2 size={24} style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="Income" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                No data available
              </div>
            )}
          </div>

          {/* Expenses by Category Pie Chart */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Expenses by Category</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>Current month breakdown</p>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                <Loader2 size={24} style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                No expenses to display
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Transactions ── */}
        {!isNewUser && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Recent Transactions</h3>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                No transactions yet. Start by adding one!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 0', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '12px 0', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Description</th>
                      <th style={{ padding: '12px 0', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                      <th style={{ padding: '12px 0', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '12px 0', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((tx) => (
                      <tr key={tx._id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 0', fontSize: '12px', color: '#6b7280' }}>
                          {tx.date ? new Date(tx.date).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td style={{ padding: '12px 0', fontSize: '13px', color: '#111827', fontWeight: '500' }}>
                          {tx.title || tx.category}
                        </td>
                        <td style={{ padding: '12px 0', fontSize: '12px', color: '#6b7280' }}>
                          <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>{tx.category}</span>
                        </td>
                        <td style={{
                          padding: '12px 0', fontSize: '13px', fontWeight: '600', textAlign: 'right',
                          color: tx.type === 'INCOME' ? '#10b981' : '#ef4444'
                        }}>
                          {tx.type === 'INCOME' ? '+' : '−'} ₹{tx.amount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'center' }}>
                          <button
                            onClick={() => { setEditTx(tx); setTxModal(true); }}
                            style={{ background: 'none', border: 'none', color: '#3b5bdb', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginRight: '10px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTx(tx)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
