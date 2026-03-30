import { useRaces } from "../../context/RaceContext";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function AdminRaces() {
    const { races, deleteRace } = useRaces();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [openDropdown, setOpenDropdown] = useState(null);

    // Close dropdown on click outside
    useEffect(() => {
        const close = () => setOpenDropdown(null);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this race?")) return;
        await deleteRace(id);
    };

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-black uppercase">
                        Engagement <span className="text-blue-600">Register</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Operational Readiness & Logistics</p>
                </div>
                <Link
                    to="/admin/races/new"
                    className="px-8 py-4 bg-black text-white font-black rounded-2xl hover:bg-blue-600 shadow-xl shadow-black/10 transition-all flex items-center gap-3 uppercase text-xs tracking-[0.2em] active:scale-95 group"
                >
                    <span className="text-lg group-hover:rotate-90 transition-transform">+</span>
                    Add Assignment
                </Link>
            </div>

            <div className="grid gap-6">
                {races.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-20 text-center">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No active assignments on the register</p>
                    </div>
                ) : (
                    races.map((race, index) => (
                        <motion.div
                            key={race._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative cursor-pointer"
                            onClick={() => navigate(`/races/${race._id}`)}
                        >
                            <div className="absolute inset-0 bg-white rounded-3xl -z-10 shadow-sm border border-slate-100 group-hover:border-blue-500/30 transition-all" />

                            <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl group-hover:bg-blue-600 transition-all">
                                        🏁
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black text-black uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors">
                                            {race.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <span className="text-blue-500">📍</span> {race.location}
                                            </div>
                                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <span className="text-blue-500">📅</span> {formatDate(race.date)}
                                            </div>
                                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                {race.type || 'Standard'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 sm:gap-10 lg:gap-16">
                                    {/* Originator */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Originator</span>
                                        {race.createdBy ? (
                                            <Link
                                                to={`/profile/${race.createdBy.slug || race.createdBy._id}`}
                                                className="flex items-center gap-2 group/user"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover/user:bg-blue-600 group-hover/user:text-white transition-all uppercase">
                                                    {(race.createdBy?.name || 'U')[0]}
                                                </div>
                                                <span className="text-xs font-bold text-slate-600">{race.createdBy?.name || 'Unidentified'}</span>
                                            </Link>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400 italic">Unidentified</span>
                                        )}
                                    </div>

                                    {/* Engagement */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Engagement</span>
                                        <div className="flex -space-x-3">
                                            {race.participants?.slice(0, 4).map((p, i) => (
                                                <div key={i} className="h-8 w-8 rounded-xl border-2 border-white ring-1 ring-slate-100 bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase shadow-sm">
                                                    {(p?.name || 'U')[0]}
                                                </div>
                                            ))}
                                            {race.participants?.length > 4 && (
                                                <div className="h-8 w-8 rounded-xl border-2 border-white ring-1 ring-slate-100 bg-black text-white flex items-center justify-center text-[10px] font-black uppercase shadow-sm">
                                                    +{race.participants.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Telemetry */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Telemetry</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border w-fit ${race.status === 'Active'
                                            ? 'bg-green-50 text-green-600 border-green-200'
                                            : race.status === 'Completed'
                                                ? 'bg-slate-100 text-slate-500 border-slate-200'
                                                : 'bg-orange-50 text-orange-600 border-orange-200'
                                            }`}>
                                            {race.status || 'Active'}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 lg:border-transparent w-full lg:w-auto">
                                        <Link
                                            to={`/admin/races/${race._id}/edit`}
                                            className="bg-slate-50 hover:bg-black text-slate-400 hover:text-white p-3 rounded-2xl border border-slate-100 transition-all active:scale-95 shadow-sm"
                                            title="Modify Directive"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </Link>
                                        <button
                                            onClick={(e) => handleDelete(e, race._id)}
                                            className="bg-slate-50 hover:bg-red-600 text-slate-400 hover:text-white p-3 rounded-2xl border border-slate-100 transition-all active:scale-95 shadow-sm"
                                            title="Abort Engagement"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
