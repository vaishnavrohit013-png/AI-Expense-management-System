import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Tag,
  FileText,
  CreditCard,
  Loader2,
  Camera,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';

const AddTransaction = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false,
    paymentMethod: 'CASH'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const scanData = new FormData();
      scanData.append('receipt', file);
      
      setScanning(true);
      setError(null);
      try {
        const res = await transactionAPI.scanReceipt(scanData);
        if (res.data.data) {
          const { amount, category, description, date, title, type } = res.data.data;
          setFormData(prev => ({
            ...prev,
            amount: amount?.toString() || '',
            category: category || prev.category,
            description: description || title || prev.description,
            date: date ? new Date(date).toISOString().split('T')[0] : prev.date,
            type: type || prev.type
          }));
        }
      } catch (err) {
        console.error("Scanning error:", err);
        setError("AI Vision failed to parse receipt. Manual entry required.");
      } finally {
        setScanning(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.title) {
        // Fallback title if missing
        if (!formData.title) formData.title = formData.description || "Untitled Transaction";
    }

    setLoading(true);
    setError(null);
    try {
      await transactionAPI.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      navigate('/dashboard');
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || "Failed to sync transaction to the vault.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-5xl font-black text-slate-900 mb-12 tracking-tight italic uppercase">Add <span className="text-blue-600">Entry</span>_</h1>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12 space-y-10">
          {/* Scan Button */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          <button 
            onClick={handleScanClick}
            disabled={scanning}
            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 border-b-4 border-blue-800 active:scale-95 group"
          >
            {scanning ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Scanning Architecture...
              </>
            ) : (
              <>
                <Camera size={20} className="group-hover:rotate-12 transition-transform" />
                Analyze Receipt with AI_
              </>
            )}
          </button>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-500 p-6 rounded-2xl flex items-center gap-4 animate-shake">
                    <AlertCircle size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
                </div>
            )}

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700">Transaction Title</label>
              <input 
                type="text"
                name="title"
                required
                placeholder="e.g. Monthly Rent, Grocery Shopping"
                value={formData.title || ''}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Type</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
              >
                <option value="EXPENSE">Expense Account</option>
                <option value="INCOME">Income Source</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Amount</label>
                <input 
                  type="text"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Payment Method</label>
                <select 
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                >
                  <option value="CASH">Cash Holdings</option>
                  <option value="CARD">Debit/Credit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="MOBILE_PAYMENT">Mobile/UPI</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Select category</option>
                  <option value="Food">Food</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Description</label>
              <input 
                type="text"
                name="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Recurring Transaction</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Set up a recurring schedule for this transaction</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex gap-6 pt-10">
              <button 
                type="button"
                onClick={() => navigate('/transactions')}
                className="flex-1 py-6 border-2 border-slate-100 rounded-[2rem] font-black uppercase tracking-widest text-xs text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 border-b-4 border-slate-700 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                {loading ? 'Processing...' : 'Deploy Transaction_'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddTransaction;
