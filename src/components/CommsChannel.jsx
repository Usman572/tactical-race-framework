import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config/api";

const CommsChannel = ({ raceId, isLiveHUD = false }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [isOpen, setIsOpen] = useState(!isLiveHUD);
    const [unread, setUnread] = useState(0);
    const socket = useSocket();
    const { user } = useAuth();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (socket && raceId) {
            // Fetch existing messages
            fetchMessages();

            // Join room
            socket.emit('join_race_chat', raceId);

            // Listen for new messages
            socket.on('new_race_message', (msg) => {
                setMessages(prev => [...prev, msg]);
                if (!isOpen) setUnread(prev => prev + 1);
            });

            return () => {
                socket.emit('leave_race_chat', raceId);
                socket.off('new_race_message');
            };
        }
    }, [socket, raceId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/chat/${raceId}`, {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setMessages(data);
        } catch (err) {
            console.error('Fetch chat failed:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/chat/${raceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ text })
            });
            if (res.ok) {
                setText("");
            }
        } catch (err) {
            console.error('Send message failed:', err);
        }
    };

    if (!user) return null;

    return (
        <div className={`fixed bottom-6 right-6 z-[1000] flex flex-col items-end ${isLiveHUD ? 'scale-90 origin-bottom-right' : ''}`}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-80 md:w-96 h-[500px] glass-premium rounded-[2.5rem] mb-4 flex flex-col overflow-hidden shadow-2xl border border-white/10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <div>
                                <h4 className="text-sm font-black italic uppercase tracking-tighter">Comms Channel</h4>
                                <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] animate-pulse">Encrypted Link Active</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-900/20">
                            {messages.map((msg, i) => {
                                const isMe = (msg.user?._id || msg.user) === user.id;
                                return (
                                    <div key={msg._id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 text-slate-200 rounded-bl-none border border-white/5'}`}>
                                            {!isMe && <p className="text-[9px] font-black text-blue-400 mb-1 uppercase tracking-widest">{msg.user?.name}</p>}
                                            <p>{msg.text}</p>
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-500 uppercase mt-1 px-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type transmission..."
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                                />
                                <button
                                    type="submit"
                                    disabled={!text.trim()}
                                    className="absolute right-2 top-1.5 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-black transition-all disabled:opacity-30 antialiased"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polyline points="22 2 15 22 11 13 2 9 22 2"></polyline></svg>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) setUnread(0);
                }}
                className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${isOpen ? 'bg-black text-white' : 'bg-blue-600 text-white shadow-blue-500/40 hover:bg-blue-700'}`}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                {unread > 0 && !isOpen && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-[var(--bg-main)]">
                        {unread}
                    </span>
                )}
            </motion.button>
        </div>
    );
};

export default CommsChannel;
