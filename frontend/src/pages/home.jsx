import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    ChevronDown, 
    ChevronUp,
    BarChart3,
    Wallet,
    Star,
    Target,
    FileText,
    Zap,
    LayoutDashboard,
    PieChart,
    Shield
} from 'lucide-react';

const Navbar = () => (
    <nav className="fixed top-0 left-0 w-full bg-white h-24 px-8 md:px-24 flex items-center justify-between z-[1000] shadow-sm border-b border-slate-50">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-[0.8rem] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">F</div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Finance <span className="text-blue-600">Archive</span></span>
        </div>
        <div className="hidden md:flex items-center gap-12">
            <a href="#features" className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.3em]">Features</a>
            <a href="#how-it-works" className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.3em]">Protocol</a>
            <a href="#faq" className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.3em]">Intelligence</a>
            <Link to="/login" className="px-10 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100 uppercase tracking-widest border-b-4 border-blue-800">Login Hub_</Link>
        </div>
    </nav>
);

const FeatureCard = ({ title, desc, emoji }) => (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-2xl transition-all duration-500 text-left flex flex-col items-start h-full">
        <div className="w-16 h-16 bg-blue-50/50 rounded-2xl flex items-center justify-center mb-8 text-3xl shadow-inner">
            {emoji}
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-500 text-base leading-relaxed font-medium">{desc}</p>
    </div>
);

const StepCard = ({ number, title, desc }) => (
    <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] text-center flex flex-col items-center hover:shadow-xl transition-all duration-500">
        <div className="w-16 h-16 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center text-2xl font-black mb-8 shadow-inner">
            {number}
        </div>
        <h4 className="text-2xl font-black text-slate-900 mb-4">{title}</h4>
        <p className="text-slate-500 text-base leading-relaxed font-medium">{desc}</p>
    </div>
);

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-slate-100 rounded-[2rem] mb-6 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-8 flex items-center justify-between text-left bg-white hover:bg-slate-50 transition-colors"
            >
                <span className="text-xl font-black text-slate-800 tracking-tight">{question}</span>
                {isOpen ? <ChevronUp className="text-blue-500" size={24} /> : <ChevronDown className="text-slate-300" size={24} />}
            </button>
            {isOpen && (
                <div className="p-8 pt-0 bg-white border-t border-slate-50">
                    <p className="text-slate-500 text-lg leading-relaxed font-medium">{answer}</p>
                </div>
            )}
        </div>
    );
};

