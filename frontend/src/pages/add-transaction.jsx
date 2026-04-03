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
import { aiAPI } from '../services/api';
import Layout from '../components/Layout';

const AddTransaction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  
  const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
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
      setSuccess("Transaction added successfully! Returning to dashboard...");
      setTimeout(() => {
        navigate('/dashboard');
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

            {/* Type Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold transition-all ${
                    formData.type === 'EXPENSE' 
                      ? 'border-red-200 bg-red-50 text-red-600 shadow-sm ring-1 ring-red-500/10' 
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ArrowDown size={16} /> Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold transition-all ${
                    formData.type === 'INCOME' 
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-500/10' 
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
              <input 
                type="number"
                name="amount"
                placeholder="Enter amount"
                required
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold"
              />
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
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold"
              />
            </div>

            {/* Merchant */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Paid To</label>
              <input 
                type="text"
                name="merchant"
                placeholder="Name of recipient or store"
                value={formData.merchant}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold"
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
