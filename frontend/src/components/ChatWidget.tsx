import React, { useState, useRef, useEffect } from 'react';
import { tutor } from '../services/api';
import { MessageCircle, Send, X } from 'lucide-react';

interface ChatWidgetProps {
    context?: string; // Optional context (if null, acts as Guide)
    isOpen?: boolean;
    onClose?: () => void;
}

interface Message {
    role: 'user' | 'ai';
    content: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ context = '', isOpen: externalIsOpen, onClose }) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    // Use external control if provided, otherwise internal state
    const isControlled = externalIsOpen !== undefined;
    const isOpen = isControlled ? externalIsOpen : internalIsOpen;
    const handleClose = isControlled && onClose ? onClose : () => setInternalIsOpen(false);

    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'Hi! I am your AI Tutor. Ask me anything about this lesson!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await tutor.chat(userMsg, context);
            setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button (Only show if NOT controlled externally) */}
            {!isControlled && !isOpen && (
                <button
                    onClick={() => setInternalIsOpen(true)}
                    className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition transform hover:scale-105"
                >
                    <MessageCircle className="w-8 h-8" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col border border-white/10 animate-in slide-in-from-bottom-10 fade-in duration-300">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center shadow-lg relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-bold block text-sm">Antigravity AI</span>
                                <span className="text-xs text-indigo-200 block">Your Personal Guide</span>
                            </div>
                        </div>
                        <button onClick={handleClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-500/20'
                                        : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-none shadow-md'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 border border-white/5 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-2 items-center">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 bg-slate-900 rounded-b-2xl">
                        <div className="flex gap-2 relative">
                            <input
                                type="text"
                                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Ask about courses, features, etc..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                disabled={loading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default ChatWidget;
