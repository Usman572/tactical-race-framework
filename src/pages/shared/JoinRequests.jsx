import { useState } from "react";
import { useRaces } from "../../context/RaceContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const EXPERIENCE_STYLES = {
    Elite: "bg-red-600/10 text-red-600 border-red-500/20",
    Veteran: "bg-blue-600/10 text-blue-600 border-blue-500/20",
    Rookie: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export default function JoinRequests() {
    const { pendingRequests, approveRequest, rejectRequest, isLoading } = useRaces();
    const { user } = useAuth();
    const [expandedId, setExpandedId] = useState(null);
    const [selected, setSelected] = useState([]);
    const [processing, setProcessing] = useState({});

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

    const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    const allSelected = selected.length === pendingRequests.length && pendingRequests.length > 0;
    const toggleAll = () => setSelected(allSelected ? [] : pendingRequests.map(r => r._id));

    const handleApprove = async (reqId) => {
        setProcessing(p => ({ ...p, [reqId]: 'approving' }));
        await approveRequest(reqId);
        setProcessing(p => ({ ...p, [reqId]: null }));
        setSelected(s => s.filter(id => id !== reqId));
    };

    const handleReject = async (reqId) => {
        setProcessing(p => ({ ...p, [reqId]: 'rejecting' }));
        await rejectRequest(reqId);
        setProcessing(p => ({ ...p, [reqId]: null }));
        setSelected(s => s.filter(id => id !== reqId));
    };

    const handleBatchApprove = async () => {
        for (const id of selected) await handleApprove(id);
        setSelected([]);
    };

    const handleBatchReject = async () => {
        for (const id of selected) await handleReject(id);
        setSelected([]);
    };

    if (isLoading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-black uppercase">
                        Participation <span className="text-blue-600">Requests</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Operational Clearance Queue · {pendingRequests.length} Pending</p>
                </div>

                {/* Batch Actions */}
                <AnimatePresence>
                    {selected.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{selected.length} selected</span>
                            <button onClick={handleBatchApprove} className="px-3 py-1.5 bg-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all">Approve All</button>
                            <button onClick={handleBatchReject} className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Deny All</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-5">
                                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                            </th>
                            <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Operative</th>
                            <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Assignment</th>
                            <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Classification</th>
                            <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Date</th>
                            <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-right">Clearance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        <AnimatePresence>
                            {pendingRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <p className="text-sm font-bold text-slate-300 uppercase tracking-widest italic">No pending requests in the queue</p>
                                    </td>
                                </tr>
                            ) : (
                                pendingRequests.map((req, idx) => (
                                    <>
                                        <motion.tr
                                            key={req._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className={`hover:bg-blue-50/30 transition-all group cursor-pointer ${selected.includes(req._id) ? 'bg-blue-50/50' : ''}`}
                                            onClick={() => setExpandedId(expandedId === req._id ? null : req._id)}
                                        >
                                            <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                                                <input type="checkbox" checked={selected.includes(req._id)} onChange={() => toggleSelect(req._id)}
                                                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                                            </td>
                                            <td className="px-6 py-5">
                                                <Link to={`/profile/${req.user?.slug || req.user?._id}`} className="flex items-center gap-3 group/user" onClick={e => e.stopPropagation()}>
                                                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black border border-blue-200 group-hover/user:bg-blue-600 group-hover/user:text-white transition-all shrink-0">
                                                        {req.user?.name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 group-hover/user:text-blue-600 transition-all">{req.user?.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{req.user?.email}</p>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Link to={`/races/${req.race?._id}`} className="group/race" onClick={e => e.stopPropagation()}>
                                                    <p className="text-sm font-black text-slate-900 group-hover/race:text-blue-600 transition-all uppercase tracking-tight">{req.race?.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">📍 {req.race?.location}</p>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${EXPERIENCE_STYLES[req.experience] || EXPERIENCE_STYLES.Rookie}`}>
                                                    {req.experience || 'Rookie'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-bold text-slate-500">{formatDate(req.createdAt)}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleApprove(req._id)}
                                                        disabled={!!processing[req._id]}
                                                        className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-40"
                                                    >
                                                        {processing[req._id] === 'approving' ? '...' : 'Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req._id)}
                                                        disabled={!!processing[req._id]}
                                                        className="px-4 py-2 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-40"
                                                    >
                                                        {processing[req._id] === 'rejecting' ? '...' : 'Deny'}
                                                    </button>
                                                    <button className={`p-2 rounded-xl transition-colors ${expandedId === req._id ? 'bg-slate-900 text-white' : 'text-slate-300 hover:text-slate-600'}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points={expandedId === req._id ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>

                                        {/* Expanded Intel Row */}
                                        <AnimatePresence>
                                            {expandedId === req._id && (
                                                <motion.tr
                                                    key={`${req._id}-expand`}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <td colSpan="6" className="px-6 pb-6 pt-0 bg-blue-50/30">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                            <div>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle / Machine</p>
                                                                <p className="text-sm font-bold text-slate-700">{req.vehicleDetails || <span className="italic text-slate-300">Not specified</span>}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Message to Command</p>
                                                                <p className="text-sm font-medium text-slate-700">{req.message || <span className="italic text-slate-300">No message provided</span>}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {pendingRequests.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
                        <p className="text-sm font-bold text-slate-300 uppercase tracking-widest italic">No pending requests</p>
                    </div>
                ) : (
                    pendingRequests.map((req, idx) => (
                        <motion.div
                            key={req._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                        >
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <Link to={`/profile/${req.user?.slug || req.user?._id}`} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black border border-blue-200 shrink-0">
                                            {req.user?.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm">{req.user?.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{req.user?.email}</p>
                                        </div>
                                    </Link>
                                    <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${EXPERIENCE_STYLES[req.experience] || EXPERIENCE_STYLES.Rookie}`}>
                                        {req.experience || 'Rookie'}
                                    </span>
                                </div>

                                <Link to={`/races/${req.race?._id}`} className="block p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{req.race?.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400">📍 {req.race?.location}</p>
                                </Link>

                                {(req.vehicleDetails || req.message) && (
                                    <div className="space-y-2 mb-3">
                                        {req.vehicleDetails && (
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vehicle</p>
                                                <p className="text-xs font-bold text-slate-700 mt-0.5">{req.vehicleDetails}</p>
                                            </div>
                                        )}
                                        {req.message && (
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Message</p>
                                                <p className="text-xs text-slate-700 mt-0.5">{req.message}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        onClick={() => handleApprove(req._id)}
                                        disabled={!!processing[req._id]}
                                        className="flex-1 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all active:scale-95 disabled:opacity-40"
                                    >
                                        {processing[req._id] === 'approving' ? '...' : '✓ Approve'}
                                    </button>
                                    <button
                                        onClick={() => handleReject(req._id)}
                                        disabled={!!processing[req._id]}
                                        className="flex-1 py-3 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-40"
                                    >
                                        {processing[req._id] === 'rejecting' ? '...' : '✕ Deny'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
