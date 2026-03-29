import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Wallet, 
  PieChart, 
  ShieldCheck, 
  Zap
} from 'lucide-react';

const Home = () => {
    const features = [
        {
            title: "Transaction Synthesis",
            desc: "Aggregate every financial node into a single, cohesive ledger.",
            icon: Wallet
        },
        {
            title: "Sector Analysis",
            desc: "Visual distribution of resources across all category domains.",
            icon: PieChart
        },
        {
            title: "Secure Protocols",
            desc: "Bank-grade encryption protecting your personal financial vault.",
            icon: ShieldCheck
        },
        {
            title: "Instant Verification",
            desc: "Real-time updates as soon as your capital moves.",
            icon: Zap
        }
    ];

    return (
        <div className="min-h-screen bg-[#FAF9F6] selection:bg-[#003399]/10 selection:text-[#003399] font-sans">
            {/* Global Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F6]/80 backdrop-blur-md px-8 py-6 flex justify-between items-center max-w-7xl mx-auto border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-serif italic tracking-tighter text-[#1e293b]">FinanceAI</span>
                </div>
                <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-[#1e293b]/60">
                    <Link to="/login" className="hover:text-[#003399] transition-colors">Authorization</Link>
                    <Link to="/register" className="px-6 py-2.5 bg-[#003399] text-white rounded-md hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 uppercase tracking-[0.2em] font-black text-[9px]">Get Started</Link>
                </div>
            </nav>

            {/* Hero Domain */}
            <main className="pt-40 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-12 mb-32">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-6xl md:text-8xl font-black font-serif text-[#1e293b] leading-[0.95] tracking-tight mb-8">
                            Unleash Your <br />
                            <span className="text-[#003399] italic border-b-8 border-[#003399]/10 pb-2">Financial Flow_</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg text-gray-500 font-medium leading-relaxed italic">
                            FinanceAI is your specialized partner for resource management. Synchronize accounts, analyze sectors, and scale your capital with cinematic precision.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        <Link to="/register" className="group px-10 py-5 bg-[#003399] text-white rounded-xl font-bold text-sm tracking-wider flex items-center gap-3 hover:bg-blue-800 transition-all shadow-2xl shadow-blue-900/20 active:scale-95">
                            Start Tracking Now
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/login" className="px-10 py-5 bg-white border border-gray-100 rounded-xl font-bold text-sm tracking-wider text-[#1e293b] hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            Secure Login
                        </Link>
                    </div>
                </div>

                {/* Perspective View (Mock Data Area) */}
                <div className="max-w-6xl mx-auto relative animate-in fade-in zoom-in duration-1000 delay-500">
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.15)] border border-white/50 bg-white p-4">
                        <div className="bg-gray-50 rounded-[2rem] aspect-video flex items-center justify-center group overflow-hidden border border-gray-100 italic">
                           <div className="flex flex-col items-center gap-4 text-gray-300 group-hover:scale-110 transition-transform duration-700">
                               <BarChart3 size={80} strokeWidth={1} />
                               <span className="text-[10px] font-black uppercase tracking-[0.5em]">Network Visualization Active</span>
                           </div>
                        </div>
                    </div>
                    {/* Decorative Blurs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#003399]/5 rounded-full blur-[140px] -z-10"></div>
                </div>
            </main>

            {/* Feature Synthesis */}
            <section className="py-32 px-6 bg-white/50">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-24 text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black font-serif text-[#1e293b] tracking-tight italic uppercase">Tools for Every User_</h2>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em]">Integrated Financial Infrastructure</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white p-12 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-blue-50/50 rounded-2xl flex items-center justify-center text-[#003399] mb-10 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                    <f.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-[#1e293b] mb-4 font-serif italic">{f.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed font-bold opacity-80 uppercase tracking-tight">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer Global */}
            <footer className="py-20 border-t border-gray-100 px-6 bg-[#FAF9F6]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="space-y-4 text-center md:text-left">
                        <span className="text-xl font-black font-serif italic tracking-tighter text-[#1e293b]">FinanceAI</span>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">Scaling Individual Capital Through Intelligence</p>
                    </div>
                    
                    <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <a href="#" className="hover:text-[#003399] transition-colors">Protocols</a>
                        <a href="#" className="hover:text-[#003399] transition-colors">Manifesto</a>
                        <a href="#" className="hover:text-[#003399] transition-colors">Encrypted Support</a>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-gray-100 shadow-sm">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Architected By</span>
                        <span className="text-[11px] font-black text-[#003399] uppercase tracking-widest italic outline-none">Rohit</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;