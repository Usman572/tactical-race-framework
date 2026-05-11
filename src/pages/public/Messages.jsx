import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket, useTypingStatus } from "../../context/SocketContext";
import { useRaces } from "../../context/RaceContext";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import { motion, AnimatePresence } from "framer-motion";

// Scrambled Text for Signal Encryption Vibe - Refined
const ScrambledText = ({ text }) => {
    const [display, setDisplay] = useState('');
    const chars = '!<>-_\\/[]{}—=+*^?#________';

    useEffect(() => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplay(text?.split('').map((char, index) => {
                if (index < iteration) return text[index];
                return chars[Math.floor(Math.random() * chars.length)];
            }).join(''));

            if (iteration >= text?.length) clearInterval(interval);
            iteration += 1 / 3;
        }, 20);
        return () => clearInterval(interval);
    }, [text]);

    return <span>{display}</span>;
};

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedThread, setSelectedThread] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recorder, setRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    
    const { user } = useAuth();
    const socket = useSocket();
    const typingStatus = useTypingStatus();
    const { approveRequest, rejectRequest, fetchUnreadCount } = useRaces();
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchMessages();
        }
    }, [user]);

    useEffect(() => {
        if (socket) {
            const handleNewMsg = (newMsg) => {
                setMessages(prev => [newMsg, ...prev]);
            };
            socket.on('new_notification', handleNewMsg);
            socket.on('new_private_message', handleNewMsg);
            return () => {
                socket.off('new_notification', handleNewMsg);
                socket.off('new_private_message', handleNewMsg);
            };
        }
    }, [socket]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedThread, messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);

            if (data.length > 0 && !selectedThread) {
                const threads = groupIntoThreads(data);
                if (threads.length > 0) setSelectedThread(threads[0].senderId);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTyping = (e) => {
        setReplyText(e.target.value);
        
        if (socket && selectedThread) {
            socket.emit('typing_start', { recipientId: selectedThread, senderId: user.id });
            
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing_stop', { recipientId: selectedThread, senderId: user.id });
            }, 2000);
        }
    };

    const deleteMessage = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                setMessages(prev => prev.filter(m => m._id !== id));
                fetchUnreadCount();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteThread = async () => {
        if (!activeContact || !window.confirm(`Terminate secure link with ${activeContact.senderName}? History will be purged.`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications/thread/${activeContact.senderId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                setMessages(prev => prev.filter(m => {
                    const sid = m.sender?._id || m.sender || m.user?._id || m.user;
                    const rid = m.recipient?._id || m.recipient;
                    return sid !== activeContact.senderId && rid !== activeContact.senderId;
                }));
                setSelectedThread(null);
                fetchUnreadCount();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/races/search?q=${query}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            setSearchResults(data.users.filter(u => u._id !== user.id));
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const startNewThread = (u) => {
        setSelectedThread(u._id);
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    const markAsRead = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
            fetchUnreadCount();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendReply = async () => {
        if ((!replyText.trim() && !audioBlob && !selectedFile) || !selectedThread) return;
        
        setIsSending(true);
        try {
            const formData = new FormData();
            formData.append('recipientId', selectedThread);
            formData.append('text', replyText);

            if (audioBlob) formData.append('media', audioBlob, 'voice-note.webm');
            else if (selectedFile) formData.append('media', selectedFile);

            const res = await fetch(`${API_BASE_URL}/api/chat/private`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` },
                body: formData
            });

            if (res.ok) {
                const newMsg = await res.json();
                setMessages(prev => [newMsg, ...prev]);
                setReplyText("");
                setAudioBlob(null);
                setSelectedFile(null);
                setFileType(null);
                if (socket) socket.emit('typing_stop', { recipientId: selectedThread, senderId: user.id });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start();
            setRecorder(mediaRecorder);
            setIsRecording(true);
        } catch (err) {
            alert("Microphone access required.");
        }
    };

    const stopRecording = () => {
        if (recorder && isRecording) {
            recorder.stop();
            setIsRecording(false);
        }
    };

    const groupIntoThreads = (msgs) => {
        if (!Array.isArray(msgs)) return [];
        const groups = {};
        msgs.forEach(m => {
            const senderId = m.sender?._id || m.sender || m.user?._id || m.user;
            const recipientId = m.recipient?._id || m.recipient;
            const isSentByMe = senderId === user.id;
            const otherId = isSentByMe ? recipientId : senderId;
            const otherUser = isSentByMe ? m.recipient : (m.sender || m.user);

            if (!otherId) return;

            if (!groups[otherId]) {
                groups[otherId] = {
                    senderId: otherId,
                    senderName: otherUser?.name || 'Operative',
                    senderAvatar: otherUser?.profilePicture,
                    senderRank: otherUser?.rank || 'Rookie',
                    lastMessage: m.message || m.text,
                    lastDate: m.createdAt,
                    unreadCount: 0,
                    messages: []
                };
            }
            groups[otherId].messages.push(m);
            if (!m.read && !isSentByMe) groups[otherId].unreadCount++;
        });
        return Object.values(groups).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
    };

    const threads = groupIntoThreads(messages);
    const activeContact = threads.find(t => t.senderId === selectedThread);
    const activeMessages = activeContact?.messages.slice().reverse() || [];
    const isOtherTyping = typingStatus?.[selectedThread];

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center bg-slate-950">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-500 animate-pulse">SCANNING</div>
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto flex bg-slate-950 sm:rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 relative mb-10">
            {/* Sidebar */}
            <div className={`w-full md:w-96 border-r border-white/5 flex flex-col bg-slate-900/50 backdrop-blur-xl ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Comms</h2>
                            <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em]">Secure Signal Link</p>
                        </div>
                        <button onClick={() => setIsSearchOpen(true)} className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    {threads.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-4xl mb-4 opacity-20">📡</div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No active frequencies</p>
                        </div>
                    ) : (
                        threads.map((thread) => (
                            <button
                                key={thread.senderId}
                                onClick={() => setSelectedThread(thread.senderId)}
                                className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all relative group ${selectedThread === thread.senderId ? 'bg-blue-600 shadow-xl shadow-blue-600/20' : 'hover:bg-white/5'}`}
                            >
                                <div className="relative">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border transition-colors ${selectedThread === thread.senderId ? 'bg-white text-blue-600 border-white/20' : 'bg-slate-800 text-slate-400 border-white/5'}`}>
                                        {thread.senderAvatar ? <img src={thread.senderAvatar} className="w-full h-full object-cover rounded-2xl" /> : thread.senderName[0]}
                                    </div>
                                    {thread.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-6 h-6 flex items-center justify-center rounded-full ring-4 ring-slate-900 animate-pulse">
                                            {thread.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-black text-sm uppercase italic tracking-tight ${selectedThread === thread.senderId ? 'text-white' : 'text-slate-200'}`}>{thread.senderName}</span>
                                        <span className={`text-[8px] font-black uppercase tracking-tighter ${selectedThread === thread.senderId ? 'text-blue-100' : 'text-slate-500'}`}>
                                            {new Date(thread.lastDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className={`text-[11px] truncate font-bold ${selectedThread === thread.senderId ? 'text-blue-50' : 'text-slate-500'}`}>
                                        {typingStatus?.[thread.senderId] ? "ENCODING SIGNAL..." : thread.lastMessage}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed ${!selectedThread ? 'hidden md:flex' : 'flex'}`}>
                {activeContact ? (
                    <>
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl z-20 sticky top-0">
                            <div className="flex items-center gap-5">
                                <button onClick={() => setSelectedThread(null)} className="md:hidden p-3 -ml-4 rounded-2xl text-slate-400 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                </button>
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black overflow-hidden">
                                        {activeContact.senderAvatar ? <img src={activeContact.senderAvatar} className="w-full h-full object-cover" /> : activeContact.senderName[0]}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-slate-950 animate-pulse"></div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-black text-white text-lg uppercase italic tracking-tighter">{activeContact.senderName}</h3>
                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[8px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                                            {activeContact.senderRank}
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-black text-blue-500/60 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                                        LINK: SECURE <span className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleDeleteThread} className="p-3 rounded-2xl hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
                            {/* Tactical HUD Overlay Elements */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
                                <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white rounded-full"></div>
                                <div className="absolute bottom-10 right-10 w-60 h-60 border border-white rounded-full"></div>
                            </div>

                            {activeMessages.map((msg, i) => {
                                const isMe = (msg.sender?._id || msg.sender || msg.user?._id || msg.user) === user.id;
                                return (
                                    <motion.div
                                        key={msg._id}
                                        initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`flex items-end gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <div className={`relative p-6 rounded-3xl border ${isMe ? 'bg-blue-600 text-white border-blue-400/30 shadow-2xl shadow-blue-600/20 rounded-br-none' : 'bg-slate-900 text-slate-100 border-white/5 shadow-xl rounded-bl-none'}`}>
                                                {msg.mediaUrl && (
                                                    <div className="mb-4 rounded-2xl overflow-hidden border border-white/10">
                                                        {msg.type === 'Image' && <img src={`${API_BASE_URL}${msg.mediaUrl}`} className="max-w-full h-auto" />}
                                                        {msg.type === 'Video' && <video src={`${API_BASE_URL}${msg.mediaUrl}`} controls className="max-w-full" />}
                                                        {msg.type === 'Audio' && <audio src={`${API_BASE_URL}${msg.mediaUrl}`} controls className="w-full h-10 mt-2" />}
                                                    </div>
                                                )}
                                                <div className="text-[13px] font-bold leading-relaxed tracking-tight">
                                                    {msg.isEncrypted ? <ScrambledText text={msg.message || msg.text} /> : (msg.message || msg.text)}
                                                </div>
                                                
                                                {msg.type === 'JoinRequest' && msg.joinRequest && (
                                                    <div className="mt-6 p-5 rounded-2xl bg-black/40 border border-white/10">
                                                        <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">ACCESS REQUEST</p>
                                                        <p className="text-xs font-black uppercase mb-4 italic">{msg.race?.name || 'CLASSIFIED OPERATION'}</p>
                                                        {!msg.read ? (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleAction(msg._id, msg.joinRequest._id || msg.joinRequest, 'approve')} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">APPROVE</button>
                                                                <button onClick={() => handleAction(msg._id, msg.joinRequest._id || msg.joinRequest, 'reject')} className="flex-1 py-2.5 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">DENY</button>
                                                            </div>
                                                        ) : <div className="text-center text-[9px] font-black text-slate-500 uppercase tracking-widest py-2 border-t border-white/5 mt-2">CLEARED</div>}
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={() => deleteMessage(msg._id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-red-500 transition-all">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-3 px-2">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </motion.div>
                                );
                            })}

                            {isOtherTyping && (
                                <div className="flex items-center gap-4 py-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                    <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-[0.3em]">OPERATIVE ENCODING...</span>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-8 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 z-20">
                            {(selectedFile || audioBlob) && (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">📎</span>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                            {selectedFile ? `ATTACHMENT: ${selectedFile.name}` : 'VOICE ENCODING READY'}
                                        </span>
                                    </div>
                                    <button onClick={() => { setSelectedFile(null); setAudioBlob(null); }} className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline">ABORT</button>
                                </motion.div>
                            )}

                            <div className="flex items-center gap-4 max-w-6xl mx-auto">
                                <div className="flex gap-2">
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) { setSelectedFile(file); setFileType(file.type.startsWith('image') ? 'Image' : 'Video'); }
                                    }} />
                                    <button onClick={() => fileInputRef.current.click()} className="w-14 h-14 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 hover:text-blue-500 hover:border-blue-500/30 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                    </button>
                                    <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} className={`w-14 h-14 rounded-2xl border transition-all flex items-center justify-center ${isRecording ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-red-500'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                    </button>
                                </div>

                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder={isRecording ? "ENCODING AUDIO..." : "INITIATE TRANSMISSION..."}
                                        value={replyText}
                                        onChange={handleTyping}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                        className="w-full h-16 bg-slate-900 border-2 border-white/5 rounded-2xl px-8 text-sm font-bold text-white placeholder:text-slate-600 focus:border-blue-500/30 transition-all outline-none italic"
                                        disabled={isRecording}
                                    />
                                    <button
                                        onClick={handleSendReply}
                                        disabled={isSending || (!replyText.trim() && !audioBlob && !selectedFile)}
                                        className="absolute right-3 top-3 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl shadow-blue-600/20 disabled:opacity-20"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polyline points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10">
                            <div className="w-40 h-40 bg-blue-600/10 border border-blue-500/20 rounded-[3rem] flex items-center justify-center text-6xl mb-10 shadow-2xl shadow-blue-500/10 animate-pulse transition-all">📡</div>
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-6">Signals Hub</h2>
                            <p className="max-w-md text-slate-500 text-sm font-bold leading-relaxed uppercase tracking-widest">
                                Establish secure link with an operative to begin tactical coordination.
                            </p>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Search Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1001] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setIsSearchOpen(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-white/5 rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="p-10 border-b border-white/5">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-2">Biometric Search</h3>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Querying Operative Database</p>
                            </div>
                            <div className="p-10">
                                <div className="relative mb-8">
                                    <input type="text" placeholder="NAME OR SERIAL NUMBER..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} className="w-full h-16 bg-slate-950 border-2 border-white/5 rounded-2xl px-8 text-sm font-black text-white placeholder:text-slate-700 focus:border-blue-500 transition-all outline-none italic" autoFocus />
                                    <div className="absolute right-6 top-5 text-blue-500">
                                        {isSearching ? <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>}
                                    </div>
                                </div>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {searchResults.map(u => (
                                        <button key={u._id} onClick={() => startNewThread(u)} className="w-full flex items-center gap-5 p-5 rounded-[2rem] bg-slate-950/50 hover:bg-blue-600 transition-all border border-white/5 hover:border-blue-400 group text-left">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 font-black group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                                {u.profilePicture ? <img src={u.profilePicture} className="w-full h-full object-cover rounded-2xl" /> : u.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-white uppercase italic text-sm group-hover:text-white transition-colors">{u.name}</p>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-100 transition-colors">{u.role}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

