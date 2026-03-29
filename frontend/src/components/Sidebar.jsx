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
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 text-sm font-bold ${
                isActive
                    ? 'bg-[#E7F7F0] text-[#10B981]'
                    : 'text-gray-500 hover:bg-gray-50'
            }`
        }
    >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span>{label}</span>
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
        <div className="flex flex-col h-full bg-white border-r border-gray-100 font-sans w-full">
            {/* Logo Section */}
            <div className="flex items-center gap-3 p-8">
                <div className="w-10 h-10 bg-[#1e40af] rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                    F
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">Finance</span>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 space-y-1">
                <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <SidebarLink to="/transactions" icon={ArrowLeftRight} label="Transactions" />
                <SidebarLink to="/receipts" icon={Receipt} label="Receipts" />
                <SidebarLink to="/analytics" icon={BarChart3} label="Analytics" />
                <SidebarLink to="/profile" icon={User} label="Profile" />
            </nav>

            {/* Profile Section */}
            <div className="p-6 border-t border-gray-50">
                <div className="bg-gray-50 rounded-2xl p-5 mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Logged in as</p>
                    <p className="text-sm font-black text-gray-900 truncate">
                        {user?.name || 'Rohit'}
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 w-full px-5 py-3 text-gray-500 hover:text-red-600 transition-colors text-sm font-bold rounded-xl hover:bg-red-50"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0 rotate-180" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
