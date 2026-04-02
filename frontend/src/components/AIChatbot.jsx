import React, { useState, useRef, useEffect } from 'react';
import { Bot, Minus, Copy, ThumbsUp, ThumbsDown, CheckCheck, Send, MessageSquare } from 'lucide-react';
import { aiService } from '../services/aiService';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: "Hi there! 👋 I'm your Finora AI Assistant.\nAsk me about your expenses, budgets, or anything finance-related!", 
            isBot: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
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

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMessage = { id: Date.now(), text: userText, isBot: false, time: currentTime };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await aiService.chatWithAI(userText, messages.slice(-5));
            const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const botMessage = { id: Date.now() + 1, text: aiResponse, isBot: true, time: botTime };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("AI Communication Error:", error);
            const errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const errorMessage = { id: Date.now() + 2, text: "Sync failed. Check your connection.", isBot: true, time: errTime };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-10 right-10 w-16 h-16 bg-[#3b82f6] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-[2000] border-4 border-white group"
            >
                <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#4ade80] rounded-full border-2 border-white animate-pulse"></div>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-10 right-10 bg-white shadow-2xl rounded-3xl border border-slate-100 flex flex-col z-[2000] transition-all duration-300 ${
            isMinimized ? 'h-16 w-[380px] overflow-hidden' : 'h-[650px] w-[380px]'
        } font-sans`}>
            
            {/* Header */}
            <div className="bg-[#3b82f6] p-4 flex items-center justify-between text-white shadow-md z-10 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-inner">
                        <Bot className="text-blue-600 w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-[16px] leading-tight tracking-tight">StarklyAI</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse"></div>
                            <span className="text-[10px] text-blue-100 font-medium">Online</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                    }} 
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors active:scale-95 text-white/90"
                >
                    <Minus size={20} />
                </button>
            </div>

            {!isMinimized && (
                <>
                    {/* Chat Body */}
                    <div className="flex-1 bg-gradient-to-b from-slate-50 to-white flex flex-col pt-6 pb-2 px-4 overflow-y-auto space-y-6 custom-scrollbar relative">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex w-full ${!msg.isBot ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                
                                {msg.isBot ? (
                                    /* Bot Message */
                                    <div className="flex gap-2 max-w-[90%]">
                                        <div className="w-8 h-8 rounded-full bg-[#6b21a8] flex items-center justify-center text-white flex-shrink-0 mt-3 shadow-md border-2 border-white">
                                            <Bot size={16} />
                                        </div>
                                        <div className="bg-[#4c1d95] text-white p-3.5 pb-4 rounded-xl rounded-tl-sm relative shadow-lg">
                                            <p className="text-[12.5px] leading-[1.6] whitespace-pre-wrap">
                                                {msg.text}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1 opacity-70">
                                                <span className="text-[9px] text-purple-200">{msg.time || "7:20"}</span>
                                            </div>
                                            {/* Action Icons */}
                                            <div className="absolute -bottom-2.5 right-3 flex items-center gap-2 bg-[#4c1d95] rounded-full px-2 py-1 shadow-md border border-purple-800/50">
                                                <Copy size={11} className="text-purple-200 hover:text-white cursor-pointer transition-colors" />
                                                <ThumbsUp size={11} className="text-purple-200 hover:text-white cursor-pointer transition-colors" />
                                                <ThumbsDown size={11} className="text-purple-200 hover:text-white cursor-pointer transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* User Message */
                                    <div className="flex justify-end max-w-[90%] relative group mb-2 mt-2">
                                        <div className="bg-slate-200 text-slate-800 p-3.5 rounded-xl rounded-br-sm relative mr-6 shadow-sm border border-slate-200/50">
                                            <p className="text-[12.5px] leading-[1.6] whitespace-pre-wrap">
                                                {msg.text}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1.5 justify-end">
                                                <span className="text-[9px] text-slate-400 font-medium">{msg.time || "7:20"}</span>
                                                <CheckCheck size={12} className="text-[#9333ea]" />
                                            </div>
                                            {/* Avatar Overlay */}
                                            <div className="absolute -bottom-3 -right-5 w-8 h-8 rounded-full border-4 border-white overflow-hidden shadow-md bg-slate-100 flex items-center justify-center">
                                                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    U
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex gap-2 max-w-[90%] animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-[#6b21a8] flex items-center justify-center text-white flex-shrink-0 mt-3 shadow-md border-2 border-white">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-[#4c1d95] text-white p-3.5 rounded-xl rounded-tl-sm shadow-lg flex items-center gap-2">
                                     <div className="flex gap-1">
                                         <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                         <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                         <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce"></div>
                                     </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>

                    {/* Suggestions */}
                    <div className="px-4 py-3 bg-white flex items-center gap-2 overflow-x-auto scrollbar-hide border-t border-slate-50">
                        <button type="button" onClick={() => setInput("How much did I spend this month?")} className="flex-shrink-0 flex items-center gap-1 border border-slate-200 rounded-full px-3 py-1.5 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-[10px] font-semibold text-slate-600 active:scale-95 shadow-sm">
                            <span>💰</span> Spending this month?
                        </button>
                        <button type="button" onClick={() => setInput("Show my recent expenses")} className="flex-shrink-0 flex items-center gap-1 border border-slate-200 rounded-full px-3 py-1.5 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-[10px] font-semibold text-slate-600 active:scale-95 shadow-sm">
                            <span>📝</span> Recent expenses
                        </button>
                        <button type="button" onClick={() => setInput("Am I close to crossing my budget?")} className="flex-shrink-0 flex items-center gap-1 border border-slate-200 rounded-full px-3 py-1.5 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-[10px] font-semibold text-slate-600 active:scale-95 shadow-sm">
                            <span>⚠️</span> Budget status
                        </button>
                        <button type="button" onClick={() => setInput("How do I scan receipts?")} className="flex-shrink-0 flex items-center gap-1 border border-slate-200 rounded-full px-3 py-1.5 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-[10px] font-semibold text-slate-600 active:scale-95 shadow-sm">
                            <span>📸</span> Scan receipts
                        </button>
                    </div>

                    {/* Input */}
                    <div className="px-4 pb-4 pt-1 bg-white">
                        <form onSubmit={handleSend} className="relative group">
                            <input
                                type="text"
                                placeholder="Type your message here..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full bg-slate-100/80 text-slate-800 placeholder-slate-400 font-medium rounded-xl py-3 pl-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border text-[13px] transition-all shadow-inner border-slate-200/60"
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isLoading} 
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all rounded-lg disabled:opacity-40 disabled:hover:bg-transparent active:scale-90"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIChatbot;
