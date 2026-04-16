import { useParams, Link, useNavigate } from "react-router-dom";
import { useRaces } from "../../context/RaceContext";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CommsChannel from "../../components/CommsChannel";
import MissionCertificate from "../../components/MissionCertificate";
import FactionDominance from "../../components/FactionDominance";
import RegistrationModal from "../../components/RegistrationModal";

export default function RaceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getRaceById, requestToJoin, leaveRace, deleteRace, myRequests, isLoading: racesLoading } = useRaces();
    const { user } = useAuth();
    const [race, setRace] = useState(null);
    const [isRequesting, setIsRequesting] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLocalLoading, setIsLocalLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [requestResult, setRequestResult] = useState(null);

    useEffect(() => {
        const fetchRace = async () => {
            setIsLocalLoading(true);
            const res = await getRaceById(id);
            if (res.success) setRace(res.data);
            setIsLocalLoading(false);
        };
        fetchRace();
    }, [id]);

    const joined = race?.participants?.some(p => p._id === user?.id || p === user?.id);
    const hasPendingRequest = myRequests?.some(r => r.race?._id === id && r.status === 'Pending');
    const canManage = user?.role === 'admin' || (race?.createdBy === user?.id || race?.createdBy?._id === user?.id);
    const isFull = race?.maxParticipants && race?.participants?.length >= race?.maxParticipants;
    const deadline = race?.registrationDeadline ? new Date(race.registrationDeadline) : null;
    const isClosed = deadline && new Date() > deadline;

    if (isLocalLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-glow-primary"></div>
        </div>
    );

    if (!race) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
            <div className="text-center py-20 text-[var(--text-main)] font-black uppercase tracking-[0.4em] opacity-40 italic">
                ⚠️ Race Intel Not Found
            </div>
        </div>
    );

    const handleJoinRequest = async (payload) => {
        if (!user) return;
        setIsRequesting(true);
        const res = await requestToJoin(id, payload);
        setIsRequesting(false);
        setRequestResult(res);
        if (res.success) {
            const updated = await getRaceById(id);
            if (updated.success) setRace(updated.data);
        }
    };

    const handleLeave = async () => {
        if (window.confirm("Are you sure you want to leave this race?")) {
            setIsLeaving(true);
            const res = await leaveRace(id);
            if (!res.success) alert(res.message || "Failed to leave race.");
            setIsLeaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this race?")) {
            setIsDeleting(true);
            const res = await deleteRace(id);
            if (res.success) navigate("/");
            else {
                alert(res.message || "Failed to delete race.");
                setIsDeleting(false);
            }
        }
    };

    const slotsLeft = race.maxParticipants ? race.maxParticipants - (race.participants?.length || 0) : null;
    const capacityPct = race.maxParticipants ? Math.min(100, ((race.participants?.length || 0) / race.maxParticipants) * 100) : 0;

    const getJoinButtonLabel = () => {
        if (joined) return "✓ Mission Verified";
        if (hasPendingRequest) return "⌛ Pending Intel";
        if (isFull) return "🔴 Race Full";
        if (isClosed) return "⛔ Registration Closed";
        return "Request Deployment";
    };
    const joinDisabled = joined || hasPendingRequest || isFull || isClosed;

    return (
        <div className="bg-[var(--bg-main)] min-h-screen transition-colors duration-500 pb-20 relative overflow-hidden">
            <AnimatePresence>
                {showModal && (
                    <RegistrationModal
                        race={race}
                        onClose={() => { setShowModal(false); setRequestResult(null); }}
                        onSubmit={handleJoinRequest}
                        isSubmitting={isRequesting}
                        result={requestResult}
                    />
                )}
            </AnimatePresence>

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full animate-pulse-soft" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-600/5 blur-[150px] rounded-full animate-pulse-soft" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto py-12 px-4 sm:px-10 relative z-10"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Intel Column */}
                    <div className="lg:col-span-2 flex flex-col gap-10">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[var(--header-bg)] rounded-[3rem] shadow-2xl border border-[var(--border-main)] overflow-hidden backdrop-blur-3xl relative group"
                        >
                            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px]" />
                            <div className="p-8 sm:p-12 border-b border-[var(--border-main)] relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <div className="w-24 h-24 border-2 border-blue-600 rounded-full flex items-center justify-center animate-spin-slow">
                                        <div className="w-16 h-16 border-2 border-orange-500 rounded-full" />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mb-8">
                                    <motion.span 
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-glow-primary"
                                    >
                                        {race.type}
                                    </motion.span>
                                    {race.sector && (
                                        <span className="bg-[var(--bg-main)] text-blue-500 border border-blue-500/30 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] italic">
                                            🗺 {race.sector}
                                        </span>
                                    )}
                                    {isFull && <span className="bg-red-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-glow-primary">🔴 FULL</span>}
                                    {isClosed && !isFull && <span className="bg-amber-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-glow-primary">⛔ CLOSED</span>}
                                </div>

                                <h1 className="text-4xl sm:text-7xl font-black italic tracking-tighter text-[var(--text-main)] mb-6 uppercase leading-none">
                                    {race.name.split(' ').map((word, i) => (
                                        <span key={i} className={i % 2 === 1 ? 'text-blue-600' : ''}>{word} </span>
                                    ))}
                                </h1>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-[var(--text-main)] font-black uppercase tracking-[0.2em] text-[10px] bg-[var(--bg-main)]/40 p-6 rounded-[2rem] border border-[var(--border-main)] backdrop-blur-md">
                                    <div className="flex flex-col gap-1">
                                        <span className="opacity-30 text-[8px]">Location</span>
                                        <span className="italic">📍 {race.location}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="opacity-30 text-[8px]">Deployment</span>
                                        <span className="italic">📅 {new Date(race.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="opacity-30 text-[8px]">Course</span>
                                        <span className="italic text-blue-500">📏 {race.trackLength || '0'} KM</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="opacity-30 text-[8px]">Status</span>
                                        <span className="italic text-green-500">👥 {race.participants?.length || 0}{race.maxParticipants ? ` / ${race.maxParticipants}` : ''} OPS</span>
                                    </div>
                                </div>

                                {/* Capacity Bar */}
                                {race.maxParticipants && (
                                    <div className="mt-8">
                                        <div className="flex justify-between text-[9px] font-black opacity-40 text-[var(--text-main)] uppercase tracking-[0.3em] mb-3 italic">
                                            <span>Deployment Capacity</span>
                                            <span className={slotsLeft <= 2 ? 'text-red-500 opacity-100' : ''}>{slotsLeft <= 0 ? 'STATUS: FULL' : `${slotsLeft} SLOTS REMAINING`}</span>
                                        </div>
                                        <div className="h-2 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-main)]">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${capacityPct}%` }}
                                                transition={{ duration: 1.5, ease: "circOut" }}
                                                className={`h-full rounded-full ${isFull ? 'bg-red-600 shadow-glow-primary' : capacityPct > 75 ? 'bg-amber-500' : 'bg-blue-600 shadow-glow-primary'}`}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {race.linkedEvent && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-gradient-to-r from-red-600/20 via-blue-600/10 to-red-600/20 border-b border-[var(--border-main)] px-8 sm:px-12 py-6 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-3 h-3 rounded-full bg-red-600 animate-ping shadow-glow-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] italic mb-1">High-Stakes Event Active</span>
                                            <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight italic">{race.linkedEvent.title}</h3>
                                        </div>
                                    </div>
                                    {race.linkedEvent.type === 'XP_BOOST' && (
                                        <div className="bg-red-600/20 border border-red-500/30 px-5 py-2 rounded-full shadow-glow-primary">
                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">x{race.linkedEvent.multiplier} XP BOOST</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            <div className="p-8 sm:p-12 space-y-12">
                                {race.status === 'Completed' && joined && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                        <MissionCertificate race={race} user={user} />
                                    </motion.div>
                                )}

                                {race.sector && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                        <FactionDominance 
                                            participants={race.participants} 
                                            sectorName={race.sector} 
                                            userFaction={user?.faction} 
                                        />
                                    </motion.div>
                                )}

                                <div>
                                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-8 italic opacity-60">Deployed Operatives</h4>
                                    {race.participants?.length > 0 ? (
                                        <div className="flex flex-wrap gap-4">
                                            {race.participants.map((p, idx) => (
                                                <Link
                                                    key={idx}
                                                    to={`/profile/${p.slug || (typeof p === 'object' ? p._id : p)}`}
                                                    className="bg-[var(--bg-main)]/60 border border-[var(--border-main)] text-[var(--text-main)] px-5 py-3 rounded-2xl text-[10px] font-black italic uppercase hover:border-blue-500 hover:text-blue-500 transition-all flex items-center gap-3 shadow-xl backdrop-blur-md group/op active:scale-95"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center text-xs not-italic font-black border border-blue-500/30 group-hover/op:bg-blue-600 group-hover/op:text-white transition-colors">
                                                        {(typeof p === 'object' ? p.name : 'V').charAt(0)}
                                                    </div>
                                                    {typeof p === 'object' ? p.name : 'Operative'}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-[var(--bg-main)]/40 border border-dashed border-[var(--border-main)] p-12 rounded-[2.5rem] text-center">
                                            <p className="text-[var(--text-main)] opacity-30 italic font-black uppercase text-[10px] tracking-widest">Waiting for tactical deployment signal...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-6 pt-6">
                                    <button
                                        onClick={() => !joinDisabled && setShowModal(true)}
                                        disabled={joinDisabled}
                                        className={`px-10 sm:px-14 py-6 sm:py-7 rounded-[2rem] font-black text-[11px] sm:text-xs uppercase tracking-[0.4em] italic shadow-2xl transition-all w-full md:w-auto active:scale-95 relative overflow-hidden group/btn ${joined
                                            ? "bg-[var(--bg-main)] text-green-500 border border-green-500/30 cursor-default"
                                            : hasPendingRequest
                                                ? "bg-[var(--bg-main)] text-blue-500/40 border border-[var(--border-main)] cursor-default"
                                                : (isFull || isClosed)
                                                    ? "bg-[var(--bg-main)] text-red-500/40 border border-[var(--border-main)] cursor-not-allowed"
                                                    : "bg-blue-600 text-white hover:bg-black shadow-glow-primary hover:-translate-y-1"
                                            }`}
                                    >
                                        <span className="relative z-10">{getJoinButtonLabel()}</span>
                                        {!joinDisabled && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />}
                                    </button>

                                    {joined && (
                                        <Link
                                            to={`/races/${id}/hud`}
                                            className="px-10 sm:px-14 py-6 sm:py-7 bg-black text-white hover:bg-blue-700 rounded-[2rem] font-black text-[11px] sm:text-xs uppercase tracking-[0.4em] italic shadow-glow-primary hover:-translate-y-1 active:scale-95 transition-all text-center flex-1 md:flex-initial"
                                        >
                                            ⚡ Engage Live HUD
                                        </Link>
                                    )}

                                    {canManage && (
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="px-8 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] italic border-2 border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white transition-all w-full md:w-auto disabled:opacity-50"
                                        >
                                            {isDeleting ? "Aborting..." : "🗑️ Terminate mission"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {joined && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:hidden">
                                <CommsChannel raceId={id} />
                            </motion.div>
                        )}
                    </div>

                    {/* Secondary Intel Column (Sidebar) */}
                    <div className="flex flex-col gap-10">
                        {joined && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:block">
                                <CommsChannel raceId={id} />
                            </motion.div>
                        )}

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[var(--header-bg)] rounded-[3rem] border border-[var(--border-main)] p-10 shadow-2xl backdrop-blur-3xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-grid-white/[0.01] bg-[length:20px_20px]" />
                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-10 italic opacity-60">Support Intel</h4>
                            <div className="space-y-6 relative z-10">
                                <div className="p-6 rounded-[2rem] bg-[var(--bg-main)]/50 border border-[var(--border-main)] group hover:border-blue-600/30 transition-colors">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] mb-2 italic">Encrypted Bridge</p>
                                    <p className="text-[10px] text-[var(--text-main)] opacity-40 leading-relaxed font-bold uppercase">Telemetry and comms are routed via Quantum Signal Bridge V4.2.</p>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-[var(--bg-main)]/50 border border-[var(--border-main)] group hover:border-orange-500/30 transition-colors">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] mb-2 italic">Operational Safety</p>
                                    <p className="text-[10px] text-[var(--text-main)] opacity-40 leading-relaxed font-bold uppercase">Biometric monitoring mandatory. Abort protocol active if signal drops.</p>
                                </div>
                            </div>

                            {joined && (
                                <button
                                    onClick={handleLeave}
                                    disabled={isLeaving}
                                    className="mt-12 w-full py-5 rounded-2xl border border-red-600/20 text-red-600 text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-lg"
                                >
                                    {isLeaving ? "Exiting Bridge..." : "Detach from mission"}
                                </button>
                            )}
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
