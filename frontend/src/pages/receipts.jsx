import React, { useState, useRef, useEffect } from 'react';
import { transactionAPI, aiAPI } from '../services/api'; // use aiAPI for scanReceipt
import {
  Camera,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Search,
  ExternalLink,
  Plus,
  Bell,
  User,
  Zap,
  FileSearch,
  Edit3,
  Save,
  X,
  Calendar,
  IndianRupee,
  AtSign,
  Tag
} from 'lucide-react';
import Layout from '../components/Layout';

/**
 * Receipts Component
 * 
 * This page allows users to scan physical receipts using AI and manage
 * their digitized transaction records.
 */
const Receipts = () => {
  // --- STATE MANAGEMENT ---
  // Tracks if a file is currently being uploaded or processed by AI
  const [isUploading, setIsUploading] = useState(false);
  // Controls the custom toast notification at the top
  const [showToast, setShowToast] = useState(null);
  // Reference for the hidden file input field
  const fileInputRef = useRef(null);
  // Stores the search keyword for filtering receipts
  const [keyword, setKeyword] = useState('');

  // Stores the list of all transactions that have receipts
  const [receipts, setReceipts] = useState([]);
  // Loading state for the main data fetch
  const [loading, setLoading] = useState(true);

  // States for the AI Scan Confirmation Modal
  const [scanResult, setScanResult] = useState(null); // The raw result from API
  const [previewData, setPreviewData] = useState(null); // The data user can edit in modal

  // --- EFFECTS ---
  // Runs once when the component is first mounted to the screen
  useEffect(() => {
    fetchReceipts();
  }, []);

  // --- ACTION HANDLERS ---

  /**
   * Fetches all receipts (transactions with receipt URLs) from the backend.
   */
  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await transactionAPI.getAll({ limit: 50 });
      const transactions = res.data.data || res.data.transactions || [];
      const receiptTransactions = transactions.filter(t => t.receiptUrl || t.description?.toLowerCase().includes('auto-entered'));
      setReceipts(receiptTransactions.map(t => ({
        id: t._id || t.id,
        title: t.title || t.description || 'Unknown',
        category: t.category || 'Other',
        amount: t.amount,
        date: new Intl.DateTimeFormat('en-IN').format(new Date(t.date)),
        status: 'Processed',
        receiptUrl: t.receiptUrl
      })));
    } catch (error) {
       console.error("Failed to load receipts", error);
    } finally {
       setLoading(false);
    }
  };

  const triggerToast = (type, message) => {
    setShowToast({ type, message });
    setTimeout(() => setShowToast(null), 4000);
  };

  /**
   * Handles the 'Scan Receipt' button click by triggering the hidden file input.
   */
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  /**
   * Handles the actual file selection and sends it to the AI Scan API.
   */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('receipt', file);

      try {
        const scanRes = await aiAPI.scanReceipt(formData);
        if (scanRes.data.data) {
          setScanResult(scanRes.data.data);
          setPreviewData(scanRes.data.data);
          triggerToast('success', 'AI has successfully processed your receipt. Please confirm the details.');
        } else {
           triggerToast('error', 'AI could not extract data from this receipt.');
        }
      } catch (err) {
        console.error(err);
        triggerToast('error', 'Protocol failure during AI receipt scanning.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmSave = async () => {
    if (!previewData) return;
    
    setIsUploading(true);
    try {
        const { amount, category, date, title, receiptUrl, merchant } = previewData;
        
        await transactionAPI.create({
            title: title || merchant || 'Scanned Receipt',
            amount: parseFloat(amount) || 0,
            category: category || 'Other',
            merchant: merchant || '',
            date: date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: `Auto-entered from ${merchant || 'receipt'} scan`,
            type: 'EXPENSE',
            paymentMethod: 'CASH',
            receiptUrl: receiptUrl
        });

        triggerToast('success', 'Transaction saved successfully!');
        setScanResult(null);
        setPreviewData(null);
        fetchReceipts();
    } catch (err) {
        console.error(err);
        triggerToast('error', 'Failed to save the transaction.');
    } finally {
        setIsUploading(false);
    }
  };

  /**
   * Deletes a receipt record from the system.
   */
  const handleDelete = async (id) => {
      if (window.confirm("Are you sure you want to delete this receipt record permanently?")) {
          try {
             await transactionAPI.delete(id);
             setReceipts(receipts.filter(r => r.id !== id));
             triggerToast('info', 'Record deleted successfully.');
          } catch(err) {
             triggerToast('error', 'Failed to delete record.');
          }
      }
  };

  const getCategoryColor = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat === 'food') return 'bg-orange-50 text-orange-600';
    if (cat === 'utilities') return 'bg-blue-50 text-blue-600';
    if (cat === 'transport') return 'bg-purple-50 text-purple-600';
    return 'bg-emerald-50 text-emerald-600';
  };

  const filteredReceipts = receipts.filter(r => 
      r.title.toLowerCase().includes(keyword.toLowerCase()) || 
      r.category.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-10 pb-20 relative">
        {/* Premium Toast */}
        {showToast && (
            <div className="fixed top-12 right-12 z-[100] animate-in slide-in-from-top-10 duration-500">
                <div className={`${
                    showToast.type === 'success' ? 'bg-[#1e40af]' : 
                    showToast.type === 'info' ? 'bg-[#1e293b]' : 'bg-red-600'
                } text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 min-w-[320px] border border-white/10`}>
                    <div className="p-2 bg-white/20 rounded-xl">
                        {showToast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest opacity-60">{showToast.type}</p>
                        <p className="font-bold text-sm mt-0.5">{showToast.message}</p>
                    </div>
                </div>
            </div>
        )}

        {/* OCR Preview Modal */}
        {scanResult && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-[#0f172a]/60 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                    {/* Image Preview */}
                    <div className="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center border-r border-gray-100 overflow-hidden">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img 
                                src={scanResult.receiptUrl} 
                                alt="Receipt Preview" 
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-lg ring-1 ring-black/5"
                            />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                Document Preview
                            </div>
                        </div>
                    </div>

                    {/* Data Form */}
                    <div className="w-full md:w-1/2 p-10 flex flex-col overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[#1e293b] tracking-tight">AI Extraction</h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Verify & Refine Data</p>
                            </div>
                            <button 
                                onClick={() => setScanResult(null)}
                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <AtSign size={12} /> Merchant / Title
                                </label>
                                <input 
                                    type="text"
                                    value={previewData.title || ''}
                                    onChange={(e) => setPreviewData({...previewData, title: e.target.value})}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <IndianRupee size={12} /> Total Amount
                                    </label>
                                    <input 
                                        type="number"
                                        value={previewData.amount || 0}
                                        onChange={(e) => setPreviewData({...previewData, amount: e.target.value})}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Calendar size={12} /> Trans. Date
                                    </label>
                                    <input 
                                        type="date"
                                        value={previewData.date || ''}
                                        onChange={(e) => setPreviewData({...previewData, date: e.target.value})}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Tag size={12} /> Category Classification
                                </label>
                                <select 
                                    value={previewData.category?.toUpperCase() || 'OTHER'}
                                    onChange={(e) => setPreviewData({...previewData, category: e.target.value})}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-[#1e293b] focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-sm appearance-none"
                                >
                                    <option value="FOOD">FOOD</option>
                                    <option value="TRANSPORT">TRANSPORT</option>
                                    <option value="SHOPPING">SHOPPING</option>
                                    <option value="ENTERTAINMENT">ENTERTAINMENT</option>
                                    <option value="UTILITIES">UTILITIES</option>
                                    <option value="OTHER">OTHER</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-auto pt-10">
                            <button 
                                onClick={handleConfirmSave}
                                disabled={isUploading}
                                className="w-full bg-[#1e40af] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:shadow-2xl hover:bg-blue-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isUploading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                Synchronize Record
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept="image/*"
        />

        {/* SaaS Header */}
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-2xl text-[#1e40af]">
                        <Receipt size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Receipts</h1>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1 ml-0.5">Manage Your Physical Bills Digitally</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button 
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="flex items-center gap-3 bg-[#1e40af] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:shadow-2xl hover:bg-blue-800 transition-all disabled:opacity-50 active:scale-95 group"
                >
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} className="group-hover:rotate-12 transition-transform" />}
                    {isUploading ? 'AI Analyzing...' : 'Scan Receipt'}
                </button>
                <div className="w-[1px] h-10 bg-gray-100 ml-2"></div>
                <button className="p-3.5 text-gray-400 hover:text-blue-600 border border-gray-100 rounded-2xl bg-white shadow-sm transition-all hover:bg-blue-50">
                    <Bell size={20} />
                </button>
            </div>
        </div>

        {/* Global Stats or Filters could go here */}

        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            {/* Search Bar */}
            <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full max-w-lg focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <div className="pl-6 text-gray-300">
                    <Search size={22} />
                </div>
                <input 
                    type="text" 
                    placeholder="Locate document by title or metadata..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full pr-6 py-4 outline-none font-bold text-sm text-[#1e293b] placeholder:text-gray-300"
                />
            </div>

            <div className="flex items-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-widest px-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Systems Operational
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#f8fafc]/50 border-b border-gray-50">
                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Document Identity</th>
                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tag</th>
                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Net Value</th>
                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verif.</th>
                            <th className="px-10 py-8 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading && filteredReceipts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-10 py-32 text-center">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="p-4 bg-blue-50 rounded-full">
                                            <Loader2 size={40} className="animate-spin text-[#1e40af]" />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] animate-pulse">Accessing Secure Archive</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredReceipts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-10 py-32 text-center">
                                    <div className="flex flex-col items-center gap-6 opacity-30">
                                        <div className="p-8 bg-gray-50 rounded-full mb-2">
                                            <FileSearch size={64} className="text-gray-400" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 italic max-w-xs mx-auto leading-relaxed">No document signatures detected in this sector. Deploy scanner to populate archive.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredReceipts.map((r, idx) => (
                            <tr key={r.id} className="hover:bg-[#f8fafc]/80 transition-all group animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                <td className="px-10 py-8 whitespace-nowrap text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {r.date}
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-500 transition-all shadow-sm">
                                            <Edit3 size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#1e293b] leading-tight">{r.title}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">ID: {r.id.slice(-6)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${getCategoryColor(r.category)}`}>
                                        {r.category}
                                    </span>
                                </td>
                                <td className="px-10 py-8">
                                    <p className="text-base font-black text-[#1e293b]">₹{Math.abs(r.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">Verified</p>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                            {r.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                        {r.receiptUrl && (
                                            <a 
                                                href={r.receiptUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="p-3 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-100 rounded-xl shadow-sm border border-gray-100"
                                                title="Open Source Document"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(r.id)}
                                            className="p-3 bg-white text-gray-400 hover:text-red-500 hover:border-red-100 rounded-xl shadow-sm border border-gray-100"
                                            title="Purge Record"
                                        >
                                            <Trash2 size={18} />
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

export default Receipts;
