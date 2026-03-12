import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Receipt,
    BarChart3,
    FileText,
    Settings,
    LogOut,
    PlusCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-6 px-8 py-6 rounded-2xl transition-all duration-300 group ${
                isActive
                    ? 'bg-blue-50 text-blue-600 font-black shadow-sm'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`
        }
    >
        <Icon className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110`} />
        <span className="text-lg font-bold tracking-tight">{label}</span>
    </NavLink>
);

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-100 p-6 font-['Inter']">
            {/* Logo - Matching Image 1 (Blue) */}
            <div className="flex items-center gap-3 mb-12 px-4 group cursor-pointer">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                    F
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">Finance</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-4">
                <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <SidebarLink to="/transactions" icon={ArrowLeftRight} label="Transactions" />
                <SidebarLink to="/receipts" icon={Receipt} label="Receipts" />
                <SidebarLink to="/analytics" icon={BarChart3} label="Analytics" />
                <SidebarLink to="/reports" icon={FileText} label="Reports" />
                <SidebarLink to="/settings" icon={Settings} label="Settings" />
            </nav>

            {/* Footer - Matching Image 1 */}
            <div className="mt-auto space-y-6 pt-6 border-t border-slate-50">
                <div className="px-6 py-4 bg-slate-50/50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">LOGGED IN AS</p>
                    <p className="text-sm font-black text-slate-900 truncate tracking-tight">{user?.name || 'Rohit'}</p>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-6 py-3 text-slate-400 hover:text-rose-600 transition-colors font-bold text-sm"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
