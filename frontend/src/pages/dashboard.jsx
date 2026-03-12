import React from 'react';
import { 
    LayoutGrid, 
    TrendingUp, 
    TrendingDown, 
    Wallet, 
    Plus, 
    ArrowUpRight, 
    ArrowDownRight, 
    Clock, 
    MoreVertical,
    Activity,
    CreditCard,
    Building2,
    IndianRupee,
    Edit2,
    Check,
    X,
    Mail,
    Sparkles,
    Calendar,
    ArrowRightCircle,
    Download,
    Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell, PieChart, Pie } from 'recharts';
import Layout from '../components/Layout';
import { transactionAPI, analyticsAPI } from '../services/api';
import { aiService } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

const AIReportModal = ({ isOpen, onClose, transactions }) => {
    const [isSending, setIsSending] = React.useState(false);
    const [isDownloaded, setIsDownloaded] = React.useState(false);
    const [insights, setInsights] = React.useState([]);
    const [loadingInsights, setLoadingInsights] = React.useState(true);

    const stats = transactions?.reduce((acc, tx) => {
        const amt = tx.amount || 0;
        if (tx.type === 'income') acc.income += amt;
        else acc.expenses += amt;
        return acc;
    }, { income: 0, expenses: 0 }) || { income: 0, expenses: 0 };

    const categoryBreakdown = transactions?.reduce((acc, tx) => {
        if (tx.type === 'expense') {
            const cat = tx.category || 'Other';
            acc[cat] = (acc[cat] || 0) + (tx.amount || 0);
        }
        return acc;
    }, {}) || {};

    const sortedCategories = Object.entries(categoryBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 7);

    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

    React.useEffect(() => {
        if (isOpen && transactions?.length > 0) {
            const fetchInsights = async () => {
                setLoadingInsights(true);
                const result = await aiService.getFinancialInsights(transactions);
                setInsights(result);
                setLoadingInsights(false);
            };
            fetchInsights();
        }
    }, [isOpen, transactions]);

    if (!isOpen) return null;

    const handleDownload = () => {
        setIsDownloaded(true);
        setTimeout(() => {
            alert('Financial Report PDF downloaded successfully!');
            setIsDownloaded(false);
        }, 1000);
    };

    const handleEmailResend = () => {
        setIsSending(true);
        setTimeout(() => {
            alert('Report has been sent to your registered email: rohit@example.com');
            setIsSending(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Intelligence Export_</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live monthly synthesis_</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-12 space-y-12">
                    {/* Header from Email Image */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Monthly Financial <span className="text-blue-600">Report</span>_</h1>
                        <p className="text-lg md:text-xl font-medium text-slate-500 italic">Hello Rohit, here's your strategic financial summary for {currentMonth}_</p>
                    </div>

                    {/* Summary Cards from Email Image */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 md:p-10 bg-white border border-slate-100 rounded-[2.5rem] space-y-4 shadow-sm group hover:border-blue-200 transition-all text-center md:text-left">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Income</span>
                            <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">₹{stats.income.toLocaleString()}</h4>
                        </div>
                        <div className="p-8 md:p-10 bg-white border border-slate-100 rounded-[2.5rem] space-y-4 shadow-sm group hover:border-blue-200 transition-all text-center md:text-left">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Expenses</span>
                            <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">₹{stats.expenses.toLocaleString()}</h4>
                        </div>
                        <div className="p-8 md:p-10 bg-slate-900 text-white rounded-[2.5rem] space-y-4 shadow-2xl relative overflow-hidden group text-center md:text-left">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest relative z-10">Net Balance</span>
                            <h4 className="text-2xl md:text-3xl font-black text-white tracking-tighter relative z-10">₹{(stats.income - stats.expenses).toLocaleString()}</h4>
                        </div>
                    </div>

                    {/* Expenses by Category - Matching Image 2 */}
                    <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 italic uppercase">Expenses by Category_</h2>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Activity size={20} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {sortedCategories.length > 0 ? sortedCategories.map(([cat, val], i) => (
                                <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 group hover:bg-slate-50/50 px-4 rounded-xl transition-all">
                                    <span className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest">{cat}</span>
                                    <span className="text-base md:text-lg font-black text-slate-900 tracking-tight">₹{val.toLocaleString()}</span>
                                </div>
                            )) : (
                                <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-widest">No detailed breakdown available_</p>
                            )}
                        </div>
                    </div>

                    {/* AI Insights from Email Image 3 */}
                    <div className="p-12 bg-blue-50/30 rounded-[4rem] border-4 border-dashed border-blue-100 space-y-10 relative overflow-hidden">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-100/50 rounded-full blur-3xl"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Welth Insights_</h2>
                            <div className="flex-1 h-3 bg-blue-100 rounded-full"></div>
                        </div>
                        <div className="space-y-8 relative z-10">
                            {loadingInsights ? (
                                <div className="space-y-6 animate-pulse">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-6">
                                            <div className="mt-1.5 w-4 h-4 rounded-full bg-blue-200"></div>
                                            <div className="h-4 bg-blue-100 rounded w-full"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : insights.map((tip, idx) => (
                                <div key={idx} className="flex gap-6 group">
                                    <div className="mt-1.5 w-4 h-4 rounded-full bg-blue-600 shadow-lg shadow-blue-200 group-hover:scale-125 transition-transform"></div>
                                    <p className="text-xl font-semibold text-slate-600 leading-[1.8] italic">
                                        "{tip}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-6">
                    <button 
                        onClick={handleDownload}
                        disabled={isDownloaded}
                        className="flex-1 py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 border-b-4 border-blue-800"
                    >
                        {isDownloaded ? <Check size={20} /> : <Download size={20} />}
                        {isDownloaded ? 'Downloaded_HUB' : 'Download PDF Report'}
                    </button>
                    <button 
                        onClick={handleEmailResend}
                        disabled={isSending}
                        className="flex-1 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-100 hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 border-b-4 border-slate-700"
                    >
                        {isSending ? <Loader2 size={20} className="animate-spin" /> : <Mail size={20} />}
                        {isSending ? 'Syncing...' : 'Resend to Email'}
                    </button>
                </div>
            </div>
        </div>
    );
};
const Dashboard = () => {
    const [budgetLimit, setBudgetLimit] = React.useState(0);
    const [spentAmount, setSpentAmount] = React.useState(0);
    const [summary, setSummary] = React.useState({ totalIncome: 0, totalExpenses: 0, availableBalance: 0, savingsRate: 0 });
    const [transactions, setTransactions] = React.useState([]);
    const [barData, setBarData] = React.useState([]);
    const [pieData, setPieData] = React.useState([]);
    const [showAIReport, setShowAIReport] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const { user } = useAuth();

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [txRes, summaryRes, chartRes, pieRes] = await Promise.all([
                    transactionAPI.getAll({ limit: 5 }),
                    analyticsAPI.getSummary({ preset: 'THIS_MONTH' }),
                    analyticsAPI.getChart({ preset: 'LAST_6_MONTHS' }),
                    analyticsAPI.getExpenseBreakdown({ preset: 'THIS_MONTH' })
                ]);

                setTransactions(txRes.data.data || []);
                setSummary(summaryRes.data.data);
                setSpentAmount(summaryRes.data.data.totalExpenses);
                setBudgetLimit(user?.monthlyBudget || 450000); // Fallback to 4.5L if not set

                // Map Chart Data
                const mappedChartData = chartRes.data.data.chartData.map(item => ({
                    name: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(item.date)),
                    income: item.income,
                    expenses: item.expense
                }));
                setBarData(mappedChartData);

                // Map Pie Data
                const mappedPieData = Object.entries(pieRes.data.data.categories).map(([name, data]) => ({
                    name,
                    value: data.amount
                }));
                setPieData(mappedPieData);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b'];

    return (
        <Layout>
            <div className="space-y-10 pb-10">
                {/* Greeting - Matching Image 1 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Welcome back, Rohit!</h1>
                        <p className="text-slate-500 mt-2 font-medium text-lg">Here's your financial overview for this month</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowAIReport(true)}
                            className="flex items-center gap-4 px-10 py-5 bg-blue-50 text-blue-600 rounded-[2rem] font-black text-[11px] hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-50 active:scale-95 uppercase tracking-[0.2em] border border-blue-200 group"
                        >
                            <Sparkles size={18} className="text-blue-500 group-hover:text-white group-hover:rotate-12 transition-all" />
                            AI Insight Report
                        </button>
                    </div>
                </div>

                {/* Monthly Budget Section - Matching Image 2 */}
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 mt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900">Monthly Budget (Default Account)</h3>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                                <span>₹{spentAmount.toLocaleString()} of ₹{budgetLimit.toLocaleString()} spent</span>
                                <button onClick={() => window.location.href='/settings'} className="text-slate-400 hover:text-slate-600">
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            (spentAmount / budgetLimit) > 0.9 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                            {budgetLimit > 0 ? ((spentAmount / budgetLimit) * 100).toFixed(1) : 0}% used
                        </div>
                    </div>
                    
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                        <div 
                            className={`h-full transition-all duration-1000 ${
                                (spentAmount / budgetLimit) > 0.9 ? 'bg-rose-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min((spentAmount / (budgetLimit || 1)) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Stats Grid - Matching Image 1 Four-Card Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Balance */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center text-slate-400">
                            <span className="text-sm font-medium">Balance</span>
                            <Wallet size={20} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">₹{summary.availableBalance.toLocaleString()}</h2>
                            <p className="text-xs text-slate-400 font-medium mt-1">Current account balance</p>
                        </div>
                    </div>

                    {/* Income */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center text-emerald-500">
                            <span className="text-sm font-medium text-slate-400">Income</span>
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">₹{summary.totalIncome.toLocaleString()}</h2>
                            <p className="text-xs text-slate-400 font-medium mt-1">This month</p>
                        </div>
                    </div>

                    {/* Expenses */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center text-rose-500">
                            <span className="text-sm font-medium text-slate-400">Expenses</span>
                            <TrendingDown size={20} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">₹{summary.totalExpenses.toLocaleString()}</h2>
                            <p className="text-xs text-slate-400 font-medium mt-1">This month</p>
                        </div>
                    </div>

                    {/* Savings Goal */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center text-blue-500">
                            <span className="text-sm font-medium text-slate-400">Savings Rate</span>
                            <div className="w-5 h-5 rounded-full border-4 border-blue-500/30 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{summary.savingsRate}%</h2>
                            <p className="text-xs text-slate-400 font-medium mt-1">Efficiency of wealth generation_</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Recent Transactions & Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Recent Transactions Section - Image 2 Style */}
                    <div className="lg:col-span-12 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase leading-none">Recent <span className="text-blue-600">Transactions</span>_</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Latest financial pulse synchronization</p>
                            </div>
                            <button 
                                onClick={() => window.location.href='/transactions'}
                                className="px-6 py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-100/50"
                            >
                                View All Matrix_
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="flex flex-col gap-6 py-10 items-center justify-center opacity-30">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs font-black uppercase tracking-widest">Scanning Ledger...</p>
                                </div>
                            ) : transactions.length > 0 ? (
                                transactions.slice(0, 4).map((tx, i) => (
                                    <div key={tx._id || i} className="flex items-center justify-between p-7 hover:bg-slate-50 rounded-3xl transition-all group/tx cursor-default border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-6">
                                            <div className={`p-4 rounded-2xl ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} group-hover/tx:scale-110 transition-transform`}>
                                                {tx.type === 'INCOME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase italic">{tx.category || tx.title}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    {tx.date ? new Intl.DateTimeFormat('en-CA').format(new Date(tx.date)) : 'No Date'} • {tx.description || 'Generic Entry'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`text-xl font-black tracking-tighter ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-900'}`}>
                                            {tx.type === 'INCOME' ? '+' : ''}₹{tx.amount?.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100">
                                    <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">No data records found in the vault_</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Income vs Expenses Bar Chart */}
                    <div className="lg:col-span-8 bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="space-y-1 mb-10">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Income vs Expenses</h3>
                            <p className="text-sm text-slate-400 font-medium tracking-tight">Monthly trends for the past 6 months</p>
                        </div>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} />
                                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                                    <Bar dataKey="expenses" fill="#1d4ed8" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Expenses by Category Donut Chart */}
                    <div className="lg:col-span-4 bg-white p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                        <div className="space-y-1 mb-10">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Expenses by Category</h3>
                            <p className="text-sm text-slate-400 font-medium tracking-tight">Current month breakdown</p>
                        </div>
                        <div className="h-[250px] mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4 overflow-y-auto max-h-[150px] scrollbar-hide">
                            {pieData.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 tracking-tighter italic">₹{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Report Modal */}
                <AIReportModal isOpen={showAIReport} onClose={() => setShowAIReport(false)} transactions={transactions} />
            </div>
        </Layout>
    );
};

export default Dashboard;