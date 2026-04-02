import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Filter,
  Download,
  FileText,
  Table as TableIcon,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import Layout from '../components/Layout';
import { transactionAPI } from '../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Transactions = () => {
    const navigate = useNavigate();
    const categories = ['All', 'Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
    
    // Core States
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [pagination, setPagination] = useState({ pageNumber: 1, totalPages: 1, totalCount: 0 });
    const [showFilters, setShowFilters] = useState(false);

    // Filter States
    const [filters, setFilters] = useState({
        keyword: '',
        category: 'All',
        type: 'All',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        sort: 'latest'
    });

    const triggerToast = (type, message) => {
        setShowToast({ type, message });
        setTimeout(() => setShowToast(null), 3000);
    };

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                pageNumber: pagination.pageNumber,
                keyword: filters.keyword || undefined,
                category: filters.category === 'All' ? undefined : filters.category,
                type: filters.type === 'All' ? undefined : filters.type,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
                minAmount: filters.minAmount || undefined,
                maxAmount: filters.maxAmount || undefined,
                sort: filters.sort
            };
            const res = await transactionAPI.getAll(params);
            const data = res.data.data || res.data;
            setTransactions(data.transactions || []);
            if (data.pagination) {
                setPagination(prev => ({
                    ...prev,
                    totalPages: data.pagination.totalPages,
                    totalCount: data.pagination.totalCount
                }));
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            triggerToast('error', 'Could not fetch transactions.');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.pageNumber]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTransactions();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchTransactions]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            keyword: '',
            category: 'All',
            type: 'All',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: '',
            sort: 'latest'
        });
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
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

    // Export Functions
    const exportToExcel = () => {
        try {
            const dataToExport = transactions.map(tx => ({
                Date: new Date(tx.date).toLocaleDateString('en-IN'),
                Title: tx.title || tx.description || '—',
                Category: tx.category || 'Other',
                Type: tx.type,
                Amount: tx.amount,
                Merchant: tx.merchant || '—',
                Note: tx.description || '—'
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
            XLSX.writeFile(workbook, `Transactions_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            triggerToast('success', 'Excel report downloaded.');
        } catch (error) {
            triggerToast('error', 'Excel export failed.');
        }
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text("Expense Report", 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
            
            const tableColumn = ["Date", "Description", "Category", "Type", "Amount"];
            const tableRows = transactions.map(tx => [
                new Date(tx.date).toLocaleDateString('en-IN'),
                tx.title || tx.description || '—',
                tx.category || 'Other',
                tx.type,
                `INR ${tx.amount.toLocaleString('en-IN')}`
            ]);

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 40,
                theme: 'grid',
                headStyles: { fillStyle: '#1d4ed8', textColor: '#ffffff' }
            });

            const total = transactions.reduce((acc, curr) => 
                curr.type === 'INCOME' ? acc + curr.amount : acc - curr.amount, 0);
            
            doc.text(`Net Balance: INR ${total.toLocaleString('en-IN')}`, 14, doc.lastAutoTable.finalY + 10);

            doc.save(`Transactions_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            triggerToast('success', 'PDF report downloaded.');
        } catch (error) {
            console.error(error);
            triggerToast('error', 'PDF export failed.');
        }
    };

    const getCategoryStyles = (category) => {
        const cat = category?.toLowerCase() || '';
        if (cat === 'income') return 'bg-[#dcfce7] text-[#166534]';
        if (cat === 'food') return 'bg-[#fee2e2] text-[#991b1b]';
        if (cat === 'bills' || cat === 'utilities') return 'bg-[#dbeafe] text-[#1e40af]';
        if (cat === 'travel' || cat === 'transport') return 'bg-[#f3e8ff] text-[#6b21a8]';
        if (cat === 'entertainment') return 'bg-[#fef9c3] text-[#854d0e]';
        if (cat === 'health') return 'bg-[#fce7f3] text-[#9d174d]';
        if (cat === 'shopping') return 'bg-[#fef3c7] text-[#92400e]';
        if (cat === 'education') return 'bg-[#e0f2fe] text-[#075985]';
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
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={() => navigate('/add-transaction')}
                            className="flex items-center gap-2 px-6 py-3 bg-[#1d4ed8] text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-all shadow-md group"
                        >
                            <Plus size={18} className="transition-transform group-hover:rotate-90" />
                            New Transaction
                        </button>
                    </div>
                </div>

                {/* Advanced Filter Bar */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 w-full lg:max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
                            <input 
                                type="text" 
                                name="keyword"
                                placeholder="Search by title, category, merchant..."
                                value={filters.keyword}
                                onChange={handleFilterChange}
                                className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-[#1e293b]"
                            />
                        </div>
                        
                        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                           <button 
                              onClick={() => setShowFilters(!showFilters)}
                              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border ${
                                 showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                              }`}
                           >
                              <Filter size={16} />
                              Filters
                              <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                           </button>
                           
                           <div className="h-10 w-[1px] bg-gray-100 mx-2 hidden lg:block" />

                           <button 
                              onClick={exportToExcel}
                              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 text-emerald-600 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-all"
                           >
                              <TableIcon size={16} />
                              Excel
                           </button>
                           <button 
                              onClick={exportToPDF}
                              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all"
                           >
                              <FileText size={16} />
                              PDF
                           </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-50 animate-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                                <select 
                                    name="category" 
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction Type</label>
                                <select 
                                    name="type" 
                                    value={filters.type}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all"
                                >
                                    <option value="All">All Types</option>
                                    <option value="EXPENSE">Expense</option>
                                    <option value="INCOME">Income</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sort By</label>
                                <select 
                                    name="sort" 
                                    value={filters.sort}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all"
                                >
                                    <option value="latest">Latest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="highest">Highest Amount</option>
                                    <option value="lowest">Lowest Amount</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex justify-between">
                                    Date Range
                                    {(filters.startDate || filters.endDate) && <button onClick={() => setFilters(p => ({...p, startDate:'', endDate:''}))} className="text-blue-500 capitalize hover:underline">Clear</button>}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-3 py-3 bg-gray-50 border-transparent rounded-xl font-bold text-xs outline-none focus:bg-white focus:border-blue-500" />
                                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-3 py-3 bg-gray-50 border-transparent rounded-xl font-bold text-xs outline-none focus:bg-white focus:border-blue-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex justify-between">
                                    Amount Range (₹)
                                    {(filters.minAmount || filters.maxAmount) && <button onClick={() => setFilters(p => ({...p, minAmount:'', maxAmount:''}))} className="text-blue-500 capitalize hover:underline">Clear</button>}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" name="minAmount" placeholder="Min" value={filters.minAmount} onChange={handleFilterChange} className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500" />
                                    <input type="number" name="maxAmount" placeholder="Max" value={filters.maxAmount} onChange={handleFilterChange} className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500" />
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex justify-end gap-3 pt-2">
                                <button 
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all border border-transparent"
                                >
                                    <RotateCcw size={14} />
                                    Reset All
                                </button>
                            </div>
                        </div>
                    )}
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
                                            <div className="max-w-xs mx-auto space-y-3">
                                                 <Filter size={48} className="mx-auto text-gray-100 mb-4" />
                                                 <p className="text-lg font-bold text-gray-900">No results found</p>
                                                 <p className="text-sm font-medium">Try adjusting your filters or search keywords to find what you're looking for.</p>
                                                 <button onClick={clearFilters} className="text-blue-500 font-bold hover:underline">Clear all filters</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.map((tx) => (
                                    <tr key={tx.id || tx._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6 text-sm font-bold text-gray-500 whitespace-nowrap">
                                            {tx.date ? new Intl.DateTimeFormat('en-IN').format(new Date(tx.date)) : '—'}
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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
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
                )}
            </div>
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </Layout>
    );
};

export default Transactions;
