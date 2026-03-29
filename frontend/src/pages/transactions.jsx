import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Layout from '../components/Layout';
import { transactionAPI } from '../services/api';

const Transactions = () => {
    const navigate = useNavigate();
    const categories = ['All', 'Food', 'Income', 'Utilities', 'Transport', 'Entertainment', 'Health', 'Shopping'];
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
            setTransactions(res.data.data || res.data.transactions || []);
            if (res.data.pagination) {
                setPagination(prev => ({
                    ...prev,
                    totalPages: res.data.pagination.totalPages
                }));
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            triggerToast('error', 'Could not fetch transactions.');
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
        if (window.confirm("Delete this transaction?")) {
            try {
                await transactionAPI.delete(id);
                setTransactions(prev => prev.filter(t => t.id !== id && t._id !== id));
                triggerToast('success', 'Transaction deleted.');
            } catch (error) {
                triggerToast('error', 'Failed to delete transaction.');
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
            triggerToast('success', 'Transaction updated.');
        } catch (error) {
            triggerToast('error', 'Failed to update transaction.');
        }
    };

    const getCategoryStyles = (category) => {
        const cat = category?.toLowerCase() || '';
        if (cat === 'income') return 'bg-[#dcfce7] text-[#166534]';
        if (cat === 'food') return 'bg-[#fee2e2] text-[#991b1b]';
        if (cat === 'utilities') return 'bg-[#dbeafe] text-[#1e40af]';
        if (cat === 'transport') return 'bg-[#f3e8ff] text-[#6b21a8]';
        if (cat === 'entertainment') return 'bg-[#fef9c3] text-[#854d0e]';
        if (cat === 'health') return 'bg-[#fce7f3] text-[#9d174d]';
        return 'bg-gray-100 text-gray-600'; // default
    };

    return (
        <Layout>
            <div className="space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1e293b]">Transactions</h1>
                        <p className="text-gray-500 mt-1">Track and manage all your expenses</p>
                    </div>
                    <button 
                        onClick={() => navigate('/add-transaction')}
                        className="flex items-center gap-2 px-6 py-3 bg-[#1d4ed8] text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-all shadow-md group"
                    >
                        <Plus size={18} className="transition-transform group-hover:rotate-90" />
                        New Transaction
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="space-y-6">
                    <div className="relative max-w-2xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search transactions..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:border-blue-500 shadow-sm transition-all font-medium text-[#1e293b]"
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2.5">
                        {categories.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                                    activeFilter === filter
                                        ? 'bg-[#1d4ed8] text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50 text-gray-400">
                                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest">Description</th>
                                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest">Merchant</th>
                                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest">Category</th>
                                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <Loader2 size={32} className="animate-spin text-blue-500 mx-auto" />
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center text-gray-400">
                                            <p className="text-lg font-bold">No transactions found</p>
                                        </td>
                                    </tr>
                                ) : transactions.map((tx) => (
                                    <tr key={tx.id || tx._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6 text-sm font-bold text-gray-500 whitespace-nowrap">
                                            {new Intl.DateTimeFormat('en-IN').format(new Date(tx.date))}
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-[#1e293b]">
                                            {tx.title || tx.description || '—'}
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-gray-400">
                                            {tx.merchant || '—'}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getCategoryStyles(tx.category || (tx.type === 'INCOME' ? 'Income' : 'Other'))}`}>
                                                {tx.category || (tx.type === 'INCOME' ? 'Income' : 'Other')}
                                            </span>
                                        </td>
                                        <td className={`px-8 py-6 text-right text-base font-bold ${
                                            tx.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                            <div className="flex items-center justify-end gap-4">
                                                <span>{tx.type === 'INCOME' ? '+' : '-'}₹{Math.abs(tx.amount || 0).toLocaleString('en-IN')}</span>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditClick(tx)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(tx.id || tx._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Modal */}
                {editingId && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold text-gray-900">Edit Transaction</h3>
                                <button onClick={() => setEditingId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={editForm.title || editForm.description || ''}
                                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</label>
                                        <input 
                                            type="number" 
                                            required
                                            value={editForm.amount}
                                            onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                                            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Merchant</label>
                                        <input 
                                            type="text" 
                                            value={editForm.merchant || ''}
                                            onChange={(e) => setEditForm({...editForm, merchant: e.target.value})}
                                            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                                    Apply Changes
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {showToast && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-10 duration-500">
                        <div className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
                            showToast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                            {showToast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <span className="text-sm font-bold uppercase tracking-widest">{showToast.message}</span>
                        </div>
                    </div>
                )}

                {/* Pagination (Simplified UX) */}
                <div className="flex justify-center pt-8">
                     <div className="flex items-center gap-2">
                         {[...Array(pagination.totalPages)].map((_, i) => (
                             <button 
                                key={i}
                                onClick={() => setPagination(prev => ({ ...prev, pageNumber: i + 1 }))}
                                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                    pagination.pageNumber === i + 1
                                        ? 'bg-[#1d4ed8] text-white shadow-md'
                                        : 'bg-white text-gray-500 border border-gray-100 hover:border-blue-200'
                                }`}
                             >
                                 {i + 1}
                             </button>
                         ))}
                     </div>
                </div>
            </div>
        </Layout>
    );
};

export default Transactions;
