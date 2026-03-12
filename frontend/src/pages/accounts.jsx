import React from 'react';
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  MoreVertical,
  Plus,
  ArrowUpRight,
  Activity,
  CreditCard,
  Building2,
  IndianRupee
} from 'lucide-react';
import Layout from '../components/Layout';

const AccountCard = ({ title, type, balance, icon: Icon, colorClass, iconColor }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} className={iconColor} />
      </div>
      <button className="text-slate-300 hover:text-slate-600 transition-colors">
        <MoreVertical size={20} />
      </button>
    </div>

    <div className="space-y-1 mb-8">
      <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{type}</h4>
      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight italic">{title}</h3>
    </div>

    <div className="flex items-end justify-between border-t border-slate-50 pt-6">
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Available Liquidity</p>
        <p className="text-2xl font-black text-slate-900 flex items-center gap-1">
          <span className="text-slate-300">₹</span>{balance}
        </p>
      </div>
      <div className="w-10 h-10 rounded-full border border-slate-50 flex items-center justify-center bg-slate-50/50 group-hover:bg-blue-600 group-hover:text-white transition-all cursor-pointer">
        <ArrowUpRight size={18} />
      </div>
    </div>
  </div>
);

const Accounts = () => {
  const accounts = [
    { title: 'HDFC Checkings', type: 'Primary Account', balance: '1,24,450.50', icon: Building2, colorClass: 'bg-blue-50', iconColor: 'text-blue-600' },
    { title: 'SBI Reserve', type: 'Elite Savings', balance: '4,50,000.00', icon: ShieldCheck, colorClass: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { title: 'ICICI Business', type: 'Business Credit', balance: '28,800.00', icon: CreditCard, colorClass: 'bg-blue-50', iconColor: 'text-blue-600' },
  ];

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Capital <span className="text-blue-600 italic">_Vaults</span></h1>
            <p className="text-slate-500 font-medium italic">Manage your financial nodes and rupee vaults_</p>
          </div>
          <button className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 uppercase tracking-widest border-b-4 border-blue-800 group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Connect Vault_
          </button>
        </div>

        {/* Wealth Summary Section */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-bl-full pointer-events-none -mr-16 -mt-16 opacity-40 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="space-y-6 relative z-10 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/10 text-blue-600 rounded-lg">
                <TrendingUp size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Capital Integrity_</span>
            </div>
            <div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                <span className="text-slate-200">₹</span>6,03,250.50
              </h2>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
                <ArrowUpRight size={14} /> +4.2% Growth Signal detected
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto relative z-10">
            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-center hover:bg-white hover:shadow-xl transition-all cursor-default">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Liquid Assets</p>
              <p className="text-lg font-black text-slate-900">82%</p>
            </div>
            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-center hover:bg-white hover:shadow-xl transition-all cursor-default">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Profile</p>
              <p className="text-lg font-black text-slate-900 uppercase italic">Minimal</p>
            </div>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {accounts.map((acc, idx) => (
            <AccountCard key={idx} {...acc} />
          ))}
          {/* Add Placeholder */}
          <div className="border-4 border-dashed border-slate-100 rounded-[3.5rem] flex flex-col items-center justify-center p-10 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group min-h-[250px]">
            <div className="p-5 bg-slate-50 rounded-2xl text-slate-200 group-hover:scale-110 group-hover:text-blue-600 group-hover:bg-white transition-all shadow-sm">
              <Plus size={40} />
            </div>
            <p className="mt-6 text-[10px] font-black text-slate-300 group-hover:text-blue-600 transition-colors uppercase tracking-[0.3em]">New Vault</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Accounts;
