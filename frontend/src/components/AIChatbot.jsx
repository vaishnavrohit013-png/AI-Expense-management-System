import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { aiService } from '../services/aiService';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI Finance Assistant. How can I help you manage your money today?", isBot: true }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        const userText = input.trim();
        if (!userText) return;

        const userMessage = { id: Date.now(), text: userText, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await aiService.chatWithAI(userText, messages.slice(-5));
            const botMessage = { id: Date.now() + 1, text: aiResponse, isBot: true };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("AI Communication Error:", error);
            const errorMessage = { id: Date.now() + 2, text: "Sync failed. Check your API configuration node.", isBot: true };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-[2000] border-4 border-white group"
            >
                <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-10 right-10 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] rounded-[2.5rem] border border-slate-100 flex flex-col z-[2000] transition-all duration-300 ${
            isMinimized ? 'h-20 w-80' : 'h-[600px] w-[450px]'
        } overflow-hidden font-['Inter'] animate-scale-in shadow-blue-100`}>
            {/* Header */}
            <div className={`p-6 bg-slate-900 text-white flex items-center justify-between ${isMinimized ? 'h-full' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm tracking-tight">Finance AI Assistant</h4>
                        {!isMinimized && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by Gemini AI</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide bg-slate-50/30">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-slide-up`}>
                                <div className={`max-w-[85%] p-7 rounded-[2.5rem] text-[15px] leading-[1.7] ${
                                    msg.isBot 
                                        ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm' 
                                        : 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-100'
                                } font-medium whitespace-pre-wrap relative`}>
                                    {msg.isBot && <div className="flex items-center gap-2 mb-4 text-blue-600">
                                        <div className="p-1.5 bg-blue-50 rounded-lg">
                                            <Sparkles size={12} className="animate-pulse" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategic synthesis_</span>
                                    </div>}
                                    {msg.text}
                                    {!msg.isBot && <div className="absolute -bottom-6 right-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">User_Sent</div>}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-white border border-slate-100 p-6 rounded-3xl rounded-tl-none flex items-center gap-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Link Syncing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-8 border-t border-slate-50 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                        <div className="relative group">
                            <input 
                                type="text"
                                placeholder="Query financial strategy..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full pl-8 pr-16 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all font-bold text-[13px] tracking-tight text-slate-700"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-30 transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center justify-center"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                        <div className="mt-6 flex items-center justify-between text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                            <span>Status: Nominal</span>
                            <span>Core v2.4_Stable</span>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default AIChatbot;
