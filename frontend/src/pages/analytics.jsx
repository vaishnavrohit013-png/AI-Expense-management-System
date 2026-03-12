import React, { useState, useEffect } from 'react';
import {
    LayoutGrid,
    TrendingUp,
    TrendingDown,
    Zap,
    Download,
    Filter,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Activity,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    IndianRupee
} from 'lucide-react';
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import Layout from '../components/Layout';

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
                <span className="text-slate-300">₹</span>{value}
            </div>
        </div>
    </div>
);

const Analytics = () => {
    const data = [
        { name: 'Mon', income: 40000, expenses: 24000 },
        { name: 'Tue', income: 30000, expenses: 13980 },
        { name: 'Wed', income: 20000, expenses: 98000 },
        { name: 'Thu', income: 27800, expenses: 39080 },
        { name: 'Fri', income: 18900, expenses: 48000 },
        { name: 'Sat', income: 23900, expenses: 38000 },
        { name: 'Sun', income: 34900, expenses: 43000 },
    ];

    return (
        <Layout>
            <div className="space-y-8 pb-10 font-['Inter']">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Analytics <span className="text-blue-600 italic">_Hub</span></h1>
                        <p className="text-slate-500 font-medium opacity-70">In-depth synthesis of your financial trajectories_</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                            <Calendar size={18} />
                            Last 30 Days
                        </button>
                        <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 border-b-4 border-blue-800">
                            <Download size={18} />
                            Export Hub_
                        </button>
                    </div>
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnalyticsCard title="Net Savings" value="4,25,000" percentage="12" isPositive={true} icon={Activity} />
                    <AnalyticsCard title="Burn velocity" value="14,250/day" percentage="3" isPositive={false} icon={TrendingDown} />
                    <AnalyticsCard title="Passive Flow" value="85,000" percentage="8" isPositive={true} icon={Zap} />
                    <AnalyticsCard title="Audit Health" value="STRONG" percentage="100" isPositive={true} icon={Activity} />
                </div>

                {/* Main Visualization */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm group">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 uppercase italic tracking-tighter">Market Momentum_</h3>
                            <p className="text-[10px] text-slate-400 font-black tracking-[0.3em] uppercase mt-2">Daily synchronization matrix</p>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)'}} 
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
                                />
                                <Area type="monotone" dataKey="income" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expenses" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bottom Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm group">
                        <h3 className="text-xl font-bold text-slate-900 mb-10 uppercase italic tracking-tighter">Category Flow_</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.slice(0, 5)} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                    <Bar dataKey="expenses" fill="#2563eb" radius={[0, 10, 10, 0]} barSize={25} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm flex flex-col items-center justify-center space-y-8 group">
                        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                             <PieChartIcon size={40} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-900 uppercase italic tracking-tighter">Asset Allocation_</h3>
                            <p className="text-[10px] text-slate-400 font-black tracking-[0.5em] uppercase mt-2">Neural profile active</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Analytics;