const Home = () => {
    return (
        <div className="min-h-screen bg-[#fdfcfb] font-['Inter'] selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden pt-24 text-slate-900">
            <Navbar />

            {/* 1. HERO SECTION */}
            <section className="relative h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/hero_bg.png" 
                        alt="Background" 
                        className="w-full h-full object-cover brightness-[0.35]"
                    />
                </div>
                <div className="relative z-10 max-w-7xl w-full text-left px-8 md:px-24 space-y-12">
                    <h1 className="text-6xl md:text-[7rem] font-black text-white leading-[1] uppercase tracking-tighter mb-4">
                        MANAGE YOUR <br/> MONEY SMARTER
                    </h1>
                    <p className="max-w-3xl text-slate-300 text-xl md:text-2xl font-medium leading-relaxed mb-8 opacity-90">
                        Take control of your finances with intelligent budgeting, real-time tracking, and 
                        personalized insights. Track every expense and build the financial future you deserve.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-8 pt-4">
                        <Link to="/register" className="w-full sm:w-auto px-16 py-6 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 text-center uppercase tracking-[0.3em] border-b-4 border-blue-800">
                            Initialize Account_
                        </Link>
                        <button className="w-full sm:w-auto px-16 py-6 border-2 border-white/30 text-white rounded-2xl font-black text-xs hover:bg-white hover:text-slate-900 transition-all active:scale-95 text-center uppercase tracking-[0.3em] backdrop-blur-sm">
                            Explore Protocol_
                        </button>
                    </div>
                </div>
            </section>

            {/* SPACER FOR BREATHING ROOM */}
            <div className="h-64"></div>

            {/* 2. CORE FEATURES SECTIONS */}
            <section className="px-8 md:px-24 max-w-7xl mx-auto space-y-64">
                {/* AI Receipt Scanning */}
                <div className="flex flex-col lg:flex-row items-center gap-24">
                    <div className="flex-1 space-y-10">
                        <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight uppercase italic">AI Receipt <br/> Scanning_</h2>
                        <div className="w-20 h-2 bg-blue-600 rounded-full"></div>
                        <p className="text-slate-500 text-xl md:text-2xl leading-relaxed font-medium">
                            Snap a photo of your receipt and let our AI do the heavy lifting. 
                            It automatically extracts the amount, merchant, and category to fill your 
                            transaction details in seconds.
                        </p>
                    </div>
                    <div className="flex-1 w-full flex justify-center">
                        <img 
                            src="/smart_planning_v2.png" 
                            alt="AI Scanning" 
                            className="w-full max-w-2xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.08)] hover:scale-[1.02] transition-transform duration-700 border-8 border-white"
                        />
                    </div>
                </div>

                {/* Budget Intelligence */}
                <div className="flex flex-col lg:flex-row-reverse items-center gap-24">
                    <div className="flex-1 space-y-10">
                        <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight uppercase italic text-right">Budget <br/> Intelligence_</h2>
                        <div className="w-20 h-2 bg-blue-600 rounded-full ml-auto"></div>
                        <p className="text-slate-500 text-xl md:text-2xl leading-relaxed font-medium text-right ml-auto max-w-xl">
                            Set monthly limits and track your spending in real-time. 
                            Receive instant email alerts when you're approaching your limit 
                            to keep your financial flow healthy.
                        </p>
                    </div>
                    <div className="flex-1 w-full flex justify-center">
                        <img 
                            src="/growth_v2.png" 
                            alt="Budget Bar" 
                            className="w-full max-w-2xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.08)] hover:scale-[1.02] transition-transform duration-700 border-8 border-white"
                        />
                    </div>
                </div>
            </section>

            <div className="h-64"></div>

            {/* 3. KEY FEATURES GRID */}
            <section id="features" className="py-64 px-8 md:px-24 bg-white border-y border-slate-50">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="mb-32 space-y-6">
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic">Implemented Features_</h2>
                        <div className="w-40 h-2 bg-blue-600 rounded-full mx-auto"></div>
                        <p className="text-slate-400 text-2xl font-medium tracking-tight">Tools already built into your dashboard</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        <FeatureCard 
                            emoji="📸"
                            title="AI Receipt Scanning" 
                            desc="Upload images of receipts to automatically extract amounts and categories."
                        />
                        <FeatureCard 
                            emoji="📊"
                            title="Visual Analytics" 
                            desc="Comprehensive bar and pie charts to visualize your income vs expenses."
                        />
                        <FeatureCard 
                            emoji="💰"
                            title="Budget Control" 
                            desc="Set and edit monthly budgets with real-time percentage tracking."
                        />
                        <FeatureCard 
                            emoji="📧"
                            title="Email Alerts" 
                            desc="Automated notifications sent to your inbox when budget limits are exceeded."
                        />
                        <FeatureCard 
                            emoji="🏦"
                            title="Account Management" 
                            desc="Track balances across personal, savings, and business accounts."
                        />
                        <FeatureCard 
                            emoji="📝"
                            title="Transaction History" 
                            desc="Detailed logs of all your financial activities with easy sorting."
                        />
                    </div>
                </div>
            </section>

            <div className="h-64"></div>

            {/* 4. HOW IT WORKS SECTION */}
            <section id="how-it-works" className="py-64 px-8 md:px-24 bg-[#fcfaf9]">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="mb-32 space-y-6">
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic">System Protocol_</h2>
                        <div className="w-40 h-2 bg-blue-600 rounded-full mx-auto"></div>
                        <p className="text-slate-400 text-2xl font-medium tracking-tight">Four simple steps to financial control</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        <StepCard 
                            number="1" 
                            title="Sign Up" 
                            desc="Create your account and verify your identity securely."
                        />
                        <StepCard 
                            number="2" 
                            title="Upload Receipt" 
                            desc="Snap a photo or upload a digital receipt for AI processing."
                        />
                        <StepCard 
                            number="3" 
                            title="Set Budget" 
                            desc="Define your monthly spending limits for each account."
                        />
                        <StepCard 
                            number="4" 
                            title="Stay Notified" 
                            desc="Receive real-time insights and budget alerts via email."
                        />
                    </div>
                </div>
            </section>

            <div className="h-64"></div>

            {/* 5. FAQ SECTION */}
            <section id="faq" className="py-64 px-8 md:px-24 bg-white border-t border-slate-50">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="mb-32 space-y-6">
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic">Neural FAQ_</h2>
                        <div className="w-40 h-2 bg-blue-600 rounded-full mx-auto"></div>
                        <p className="text-slate-400 text-2xl font-medium tracking-tight">Find answers to common questions</p>
                    </div>
                    <div className="space-y-6 text-left">
                        <FAQItem 
                            question="How accurate is the AI Receipt Scanning?" 
                            answer="Our AI uses advanced OCR technology to achieve over 95% accuracy in extracting text from standard retail receipts." 
                        />
                        <FAQItem 
                            question="When do I receive budget alerts?" 
                            answer="Alerts are triggered once you exceed 80%, 90%, and 100% of your set monthly budget limit." 
                        />
                        <FAQItem 
                            question="Can I manage multiple bank accounts?" 
                            answer="Yes, you can add and track unlimited accounts including Savings, Checking, and Credit Cards." 
                        />
                        <FAQItem 
                            question="Is my data encrypted?" 
                            answer="We use bank-grade AES-256 encryption to protect your financial data and personal information at all times." 
                        />
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-32 px-12 flex flex-col items-center w-full">
                <div className="max-w-4xl mx-auto text-center space-y-16 animate-fade-in group">
                    <h2 className="text-5xl md:text-[6rem] font-bold text-slate-900 leading-tight tracking-tighter uppercase italic">
                        Ready to Optimize your <br/> Money Flow_?
                    </h2>
                    <div className="flex items-center justify-center pt-4">
                        <Link to="/register" className="px-16 py-6 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.6em] hover:bg-blue-700 transition-all shadow-[0_30px_60px_-10px_rgba(37,99,235,0.4)] active:scale-95 border-b-8 border-blue-900">
                            Authorize Protocol_
                        </Link>
                    </div>
                </div>
            </section>

            {/* MINIMAL FOOTER BLUE LINE */}
            <div className="h-4 bg-blue-400 w-full opacity-30"></div>

            <footer className="py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.5em] bg-white border-t border-slate-50">
                © 2026 Finance Manager. Professional Wealth Intelligence.
            </footer>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 1s ease-out forwards;
                }
            `}} />
        </div>
    );
};

export default Home;