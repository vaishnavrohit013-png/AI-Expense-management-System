import React, { useState, useEffect } from 'react';
import {
    Activity,
    TrendingDown,
    Zap,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    PieChartIcon,
    AlertCircle,
    CheckCircle2,
    Lightbulb
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import Layout from '../components/Layout';
import { transactionAPI, aiAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsCard = ({ title, value, percentage, isPositive, icon: Icon }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Icon size={20} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {percentage}%
            </div>
        </div>
        <div className="space-y-1">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h4>
            <div className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                <span className="text-slate-300">{typeof value === 'number' ? '₹' : ''}</span>{value}
            </div>
        </div>
    </div>
);

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [aiInsights, setAiInsights] = useState({ score: 0, suggestions: [], insights: [] });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await transactionAPI.getAll({ limit: 100 });
            const txns = res.data.transactions || [];
            setTransactions(txns);
            
            if (txns.length > 0) {
                const aiRes = await aiAPI.getInsights(txns);
                if (aiRes.data && aiRes.data.score) {
                    setAiInsights(aiRes.data);
                } else if (aiRes.data && aiRes.data.insights) {
                    setAiInsights({ score: 72, suggestions: ["✔ Reduce shopping", "✔ Increase savings"], insights: aiRes.data.insights }); // fallback
                }
            } else {
                setAiInsights({ score: 100, suggestions: ["✔ Start adding transactions"], insights: ["No data to analyze yet"] });
            }
        } catch (error) {
            console.error("Failed to load analytics data", error);
            setAiInsights({ score: "--", suggestions: ["Could not load"], insights: [] });
        } finally {
            setLoading(false);
        }
    };

    const monthlyTrendData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Income',
                data: [40000, 30000, 20000, 27800, 18900, 23900, 34900],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Expenses',
                data: [24000, 13980, 98000, 39080, 48000, 38000, 43000],
                borderColor: '#e2e8f0',
                borderDash: [5, 5],
                backgroundColor: 'transparent',
                tension: 0.4
            }
        ]
    };

    const categoryData = {
        labels: ['Food', 'Shopping', 'Transport', 'Utilities', 'Others'],
        datasets: [
            {
                label: 'Category Breakdown',
                data: [4500, 3000, 2000, 1500, 1000],
                backgroundColor: '#2563eb',
                borderRadius: 4
            }
        ]
    };

    const pieData = {
        labels: ['Income', 'Expenses', 'Savings'],
        datasets: [{
            data: [150000, 85000, 65000],
            backgroundColor: ['#2563eb', '#ef4444', '#10b981'],
            borderWidth: 0
        }]
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8 pb-10 font-['Inter']">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Analytics <span className="text-blue-600 italic">_Hub</span></h1>
                        <p className="text-slate-500 font-medium opacity-70">In-depth synthesis of your financial trajectories_</p>
                    </div>
                </div>

                {/* AI Financial Health Score & Insights */}
                <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Activity size={200} />
                    </div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div>
                            <h3 className="text-xl font-bold uppercase tracking-widest text-blue-300 mb-2">AI Financial Health Score</h3>
                            <div className="flex items-end gap-2 mb-6">
                                <span className="text-7xl font-black italic">{aiInsights.score}</span>
                                <span className="text-xl font-bold text-blue-400 mb-2">/ 100</span>
                            </div>

                            <div className="space-y-3">
                                {aiInsights.suggestions?.map((sug, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/5 backdrop-blur-sm w-max">
                                        <CheckCircle2 className="text-green-400" size={18} />
                                        <span className="font-bold text-sm">{sug}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold uppercase tracking-widest text-blue-300 mb-4 flex items-center gap-2">
                                <Lightbulb size={20} /> AI Spending Insights
                            </h3>
                            {aiInsights.insights?.map((insight, i) => (
                                <div key={i} className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                                    <p className="font-medium text-sm leading-relaxed">{insight}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnalyticsCard title="Net Savings" value="4,25,000" percentage="12" isPositive={true} icon={Activity} />
                    <AnalyticsCard title="Burn velocity" value="14,250/day" percentage="3" isPositive={false} icon={TrendingDown} />
                    <AnalyticsCard title="Passive Flow" value="85,000" percentage="8" isPositive={true} icon={Zap} />
                    <AnalyticsCard title="Audit Health" value="STRONG" percentage="100" isPositive={true} icon={Activity} />
                </div>

                {/* Main Visualization (Chart.js) */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm group">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 uppercase italic tracking-tighter">Market Momentum_</h3>
                            <p className="text-[10px] text-slate-400 font-black tracking-[0.3em] uppercase mt-2">Monthly trend</p>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <Line 
                            data={monthlyTrendData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: { x: { grid: { display: false } }, y: { grid: { borderDash: [5, 5] } } },
                                plugins: { legend: { position: 'bottom' } }
                            }}
                        />
                    </div>
                </div>

                {/* Bottom Charts (Chart.js) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm group">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase italic tracking-tighter">Category Breakdown_</h3>
                        <div className="h-[300px]">
                            <Bar 
                                data={categoryData}
                                options={{
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: { x: { grid: { display: false } }, y: { grid: { display: false } } },
                                    plugins: { legend: { display: false } }
                                }}
                            />
                        </div>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm flex flex-col items-center justify-center group">
                        <h3 className="text-xl font-bold text-slate-900 uppercase italic tracking-tighter mb-6 self-start">Asset Allocation_</h3>
                        <div className="w-64 h-64">
                             <Pie 
                                data={pieData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' } }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Analytics;
