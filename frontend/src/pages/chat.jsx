import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Landmark, PlusCircle, PieChart, ShieldCheck, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI, transactionAPI, userAPI } from '../services/api';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: "Hello! I'm your Spendly AI Assistant.\n\nHow can I help you manage your money today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // --- 🪄 ROTATING PLACEHOLDER LOGIC ---
  const placeholders = [
    "Ask about spending, budgets, or add an expense...",
    "Try: Add ₹450 lunch expense",
    "Try: Show my monthly spending",
    "Try: Set my food budget to ₹5000",
    "Try: What are my top expenses?",
    "Tell me: How much did I spend yesterday?"
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // --- 🛠️ COMMAND EXECUTOR ENGINE ---
  const executeCommand = async (commandStr) => {
    try {
        const commandMatch = String(commandStr).match(/\[\[COMMAND:\s*(.*?)\s*\]\]/s);
        if (!commandMatch) return { text: String(commandStr), executed: false };

        const command = JSON.parse(commandMatch[1].trim());
        const cleanText = String(commandStr).replace(/\[\[COMMAND:[\s\S]*?\]\]/g, '').trim();
        
        console.log("🚀 [AI Command] Executing:", command.type);

        switch (command.type) {
            case 'ADD_TRANSACTION':
                await transactionAPI.create(command.data);
                return { text: cleanText, executed: true, result: "✅ Transaction logged successfully!" };
            
            case 'SET_BUDGET':
                await userAPI.updateProfile({ monthlyBudget: command.data.limit });
                return { text: cleanText, executed: true, result: "🎯 Budget updated!" };
            
            case 'NAVIGATE':
                if (command.data.page !== location.pathname) {
                    setTimeout(() => navigate(command.data.page), 1500);
                }
                return { text: cleanText, executed: true, result: `🧭 Switching to ${command.data.page}...` };
            
            default:
                return { text: cleanText, executed: false };
        }
    } catch (err) {
        console.error("❌ [AI Command] Execution Error:", err);
        return { text: String(commandStr), executed: false, error: "Action processing failed." };
    }
  };

  const handleSend = async (e, forcedInput = null) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const userText = forcedInput || input.trim();
    if (!userText || isLoading) return;

    setError('');
    if (!forcedInput) setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-10).map(m => ({
        isBot: m.role === 'system',
        text: String(m.content)
      }));
      
      const response = await aiAPI.chat(userText, historyPayload);
      
      if (response.data && response.data.success) {
        const aiRawReply = String(response.data.reply);
        const { text, executed, result, error: cmdError } = await executeCommand(aiRawReply);
        
        setMessages(prev => [
            ...prev, 
            { 
                role: 'system', 
                content: text || "I've processed that for you.",
                meta: executed ? (cmdError ? `❌ ${cmdError}` : result) : null 
            }
        ]);
      } else {
        throw new Error(response.data?.message || "AI service is momentarily unavailable.");
      }
    } catch (error) {
      console.error('💥 [Chat] Error:', error);
      setError('');
      setMessages(prev => [...prev, { role: 'system', content: "Sorry, I'm having trouble. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ✨ UPDATED QUICK ACTIONS ---
  const chips = [
    { label: 'Add Expense', icon: PlusCircle, prompt: 'Add expense ₹500 for coffee' },
    { label: 'Set Budget', icon: Landmark, prompt: 'Set my monthly budget to ₹25000' },
    { label: 'Show Spending', icon: PieChart, prompt: 'Show my spending breakdown' },
    { label: 'View Profile', icon: ShieldCheck, prompt: 'Go to my account' },
  ];

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-100px)] bg-[#f8fafc]">
        
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 italic font-black text-white text-lg">
              S
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Spendly AI</h1>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block -mt-1">● Online</span>
            </div>
          </div>
          <button 
            onClick={() => setMessages([{ role: 'system', content: "History cleared. What's on your mind?" }])}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-100 rounded-xl uppercase tracking-widest transition-all"
          >
            <Trash2 size={13} />
            Reset
          </button>
        </div>

        {/* Message View */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 no-scrollbar h-full">
          <div className="max-w-3xl mx-auto space-y-10">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black ${
                  msg.role === 'system' ? 'bg-indigo-600 text-white italic' : 'bg-white border border-slate-200 text-slate-400'
                }`}>
                  {msg.role === 'system' ? 'S' : <User size={18} />}
                </div>
                
                <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <div className={`px-5 py-4 rounded-2xl md:rounded-3xl shadow-sm text-sm md:text-base leading-snug font-bold ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none ring-1 ring-slate-100'
                    }`}>
                      {String(msg.content)}
                    </div>
                    {msg.meta && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider animate-in fade-in duration-500">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            {msg.meta}
                        </div>
                    )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 items-center pl-2 animate-in fade-in duration-300">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black bg-indigo-600 text-white italic">
                  S
                </div>
                <div className="flex gap-2 items-center px-5 py-4 bg-white border border-slate-100 rounded-3xl rounded-tl-none shadow-sm text-sm font-bold text-slate-500">
                  <div className="flex gap-1.5 items-center mr-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Bar */}
        <div className="bg-white border-t border-slate-100 p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            {/* Action Chips */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                {chips.map((chip, i) => (
                    <button 
                        key={i}
                        type="button"
                        onClick={() => handleSend(null, chip.prompt)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-100 rounded-2xl transition-all text-[11px] font-bold text-slate-500 whitespace-nowrap disabled:opacity-50"
                    >
                        <chip.icon size={13} className="opacity-60" />
                        {chip.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSend} className="relative flex items-center group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholders[placeholderIdx]}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-4 pl-6 pr-14 outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm md:text-base font-bold text-slate-600 shadow-inner group-focus-within:ring-4 ring-indigo-500/5 placeholder:transition-opacity placeholder:duration-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-2xl transition-all shadow-md active:scale-95"
                >
                    <Send size={20} />
                </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
