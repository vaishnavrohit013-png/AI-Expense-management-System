import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Sparkles,
    Loader2,
    Target,
    Pencil
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import Layout from '../components/Layout';
import { transactionAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    // Core data state
    // Core data state
    const [summary, setSummary] = React.useState({ totalIncome: 0, totalExpenses: 0, availableBalance: 0, savingsRate: 0 });
    const [transactions, setTransactions] = React.useState([]);
    const [barData, setBarData] = React.useState([]);
    const [pieData, setPieData] = React.useState([]);
    const [budgetLimit, setBudgetLimit] = React.useState(10000); // Default budget
    const [spentAmount, setSpentAmount] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('THIS_MONTH'); // Options: TODAY, THIS_WEEK, THIS_MONTH, THIS_YEAR

    const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];

    const fetchDashboard = async () => {
        setIsLoading(true);
        try {
            const chartFilter = filter === 'THIS_YEAR' ? 'LAST_12_MONTHS' : (filter === 'THIS_MONTH' ? 'LAST_6_MONTHS' : 'LAST_7_DAYS');
            
            const [txRes, summaryRes, chartRes, pieRes] = await Promise.all([
                transactionAPI.getAll({ limit: 5 }),
                analyticsAPI.getSummary({ preset: filter }),
                analyticsAPI.getChart({ preset: chartFilter }),
                analyticsAPI.getExpenseBreakdown({ preset: filter }),
            ]);

            const txList = txRes.data.data || [];
            setTransactions(txList);

            const s = summaryRes.data.data;
            setSummary({
                totalIncome: s.totalIncome || 0,
                totalExpenses: s.totalExpenses || 0,
                availableBalance: s.availableBalance || 0,
                savingsRate: s.savingsRate || 0
            });
            setSpentAmount(s.totalExpenses || 0);

            // Bar chart
            const mapped = (chartRes.data.data?.chartData || []).map(item => ({
                name: new Intl.DateTimeFormat('en-US', { month: 'short', day: filter === 'TODAY' || filter === 'THIS_WEEK' ? 'numeric' : undefined }).format(new Date(item.date)),
                Income: item.income,
                Expenses: item.expense,
            }));
            setBarData(mapped);

            // Pie chart
            const categoriesObj = pieRes.data.data?.categories || {};
            const pie = Object.entries(categoriesObj).map(([name, data]) => ({
                name,
                value: data.amount || 0,
            }));
            setPieData(pie);

        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchDashboard();
    }, [user, filter]);

    const budgetPct = budgetLimit > 0 ? Math.min((spentAmount / budgetLimit) * 100, 100) : 0;

    const formatLakhs = (amt) => {
        return `₹${amt.toLocaleString('en-IN')}`;
    };

    const handleExport = async () => {
        try {
            const res = await transactionAPI.getAll({ limit: 1000 });
            const data = res.data.data || [];
            if (data.length === 0) {
                alert("No transactions to export.");
                return;
            }
            const headers = ["Date", "Description", "Merchant", "Category", "Type", "Amount"];
            const csvContent = [
                headers.join(","),
                ...data.map(row => [
                    new Date(row.date).toLocaleDateString(),
                    `"${row.title || row.description || ''}"`,
                    `"${row.merchant || ''}"`,
                    `"${row.category || ''}"`,
                    row.type,
                    row.amount
                ].join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `finance_report_${filter.toLowerCase()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Export error:", err);
            alert("Export failed.");
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-10 pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
                        <p className="text-gray-500 font-medium mt-1">Here's your financial overview</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-white border border-gray-100 text-gray-900 text-sm font-bold rounded-xl px-4 py-2.5 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                            <option value="TODAY">Daily</option>
                            <option value="THIS_WEEK">Weekly</option>
                            <option value="THIS_MONTH">Monthly</option>
                            <option value="THIS_YEAR">Yearly</option>
                        </select>
                    </div>
                </div>

                {/* Budget Card */}
                <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100/50 transition-colors"></div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-widest text-gray-400">Budget Progress</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-[#1e293b]">{formatLakhs(spentAmount)} <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">of</span> {formatLakhs(budgetLimit)}</span>
                                <Pencil size={12} className="text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" />
                            </div>
                        </div>
                        <div className="text-right">
                           <span className={`text-xs font-black px-4 py-2 rounded-xl border ${budgetPct > 90 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} uppercase tracking-widest`}>
                               {budgetPct.toFixed(1)}% consumed
                           </span>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{formatLakhs(budgetLimit - spentAmount)} Remaining</p>
                        </div>
                    </div>
                    <div className="w-full h-4 bg-gray-50 rounded-full p-1 overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${budgetPct > 90 ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-[#1e40af] shadow-[0_0_20px_rgba(30,64,175,0.4)]'}`}
                            style={{ width: `${budgetPct}%` }}
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Available Balance', value: `₹${summary.availableBalance.toLocaleString('en-IN')}`, sub: 'Cash on hand', icon: Wallet, color: 'text-gray-400', bg: 'bg-gray-50/50' },
                        { label: 'Total Income', value: `₹${summary.totalIncome.toLocaleString('en-IN')}`, sub: filter.toLowerCase().replace('_', ' '), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50/30' },
                        { label: 'Total Expenses', value: `₹${summary.totalExpenses.toLocaleString('en-IN')}`, sub: filter.toLowerCase().replace('_', ' '), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50/30' },
                        { label: 'Savings Rate', value: `${summary.savingsRate || 0}%`, sub: 'Efficiency score', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50/30' }
                    ].map((card, i) => (
                        <div key={i} className={`p-8 rounded-[2rem] border border-gray-100 shadow-sm relative group hover:shadow-xl hover:shadow-gray-200/50 transition-all ${card.bg}`}>
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{card.label}</span>
                                <div className={`p-2.5 rounded-xl ${card.bg.replace('/30', '/60')} border border-white`}>
                                    <card.icon size={18} className={card.color} />
                                </div>
                            </div>
                            <h4 className="text-2xl font-black text-[#1e293b] mb-1">{card.value}</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="mb-10 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">Financial Trajectory</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Data Synthesis vs Market Baseline</p>
                            </div>
                        </div>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }} />
                                    <Tooltip 
                                      cursor={{ fill: '#f8fafc' }} 
                                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px' }} 
                                      itemStyle={{ fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    />
                                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '40px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }} iconType="circle" />
                                    <Bar dataKey="Income" fill="#1e40af" radius={[6, 6, 0, 0]} barSize={30} />
                                    <Bar dataKey="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
                        <div className="mb-10">
                            <h3 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">Category Breakdown</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Resource Distribution</p>
                        </div>
                        <div className="flex-1 min-h-[300px] relative">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie 
                                        data={pieData.length > 0 ? pieData : [{name: 'Empty', value: 1}]} 
                                        innerRadius={70} 
                                        outerRadius={100} 
                                        paddingAngle={8} 
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                        {pieData.length === 0 && <Cell fill="#f8fafc" />}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Spending Details List */}
                        <div className="mt-8 space-y-4">
                            {pieData.length > 0 ? pieData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <span className="text-xs font-black text-[#1e293b] uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-[#1e293b] tracking-wider">₹{item.value.toLocaleString('en-IN')}</span>
                                </div>
                            )) : (
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest text-center mt-10 italic">No allocation detected in this sector</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Transactions Footer Hint */}
                <div className="flex justify-center">
                    <button 
                        onClick={() => window.location.href = '/transactions'}
                        className="group flex flex-col items-center gap-2"
                    >
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em] group-hover:text-blue-500 transition-colors">Access Universal Ledger</span>
                        <div className="w-10 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="w-0 h-full bg-blue-500 group-hover:w-full transition-all duration-500"></div>
                        </div>
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;