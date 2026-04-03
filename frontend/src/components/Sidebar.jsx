import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Receipt,
    BarChart3,
    FileText,
    Settings,
    User,
    LogOut,
    MessageSquare,
    Target,
    CalendarDays
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI, transactionAPI } from '../services/api';
import { Zap, ShieldCheck } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-[14px] font-medium ${
                isActive
                    ? 'bg-gray-100 text-[#2563eb]'
                    : 'text-gray-600 hover:bg-gray-50'
            }`
        }
    >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
        <span>{label}</span>
    </NavLink>
);

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [aiResults, setAiResults] = React.useState({ score: 0, insight: '', loading: true });

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/');
        }
    };

    React.useEffect(() => {
        const fetchHealthScore = async () => {
            try {
                const res = await transactionAPI.getAll({ pageSize: 15 });
                const txs = res.data.transactions || res.data.data || [];
                if (txs.length > 0) {
                    const insightsRes = await aiAPI.getInsights(txs);
                    setAiResults({
                        score: insightsRes.data.score || 0,
                        insight: insightsRes.data.insights?.[0] || insightsRes.data.suggestions?.[0] || 'Analyzing...',
                        loading: false
                    });
                }
            } catch (err) {
                setAiResults(prev => ({ ...prev, loading: false }));
            }
        };
        fetchHealthScore();
    }, []);

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-100 font-sans w-full">
            {/* Logo Section - Bardly Style */}
            <div className="flex items-center px-6 pt-10 pb-6 mb-4">
                <span className="text-2xl font-black text-gray-900 tracking-tight" style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.03em' }}>Spendly</span>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-3 space-y-1">
                <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <SidebarLink to="/transactions" icon={ArrowLeftRight} label="Expenses" />
                <SidebarLink to="/receipts" icon={Receipt} label="Scan Receipts" />
                <SidebarLink to="/profile" icon={User} label="My Account" />
                <SidebarLink to="/calendar" icon={CalendarDays} label="Calendar" />
                <SidebarLink to="/chat" icon={MessageSquare} label="AI Assistant" />
                
                {/* Simplified Health Indicator */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col gap-1">
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-gray-600 transition-all duration-200 text-[14px] font-medium group">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-[18px] h-[18px] text-emerald-500" />
                            <span>Health Score</span>
                        </div>
                        <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                            aiResults.score > 70 ? 'bg-emerald-50 text-emerald-600' : (aiResults.score > 40 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600')
                        }`}>
                            {aiResults.loading ? '—' : aiResults.score}
                        </span>
                    </div>
                </div>
            </nav>

            {/* Profile Section */}
            <div className="p-4 border-t border-gray-50">
                <div className="bg-gray-50 rounded-xl p-4 mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Logged in as</p>
                    <p className="text-[13px] font-bold text-gray-900 truncate">
                        {user?.name || 'Rohit'}
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-500 hover:text-red-500 transition-colors text-[13px] font-medium rounded-xl hover:bg-red-50"
                >
                    <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
