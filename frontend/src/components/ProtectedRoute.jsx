import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Activity } from 'lucide-react';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-vh-100 bg-[#f8fafc] fade-in">
                <div className="flex flex-col items-center gap-8">
                    <div className="relative">
                        <Loader2 className="animate-spin text-[#2563eb]" size={56} />
                        <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#2563eb]/20" size={24} />
                    </div>
                    <div className="text-center space-y-3">
                        <p className="text-[11px] font-black text-[#0f172a] uppercase tracking-[0.4em] animate-pulse">Initializing_Elite_Interface</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Synchronizing Secure Nodes...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
