import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, User } from 'lucide-react';
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
      const historyPayload = messages.map(m => ({
        isBot: m.role === 'system',
        text: m.content
      }));
      
      const response = await aiAPI.chat(userText, historyPayload);
      
      if (response.data && response.data.success) {
        const aiReply = response.data.reply || "I'm sorry, I couldn't formulate a response.";
        setMessages(prev => [...prev, { role: 'system', content: aiReply }]);
      } else {
        throw new Error(response.data?.message || "Unknown error occurred.");
      }
      setIsLoading(false);
      
    } catch (error) {
      console.error('[Chat Component] Error:', error);
      
      // Extract backend error message securely
      let errorUiMsg = "Unable to process chatbot request right now.";
      if (error.response && error.response.data && error.response.data.message) {
          errorUiMsg = error.response.data.message;
      }
      
      setMessages(prev => [...prev, { role: 'system', content: `⚠️ ${errorUiMsg}` }]);
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50">
        
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">AI Finance Assistant</h1>
              <p className="text-sm text-gray-500">Get instant answers about your finances</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Online</span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 1 && !isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AI Finance Assistant</h2>
                <p className="text-base text-gray-700 mb-6">Ask me anything about your finances, budgeting, or expense management</p>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => {
                      setInput('What is my monthly spending?');
                      setTimeout(() => document.querySelector('button[aria-label="Send message"]')?.click(), 0);
                    }}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-colors text-left"
                  >
                    📊 What is my monthly spending?
                  </button>
                  <button 
                    onClick={() => {
                      setInput('Show me my expense breakdown');
                      setTimeout(() => document.querySelector('button[aria-label="Send message"]')?.click(), 0);
                    }}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-colors text-left"
                  >
                    💰 Show me my expense breakdown
                  </button>
                  <button 
                    onClick={() => {
                      setInput('What is my budget status?');
                      setTimeout(() => document.querySelector('button[aria-label="Send message"]')?.click(), 0);
                    }}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-colors text-left"
                  >
                    ⚠️ What is my budget status?
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.length > 1 && (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'system' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-xs px-4 py-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about your finances..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 transition-all"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
