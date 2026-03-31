import { useParams, Link, useNavigate } from "react-router-dom";
import { useRaces } from "../../context/RaceContext";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
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
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!race) return <div className="text-center py-20 text-slate-500 font-bold">Race not found.</div>;

    const handleJoinRequest = async (payload) => {
        if (!user) return;
        setIsRequesting(true);
        const res = await requestToJoin(id, payload);
        setIsRequesting(false);
        setRequestResult(res);
        // Refresh race data to update participant count
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
        <>
            {showModal && (
                <RegistrationModal
                    race={race}
                    onClose={() => { setShowModal(false); setRequestResult(null); }}
                    onSubmit={handleJoinRequest}
                    isSubmitting={isRequesting}
                    result={requestResult}
                />
            )}

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-10 mb-20 lg:mb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Intel Column */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden glass-premium grid-pattern">
                            <div className="bg-slate-50/50 p-6 sm:p-10 border-b border-slate-200 scanline relative">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        {race.type}
                                    </span>
                                    {race.sector && (
                                        <span className="bg-slate-800 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                            🗺 {race.sector}
                                        </span>
                                    )}
                                    {isFull && <span className="bg-red-600/10 text-red-600 border border-red-500/20 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">🔴 Full</span>}
                                    {isClosed && !isFull && <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">⛔ Closed</span>}
                                </div>
                                <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-slate-900 mt-2 mb-4 uppercase relative z-20">{race.name}</h1>
                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs relative z-20">
                                    <span className="flex items-center gap-2">📍 {race.location}</span>
                                    <span className="flex items-center gap-2">📅 {new Date(race.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-2 border-l border-slate-300 pl-4 sm:pl-6">📏 {race.trackLength || '0'} KM</span>
                                    <span className="flex items-center gap-2 text-blue-600">👥 {race.participants?.length || 0}{race.maxParticipants ? ` / ${race.maxParticipants}` : ''} OPERATIVES</span>
                                </div>

                                {/* Capacity Bar */}
                                {race.maxParticipants && (
                                    <div className="mt-5 relative z-20">
                                        <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                            <span>Deployment Capacity</span>
                                            <span className={slotsLeft <= 2 ? 'text-red-500' : 'text-slate-400'}>{slotsLeft <= 0 ? 'Full' : `${slotsLeft} slots remaining`}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-red-500' : capacityPct > 75 ? 'bg-amber-500' : 'bg-blue-600'}`}
                                                style={{ width: `${capacityPct}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Deadline */}
                                {deadline && !isClosed && (
                                    <div className="mt-4 relative z-20 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">⏳ Registration closes {deadline.toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            {race.linkedEvent && (
                                <div className="bg-gradient-to-r from-red-600/10 via-black to-red-600/10 border-b border-red-500/20 px-6 sm:px-10 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">High-Stakes Event Active</span>
                                            <h3 className="text-sm font-black text-white uppercase tracking-tight">{race.linkedEvent.title}</h3>
                                        </div>
                                    </div>
                                    {race.linkedEvent.type === 'XP_BOOST' && (
                                        <div className="bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
                                            <span className="text-[10px] font-black text-red-500 uppercase">x{race.linkedEvent.multiplier} XP Multiplier</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="p-6 sm:p-10">
                                {race.status === 'Completed' && joined && (
                                    <div className="mb-12">
                                        <MissionCertificate race={race} user={user} />
                                    </div>
                                )}

                                {race.linkedEvent && (
                                    <div className="mb-12">
                                        <FactionDominance participants={race.participants} />
                                    </div>
                                )}

                                <div className="mb-12">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Mission Participants</h4>
                                    {race.participants?.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {race.participants.map((p, idx) => (
                                                <Link
                                                    key={idx}
                                                    to={`/profile/${p.slug || (typeof p === 'object' ? p._id : p)}`}
                                                    className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-2xl text-xs font-black italic uppercase hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] not-italic">
                                                        {(typeof p === 'object' ? p.name : 'V').charAt(0)}
                                                    </div>
                                                    {typeof p === 'object' ? p.name : 'Operative'}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 italic font-medium text-xs">No operatives deployed yet. Waiting for signal...</p>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <button
                                        onClick={() => !joinDisabled && setShowModal(true)}
                                        disabled={joinDisabled}
                                        className={`px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] shadow-2xl transition-all w-full md:w-auto active:scale-95 ${joined
                                            ? "bg-black text-white shadow-black/20 cursor-default"
                                            : hasPendingRequest
                                                ? "bg-slate-100 text-slate-400 cursor-default border border-slate-200"
                                                : (isFull || isClosed)
                                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                                    : "bg-blue-600 text-white hover:bg-black shadow-blue-500/30 hover:-translate-y-1"
                                            }`}
                                    >
                                        {getJoinButtonLabel()}
                                    </button>

                                    {joined && (
                                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                                            <Link
                                                to={`/races/${id}/hud`}
                                                className="px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all text-center flex-1 md:flex-initial"
                                            >
                                                ⚡ Engage HUD
                                            </Link>
                                        </div>
                                    )}

                                    {canManage && (
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all w-full md:w-auto disabled:opacity-50"
                                        >
                                            {isDeleting ? "Deleting..." : "🗑️ TERMINATE"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {joined && (
                            <div className="md:hidden">
                                <CommsChannel raceId={id} />
                            </div>
                        )}
                    </div>

                    {/* Secondary Intel Column (Sidebar) */}
                    <div className="flex flex-col gap-8">
                        {joined && (
                            <div className="hidden md:block">
                                <CommsChannel raceId={id} />
                            </div>
                        )}

                        <div className="bg-white rounded-3xl border border-slate-100 p-8 glass-premium grid-pattern">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Mission Support</h4>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 mb-1">Encrypted Bridge</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">All telemetry and comms are routed through the Quantum Signal Bridge for maximum security.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 mb-1">Operative Safety</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Wear biometric monitors at all times during deployment. Abort if signal latency exceeds 500ms.</p>
                                </div>
                            </div>

                            {joined && (
                                <button
                                    onClick={handleLeave}
                                    disabled={isLeaving}
                                    className="mt-8 w-full py-4 rounded-xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                >
                                    {isLeaving ? "Exiting Bridge..." : "Detach From Mission"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
