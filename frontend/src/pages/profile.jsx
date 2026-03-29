import React, { useState } from 'react';
import {
    User,
    Lock,
    Bell,
    Shield,
    CreditCard,
    Save,
    Settings as SettingsIcon,
    IndianRupee,
    Sparkles,
    Mail,
    Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const ProfileTab = ({ id, active, label, icon: Icon, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 text-sm font-bold ${
            active === id
                ? 'bg-[#1e40af] text-white shadow-lg shadow-blue-100'
                : 'text-gray-500 hover:bg-gray-50'
        }`}
    >
        <Icon size={20} />
        <span>{label}</span>
    </button>
);

const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [budget, setBudget] = useState('50000');
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [monthlyAIReport, setMonthlyAIReport] = useState(true);

    return (
        <Layout>
            <div className="space-y-10 pb-20">
                
                {/* SaaS Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1e293b]">Profile</h1>
                        <p className="text-gray-500 mt-1">Manage your identity, budgets, and security preferences.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2.5 text-gray-400 hover:text-gray-600 border border-gray-100 rounded-xl bg-white shadow-sm">
                            <Bell size={20} />
                        </button>
                        <button className="p-2.5 text-gray-400 hover:text-gray-600 border border-gray-100 rounded-xl bg-white shadow-sm font-bold">
                            <User size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1 space-y-3 bg-white p-4 rounded-[2.5rem] border border-gray-50 shadow-sm">
                        <ProfileTab id="profile" active={activeTab} label="Public Profile" icon={User} onClick={setActiveTab} />
                        <ProfileTab id="budget" active={activeTab} label="Budget & Alerts" icon={IndianRupee} onClick={setActiveTab} />
                        <ProfileTab id="security" active={activeTab} label="Security" icon={Shield} onClick={setActiveTab} />
                        <ProfileTab id="billing" active={activeTab} label="Billing" icon={CreditCard} onClick={setActiveTab} />
                        <ProfileTab id="notifications" active={activeTab} label="Notifications" icon={Bell} onClick={setActiveTab} />
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 space-y-10 animate-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-bold text-[#1e293b]">Profile Details</h3>
                                    <p className="text-sm text-gray-400 mt-1">Information displayed on your financial reports.</p>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="relative group">
                                        <div className="w-28 h-28 bg-[#f8fafc] text-[#1e40af] rounded-[2rem] flex items-center justify-center text-4xl font-black border-4 border-white shadow-xl shadow-blue-50">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 p-2.5 bg-white rounded-xl shadow-lg border border-gray-50 text-gray-400 hover:text-blue-600 transition-colors">
                                            <Camera size={18} />
                                        </button>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[#1e293b]">{user?.name || 'Rohit'}</h4>
                                        <p className="text-sm text-gray-400 font-medium">{user?.email || 'user@example.com'}</p>
                                    </div>
                                </div>

                                <form className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Full Name</label>
                                            <input 
                                                type="text" 
                                                defaultValue={user?.name || 'Rohit'} 
                                                className="w-full px-6 py-4 bg-[#f8fafc] border border-gray-50 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-[#1e293b] shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Email Address</label>
                                            <input 
                                                type="email" 
                                                defaultValue={user?.email || 'user@example.com'} 
                                                className="w-full px-6 py-4 bg-[#f8fafc] border border-gray-50 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-[#1e293b] shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Personal Bio</label>
                                        <textarea 
                                            rows="4" 
                                            placeholder="Briefly describe your financial goals..." 
                                            className="w-full px-6 py-5 bg-[#f8fafc] border border-gray-50 rounded-[2rem] outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-[#1e293b] shadow-sm resize-none"
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-gray-50">
                                        <button type="button" className="flex items-center gap-2 px-8 py-4 bg-[#1e40af] text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all">
                                            <Save size={18} />
                                            Update Profile
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'budget' && (
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 space-y-10 animate-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-bold text-[#1e293b]">Budget & Alerts</h3>
                                    <p className="text-sm text-gray-400 mt-1">Configure threshold notifications for automated monitoring.</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Monthly Spending Limit (₹)</label>
                                        <div className="relative max-w-md group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1e40af] font-black text-lg">₹</div>
                                            <input 
                                                type="number" 
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                className="w-full pl-12 pr-6 py-5 bg-[#f8fafc] border border-gray-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-black text-2xl text-[#1e293b] shadow-sm"
                                                placeholder="50000"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 font-bold ml-2 italic underline decoration-blue-200">System will alert at 80% and 100% threshold.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div onClick={() => setEmailAlerts(!emailAlerts)} className={`p-8 rounded-[2rem] border transition-all cursor-pointer ${emailAlerts ? 'bg-blue-50 border-blue-100' : 'bg-[#f8fafc] border-gray-50'}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 rounded-xl ${emailAlerts ? 'bg-white text-blue-600 shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                                                    <Mail size={24} />
                                                </div>
                                                <div className={`w-12 h-6 rounded-full relative transition-colors ${emailAlerts ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${emailAlerts ? 'left-7' : 'left-1'}`}></div>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-[#1e293b] text-base">Real-time Inbox Alerts</h4>
                                            <p className="text-xs text-gray-400 font-bold mt-1">Receive warnings instantly.</p>
                                        </div>

                                        <div onClick={() => setMonthlyAIReport(!monthlyAIReport)} className={`p-8 rounded-[2rem] border transition-all cursor-pointer ${monthlyAIReport ? 'bg-emerald-50 border-emerald-100' : 'bg-[#f8fafc] border-gray-50'}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 rounded-xl ${monthlyAIReport ? 'bg-white text-emerald-600 shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                                                    <Sparkles size={24} />
                                                </div>
                                                <div className={`w-12 h-6 rounded-full relative transition-colors ${monthlyAIReport ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${monthlyAIReport ? 'left-7' : 'left-1'}`}></div>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-[#1e293b] text-base">Monthly AI Intelligence</h4>
                                            <p className="text-xs text-gray-400 font-bold mt-1">Auto-dispatch monthly insights.</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-gray-50">
                                        <button type="button" className="flex items-center gap-2 px-8 py-4 bg-[#1e293b] text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-black transition-all">
                                            <Save size={18} />
                                            Update Configuration
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(activeTab === 'security' || activeTab === 'billing' || activeTab === 'notifications') && (
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-20 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mb-8 border border-gray-50">
                                    <SettingsIcon size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-[#1e293b]">System Update Pending</h3>
                                <p className="text-sm text-gray-400 font-bold mt-2 max-w-xs">This configuration module is scheduled for the next deployment phase.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
