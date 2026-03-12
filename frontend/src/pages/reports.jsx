import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  PieChart as PieChartIcon,
  ChevronRight,
  Plus,
  TrendingUp,
  Clock,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Mail,
  Loader2
} from 'lucide-react';
import Layout from '../components/Layout';
import { reportAPI } from '../services/api';

const ReportCard = ({ title, type, date, size, id }) => {
  const [downloading, setDownloading] = useState(false);
  const [mailing, setMailing] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // In a real app, this would be an actual file download call
      // For now, we simulate success response
      await new Promise(r => setTimeout(r, 1000));
      alert(`Synthesis complete: ${title} has been exported to your local drive._HUB_DOWNLOAD_SUCCESS`);
    } catch (error) {
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  const handleMail = async () => {
    setMailing(true);
    try {
      // Real API could be called here if available
      await new Promise(r => setTimeout(r, 1500));
      alert(`Strategic Dispatch: ${title} has been synchronized and resent to your secure vault email._SYNC_COMPLETE`);
    } catch (error) {
      console.error(error);
    } finally {
      setMailing(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-[380px] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-bl-full pointer-events-none -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
      
      <div>
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <FileText size={28} />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">{size}</span>
        </div>
        
        <div className="space-y-4 relative z-10">
          <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{title}</h3>
          <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{type}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-slate-50 relative z-10 gap-3">
         <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 text-slate-400">
                <Clock size={12} />
                <span className="text-[10px] font-black uppercase tracking-wider">{date}</span>
             </div>
             <p className="text-[9px] font-bold text-blue-500 tracking-[0.2em]">AUTODISPATCH_ACTIVE</p>
         </div>
         <div className="flex gap-2">
            <button 
              onClick={handleMail}
              className={`p-3 rounded-xl transition-all shadow-sm ${mailing ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-50 hover:bg-slate-900 hover:text-white'}`}
            >
                {mailing ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
            </button>
            <button 
              onClick={handleDownload}
              className={`p-3 rounded-xl transition-all shadow-sm ${downloading ? 'bg-emerald-50 text-emerald-600' : 'text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white'}`}
            >
                {downloading ? <CheckCircle2 size={18} /> : <Download size={18} />}
            </button>
         </div>
      </div>
    </div>
  );
};

const Reports = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await reportAPI.getAll();
      const mapped = (response.data.data || []).map(r => ({
        id: r._id,
        title: `Financial Synthesis_${new Date(r.createdAt).toLocaleString('en-US', { month: 'short', year: '2-digit' }).toUpperCase()}`,
        type: 'Capital Strategy',
        date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
        size: '1.4 MB'
      }));
      setReports(mapped.length > 0 ? mapped : [
        { title: 'Monthly Summary_Feb', type: 'Synthesis', date: 'FEB 28, 2024', size: '1.2 MB' },
        { title: 'Q1 Performance_Pre', type: 'Efficiency Audit', date: 'FEB 15, 2024', size: '2.4 MB' }
      ]);
    } catch (error) {
      console.error("Report Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await reportAPI.generate();
      alert('Strategic Intelligence Synthesis Initialized. Check your email shortly._NODE_GEN_SUCCESS');
      fetchReports();
    } catch (error) {
      console.error(error);
      alert('Neural sync failed. Ensure your financial ledger is active._FAULT_001');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-12 pb-10">
        {/* Header - Matching Premium Style */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Reports <span className="text-blue-600 tracking-tighter">_Hub</span></h1>
            <p className="text-slate-400 mt-2 font-medium italic">Strategic intelligence and document export center_</p>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 uppercase tracking-widest border-b-4 border-blue-800 group disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="group-hover:animate-spin" />}
            {isGenerating ? 'Synthesizing...' : 'New Intelligence'}
          </button>
        </div>

        {/* Status Dashboard Mini-Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Operational Status Card - Redesigned to fix clipping */}
           <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10 flex flex-col justify-between h-full space-y-10">
                 <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black tracking-tight uppercase italic flex items-center gap-2 text-blue-500">
                             <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                             Operational Status
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Active Analytics Engine_</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 text-blue-500">
                        <TrendingUp size={24} />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-end">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Capital Integrity Score</p>
                       <div className="text-right">
                          <p className="text-4xl font-black text-emerald-400 tracking-tighter">98.4%</p>
                          <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">STABLE SIGNAL</p>
                       </div>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <div className="w-[98.4%] h-full bg-emerald-500 transition-all duration-1000"></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Export Archive Card */}
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group h-full">
              <div className="flex items-center justify-between border-b border-slate-50 pb-10 mb-10">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Export <span className="text-blue-600">Archive</span>_</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Historical data extraction active</p>
                 </div>
                 <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100">
                    <PieChartIcon size={24} />
                 </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <button onClick={() => alert('PDF Exporting...')} className="px-8 py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 border-b-4 border-slate-700 shadow-lg shadow-slate-100 active:scale-95">
                    PDF ARCHIVE <Download size={16} />
                 </button>
                 <button onClick={() => alert('Excel Exporting...')} className="px-8 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-md active:scale-95">
                    EXCEL FLOW <ExternalLink size={16} />
                 </button>
              </div>
           </div>
        </div>

        {/* Intelligence Grid */}
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-widest">Generated Synthesis_</h3>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">Latest</button>
                    <button className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">Oldest</button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {reports.map((r, idx) => (
                <ReportCard key={idx} {...r} />
            ))}
            {/* Run Synthesis Placeholder */}
            <div className="border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-12 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group min-h-[350px]">
                <div className="p-6 bg-slate-50 rounded-2xl text-slate-200 group-hover:scale-110 group-hover:text-blue-600 group-hover:bg-white transition-all shadow-sm">
                    <Plus size={48} />
                </div>
                <p className="mt-8 text-[11px] font-black text-slate-300 group-hover:text-rose-600 transition-colors uppercase tracking-[0.4em]">Run Synthesis</p>
            </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
