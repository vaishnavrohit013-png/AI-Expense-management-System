import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Loader2,
  Activity
} from 'lucide-react';
import Layout from '../components/Layout';
import { transactionAPI } from '../services/api';

const Transactions = () => {
    const navigate = useNavigate();
    const categories = ['All', 'Food', 'Shopping', 'Transport', 'Entertainment', 'Utilities', 'Health', 'Other'];
    const [activeFilter, setActiveFilter] = useState('All');
    const [keyword, setKeyword] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [pagination, setPagination] = useState({ pageNumber: 1, totalPages: 1 });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = {
                pageNumber: pagination.pageNumber,
                keyword: keyword || undefined,
                category: activeFilter === 'All' ? undefined : activeFilter
            };
            const res = await transactionAPI.getAll(params);
            setTransactions(res.data.transactions || []);
            setPagination(prev => ({
                ...prev,
                totalPages: res.data.pagination.totalPages
            }));
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            triggerToast('error', 'Critical link failure: Could not retrieve vault records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTransactions();
        }, 300);
        return () => clearTimeout(timer);
    }, [activeFilter, keyword, pagination.pageNumber]);

    const triggerToast = (type, message) => {
        setShowToast({ type, message });
        setTimeout(() => setShowToast(null), 3000);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Authorize permanent deletion of this record?")) {
            try {
                await transactionAPI.delete(id);
                setTransactions(prev => prev.filter(t => t.id !== id));
                triggerToast('success', 'Record purged successfully.');
            } catch (error) {
                triggerToast('error', 'Operation failed: Encryption lock active.');
            }
        }
    };

    const handleEditClick = (tx) => {
        setEditingId(tx.id || tx._id);
        setEditForm({ ...tx });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await transactionAPI.update(editingId, {
                ...editForm,
                amount: parseFloat(editForm.amount)
            });
            setEditingId(null);
            fetchTransactions();
            triggerToast('success', 'Core record updated successfully.');
        } catch (error) {
            triggerToast('error', 'Update refused: Structural integrity violation.');
        }
    };

    return (
        <Layout>
            <div className="space-y-12 pb-20 relative">
                {/* Custom Toast */}
                {showToast && (
                    <div className="fixed top-12 right-12 z-50 animate-slide-in">
                        <div className={`${
                            showToast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                        } text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4`}>
                            {showToast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            <div>
                                <p className="font-bold text-sm uppercase tracking-wider">Status Update</p>
                                <p className="text-xs opacity-80 font-medium">{showToast.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingId && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                        <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl border border-slate-100 animate-scale-in">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Edit Transaction</h3>
                                    <p className="text-sm text-slate-400 font-medium mt-1">Update details for this entry.</p>
                                </div>
                                <button onClick={() => setEditingId(null)} className="p-3 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Title</label>
                                    <input 
                                        type="text" 
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Amount (₹)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={editForm.amount}
                                            onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all font-bold" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Category</label>
                                        <select 
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold appearance-none cursor-pointer"
                                        >
                                            {categories.slice(1).map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 mt-4 active:scale-95 border-b-4 border-blue-800">
                                    Update Transaction Entry
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Transactions <span className="text-blue-600 italic">_Hub</span></h1>
                        <p className="text-slate-500 font-medium opacity-70">Monitor every rupee spent and earned.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/add-transaction')}
                        className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 uppercase tracking-widest group"
                    >
                        <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
                        New Entry
                    </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Query vault index..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm text-slate-900 shadow-sm"
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-3 w-full lg:w-auto overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-[0.2em] ${
                                    activeFilter === filter
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105'
                                        : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Echoes_</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{transactions.length} records in current horizon</p>
                        </div>
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${loading ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                             <div className={`w-2 h-2 rounded-full ${loading ? 'bg-blue-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`}></div>
                             <span className={`text-[10px] font-black uppercase tracking-widest ${loading ? 'text-blue-600' : 'text-emerald-600'}`}>
                                {loading ? 'Syncing...' : 'Vault Locked'}
                             </span>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Merchant</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amount</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
                                                    <Activity size={40} />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">No data flow detected in this sector_</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.map((tx) => (
                                    <tr key={tx.id || tx._id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-10 py-8 text-sm text-slate-400 font-bold">
                                            {new Date(tx.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-base font-black text-slate-900 mb-1">{tx.title}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1">{tx.description || 'No system log recorded'}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                tx.type === 'INCOME' ? 'bg-sky-50 text-sky-600' :
                                                'bg-slate-50 text-slate-500'
                                            }`}>
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className={`px-10 py-8 text-lg font-black text-right ${
                                            tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-900'
                                        }`}>
                                            {tx.type === 'INCOME' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button 
                                                    onClick={() => handleEditClick(tx)}
                                                    className="p-3 bg-blue-50 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group/btn"
                                                >
                                                    <Edit2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(tx.id || tx._id)}
                                                    className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm group/btn"
                                                >
                                                    <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Transactions;
