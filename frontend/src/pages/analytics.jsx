import React, { useState, useEffect } from 'react';
import { 
    Download, 
    Bell, 
    User, 
    Sparkles,
    Loader2,
    TrendingUp,
    Wallet,
    Target,
    Zap
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import Layout from '../components/Layout';
import { analyticsAPI, aiAPI, transactionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Analytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [aiResults, setAiResults] = useState({ score: 85, insights: [], suggestions: [] });
    
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [summaryRes, transactionsRes] = await Promise.all([
                    analyticsAPI.getSummary({ preset: 'ALL_TIME' }),
                    transactionAPI.getAll({ pageSize: 50 })
                ]);
                
                const txs = transactionsRes.data.transactions || transactionsRes.data.data || [];
                setSummary(summaryRes.data.data);
                
                const insightsRes = await aiAPI.getInsights(txs);
                if (insightsRes.data) {
                    setAiResults({
                        score: insightsRes.data.score || 85,
                        insights: insightsRes.data.insights || [],
                        suggestions: insightsRes.data.suggestions || []
                    });
                }
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const healthData = [{ name: 'Score', value: aiResults.score, fill: '#10b981' }];

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center p-40 space-y-4">
                    <Loader2 className="animate-spin text-blue-600" size={48} strokeWidth={1} />
                    <p className="text-gray-400 font-bold text-sm tracking-widest uppercase animate-pulse">Analyzing Financial Data...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-10 pb-20">
                
                {/* SaaS Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1e293b]">Analytics</h1>
                        <p className="text-gray-500 mt-1">Deep insights into your spending patterns</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 bg-white border border-gray-100 text-[#1e293b] px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all">
                            <Download size={16} />
                            Download PDF
                        </button>
                        <button className="p-2.5 text-gray-400 hover:text-gray-600 border border-gray-100 rounded-xl bg-white shadow-sm">
                            <Bell size={20} />
                        </button>
                        <button className="p-2.5 text-gray-400 hover:text-gray-600 border border-gray-100 rounded-xl bg-white shadow-sm font-bold">
                            <User size={20} />
                        </button>
                    </div>
                </div>

                {/* Primary Insights Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Financial Health Score Card */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm flex flex-col items-center justify-center relative group">
                        <h3 className="text-xl font-bold text-[#1e293b] absolute top-10 left-10">Financial Health Score</h3>
                        
                        <div className="h-64 w-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart 
                                    innerRadius="80%" 
                                    outerRadius="100%" 
                                    data={healthData} 
                                    startAngle={90} 
                                    endAngle={-270}
                                >
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar background dataKey="value" cornerRadius={30} fill="#10b981" />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-6xl font-black text-[#1e293b] leading-none">{aiResults.score}</span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Points</span>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-3 bg-green-50 px-6 py-2.5 rounded-full">
                            <Zap size={16} className="text-green-600" />
                            <span className="text-sm font-bold text-green-700">Your score is 12% higher than average</span>
                        </div>
                    </div>

                    {/* AI Insights Panel */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-[#1e293b]">AI Insights & Suggestions</h3>
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <Sparkles size={20} />
                            </div>
                        </div>
                        
                        <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar">
                            {aiResults.insights.map((msg, i) => (
                                <div key={i} className="p-5 rounded-3xl border border-blue-50 bg-[#f8fafc] group hover:bg-blue-50 transition-colors">
                                    <p className="text-sm font-bold text-gray-600 leading-relaxed italic">" {msg} "</p>
                                </div>
                            ))}
                            {aiResults.suggestions.map((msg, i) => (
                                <div key={`s-${i}`} className="p-5 rounded-3xl border border-green-50 bg-green-50/20 group hover:bg-green-50/50 transition-colors">
                                    <p className="text-sm font-bold text-green-800 leading-relaxed italic">✔ {msg}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4 Analytics Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { 
                            label: 'Avg Monthly Spending', 
                            value: `₹${(summary?.totalExpenses || 0).toLocaleString()}`, 
                            sub: 'Current month total', 
                            icon: TrendingUp, 
                            color: 'text-blue-600 bg-blue-50' 
                        },
                        { 
                            label: 'Total Savings Rate', 
                            value: `${summary?.savingsRate || 0}%`, 
                            sub: 'Calculated this month', 
                            icon: Target, 
                            color: 'text-emerald-600 bg-emerald-50' 
                        },
                        { 
                            label: 'Available Balance', 
                            value: `₹${(summary?.availableBalance || 0).toLocaleString()}`, 
                            sub: 'Sync with main node', 
                            icon: Wallet, 
                            color: 'text-orange-600 bg-orange-50' 
                        },
                        { 
                            label: 'Savings Momentum', 
                            value: summary?.savingsRate > 0 ? (summary?.savingsRate > 30 ? 'High' : 'Moderate') : 'N/A', 
                            sub: 'Based on income/expense ratio', 
                            icon: Target, 
                            color: 'text-purple-600 bg-purple-50' 
                        }
                    ].map((card, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all h-52">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{card.label}</span>
                                <div className={`p-2 rounded-xl ${card.color}`}>
                                    <card.icon size={18} />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-[#1e293b]">{card.value}</h4>
                                <p className="text-xs font-bold text-gray-400 mt-1">{card.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </Layout>
    );
};

export default Analytics;
