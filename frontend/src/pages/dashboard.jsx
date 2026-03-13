import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Edit2,
    Mic,
    MicOff,
    Sparkles,
    Shield,
    CheckCircle2,
    AlertTriangle,
    Camera,
    FileText,
    CalendarDays,
    Loader2,
    ArrowRight,
    RefreshCw,
    LightbulbIcon
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import Layout from '../components/Layout';
import { transactionAPI, analyticsAPI, aiAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    // Core data state
    const [summary, setSummary] = React.useState({ totalIncome: 0, totalExpenses: 0, availableBalance: 0, savingsRate: 0 });
    const [transactions, setTransactions] = React.useState([]);
    const [barData, setBarData] = React.useState([]);
    const [pieData, setPieData] = React.useState([]);
    const [budgetLimit, setBudgetLimit] = React.useState(0);
    const [spentAmount, setSpentAmount] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);

    // AI Health Score state
    const [healthScore, setHealthScore] = React.useState(null);
    const [healthSuggestions, setHealthSuggestions] = React.useState([]);
    const [healthInsights, setHealthInsights] = React.useState([]);
    const [loadingHealth, setLoadingHealth] = React.useState(false);

    // Voice entry state
    const [listening, setListening] = React.useState(false);
    const [voiceStatus, setVoiceStatus] = React.useState('');

    // Weekly report state
    const [weeklyReport, setWeeklyReport] = React.useState(null);

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4'];

    // ── Fetch dashboard data ──────────────────────────────────────────────
    React.useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [txRes, summaryRes, chartRes, pieRes] = await Promise.all([
                    transactionAPI.getAll({ limit: 20 }),
                    analyticsAPI.getSummary({ preset: 'THIS_MONTH' }),
                    analyticsAPI.getChart({ preset: 'LAST_6_MONTHS' }),
                    analyticsAPI.getExpenseBreakdown({ preset: 'THIS_MONTH' }),
                ]);

                const txList = txRes.data.data || [];
                setTransactions(txList);

                const s = summaryRes.data.data;
                setSummary(s);
                setSpentAmount(s.totalExpenses || 0);
                setBudgetLimit(user?.monthlyBudget || 50000);

                // Bar chart
                const mapped = (chartRes.data.data?.chartData || []).map(item => ({
                    name: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(item.date)),
                    Income: item.income,
                    Expenses: item.expense,
                }));
                setBarData(mapped);

                // Pie chart
                const cats = pieRes.data.data?.categories || {};
                const pie = Object.entries(cats).map(([name, data]) => ({
                    name,
                    value: data.amount || 0,
                }));
                setPieData(pie);

                // Weekly report summary from transactions
                buildWeeklyReport(txList);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, [user]);

    // ── Build weekly report from transaction data ─────────────────────────
    const buildWeeklyReport = (txList) => {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);

        const weekTx = txList.filter(tx => new Date(tx.date) >= weekAgo && tx.type !== 'INCOME');
        const weekTotal = weekTx.reduce((s, t) => s + (t.amount || 0), 0);

        const catMap = {};
        const dayMap = {};
        weekTx.forEach(tx => {
            const cat = tx.category || 'Other';
            catMap[cat] = (catMap[cat] || 0) + tx.amount;
            const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(tx.date));
            dayMap[day] = (dayMap[day] || 0) + tx.amount;
        });

        const topCat = Object.entries(catMap).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
        const topDay = Object.entries(dayMap).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

        setWeeklyReport({ total: weekTotal, topCategory: topCat, topDay });
    };

    // ── Fetch AI Financial Health Score ───────────────────────────────────
    const fetchHealthScore = async () => {
        if (transactions.length === 0) return;
        setLoadingHealth(true);
        try {
            const res = await aiAPI.getInsights(transactions);
            const data = res.data;
            setHealthScore(data.score ?? 72);
            setHealthSuggestions(data.suggestions || []);
            setHealthInsights(data.insights || []);
        } catch (err) {
            console.error('AI Health Score error:', err);
            setHealthScore(60);
            setHealthSuggestions(['Reduce unnecessary spending', 'Increase your savings rate']);
            setHealthInsights(['Your spending patterns show room for improvement.']);
        } finally {
            setLoadingHealth(false);
        }
    };

    // ── Voice entry ───────────────────────────────────────────────────────
    const handleVoiceEntry = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setVoiceStatus('Voice input not supported in this browser.');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setListening(true);
        setVoiceStatus('Listening… speak now');
        recognition.start();

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setVoiceStatus(`Heard: "${transcript}" — Processing…`);
            setListening(false);
            try {
                const res = await aiAPI.extractVoice(transcript);
                const d = res.data?.data || res.data;
                setVoiceStatus(`✅ Extracted: ₹${d.amount || '?'} for ${d.category || d.title || 'unknown'} on ${d.date || 'today'}. Go to Add Transaction to confirm.`);
            } catch {
                setVoiceStatus('Could not extract details. Try again.');
            }
        };
        recognition.onerror = () => {
            setListening(false);
            setVoiceStatus('Mic error. Please allow microphone access.');
        };
        recognition.onend = () => setListening(false);
    };

    const scoreColor = (s) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
    const scoreLabel = (s) => s >= 75 ? 'Good' : s >= 50 ? 'Fair' : 'Needs Work';
    const budgetPct = budgetLimit > 0 ? Math.min((spentAmount / budgetLimit) * 100, 100) : 0;

    return (
        <Layout>
            <div className="space-y-8 pb-10">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Welcome back, {user?.name?.split(' ')[0] || 'Rohit'}!
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Here's your financial overview for this month</p>
                    </div>
                    <button
                        onClick={fetchHealthScore}
                        disabled={loadingHealth || isLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                    >
                        {loadingHealth ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        AI Insight Report
                    </button>
                </div>

                {/* ── Monthly Budget ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-semibold text-slate-800 text-sm">Monthly Budget (Default Account)</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                ₹{spentAmount.toLocaleString()} of ₹{budgetLimit.toLocaleString()} spent
                                <button onClick={() => window.location.href = '/settings'} className="ml-2 text-slate-300 hover:text-slate-500">
                                    <Edit2 size={11} className="inline" />
                                </button>
                            </p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-lg ${budgetPct > 90 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                            {budgetPct.toFixed(1)}% used
                        </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${budgetPct > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${budgetPct}%` }}
                        />
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Balance', value: `₹${summary.availableBalance.toLocaleString()}`, sub: 'Current account balance', icon: <Wallet size={18} />, color: 'text-slate-400' },
                        { label: 'Income', value: `₹${summary.totalIncome.toLocaleString()}`, sub: 'This month', icon: <TrendingUp size={18} />, color: 'text-emerald-500' },
                        { label: 'Expenses', value: `₹${summary.totalExpenses.toLocaleString()}`, sub: 'This month', icon: <TrendingDown size={18} />, color: 'text-rose-500' },
                        { label: 'Savings Rate', value: `${summary.savingsRate || 0}%`, sub: 'Of monthly income saved', icon: <div className="w-4 h-4 rounded-full border-4 border-blue-300 flex items-center justify-center"><div className="w-1 h-1 bg-blue-500 rounded-full" /></div>, color: 'text-blue-500' },
                    ].map((c, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <div className={`flex justify-between items-center mb-3 ${c.color}`}>
                                <span className="text-xs font-medium text-slate-400">{c.label}</span>
                                {c.icon}
                            </div>
                            <p className="text-xl font-bold text-slate-900">{c.value}</p>
                            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ── AI Financial Health Score ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={18} className="text-blue-600" />
                        <h2 className="font-bold text-slate-800">🔐 AI Financial Health Score</h2>
                    </div>

                    {!healthScore && !loadingHealth ? (
                        <div className="flex flex-col items-center py-8 text-center">
                            <p className="text-slate-400 text-sm mb-4">Click "AI Insight Report" to generate your financial health score</p>
                            <button
                                onClick={fetchHealthScore}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
                            >
                                <Sparkles size={15} /> Generate Score
                            </button>
                        </div>
                    ) : loadingHealth ? (
                        <div className="flex items-center justify-center py-10 gap-3">
                            <Loader2 size={22} className="animate-spin text-blue-600" />
                            <span className="text-slate-400 text-sm">Analyzing your finances…</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Score Circle */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative w-32 h-32">
                                    <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={scoreColor(healthScore)} strokeWidth="3" strokeDasharray={`${healthScore}, 100`} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-slate-900">{healthScore}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold">/100</span>
                                    </div>
                                </div>
                                <span className="mt-2 text-sm font-bold" style={{ color: scoreColor(healthScore) }}>{scoreLabel(healthScore)}</span>
                                <p className="text-xs text-slate-400 mt-1">Financial Health</p>
                            </div>

                            {/* Suggestions */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Suggestions</h4>
                                <div className="space-y-2">
                                    {healthSuggestions.slice(0, 4).map((s, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-slate-600">{s}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Insights */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Insights</h4>
                                <div className="space-y-2">
                                    {healthInsights.slice(0, 3).map((ins, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-slate-600">{ins}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-1">Income vs Expenses</h3>
                        <p className="text-xs text-slate-400 mb-5">Monthly trends for the past 6 months</p>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Legend />
                                    <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
                                    <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={22} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-1">Expenses by Category</h3>
                        <p className="text-xs text-slate-400 mb-4">Current month breakdown</p>
                        <div className="h-44">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                                        {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-1.5 mt-2 max-h-28 overflow-y-auto">
                            {pieData.map((item, i) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-xs text-slate-500">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">₹{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── AI Feature Cards Row ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Voice Entry */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-purple-50 rounded-xl">
                                <Mic size={16} className="text-purple-600" />
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm">🎙 Voice Expense Entry</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">Say something like "Add 500 rupees for groceries today"</p>

                        <button
                            onClick={handleVoiceEntry}
                            disabled={listening}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                        >
                            {listening ? <><MicOff size={16} /> Listening…</> : <><Mic size={16} /> Start Voice Entry</>}
                        </button>

                        {voiceStatus && (
                            <p className={`text-xs mt-3 p-2 rounded-lg ${voiceStatus.startsWith('✅') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                {voiceStatus}
                            </p>
                        )}
                    </div>

                    {/* Weekly Report */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <CalendarDays size={16} className="text-blue-600" />
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm">📅 Weekly Spending Report</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">Summary of your last 7 days</p>
                        {weeklyReport ? (
                            <div className="space-y-2 flex-1">
                                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                    <span className="text-xs text-slate-500">Week Total</span>
                                    <span className="text-sm font-bold text-slate-800">₹{weeklyReport.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                    <span className="text-xs text-slate-500">Top Category</span>
                                    <span className="text-sm font-bold text-blue-600">{weeklyReport.topCategory}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-xs text-slate-500">Most Expensive Day</span>
                                    <span className="text-sm font-bold text-slate-800">{weeklyReport.topDay}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No expense data this week.</p>
                        )}
                        <button
                            onClick={() => window.location.href = '/reports'}
                            className="mt-4 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all"
                        >
                            View Full Reports <ArrowRight size={13} />
                        </button>
                    </div>

                    {/* Receipt Scanner */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-amber-50 rounded-xl">
                                <Camera size={16} className="text-amber-600" />
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm">🧾 AI Receipt Scanner</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">Upload a receipt and AI will automatically extract the amount, date, merchant, and category.</p>
                        <div className="flex-1 flex flex-col justify-center items-center py-4 bg-amber-50/50 rounded-xl border-2 border-dashed border-amber-100">
                            <Camera size={28} className="text-amber-300 mb-2" />
                            <p className="text-xs text-slate-400 text-center">Take a photo or upload a receipt</p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/receipts'}
                            className="mt-4 flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-semibold hover:bg-amber-500 hover:text-white transition-all"
                        >
                            Open Receipt Scanner <ArrowRight size={13} />
                        </button>
                    </div>
                </div>

                {/* ── Recent Transactions ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="font-bold text-slate-800">Recent Transactions</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Latest financial activity</p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/transactions'}
                            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight size={12} />
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 size={24} className="animate-spin text-blue-500" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="space-y-1">
                            {transactions.slice(0, 5).map((tx, i) => (
                                <div key={tx._id || i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                            {tx.type === 'INCOME' ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{tx.title || tx.category || 'Transaction'}</p>
                                            <p className="text-xs text-slate-400">
                                                {tx.date ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(tx.date)) : '—'}
                                                {tx.category ? ` • ${tx.category}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-800'}`}>
                                        {tx.type === 'INCOME' ? '+' : '−'}₹{(tx.amount || 0).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-300">
                            <FileText size={32} className="mx-auto mb-2" />
                            <p className="text-sm font-medium">No transactions found</p>
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
};

export default Dashboard;