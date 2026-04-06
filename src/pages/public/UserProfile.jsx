import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRaces } from "../../context/RaceContext";
import { API_BASE_URL } from "../../config/api";
import { motion, AnimatePresence } from "framer-motion";

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-[var(--header-bg)] rounded-[2.5rem] w-full max-w-md shadow-2xl border border-[var(--border-main)] overflow-hidden relative z-10"
                    >
                        <div className="p-8 pb-4 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight uppercase italic">{title}</h3>
                            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--glass-bg)] text-[var(--text-main)] opacity-40 hover:opacity-100 transition-all active:scale-90 text-xl font-light">✕</button>
                        </div>
                        <div className="p-8 pt-4 text-[var(--text-main)]">
                            {children}
                        </div>
                        {footer && (
                            <div className="p-8 pt-0 flex flex-col gap-3">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default function UserProfile() {
    const { id } = useParams();
    const { user: currentUser, updateUser } = useAuth();
    const { races } = useRaces();
    const [profileUser, setProfileUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'alert', // 'message', 'choice', 'url', 'alert'
        title: '',
        message: '',
        inputValue: '',
        callback: null
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchUserProfile();
    }, [id]);

    const fetchUserProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${id}`);
            const data = await response.json();
            if (response.ok) {
                setProfileUser(data);
            } else {
                setError(data.message || "Failed to fetch profile");
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setError("Network error. Please check if the server is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const showModal = (config) => {
        setModal({
            isOpen: true,
            type: config.type || 'alert',
            title: config.title || 'Notification',
            message: config.message || '',
            inputValue: config.inputValue || '',
            callback: config.callback || null
        });
    };

    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    const handleSendMessage = async () => {
        showModal({
            type: 'message',
            title: `Message ${profileUser.name}`,
            message: `Send a direct message to ${profileUser.name}:`,
            inputValue: `Hello ${profileUser.name}, we need more information regarding your participation.`,
            callback: async (val) => {
                if (!val) return;
                try {
                    const res = await fetch(`${API_BASE_URL}/api/notifications`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentUser?.token}`
                        },
                        body: JSON.stringify({
                            recipient: profileUser._id,
                            message: val
                        })
                    });
                    if (res.ok) {
                        showModal({ title: 'Success', message: 'Message sent successfully!' });
                    } else {
                        showModal({ title: 'Error', message: 'Failed to send message.' });
                    }
                } catch (err) {
                    console.error(err);
                    showModal({ title: 'Error', message: 'Error sending message.' });
                }
            }
        });
    };

    const handleUploadPhoto = () => {
        showModal({
            type: 'choice',
            title: 'Update Photo',
            message: 'Change your profile picture. How would you like to provide the image?',
            callback: (choice) => {
                if (choice === 'system') {
                    fileInputRef.current.click();
                } else if (choice === 'url') {
                    showModal({
                        type: 'url',
                        title: 'External URL',
                        message: 'Paste a direct link to your image below:',
                        inputValue: profileUser.profilePicture,
                        callback: async (url) => {
                            if (!url) return;
                            try {
                                const res = await fetch(`${API_BASE_URL}/api/users/${profileUser._id}`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${currentUser?.token}`
                                    },
                                    body: JSON.stringify({ profilePicture: url })
                                });

                                if (res.ok) {
                                    const updatedUser = await res.json();
                                    setProfileUser(updatedUser);
                                    if (currentUser?.id === updatedUser._id) {
                                        updateUser(updatedUser);
                                    }
                                    showModal({ title: 'All set!', message: 'Your profile picture has been updated.' });
                                } else {
                                    showModal({ title: 'Failed', message: 'Could not update profile picture.' });
                                }
                            } catch (err) {
                                console.error(err);
                                showModal({ title: 'Error', message: 'Something went wrong while updating.' });
                            }
                        }
                    });
                }
            }
        });
    };

    const handleJoinFaction = () => {
        showModal({
            type: 'choice',
            title: 'Select Faction',
            message: 'Align yourself with one of the major operative syndicates. This will affect your standings in the Global Leaderboard.',
            callback: async (faction) => {
                if (faction === 'system' || faction === 'url') return;
                try {
                    const res = await fetch(`${API_BASE_URL}/api/users/${profileUser._id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentUser?.token}`
                        },
                        body: JSON.stringify({ faction })
                    });

                    if (res.ok) {
                        const updatedUser = await res.json();
                        setProfileUser(updatedUser);
                        if (currentUser?.id === updatedUser._id) {
                            updateUser(updatedUser);
                        }
                        showModal({ title: 'Welcome Operative', message: `You have successfully joined the ${faction} syndicate.` });
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const res = await fetch(`${API_BASE_URL}/api/users/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser?.token}`
                },
                body: formData
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setProfileUser(updatedUser);
                if (currentUser?.id === updatedUser._id) {
                    updateUser(updatedUser);
                }
                showModal({ title: 'Success!', message: 'Your photo was uploaded successfully!' });
            } else {
                const data = await res.json();
                showModal({ title: 'Upload Failed', message: data.message || "Could not upload photo." });
            }
        } catch (err) {
            console.error(err);
            showModal({ title: 'Error', message: 'Network error during upload.' });
        }
    };

    const joinedRaces = races.filter(race =>
        race.participants?.some(p => (typeof p === 'object' ? p._id : p) === profileUser?._id)
    );

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-4xl mx-auto py-20 text-center text-[var(--text-main)]">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold">{error}</h2>
            <Link to={error.includes("login") ? "/login" : "/"} className="text-blue-500 mt-4 inline-block hover:underline">
                {error.includes("login") ? "Go to Login" : "Return Home"}
            </Link>
        </div>
    );

    if (!profileUser && !isLoading) return (
        <div className="max-w-4xl mx-auto py-20 text-center text-[var(--text-main)]">
            <h2 className="text-2xl font-bold">User not found</h2>
            <Link to="/" className="text-blue-500 mt-4 inline-block hover:underline">Return Home</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 text-[var(--text-main)]">
            {/* Profile Header */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-8 border border-[var(--border-main)] shadow-xl mb-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative group/photo">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl uppercase border-4 border-[var(--bg-main)]"
                        >
                            {profileUser.profilePicture ? (
                                <img src={profileUser.profilePicture} alt={profileUser.name} className="w-full h-full object-cover" />
                            ) : (
                                profileUser.name?.substring(0, 2)
                            )}
                        </motion.div>
                        {currentUser?.id === profileUser._id && (
                            <button
                                onClick={handleUploadPhoto}
                                className="absolute inset-0 bg-black/60 text-white text-[10px] font-black opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-full backdrop-blur-sm"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                <span>UPDATE</span>
                            </button>
                        )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                            <h1 className="text-4xl font-black tracking-tight uppercase italic">{profileUser.name}</h1>
                            {profileUser.role === 'admin' ? (
                                <span className="px-3 py-1 bg-red-600/10 text-red-500 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-red-500/20 shadow-glow-primary animate-pulse-soft">
                                    Admin Level
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                                    Operator
                                </span>
                            )}
                        </div>
                        <p className="opacity-40 font-bold mb-6 text-sm">{profileUser.email}</p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <div className="px-4 py-2 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)] flex flex-col">
                                <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Level</span>
                                <span className="text-sm font-black italic uppercase">LVL {profileUser.level || 1}</span>
                            </div>
                            <div className="px-4 py-2 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)] flex flex-col">
                                <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Accumulated</span>
                                <span className="text-sm font-black tabular-nums italic text-blue-500">{profileUser.xp || 0} XP</span>
                            </div>
                            <div className="px-4 py-2 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)] flex flex-col">
                                <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Syndicate</span>
                                <span className="text-sm font-black italic uppercase text-indigo-500">{profileUser.faction || 'Neutral'}</span>
                            </div>
                            <div className="px-4 py-2 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)] flex flex-col">
                                <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Victories</span>
                                <span className="text-sm font-black tabular-nums italic text-green-500">{profileUser.stats?.wins || 0} Wins</span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
                            {currentUser && currentUser.id === profileUser._id && (!profileUser.faction || profileUser.faction === 'None') && (
                                <button
                                    onClick={handleJoinFaction}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-glow-primary active:scale-95"
                                >
                                    Join Syndicate
                                </button>
                            )}
                            {currentUser && currentUser.id !== profileUser._id && (
                                <button
                                    onClick={handleSendMessage}
                                    className="px-6 py-3 bg-[var(--bg-main)] text-[var(--text-main)] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--border-main)] hover:bg-[var(--glass-bg)] transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
                                    Transmit Message
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Activity Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Mission Log</h2>
                </div>

                {joinedRaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {joinedRaces.map((race, index) => (
                            <motion.div
                                key={race._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (index * 0.1) }}
                            >
                                <Link
                                    to={`/races/${race._id}`}
                                    className="group block bg-[var(--glass-bg)] p-6 rounded-2xl border border-[var(--border-main)] hover:border-blue-500/50 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-blue-600/10 transition-colors" />
                                    
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <h3 className="font-black text-lg group-hover:text-blue-500 transition-colors uppercase italic">{race.name}</h3>
                                        <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-white/10 ${
                                            race.type === 'Sprint' ? 'bg-orange-600 text-white' :
                                            race.type === 'Endurance' ? 'bg-indigo-600 text-white' :
                                            'bg-slate-600 text-white'
                                        }`}>
                                            {race.type}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2 text-[10px] font-bold opacity-40 uppercase tracking-widest relative z-10">
                                        <span className="flex items-center gap-2">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                            {new Date(race.date).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                            {race.location}
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[var(--glass-bg)] border-2 border-dashed border-[var(--border-main)] rounded-3xl p-16 text-center opacity-40">
                        <p className="font-black italic uppercase text-sm tracking-widest">Logs currently encrypted or empty.</p>
                    </div>
                )}
            </motion.section>

            {/* Premium Modal Implementation */}
            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                footer={
                    modal.type === 'alert' ? (
                        <button onClick={closeModal} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-glow-primary active:scale-95">Acknowledge</button>
                    ) : modal.type === 'choice' ? (
                        <>
                            {modal.title === 'Select Faction' ? (
                                <div className="grid grid-cols-2 gap-3 mb-4 w-full">
                                    {['Cyber Shadows', 'The Vanguard', 'Neon Pulse', 'Void Runners'].map(f => (
                                        <button 
                                            key={f}
                                            onClick={() => { closeModal(); modal.callback(f); }} 
                                            className={`py-6 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 ${
                                                f === 'Cyber Shadows' ? 'border-purple-500/20 bg-purple-500/5 text-purple-500 hover:border-purple-500' :
                                                f === 'The Vanguard' ? 'border-blue-500/20 bg-blue-500/5 text-blue-500 hover:border-blue-500' :
                                                f === 'Neon Pulse' ? 'border-green-500/20 bg-green-500/5 text-green-500 hover:border-green-500' :
                                                'border-orange-500/20 bg-orange-500/5 text-orange-500 hover:border-orange-500'
                                            }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => { closeModal(); modal.callback('system'); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-glow-primary active:scale-95 flex items-center justify-center gap-2">📁 System Storage</button>
                                    <button onClick={() => { closeModal(); modal.callback('url'); }} className="w-full py-4 bg-[var(--bg-main)] text-[var(--text-main)] rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[var(--glass-bg)] transition-all active:scale-95 border border-[var(--border-main)] flex items-center justify-center gap-2">🔗 External Link</button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex gap-3">
                            <button onClick={closeModal} className="flex-1 py-4 bg-[var(--bg-main)] text-[var(--text-main)] rounded-2xl font-black uppercase tracking-widest text-[10px] border border-[var(--border-main)] hover:bg-[var(--glass-bg)] transition-all active:scale-95">Discard</button>
                            <button onClick={() => { closeModal(); modal.callback(modal.inputValue); }} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-glow-primary active:scale-95">Authorize</button>
                        </div>
                    )
                }
            >
                {modal.type === 'alert' ? (
                    <p className="opacity-60 leading-relaxed font-medium">{modal.message}</p>
                ) : modal.type === 'choice' ? (
                    <p className="opacity-60 leading-relaxed font-medium">{modal.message}</p>
                ) : modal.type === 'message' ? (
                    <div className="space-y-4">
                        <p className="opacity-60 font-bold uppercase text-[10px] tracking-widest">{modal.message}</p>
                        <textarea
                            value={modal.inputValue}
                            onChange={(e) => setModal(prev => ({ ...prev, inputValue: e.target.value }))}
                            className="w-full h-32 p-4 rounded-2xl border-2 border-[var(--border-main)] bg-[var(--bg-main)] focus:border-blue-500 focus:ring-0 transition-all resize-none text-[var(--text-main)] placeholder:opacity-20 font-medium"
                            placeholder="Type transmission here..."
                        />
                    </div>
                ) : modal.type === 'url' ? (
                    <div className="space-y-4">
                        <p className="opacity-60 font-bold uppercase text-[10px] tracking-widest">{modal.message}</p>
                        <input
                            type="text"
                            value={modal.inputValue}
                            onChange={(e) => setModal(prev => ({ ...prev, inputValue: e.target.value }))}
                            className="w-full p-4 rounded-2xl border-2 border-[var(--border-main)] bg-[var(--bg-main)] focus:border-blue-500 focus:ring-0 transition-all text-[var(--text-main)] placeholder:opacity-20 font-mono text-xs"
                            placeholder="https://quantum-net.tech/static/img/id.png"
                        />
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
