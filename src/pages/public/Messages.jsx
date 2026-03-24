import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useRaces } from "../../context/RaceContext";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import { motion, AnimatePresence } from "framer-motion";

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
    const [mediaStream, setMediaStream] = useState(null);
    const [recorder, setRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState(null); // 'Image' | 'Video'
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const { user } = useAuth();
    const socket = useSocket();
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
            return () => socket.off('new_notification', handleNewMsg);
        }
    }, [socket]);

    // Scroll to bottom when conversation changes or new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedThread, messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.status === 401) {
                // Let the global AuthContext or RaceContext handle session clearing
                // but we should at least not try to process non-array data
                setMessages([]);
                return;
            }
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);

            // Auto-select first thread if available and none selected
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
        if (!activeContact || !window.confirm(`Are you sure you want to delete the entire conversation with ${activeContact.senderName}?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications/thread/${activeContact.senderId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                setMessages(prev => prev.filter(m => {
                    const sid = m.sender?._id || m.sender;
                    const rid = m.recipient?._id || m.recipient;
                    // Delete if the other person is either the sender or the recipient
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
            // Filter out self and focus on users
            setSearchResults(data.users.filter(u => u._id !== user.id));
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const startNewThread = (u) => {
        const sid = u._id;
        // Check if thread already exists
        const existing = threads.find(t => t.senderId === sid);
        if (existing) {
            setSelectedThread(sid);
        } else {
            // Create a virtual thread for the UI
            const newVirtualThread = {
                senderId: sid,
                senderName: u.name,
                senderAvatar: u.profilePicture,
                senderRank: u.rank || 'Rookie',
                lastMessage: "Start a conversation...",
                lastDate: new Date().toISOString(),
                unreadCount: 0,
                messages: [],
                lastRaceId: null
            };
            setMessages(prev => [{
                _id: `virtual-${sid}`,
                sender: u,
                message: "New transmission initialized...",
                type: 'Message',
                read: true,
                createdAt: new Date().toISOString()
            }, ...prev]);
            setSelectedThread(sid);
        }
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    const markAllAsRead = async () => {
        try {
            await Promise.all(messages.filter(m => !m.read).map(m =>
                fetch(`${API_BASE_URL}/api/notifications/${m._id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${user.token}` }
                })
            ));
            setMessages(prev => prev.map(m => ({ ...m, read: true })));
        } catch (err) {
            console.error(err);
        }
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
        const thread = groupIntoThreads(messages).find(t => t.senderId === selectedThread);
        if (!thread) return;

        setIsSending(true);
        try {
            const formData = new FormData();
            formData.append('recipient', thread.senderId);
            if (thread.lastRaceId) {
                formData.append('raceId', thread.lastRaceId);
            }

            if (audioBlob) {
                formData.append('media', audioBlob, 'voice-note.webm');
            } else if (selectedFile) {
                formData.append('media', selectedFile);
            }

            if (replyText.trim()) {
                formData.append('message', replyText);
            }

            const res = await fetch(`${API_BASE_URL}/api/notifications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                body: formData
            });

            if (res.ok) {
                const newMsg = await res.json();
                setMessages(prev => [newMsg, ...prev]);
                setReplyText("");
                setAudioBlob(null);
                setSelectedFile(null);
                setFileType(null);
                // Real-time update will handle the rest
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
            setMediaStream(stream);
            setIsRecording(true);
        } catch (err) {
            console.error("Mic access denied:", err);
            alert("Microphone access is required for voice notes.");
        }
    };

    const stopRecording = () => {
        if (recorder && isRecording) {
            recorder.stop();
            setIsRecording(false);
        }
    };

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFileType(type);
            setAudioBlob(null);
        }
    };

    const groupIntoThreads = (msgs) => {
        if (!Array.isArray(msgs)) return [];
        const groups = {};
        msgs.forEach(m => {
            const senderId = m.sender?._id || m.sender;
            const recipientId = m.recipient?._id || m.recipient;

            // Determine the "other" person
            const isSentByMe = senderId === user.id;
            const otherId = isSentByMe ? recipientId : senderId;
            const otherUser = isSentByMe ? m.recipient : m.sender;

            if (!otherId) return;

            if (!groups[otherId]) {
                groups[otherId] = {
                    senderId: otherId,
                    senderName: otherUser?.name || 'Operative',
                    senderAvatar: otherUser?.profilePicture,
                    senderRank: otherUser?.rank || 'Rookie', // Added senderRank
                    lastMessage: m.message,
                    lastDate: m.createdAt,
                    unreadCount: 0,
                    messages: [],
                    lastRaceId: m.race?._id || m.race
                };
            }
            groups[otherId].messages.push(m);
            // Only count as unread if I am the recipient
            if (!m.read && !isSentByMe) {
                groups[otherId].unreadCount++;
            }
        });
        return Object.values(groups).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
    };

    const threads = groupIntoThreads(messages);
    const activeMessages = threads.find(t => t.senderId === selectedThread)?.messages.slice().reverse() || [];
    const activeContact = threads.find(t => t.senderId === selectedThread);

    const handleAction = async (msgId, actionId, type) => {
        let res;
        if (type === 'approve') res = await approveRequest(actionId);
        else res = await rejectRequest(actionId);

        if (res.success) markAsRead(msgId);
    };

    if (isLoading) return (
        <div className="h-[calc(100vh-180px)] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-160px)] max-w-7xl mx-auto flex bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden mb-10">
            {/* Sidebar: Conversation List */}
            <div className="w-80 md:w-96 border-r border-slate-100 flex flex-col bg-slate-50/30">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-1">Signals</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Operatives</p>
                        </div>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>
                    </div>

                    <button
                        onClick={markAllAsRead}
                        className="w-full py-2 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/50 transition-all"
                    >
                        Mark All as Read
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {threads.length === 0 ? (
                        <div className="p-10 text-center opacity-30 italic text-sm">No transmissions found</div>
                    ) : (
                        threads.map((thread) => (
                            <button
                                key={thread.senderId}
                                onClick={() => setSelectedThread(thread.senderId)}
                                className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all mb-1 ${selectedThread === thread.senderId ? 'bg-white shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/10' : 'hover:bg-white/50'}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xl border border-blue-200">
                                        {thread.senderAvatar ? <img src={thread.senderAvatar} className="w-full h-full object-cover rounded-2xl" /> : thread.senderName[0]}
                                    </div>
                                    {thread.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full ring-4 ring-slate-50">
                                            {thread.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="font-black text-sm text-slate-900 truncate">{thread.senderName}</span>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                            {new Date(thread.lastDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 truncate font-medium">{thread.lastMessage}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Area: Chat Window */}
            <div className="flex-1 flex flex-col bg-white">
                {activeContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
                            <div className="flex items-center gap-4">
                                <Link to={`/profile/${activeContact.senderId}`} className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black border border-blue-200 overflow-hidden hover:scale-105 transition-transform">
                                    {activeContact.senderAvatar ? <img src={activeContact.senderAvatar} className="w-full h-full object-cover" /> : activeContact.senderName[0]}
                                </Link>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-slate-900 leading-none">{activeContact.senderName}</h3>
                                        <span className="px-2 py-0.5 bg-blue-600/10 text-blue-600 rounded text-[8px] font-black uppercase tracking-widest border border-blue-500/10">
                                            {activeContact.senderRank}
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mt-1">Status: Operational</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeleteThread}
                                    className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all active:scale-95 border border-transparent hover:border-red-100"
                                    title="Delete Conversation"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5 transition-all">
                            <AnimatePresence mode="popLayout">
                                {activeMessages.map((msg, i) => {
                                    const isMe = (msg.sender?._id || msg.sender) === user.id;
                                    return (
                                        <motion.div
                                            key={msg._id}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className={`mb-6 flex flex-col ${isMe ? 'items-end' : 'items-start'} group/msg`}
                                        >
                                            <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                                <div className={`p-5 rounded-3xl shadow-sm border ${isMe ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' : (!msg.read ? 'bg-slate-800 text-white border-slate-700 shadow-slate-200' : 'bg-white text-slate-700 border-slate-100')}`}>
                                                    {msg.type === 'Image' && msg.mediaUrl && (
                                                        <div className="mb-3 overflow-hidden rounded-2xl border border-white/10 group-hover:scale-[1.02] transition-transform">
                                                            <img src={`${API_BASE_URL}${msg.mediaUrl}`} alt="Attachment" className="max-w-full h-auto object-cover max-h-80" />
                                                        </div>
                                                    )}

                                                    {msg.type === 'Video' && msg.mediaUrl && (
                                                        <div className="mb-3 overflow-hidden rounded-2xl border border-white/10">
                                                            <video src={`${API_BASE_URL}${msg.mediaUrl}`} controls className="max-w-full max-h-80" />
                                                        </div>
                                                    )}

                                                    {msg.type === 'Audio' && msg.mediaUrl && (
                                                        <div className="mb-3 p-3 bg-black/5 rounded-2xl flex items-center gap-4 min-w-[240px]">
                                                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                                            </div>
                                                            <audio src={`${API_BASE_URL}${msg.mediaUrl}`} controls className="h-8 flex-1" />
                                                        </div>
                                                    )}

                                                    <p className="text-[13px] font-medium leading-relaxed">{msg.message}</p>

                                                    {msg.type === 'JoinRequest' && msg.joinRequest && (
                                                        <div className={`mt-4 p-4 rounded-2xl border ${!msg.read ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-100'}`}>
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <span className="text-xl">🏁</span>
                                                                <div>
                                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${!msg.read ? 'text-blue-100' : 'text-slate-400'}`}>Operational Access Request</p>
                                                                    <Link to={`/races/${msg.race?._id || msg.race}`} className={`text-xs font-black uppercase tracking-tight hover:underline ${!msg.read ? 'text-white' : 'text-blue-600'}`}>
                                                                        {msg.race?.name || 'View Objective'}
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                            {!msg.read ? (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleAction(msg._id, msg.joinRequest._id || msg.joinRequest, 'approve')}
                                                                        className="flex-1 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl shadow-white/10"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAction(msg._id, msg.joinRequest._id || msg.joinRequest, 'reject')}
                                                                        className="flex-1 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all border border-blue-400/30"
                                                                    >
                                                                        Deny
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-1">
                                                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Entry Cleared</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => deleteMessage(msg._id)}
                                                    className="opacity-0 group-hover/msg:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                                                    title="Delete Signal"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                </button>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2 px-4">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                            {selectedFile && (
                                <div className="max-w-5xl mx-auto mb-4 p-3 bg-blue-50 rounded-2xl flex items-center justify-between border border-blue-100 italic text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                    <span>Attachment: {selectedFile.name} ({fileType})</span>
                                    <button onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700">Cancel</button>
                                </div>
                            )}
                            {audioBlob && (
                                <div className="max-w-5xl mx-auto mb-4 p-3 bg-blue-50 rounded-2xl flex items-center justify-between border border-blue-100 italic text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                    <span>Voice Note Ready</span>
                                    <button onClick={() => setAudioBlob(null)} className="text-red-500 hover:text-red-700">Discard</button>
                                </div>
                            )}

                            <div className="flex items-center gap-3 max-w-5xl mx-auto">
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileSelect(e, 'Image')}
                                    />
                                    <input
                                        type="file"
                                        ref={videoInputRef}
                                        className="hidden"
                                        accept="video/*"
                                        onChange={(e) => handleFileSelect(e, 'Video')}
                                    />

                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100" title="Link Image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                    </button>
                                    <button
                                        onClick={() => videoInputRef.current.click()}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100" title="Link Video"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                    </button>
                                    <button
                                        onMouseDown={startRecording}
                                        onMouseUp={stopRecording}
                                        onMouseLeave={stopRecording}
                                        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all border ${isRecording ? 'bg-red-500 text-white animate-pulse border-red-600' : 'bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-slate-100'}`}
                                        title="Hold to Record Voice"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                    </button>
                                </div>

                                <div className="flex-1 relative group">
                                    <input
                                        type="text"
                                        placeholder={isRecording ? "Recording Audio..." : "Transmit signal..."}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                        className={`w-full h-14 pl-6 pr-14 rounded-2xl border-2 border-transparent transition-all text-sm font-medium placeholder:text-slate-300 ${isRecording ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700 focus:border-blue-600/30 focus:bg-white'}`}
                                        disabled={isRecording}
                                    />
                                    <button
                                        onClick={handleSendReply}
                                        disabled={isSending || (!replyText.trim() && !audioBlob && !selectedFile)}
                                        className="absolute right-2 top-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all shadow-lg shadow-blue-500/20 active:scale-90 disabled:opacity-30"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polyline points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-32 h-32 bg-blue-50 rounded-[3rem] flex items-center justify-center text-5xl mb-8 animate-bounce transition-all duration-1000">📨</div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4 italic">Signal Comms Hub</h2>
                        <p className="max-w-md text-slate-400 text-sm font-medium leading-relaxed">
                            Select an operative from the sidebar to establish a secure link and review incoming assignments.
                        </p>
                    </div>
                )}
            </div>

            {/* User Search Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1001] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-1">Establish Link</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Search operative database</p>
                            </div>

                            <div className="p-8">
                                <div className="relative mb-6">
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full h-14 pl-6 pr-14 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:bg-white transition-all text-sm font-bold text-slate-700"
                                        autoFocus
                                    />
                                    <div className="absolute right-6 top-4 text-slate-300">
                                        {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>}
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {searchResults.map(u => (
                                        <button
                                            key={u._id}
                                            onClick={() => startNewThread(u)}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100 text-left"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black border border-blue-200">
                                                {u.profilePicture ? <img src={u.profilePicture} className="w-full h-full object-cover" /> : u.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm">{u.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.role}</p>
                                            </div>
                                        </button>
                                    ))}
                                    {searchQuery.length > 1 && searchResults.length === 0 && !isSearching && (
                                        <div className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">No operatives found</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
