import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronDown,
    ChevronUp,
    LayoutGrid,
    PieChart,
    Globe,
    FileText,
    ShieldCheck,
    Bell,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/* ─── Navbar ─────────────────────────────────────────────────── */
const Navbar = ({ user }) => (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #f0f0f0' }}>
        <div
            style={{
                maxWidth: '1100px',
                margin: '0 auto',
                padding: '0 24px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
            }}
        >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                    style={{
                        width: '34px', height: '34px',
                        background: '#1a3471', borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <LayoutGrid size={15} color="#fff" />
                </div>
                <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>ExpenseAI</span>
            </div>

            {/* Center links */}
            <nav
                style={{
                    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', gap: '36px',
                }}
            >
                <a href="#features" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>Features</a>
                <a href="#how-it-works" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>How It Works</a>
            </nav>

            {/* CTA */}
            <Link
                to={user ? "/dashboard" : "/login"}
                style={{
                    padding: '8px 24px',
                    background: '#2563eb',
                    color: '#fff',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}
            >
                {user ? "Dashboard" : "Login / Get Started"}
            </Link>
        </div>
    </header>
);

/* ─── Feature Card ────────────────────────────────────────────── */
const FeatureCard = ({ title, desc, icon: Icon }) => (
    <div
        style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '28px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}
    >
        <div
            style={{
                width: '40px', height: '40px',
                background: '#eef3fd',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
            }}
        >
            <Icon size={18} color="#3b5bdb" />
        </div>
        <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827', marginBottom: '8px' }}>{title}</div>
        <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.7' }}>{desc}</div>
    </div>
);

/* ─── Step Card ───────────────────────────────────────────────── */
const StepCard = ({ number, title, desc }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 8px' }}>
        <div
            style={{
                width: '48px', height: '48px',
                background: '#1a3471',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: '700', fontSize: '13px',
                marginBottom: '16px',
                position: 'relative', zIndex: 1,
                boxShadow: '0 4px 12px rgba(26,52,113,0.3)',
            }}
        >
            {number}
        </div>
        <div style={{ fontWeight: '700', fontSize: '13px', color: '#111827', marginBottom: '8px' }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.7' }}>{desc}</div>
    </div>
);

/* ─── FAQ Item ────────────────────────────────────────────────── */
const FAQItem = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: '1px solid #f3f4f6' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', padding: '16px 0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
            >
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{question}</span>
                {open
                    ? <ChevronUp size={15} color="#3b82f6" />
                    : <ChevronDown size={15} color="#9ca3af" />
                }
            </button>
            {open && (
                <div style={{ paddingBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.7', margin: 0 }}>{answer}</p>
                </div>
            )}
        </div>
    );
};

/* ─── Main Component ──────────────────────────────────────────── */
const Home = () => {
    const { user } = useAuth();
    const features = [
        { icon: LayoutGrid, title: 'Expense Tracking', desc: 'Log and categorize your expenses effortlessly. Track every transaction with detailed records and smart categorization.' },
        { icon: PieChart,   title: 'Budget Management', desc: "Set budgets for different categories and monitor your spending. Get alerts when you're approaching your limits." },
        { icon: Globe,       title: 'AI-Powered Insights', desc: 'Get intelligent recommendations and predictions based on your spending patterns. Let AI optimize your finances.' },
        { icon: FileText,    title: 'Financial Reports', desc: 'Generate comprehensive reports with charts and analytics. Visualize your financial health at a glance.' },
        { icon: ShieldCheck, title: 'Secure Authentication', desc: 'Your data is protected with industry-standard security. JWT authentication keeps your financial data safe.' },
        { icon: Bell,        title: 'Smart Notifications', desc: 'Receive timely alerts about unusual spending, bill reminders, and budget updates to stay on track.' },
    ];

    const steps = [
        { number: '01', title: 'Connect Your Accounts', desc: 'Sign up and securely link your financial accounts or start adding expenses manually.' },
        { number: '02', title: 'Track & Categorize', desc: 'The system automatically categorizes your expenses. Review and adjust as needed.' },
        { number: '03', title: 'Get AI Insights', desc: 'Receive personalized recommendations and forecasts to optimize your spending.' },
        { number: '04', title: 'Achieve Your Goals', desc: 'Set financial goals, track progress, and watch your savings grow over time.' },
    ];

    const faqs = [
        { question: 'Is ExpenseAI free to use?', answer: 'Yes, ExpenseAI offers a free plan with core features. Premium plans unlock advanced AI insights.' },
        { question: 'How secure is my financial data?', answer: 'We use bank-grade AES-256 encryption. Your credentials are never stored in plain text.' },
        { question: 'When do I receive budget alerts?', answer: 'Alerts trigger at 80%, 90%, and 100% of your set monthly budget limit.' },
        { question: 'Can I manage multiple bank accounts?', answer: 'Yes, you can add unlimited accounts including Savings, Checking, and Credit Cards.' },
        { question: 'Is my data encrypted?', answer: 'All data is encrypted with AES-256. Your personal and financial data is fully protected at rest and in transit.' },
    ];

    const inner = { maxWidth: '1100px', margin: '0 auto', padding: '0 32px' };

    return (
        <div style={{ width: '100%', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#ffffff' }}>

            {/* Navbar */}
            <Navbar user={user} />

            {/* ── Hero ── */}
            <section style={{ background: 'linear-gradient(180deg,#dce8f9 0%,#e8f0fb 100%)', width: '100%' }}>
                <div style={{ ...inner, textAlign: 'center', padding: '80px 32px 96px' }}>
                    <h1
                        style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontWeight: '700',
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            color: '#0c1f5e',
                            lineHeight: '1.25',
                            marginBottom: '20px',
                        }}
                    >
                        Take Control of Your{' '}
                        <span style={{ color: '#1d4ed8' }}>Financial<br />Future</span>
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.8', marginBottom: '32px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                        AI Expense Management System helps you track expenses, manage budgets, and gain intelligent insights into your spending patterns. Make smarter financial decisions with ease.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link
                            to={user ? "/dashboard" : "/register"}
                            style={{
                                padding: '12px 28px',
                                background: '#1e3a8a',
                                color: '#fff',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: '700',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}
                        >
                            {user ? "Back to Dashboard" : "Get Started Now"} <ArrowRight size={14} />
                        </Link>
                        {!user && (
                            <Link
                                to="/login"
                                style={{
                                    padding: '12px 28px',
                                    background: '#ffffff',
                                    color: '#374151',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                    border: '1.5px solid #e5e7eb',
                                    transition: 'all 0.2s',
                                }}
                            >
                                Existing Member?
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" style={{ background: '#eef4fc', width: '100%' }}>
                <div style={{ ...inner, padding: '72px 32px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#111827', marginBottom: '8px' }}>
                            Features for Every User
                        </h2>
                        <p style={{ fontSize: '13px', color: '#9ca3af' }}>Everything you need to manage your finances effectively.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {features.map((f, i) => <FeatureCard key={i} {...f} />)}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id="how-it-works" style={{ background: '#e5edf9', width: '100%' }}>
                <div style={{ ...inner, padding: '72px 32px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                        <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#111827', marginBottom: '8px' }}>
                            How It Works
                        </h2>
                        <p style={{ fontSize: '13px', color: '#9ca3af' }}>Get started in minutes and take control of your finances.</p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        {/* Connector line */}
                        <div
                            style={{
                                position: 'absolute', top: '24px',
                                left: '12.5%', right: '12.5%',
                                height: '1px', background: '#b3c8e8', zIndex: 0,
                            }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', position: 'relative', zIndex: 1 }}>
                            {steps.map((s, i) => <StepCard key={i} {...s} />)}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{ background: '#1a3471', width: '100%' }}>
                <div style={{ ...inner, padding: '64px 32px', textAlign: 'center' }}>
                    <h2 style={{ fontWeight: '700', fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: '#ffffff', marginBottom: '12px' }}>
                        Ready to Transform Your Finances?
                    </h2>
                    <p style={{ fontSize: '13px', color: '#93c5fd', marginBottom: '28px' }}>
                        Start managing your expenses with AI-powered insights today.
                    </p>
                    <Link
                        to={user ? "/dashboard" : "/register"}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '10px 24px',
                            background: '#ffffff',
                            color: '#1a3471',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            textDecoration: 'none',
                        }}
                    >
                        {user ? "View Dashboard" : "Get Started"} <ArrowRight size={13} />
                    </Link>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section style={{ background: '#ffffff', width: '100%' }}>
                <div style={{ maxWidth: '680px', margin: '0 auto', padding: '72px 32px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: 'clamp(1.4rem,3vw,1.8rem)', color: '#111827', marginBottom: '8px' }}>
                            Frequently Asked Questions
                        </h2>
                        <p style={{ fontSize: '13px', color: '#9ca3af' }}>Everything you want to know about ExpenseAI.</p>
                    </div>
                    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '0 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                        {faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ background: '#ffffff', borderTop: '1px solid #f3f4f6', width: '100%' }}>
                <div style={{ ...inner, padding: '24px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', background: '#1a3471', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LayoutGrid size={12} color="#fff" />
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '13px', color: '#111827' }}>ExpenseAI</span>
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <a href="#features" style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>Features</a>
                            <a href="#how-it-works" style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>How It Works</a>
                            <Link to={user ? "/dashboard" : "/login"} style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>{user ? 'Dashboard' : 'Login'}</Link>
                        </div>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>© 2026 AI Expense Management System.</p>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Home;
