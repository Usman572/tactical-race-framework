import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRaces } from "../../context/RaceContext";
import { API_BASE_URL } from "../../config/api";

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 pb-4 flex justify-between items-center">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-90 text-xl font-light">✕</button>
                </div>
                <div className="p-8 pt-4">
                    {children}
                </div>
                {footer && (
                    <div className="p-8 pt-0 flex flex-col gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
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
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-4xl mx-auto py-20 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-800">{error}</h2>
            <Link to={error.includes("login") ? "/login" : "/"} className="text-blue-600 mt-4 inline-block hover:underline">
                {error.includes("login") ? "Go to Login" : "Return Home"}
            </Link>
        </div>
    );

    if (!profileUser && !isLoading) return (
        <div className="max-w-4xl mx-auto py-20 text-center">
            <h2 className="text-2xl font-bold text-slate-800">User not found</h2>
            <Link to="/" className="text-blue-600 mt-4 inline-block hover:underline">Return Home</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            {/* Profile Header */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group/photo">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-blue-500/20 uppercase">
                            {profileUser.profilePicture ? (
                                <img src={profileUser.profilePicture} alt={profileUser.name} className="w-full h-full object-cover" />
                            ) : (
                                profileUser.name?.substring(0, 2)
                            )}
                        </div>
                        {currentUser?.id === profileUser._id && (
                            <button
                                onClick={handleUploadPhoto}
                                className="absolute inset-0 bg-black/40 text-white text-[10px] font-bold opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-full"
                            >
                                📷 <span>CHANGE</span>
                            </button>
                        )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">{profileUser.name}</h1>
                        <p className="text-slate-500 font-medium mb-4">{profileUser.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {profileUser.role === 'admin' ? (
                                <span className="px-4 py-1.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-[0.2em] border border-red-600 shadow-lg shadow-red-600/20 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                    Elite Admin
                                </span>
                            ) : (
                                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
                                    🛡️ {profileUser.faction || 'Neutral'}
                                </span>
                            )}
                            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-wider border border-blue-700 shadow-lg shadow-blue-500/20">
                                LVL {profileUser.level || 1}
                            </span>
                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100">
                                ✨ {profileUser.xp || 0} XP
                            </span>
                            <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
                                🏁 {joinedRaces.length} Missions
                            </span>
                            <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-100">
                                🏆 {profileUser.stats?.wins || 0} Wins
                            </span>
                            {currentUser && currentUser.id === profileUser._id && (!profileUser.faction || profileUser.faction === 'None') && (
                                <button
                                    onClick={handleJoinFaction}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:rotate-2 transition-all shadow-xl active:scale-95 ml-2"
                                >
                                    Join Faction
                                </button>
                            )}
                            {currentUser && currentUser.id !== profileUser._id && (
                                <button
                                    onClick={handleSendMessage}
                                    className="px-4 py-1.5 bg-white text-slate-900 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95 ml-auto"
                                >
                                    💬 Message
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Section */}
            <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-2 h-7 bg-blue-600 rounded-sm"></span>
                    Race Activity
                </h2>

                {joinedRaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {joinedRaces.map(race => (
                            <Link
                                key={race._id}
                                to={`/races/${race._id}`}
                                className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{race.name}</h3>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
                                        {race.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5">📅 {new Date(race.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1.5">📍 {race.location}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                        <p className="text-slate-400 font-medium italic">This user hasn't joined any races yet.</p>
                    </div>
                )}
            </section>

            {/* Premium Modal Implementation */}
            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                footer={
                    modal.type === 'alert' ? (
                        <button onClick={closeModal} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95">Got it</button>
                    ) : modal.type === 'choice' ? (
                        <>
                            {modal.title === 'Select Faction' ? (
                                <div className="grid grid-cols-2 gap-3 mb-4 w-full">
                                    {['Cyber Shadows', 'The Vanguard', 'Neon Pulse', 'Void Runners'].map(f => (
                                        <button 
                                            key={f}
                                            onClick={() => { closeModal(); modal.callback(f); }} 
                                            className="py-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all font-black text-[10px] uppercase tracking-widest text-slate-800"
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => { closeModal(); modal.callback('system'); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2">📁 Choose from System</button>
                                    <button onClick={() => { closeModal(); modal.callback('url'); }} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95 border border-slate-200 flex items-center justify-center gap-2">🔗 Use Image URL</button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex gap-3">
                            <button onClick={closeModal} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
                            <button onClick={() => { closeModal(); modal.callback(modal.inputValue); }} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95">Confirm</button>
                        </div>
                    )
                }
            >
                {modal.type === 'alert' ? (
                    <p className="text-slate-600 leading-relaxed">{modal.message}</p>
                ) : modal.type === 'choice' ? (
                    <p className="text-slate-600 leading-relaxed">{modal.message}</p>
                ) : modal.type === 'message' ? (
                    <div className="space-y-4">
                        <p className="text-slate-600 font-medium">{modal.message}</p>
                        <textarea
                            value={modal.inputValue}
                            onChange={(e) => setModal(prev => ({ ...prev, inputValue: e.target.value }))}
                            className="w-full h-32 p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-0 transition-all resize-none text-slate-700 placeholder:text-slate-300 bg-slate-50"
                            placeholder="Type your message here..."
                        />
                    </div>
                ) : modal.type === 'url' ? (
                    <div className="space-y-4">
                        <p className="text-slate-600 font-medium">{modal.message}</p>
                        <input
                            type="text"
                            value={modal.inputValue}
                            onChange={(e) => setModal(prev => ({ ...prev, inputValue: e.target.value }))}
                            className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-0 transition-all text-slate-700 placeholder:text-slate-300 bg-slate-50 font-mono text-sm"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
