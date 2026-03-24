import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config/api";
import { useRaces } from "../context/RaceContext";

const RaceCard = ({ race, user, onDelete }) => {
    const [openDropdown, setOpenDropdown] = useState(false);

    // Close dropdown on click outside
    useEffect(() => {
        const close = () => setOpenDropdown(false);
        if (openDropdown) {
            window.addEventListener('click', close);
        }
        return () => window.removeEventListener('click', close);
    }, [openDropdown]);

    const handleRequestDetails = async (recipientId, raceId, raceName) => {
        if (!user) {
            alert("Please login to message participants.");
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    recipient: recipientId,
                    raceId: raceId,
                    message: `${user.name} is asking for more details for race: ${raceName}`
                })
            });
            if (res.ok) {
                alert("Request sent successfully!");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const isDeployed = race.participants?.some(p => (typeof p === 'object' ? p._id : p) === user?.id);
    const canDelete = user?.role === 'admin' || (race.createdBy === user?.id || race.createdBy?._id === user?.id);

    // Calculate urgency
    const now = new Date();
    const raceDate = new Date(race.date);
    const hoursUntilStart = (raceDate - now) / (1000 * 60 * 60);
    const isUpcomingSoon = hoursUntilStart > 0 && hoursUntilStart <= 24; // Within 24 hours
    const isPast = hoursUntilStart <= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative border rounded-[2rem] p-6 transition-all duration-500 shadow-2xl flex flex-col justify-between h-full overflow-hidden ${isUpcomingSoon ? 'bg-orange-500/10 border-orange-500/50 hover:border-orange-500 hover:shadow-orange-500/20 backdrop-blur-xl' : 'glass-premium hover:border-blue-500/50 hover:shadow-blue-500/10'}`}
        >
            {/* Banner Image */}
            {race.bannerImage && (
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none transition-transform duration-700 group-hover:scale-110">
                    <img 
                        src={race.bannerImage} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/80 to-transparent"></div>
                </div>
            )}

            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-colors pointer-events-none ${isUpcomingSoon ? 'bg-orange-500/10 group-hover:bg-orange-500/20' : 'bg-blue-500/5 group-hover:bg-blue-500/10'}`}></div>

            <div className="relative z-10">
                {/* Header: Type & Status */}
                <div className="flex justify-between items-start mb-6 w-full gap-2">
                    <div className="flex gap-2 flex-wrap">
                        {race.sector && (
                            <span className="px-3 py-1 bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-white/10 rounded-lg flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                {race.sector}
                            </span>
                        )}
                        {isUpcomingSoon ? (
                            <span className="px-3 py-1 bg-orange-500/20 text-orange-500 text-[9px] font-black uppercase tracking-widest border border-orange-500/40 rounded-lg flex items-center gap-2 animate-pulse">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                Deployment Imminent
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest border border-blue-500/20 rounded-lg">
                                {race.type || 'Standard'} Spec
                            </span>
                        )}
                    </div>
                    
                    {canDelete && onDelete && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete(e, race._id);
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-500/20 shadow-sm"
                            title="Delete Engagement"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                    )}
                </div>

                {/* Title & Location */}
                <Link to={`/races/${race._id}`} className="block mb-6 group/title">
                    <h3 className={`text-2xl font-black tracking-tight leading-none mb-2 transition-colors ${isUpcomingSoon ? 'text-orange-500 group-hover/title:text-orange-400' : 'text-[var(--text-main)] group-hover/title:text-blue-500'}`}>
                        {race.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[var(--text-main)] opacity-60 font-bold text-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {race.location}
                    </div>
                </Link>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[var(--bg-main)] p-3 rounded-2xl border border-[var(--border-main)]">
                        <div className="text-[9px] font-black text-[var(--text-main)] opacity-40 uppercase tracking-[0.2em] mb-1">Schedule</div>
                        <div className={`text-sm font-black whitespace-nowrap ${isUpcomingSoon ? 'text-orange-500' : isPast ? 'text-slate-500' : 'text-[var(--text-main)] opacity-80'}`}>
                            {new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                    <div className="bg-[var(--bg-main)] p-3 rounded-2xl border border-[var(--border-main)]">
                        <div className="text-[9px] font-black text-[var(--text-main)] opacity-40 uppercase tracking-[0.2em] mb-1">Distance</div>
                        <div className="text-sm font-black text-[var(--text-main)] opacity-80">
                            {race.trackLength || '0'} <span className="text-blue-500">KM</span>
                        </div>
                    </div>
                </div>

                {/* Operatives Roster */}
                <div className="mb-8 relative">
                    <div className="text-[9px] font-black text-[var(--text-main)] opacity-40 uppercase tracking-[0.2em] mb-2">Active Operatives</div>
                    {race.participants?.length > 0 ? (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpenDropdown(!openDropdown);
                                }}
                                className="w-full flex items-center justify-between bg-[var(--bg-main)] text-[var(--text-main)] px-4 py-3 rounded-2xl border border-[var(--border-main)] font-black hover:border-blue-500 transition-all cursor-pointer shadow-sm active:scale-[0.98] group/btn"
                            >
                                <div className="flex -space-x-2">
                                    {race.participants.slice(0, 3).map((p, i) => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[var(--bg-main)] flex items-center justify-center text-[8px] text-white font-bold">
                                            {p.name ? p.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    ))}
                                    {race.participants.length > 3 && (
                                        <div className="w-6 h-6 rounded-full bg-[var(--header-bg)] border-2 border-[var(--bg-main)] flex items-center justify-center text-[8px] text-[var(--text-main)] font-bold">
                                            +{race.participants.length - 3}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-blue-500">{race.participants.length}</span>
                                    <svg className={`transition-transform duration-300 ${openDropdown ? 'rotate-180' : ''} opacity-40`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                            </button>

                            <AnimatePresence>
                                {openDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute left-0 mt-2 w-full bg-[var(--header-bg)] backdrop-blur-3xl border border-[var(--border-main)] rounded-2xl shadow-2xl z-50 p-2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    >
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                            {race.participants.map((p) => (
                                                <div key={p._id} className="flex items-center justify-between p-2 hover:bg-blue-500/10 rounded-xl group/item transition-all mb-1">
                                                    <Link
                                                        to={`/profile/${p.slug || p._id}`}
                                                        className="flex items-center gap-3 text-[var(--text-main)] hover:text-blue-500 transition-colors truncate"
                                                    >
                                                        <span className="text-sm font-bold truncate">{p.name}</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleRequestDetails(p._id, race._id, race.name)}
                                                        className="w-8 h-8 shrink-0 flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)] opacity-40 rounded-lg hover:bg-blue-500 hover:text-white hover:opacity-100 transition-all"
                                                        title="Send Message"
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-[var(--text-main)] opacity-30 font-bold text-xs italic bg-[var(--bg-main)] px-4 py-3 rounded-2xl border border-dashed border-[var(--border-main)] text-center">
                            Awaiting initial operative
                        </div>
                    )}
                </div>
            </div>

            {/* Action Area */}
            <div className="relative z-10 pt-4 border-t border-[var(--border-main)]">
                {isDeployed ? (
                    <div className="w-full text-center px-4 py-3 bg-green-500/10 text-green-500 font-black rounded-2xl border border-green-500/20 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Deployed
                    </div>
                ) : (
                    <Link
                        to={`/races/${race._id}`}
                        className="w-full block text-center px-4 py-3 bg-[var(--text-main)] text-[var(--bg-main)] font-black rounded-2xl hover:bg-blue-600 hover:text-white hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] shadow-lg text-xs uppercase tracking-widest"
                    >
                        Register Engagement
                    </Link>
                )}
            </div>
        </motion.div>
    );
};

export default RaceCard;
