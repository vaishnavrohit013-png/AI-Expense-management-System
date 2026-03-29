import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bell, User } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI } from '../services/api';

const Chat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'system',
            content: "Hello! I'm your AI Finance Assistant. How can I help you manage your money today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userText }]);
        setIsLoading(true);

        try {
            // Map the history to the format expected by the backend
            const history = messages.map(m => ({
                isBot: m.role === 'system',
                text: m.content
            }));
            
            const response = await aiAPI.chat(userText, history);
            const aiReply = response.data?.text || "I'm sorry, I couldn't formulate a response.";
            
            setMessages(prev => [...prev, { role: 'system', content: aiReply }]);
            setIsLoading(false);
            
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'system', content: 'Sorry, I encountered an error connecting to the neural network. Please try again later.' }]);
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="h-[calc(100vh-80px)] flex flex-col pb-6 space-y-6">
                {/* Global Top Bar */}
                <div className="flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
                        <p className="text-sm text-gray-500 mt-1">Here's your financial overview for this month</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Sparkles size={16} />
                            AI Insights
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="w-8 h-8 rounded-full border-2 border-gray-200 overflow-hidden text-gray-400 flex items-center justify-center">
                            <User size={18} />
                        </div>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    {/* Chat Messages */}
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white'}`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                                    </div>
                                    
                                    {/* Message Body */}
                                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        {msg.role === 'system' && (
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                                STRATEGIC_SYNTHESIS_
                                            </p>
                                        )}
                                        <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user' 
                                                ? 'bg-gray-100 text-gray-900 rounded-tr-sm' 
                                                : 'text-gray-900 pt-0 pl-0'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-4 max-w-[80%] flex-row">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                                        <Loader2 size={16} className="animate-spin" />
                                    </div>
                                    <div className="flex items-center text-gray-400 text-sm italic">
                                        Synthesizing response...
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50/50">
                        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex gap-4">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your finances..."
                                className="flex-1 w-full pl-6 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 shadow-sm transition-all"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                                <span className="hidden sm:inline">Send</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Chat;
