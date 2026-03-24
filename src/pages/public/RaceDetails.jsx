import { useParams, Link, useNavigate } from "react-router-dom";
import { useRaces } from "../../context/RaceContext";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import CommsChannel from "../../components/CommsChannel";
import MissionCertificate from "../../components/MissionCertificate";

export default function RaceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { races, requestToJoin, leaveRace, deleteRace, myRequests, isLoading: racesLoading } = useRaces();
    const { user } = useAuth();
    const [isRequesting, setIsRequesting] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [joinMessage, setJoinMessage] = useState("");

    const race = races.find(r => r._id === id);
    const joined = race?.participants?.some(p => p._id === user?.id || p === user?.id);
    const hasPendingRequest = myRequests?.some(r => r.race?._id === id && r.status === 'Pending');
    const canManage = user?.role === 'admin' || (race?.createdBy === user?.id || race?.createdBy?._id === user?.id);

    if (racesLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!race) return <div className="text-center py-20 text-slate-500 font-bold">Race not found.</div>;

    const handleJoinRequest = async () => {
        if (!user) {
            setJoinMessage("Please login to join the race.");
            return;
        }
        if (!joined && !hasPendingRequest && !isRequesting) {
            setIsRequesting(true);
            const res = await requestToJoin(id);
            setIsRequesting(false);
            if (res.success) {
                setJoinMessage("Join request sent! Awaiting operative authorization.");
            } else {
                setJoinMessage(res.message);
            }
        }
    };

    const handleLeave = async () => {
        if (window.confirm("Are you sure you want to leave this race?")) {
            setIsLeaving(true);
            const res = await leaveRace(id);
            if (res.success) {
                setJoinMessage("You have successfully left the race.");
            } else {
                alert(res.message || "Failed to leave race.");
            }
            setIsLeaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this race?")) {
            setIsDeleting(true);
            const res = await deleteRace(id);
            if (res.success) {
                navigate("/");
            } else {
                alert(res.message || "Failed to delete race.");
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden glass-premium">
                <div className="bg-slate-50/50 p-10 border-b border-slate-200">
                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        {race.type}
                    </span>
                    <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 mt-6 mb-4 uppercase">{race.name}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-slate-500 font-bold uppercase tracking-widest text-xs">
                        <span className="flex items-center gap-2">📍 {race.location}</span>
                        <span className="flex items-center gap-2">📅 {new Date(race.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-2">📏 {race.trackLength || '0'} KM</span>
                        <span className="flex items-center gap-2 text-blue-600">👥 {race.participants?.length || 0} OPERATIVES</span>
                    </div>
                </div>

                <div className="p-10">
                    {race.status === 'Completed' && joined && (
                        <div className="mb-12">
                            <MissionCertificate race={race} user={user} />
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
                            <p className="text-slate-400 italic font-medium">No operatives deployed yet.</p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        <button
                            onClick={handleJoinRequest}
                            disabled={joined || hasPendingRequest || isRequesting}
                            className={`px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all w-full md:w-auto active:scale-95 ${joined
                                ? "bg-black text-white shadow-black/20 cursor-default"
                                : hasPendingRequest
                                    ? "bg-slate-100 text-slate-400 cursor-default border border-slate-200"
                                    : "bg-blue-600 text-white hover:bg-black shadow-blue-500/30 hover:-translate-y-1"
                                }`}
                        >
                            {isRequesting ? "Transmitting..." : (joined ? "✓ Mission Verified" : hasPendingRequest ? "⌛ Pending Intel" : "Request Deployment")}
                        </button>

                        {joined && (
                            <div className="flex flex-wrap gap-4 w-full md:w-auto">
                                <Link
                                    to={`/races/${id}/hud`}
                                    className="px-12 py-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all text-center flex-1 md:flex-initial"
                                >
                                    ⚡ Engage HUD
                                </Link>
                                <button
                                    onClick={handleLeave}
                                    disabled={isLeaving}
                                    className="px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] border-2 border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-600 transition-all flex-1 md:flex-initial disabled:opacity-50 active:scale-95"
                                >
                                    {isLeaving ? "Exiting..." : "Abort Mission"}
                                </button>
                            </div>
                        )}

                        {canManage && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all w-full md:w-auto disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "🗑️ TERMINATE"}
                            </button>
                        )}
                    </div>

                    {(joined || (joinMessage && !joinMessage.includes('Already'))) && (
                        <p className={`mt-8 font-black uppercase text-[10px] tracking-widest animate-pulse ${joinMessage.includes('failed') || joinMessage.includes('error') ? 'text-red-500' : 'text-blue-600'}`}>
                            {joinMessage || (joined ? "LINK ESTABLISHED - PROCEED TO HUD" : "")}
                        </p>
                    )}
                </div>
            </div>
            <CommsChannel raceId={id} />
        </div>
    );
}
