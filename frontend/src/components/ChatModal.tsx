
import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { chat } from '../services/api';

interface ChatModalProps {
    targetUser: { id: string; name: string; picture?: string; };
    onClose: () => void;
    currentUser: any;
}

const ChatModal = ({ targetUser, onClose, currentUser }: ChatModalProps) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Setup
    useEffect(() => {
        const setup = async () => {
            // 1. Get/Create Conversation
            try {
                const res = await chat.createConversation(targetUser.id);
                setConversationId(res.data.id);

                // 2. Load Messages
                await loadMessages(res.data.id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        setup();
    }, [targetUser]);

    // Polling for new messages (MVP)
    useEffect(() => {
        if (!conversationId) return;
        const interval = setInterval(() => {
            loadMessages(conversationId);
        }, 3000);
        return () => clearInterval(interval);
    }, [conversationId]);

    const loadMessages = async (convId: string) => {
        try {
            const res = await chat.getMessages(convId);
            setMessages(res.data); // Messages are plain text now
            if (messagesEndRef.current) {
                // Only scroll if we are near bottom or first load? For now just scroll on new
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (!input.trim() || !conversationId) return;
        setSending(true);
        try {
            await chat.sendMessage({
                conversationId,
                content: input
            });

            setInput('');
            await loadMessages(conversationId);
        } catch (err) {
            console.error(err);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col z-[500] animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="p-4 bg-slate-800/50 rounded-t-2xl border-b border-white/5 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white overflow-hidden">
                            {targetUser.picture ? <img src={targetUser.picture} className="w-full h-full object-cover" /> : targetUser.name[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-slate-900 w-3 h-3 rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">{targetUser.name}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                            <span>Online</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-900/90 scrollbar-thin scrollbar-thumb-slate-700">
                {loading ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5 bg-slate-800/50 rounded-b-2xl">
                <div className="flex gap-2">
                    <input
                        className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Type a message..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        disabled={sending || loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
