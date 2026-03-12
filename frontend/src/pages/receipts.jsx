import React, { useState, useRef } from 'react';
import {
  FileText,
  Search,
  Plus,
  Camera,
  Download,
  Trash2,
  ExternalLink,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  Calendar,
  MoreVertical,
  Upload,
  X,
  AlertCircle,
  IndianRupee
} from 'lucide-react';
import Layout from '../components/Layout';

const ReceiptCard = ({ title, merchant, amount, date, status, onDelete }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
    <div className="flex justify-between items-start mb-6">
      <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
        <ReceiptIcon size={24} />
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onDelete}
          className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
    
    <div className="space-y-1 mb-8">
      <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight uppercase italic">{title}</h4>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{merchant} • {date}</p>
    </div>

    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
      <p className="text-2xl font-black text-slate-900 leading-none">₹{amount}</p>
      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
        status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 
        status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600 animate-pulse'
      }`}>
        {status}
      </span>
    </div>
  </div>
);

const Receipts = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(null); // { type, message }
  const fileInputRef = useRef(null);

  const initialReceipts = [
    { id: 1, title: 'Dinner Exp', merchant: 'Paradise Biryani', amount: '1,250', date: 'Feb 25, 2024', status: 'Verified' },
    { id: 2, title: 'Gas Fuel', merchant: 'HP Petrol', amount: '4,500', date: 'Feb 21, 2024', status: 'Verified' },
    { id: 3, title: 'Home WiFi', merchant: 'ACT Fibernet', amount: '1,299', date: 'Feb 15, 2024', status: 'Pending' },
    { id: 4, title: 'Cloud Sub', merchant: 'AWS India', amount: '2,499', date: 'Feb 10, 2024', status: 'Verified' },
  ];
  const [receipts, setReceipts] = useState(initialReceipts);

  const triggerToast = (type, message) => {
    setShowToast({ type, message });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      triggerToast('info', 'Secure upload initiated...');
      
      // Simulate upload process
      setTimeout(() => {
        setIsUploading(false);
        const newReceipt = {
            id: Date.now(),
            title: 'New Scan',
            merchant: 'AI Analyzing...',
            amount: '0.00',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Processing'
        };
        setReceipts([newReceipt, ...receipts]);
        triggerToast('success', 'Document analyzed by AI successfully.');
      }, 2000);
    }
  };

  const handleDelete = (id) => {
      if (window.confirm("Purge selected document from archive?")) {
          setReceipts(receipts.filter(r => r.id !== id));
          triggerToast('success', 'Document deleted.');
      }
  };

  return (
    <Layout>
      <div className="space-y-12 pb-20 relative">
        {/* Toast Notification */}
        {showToast && (
            <div className="fixed top-12 right-12 z-50 animate-slide-in">
                <div className={`${
                    showToast.type === 'success' ? 'bg-emerald-500' : 
                    showToast.type === 'info' ? 'bg-blue-500' : 'bg-red-700'
                } text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4 border-b-4 ${
                    showToast.type === 'success' ? 'border-emerald-700' : 
                    showToast.type === 'info' ? 'border-blue-700' : 'border-red-900'
                }`}>
                    {showToast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <div>
                        <p className="font-bold text-sm uppercase tracking-wider">Update</p>
                        <p className="text-xs opacity-80 font-medium">{showToast.message}</p>
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Receipt <span className="text-blue-600 italic">_Archive</span></h1>
            <p className="text-slate-500 font-medium opacity-70">Digitize and archive your physical transaction proofs.</p>
          </div>
          <button 
            disabled={isUploading}
            onClick={handleUploadClick}
            className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 uppercase tracking-widest border-b-4 border-blue-800"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
            {isUploading ? 'Syncing...' : 'Scan New Document'}
          </button>
        </div>

        {/* Hidden File Input */}
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept="image/*,.pdf"
        />

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
           <div className="relative w-full md:max-w-md">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
             <input 
                type="text" 
                placeholder="Search archives..."
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm text-slate-900 shadow-sm"
             />
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <button className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                <Filter size={18} />
                Filters
              </button>
              <button className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                <Calendar size={18} />
                Date
              </button>
           </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pt-4">
          {/* Add Placeholder */}
           <div 
             onClick={handleUploadClick}
             className={`border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-12 transition-all cursor-pointer group min-h-[300px] ${
                 isUploading ? 'bg-blue-50/50 cursor-wait border-blue-200' : 'hover:border-blue-400 hover:bg-blue-50/30'
             }`}
           >
              {isUploading ? (
                  <div className="space-y-6 flex flex-col items-center text-center">
                    <Loader2 size={48} className="text-blue-600 animate-spin" />
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest animate-pulse italic">Scanning Architecture...</p>
                  </div>
              ) : (
                  <>
                    <div className="p-8 bg-slate-50 rounded-[2rem] text-slate-200 group-hover:scale-110 group-hover:text-blue-600 group-hover:bg-white transition-all shadow-sm">
                        <Upload size={48} />
                    </div>
                    <p className="mt-8 text-[11px] font-black text-slate-300 group-hover:text-blue-600 transition-colors uppercase tracking-[0.4em]">Dispatch File_</p>
                  </>
              )}
           </div>

          {receipts.map((r) => (
            <ReceiptCard key={r.id} {...r} onDelete={() => handleDelete(r.id)} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

const ReceiptIcon = ({ size, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-6"/><path d="M16 12h-6"/><path d="M16 16h-6"/></svg>;

export default Receipts;
