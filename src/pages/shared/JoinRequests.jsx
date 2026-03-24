import { useRaces } from "../../context/RaceContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function JoinRequests() {
    const { pendingRequests, approveRequest, rejectRequest, isLoading } = useRaces();
    const { user } = useAuth();

    // In a real app, if user is admin they might see ALL requests, 
    // but our backend getPendingRequests already filters for races created by the user (or all if admin).
    
    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

    if (isLoading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tighter text-black uppercase">
                    Participation <span className="text-blue-600">Requests</span>
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Operational Clearance Queue</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Operative</th>
                            <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Target Assignment</th>
                            <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Transmission Date</th>
                            <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-right">Clearance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        <AnimatePresence>
                            {pendingRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <p className="text-sm font-bold text-slate-300 uppercase tracking-widest italic">No pending requests in the queue</p>
                                    </td>
                                </tr>
                            ) : (
                                pendingRequests.map((req, idx) => (
                                    <motion.tr
                                        key={req._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-blue-50/30 transition-all group"
                                    >
                                        <td className="px-8 py-6">
                                            <Link to={`/profile/${req.user?.slug || req.user?._id}`} className="flex items-center gap-4 group/user">
                                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black border border-blue-200 group-hover/user:bg-blue-600 group-hover/user:text-white transition-all">
                                                    {req.user?.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 group-hover/user:text-blue-600 transition-all">{req.user?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Verified Agent</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Link to={`/races/${req.race?._id}`} className="group/race">
                                                <p className="text-sm font-black text-slate-900 group-hover/race:text-blue-600 transition-all uppercase tracking-tight">{req.race?.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">📍 {req.race?.location}</p>
                                            </Link>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-slate-500">
                                            {formatDate(req.createdAt)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => approveRequest(req._id)}
                                                    className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-black transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => rejectRequest(req._id)}
                                                    className="px-4 py-2 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                                >
                                                    Deny
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
