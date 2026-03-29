import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import {
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  Calendar as CalendarIcon
} from 'lucide-react';
import Layout from '../components/Layout';

const AddTransaction = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: '',
    merchant: ''
  });

  const categories = ['Food', 'Income', 'Utilities', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
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
      setSuccess(null);
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
          setSuccess("Receipt scanned successfully!");
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
    if (!formData.amount || !formData.category || !formData.description) {
        setError("Please fill out all required fields.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      await transactionAPI.create({
        ...formData,
        title: formData.description,
        amount: parseFloat(formData.amount.toString().replace(/[^\d.-]/g, ''))
      });
      setSuccess("Transaction added successfully!");
      setTimeout(() => {
        navigate('/transactions');
      }, 1500);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || "Failed to add transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-10 px-4">
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Add Transaction</h1>
            <p className="text-sm text-gray-500 mt-1">Record a new income or expense</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-top-2">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span>{success}</span>
                </div>
            )}

            {/* Scan Button */}
            <div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              <button 
                type="button"
                onClick={handleScanClick}
                disabled={scanning}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                {scanning ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                {scanning ? 'Scanning...' : 'Scan Receipt with AI'}
              </button>
            </div>

            {/* Type Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold transition-colors ${
                    formData.type === 'EXPENSE' 
                      ? 'border-gray-200 bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5' 
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ArrowDown size={16} /> Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold transition-colors ${
                    formData.type === 'INCOME' 
                      ? 'border-gray-200 bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5' 
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ArrowUp size={16} /> Income
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <input 
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <input 
                type="text"
                name="description"
                placeholder="What did you spend on?"
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            {/* Merchant */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Merchant (Optional)</label>
              <input 
                type="text"
                name="merchant"
                placeholder="Store or vendor name"
                value={formData.merchant}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Date</label>
              <div className="relative">
                <input 
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={() => navigate('/transactions')}
                className="flex-1 py-3 border border-gray-200 bg-white text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={16} />}
                Add Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddTransaction;
