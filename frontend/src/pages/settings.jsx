import React, { useState } from 'react';
import {
    User,
    Lock,
    Bell,
    Shield,
    CreditCard,
    Smartphone,
    Plus,
    Save,
    Trash2,
    LogOut,
    Settings as SettingsIcon,
    ChevronRight,
    Loader2,
    Building,
    Globe,
    Activity,
    Zap,
    Mail,
    IndianRupee,
    AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const SettingsLink = ({ id, active, label, icon: Icon, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center justify-between px-8 py-5 rounded-[2rem] transition-all font-black uppercase tracking-widest text-[10px] ${
            active === id
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-100 scale-[1.02]'
                : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'
        }`}
    >
        <div className="flex items-center gap-4">
            <Icon size={18} className={active === id ? 'text-white' : ''} />
            <span>{label}</span>
        </div>
        {active === id && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
    </button>
);

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [budget, setBudget] = useState('50000');
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [monthlyAIReport, setMonthlyAIReport] = useState(true);

    return (
        <Layout>
            <div className="space-y-12 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none italic uppercase">System <span className="text-blue-600 italic">_Settings</span></h1>
                        <p className="text-slate-500 font-medium opacity-70">Manage your profile, budgets, and security preferences.</p>
                    </div>
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner border border-blue-100">
                        <SettingsIcon size={28} className="animate-[spin_6s_linear_infinite]" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 space-y-3">
                        <SettingsLink id="profile" active={activeTab} label="Public Profile" icon={User} onClick={setActiveTab} />
                        <SettingsLink id="budget" active={activeTab} label="Budget & Alerts" icon={IndianRupee} onClick={setActiveTab} />
                        <SettingsLink id="security" active={activeTab} label="Security" icon={Shield} onClick={setActiveTab} />
                        <SettingsLink id="billing" active={activeTab} label="Billing" icon={CreditCard} onClick={setActiveTab} />
                        <SettingsLink id="notifications" active={activeTab} label="Notifications" icon={Bell} onClick={setActiveTab} />
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-9 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-12 md:p-16">
                        {activeTab === 'profile' && (
                            <div className="space-y-16 animate-fade-in font-['Inter']">
                                <div className="flex flex-col md:flex-row md:items-center gap-12 border-b border-slate-50 pb-16">
                                    <div className="relative group">
                                        <div className="w-40 h-40 bg-slate-50 rounded-[3rem] border-2 border-slate-100 flex items-center justify-center text-blue-600 text-5xl font-black group-hover:scale-105 transition-all cursor-pointer overflow-hidden relative shadow-inner">
                                            {user?.name?.charAt(0) || 'R'}
                                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 p-4 bg-blue-600 text-white rounded-2xl shadow-2xl hover:bg-blue-700 transition-all active:scale-95 border-4 border-white">
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Profile Details_</h3>
                                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Global Account Active</p>
                                    </div>
                                </div>

                                <form className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                                <input type="text" defaultValue={user?.name || 'Rohit'} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                                <input type="email" defaultValue={user?.email || 'user@example.com'} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Personal Bio</label>
                                        <textarea rows="4" placeholder="Briefly describe your financial goals..." className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold resize-none"></textarea>
                                    </div>

                                    <div className="flex justify-end pt-10 border-t border-slate-50">
                                        <button className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group active:scale-95 border-b-4 border-blue-800">
                                            <Save size={20} className="group-hover:scale-110 transition-transform" />
                                            Save Profile Settings
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'budget' && (
                            <div className="space-y-12 animate-fade-in">
                                <div className="border-b border-slate-50 pb-10">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Budget & Alerts_</h3>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Configure threshold notifications for automated monitoring.</p>
                                </div>

                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Spending Limit (₹)</label>
                                        <div className="relative">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">₹</div>
                                            <input 
                                                type="number" 
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all text-2xl font-black" 
                                                placeholder="50,000"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium">You will receive notifications once your expenses reach 80%, 90%, and 100% of this limit.</p>
                                    </div>

                                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-white text-blue-600 rounded-2xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <Mail size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-lg tracking-tight italic uppercase">Real-time Email Alerts_</h4>
                                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1">Status: Active</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setEmailAlerts(!emailAlerts)}
                                            className={`w-16 h-9 rounded-full transition-all relative ${emailAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 w-7 h-7 bg-white rounded-full transition-all shadow-md ${emailAlerts ? 'left-8' : 'left-1'}`}></div>
                                        </button>
                                    </div>

                                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-white text-blue-600 rounded-2xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <Sparkles size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-lg tracking-tight italic uppercase">Monthly Intelligence_</h4>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Status: Auto-dispatch at month end</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight italic">Includes spending category breakdown & strategic insights_</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setMonthlyAIReport(!monthlyAIReport)}
                                            className={`w-16 h-9 rounded-full transition-all relative ${monthlyAIReport ? 'bg-blue-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 w-7 h-7 bg-white rounded-full transition-all shadow-md ${monthlyAIReport ? 'left-8' : 'left-1'}`}></div>
                                        </button>
                                    </div>

                                    <div className="flex items-start gap-6 p-10 bg-blue-50 rounded-[2.5rem] border border-blue-100 text-blue-900 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform">
                                            <AlertTriangle size={80} />
                                        </div>
                                        <AlertTriangle size={28} className="mt-1 flex-shrink-0 text-blue-600" />
                                        <div className="relative z-10">
                                            <p className="font-black text-sm uppercase tracking-widest italic">Intelligence Optimization Active</p>
                                            <p className="text-xs font-medium opacity-80 mt-2 leading-relaxed max-w-lg">Based on current trajectory, alerts for ₹{parseInt(budget).toLocaleString()} will be dispatched automatically.</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-10 border-t border-slate-50">
                                        <button className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group active:scale-95 border-b-4 border-blue-800">
                                            <Save size={20} className="group-hover:scale-110 transition-transform" />
                                            Update Configuration
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab !== 'profile' && activeTab !== 'budget' && (
                            <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 opacity-40">
                                <div className="p-10 bg-slate-50 rounded-[3rem]">
                                    <Zap size={64} className="text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Feature Coming Soon</h3>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-3">This section is currently being optimized.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
