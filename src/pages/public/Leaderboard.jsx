import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";
import { motion, AnimatePresence } from "framer-motion";

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState('pilots'); // 'pilots' or 'factions'
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/leaderboard`);
            if (res.ok) {
                const data = await res.json();
                setLeaders(data);
            }
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-500 font-black tracking-widest uppercase text-xs">Syncing Rankings</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-12 pb-20 px-6 transition-colors duration-500">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="relative mb-20 flex flex-col md:flex-row justify-between items-end gap-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Global Leaderboard — Season 1</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-6 leading-none uppercase">
                            ELITE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">PILOTS</span>
                        </h1>
                        <p className="opacity-60 max-w-2xl text-lg font-medium">
                            Recognizing the fastest, most consistent drivers on the circuit. Only the top verified agents and factions are listed here.
                        </p>
                    </motion.div>

                    <div className="flex bg-[var(--glass-bg)] p-2 rounded-2xl border border-[var(--border-main)] backdrop-blur-xl shadow-xl">
                        <button 
                            onClick={() => setView('pilots')}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'pilots' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'opacity-40 hover:opacity-100'}`}
                        >
                            Operatives
                        </button>
                        <button 
                            onClick={() => setView('factions')}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'factions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'opacity-40 hover:opacity-100'}`}
                        >
                            Factions
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                {view === 'pilots' ? (
                    <motion.div
                        key="pilots"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {/* Top 3 Podium */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                            {leaders.slice(0, 3).map((pilot, index) => (
                                <motion.div
                                    key={pilot._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        to={`/profile/${pilot.slug || pilot._id}`}
                                        className={`group relative p-1 rounded-[2.5rem] flex block h-full transition-all hover:-translate-y-2 ${index === 0 ? 'bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-600 shadow-glow-primary' :
                                            index === 1 ? 'bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 shadow-xl' :
                                                'bg-gradient-to-br from-orange-400 via-orange-200 to-orange-600 shadow-xl'
                                            }`}
                                    >
                                        <div className="bg-[var(--bg-main)] rounded-[2.3rem] p-8 h-full flex flex-col items-center text-center w-full relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full -mr-16 -mt-16" />
                                            
                                            <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-[var(--bg-main)] flex items-center justify-center font-black text-xl border border-[var(--border-main)] shadow-inner">
                                                {index + 1}
                                            </div>
                                            <div className="w-24 h-24 rounded-full bg-[var(--bg-main)] border-4 border-[var(--border-main)] overflow-hidden mb-6 group-hover:border-blue-500 transition-all shadow-2xl relative z-10">
                                                {pilot.profilePicture ? (
                                                    <img src={pilot.profilePicture} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl font-black opacity-20">
                                                        {pilot.name.substring(0, 1)}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-black tracking-tight mb-2 group-hover:text-blue-500 transition-colors relative z-10 uppercase italic">{pilot.name}</h3>
                                            <div className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4 relative z-10">{pilot.faction !== 'None' ? pilot.faction : `${pilot.role} operative`}</div>

                                            <div className="flex gap-2 mb-6 relative z-10">
                                                <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                                    {pilot.xp || 0} XP
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 w-full gap-4 pt-6 border-t border-[var(--border-main)] relative z-10">
                                                <div>
                                                    <div className="text-2xl font-black">{pilot.level || 1}</div>
                                                    <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">Level</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-black text-blue-500">{pilot.stats.wins}</div>
                                                    <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">Victories</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* The List */}
                        <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-main)] rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[var(--border-main)]">
                                            <th className="px-8 py-6 text-[9px] font-black opacity-40 uppercase tracking-[0.3em]">Position</th>
                                            <th className="px-8 py-6 text-[9px] font-black opacity-40 uppercase tracking-[0.3em]">Operative</th>
                                            <th className="px-8 py-6 text-[9px] font-black opacity-40 uppercase tracking-[0.3em]">Faction</th>
                                            <th className="px-8 py-6 text-[9px] font-black opacity-40 uppercase tracking-[0.3em]">Level</th>
                                            <th className="px-8 py-6 text-[9px] font-black opacity-40 uppercase tracking-[0.3em]">XP</th>
                                            <th className="px-8 py-6 text-[9px] font-black opacity-40 uppercase tracking-[0.3em] text-right">Link</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-main)]">
                                        {leaders.slice(3).map((pilot, idx) => (
                                            <motion.tr 
                                                key={pilot._id} 
                                                initial={{ opacity: 0 }}
                                                whileInView={{ opacity: 1 }}
                                                viewport={{ once: true }}
                                                className={`hover:bg-blue-600/[0.03] transition-colors group ${currentUser?.id === pilot._id ? 'bg-blue-600/[0.05]' : ''}`}
                                            >
                                                <td className="px-8 py-6 font-black text-xl italic opacity-20 group-hover:opacity-100 group-hover:text-blue-500 transition-all">
                                                    #{idx + 4}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <Link to={`/profile/${pilot.slug || pilot._id}`} className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-xl border-2 border-[var(--border-main)] overflow-hidden group-hover:border-blue-500 group-hover:scale-105 transition-all shadow-sm">
                                                            {pilot.profilePicture ? (
                                                                <img src={pilot.profilePicture} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-[var(--bg-main)] flex items-center justify-center text-[10px] font-black opacity-30">
                                                                    {pilot.name.substring(0, 1)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-lg leading-none mb-1 group-hover:text-blue-500 transition-all uppercase italic">{pilot.name}</div>
                                                            <div className="text-[7px] font-black opacity-40 uppercase tracking-widest">{pilot.role} Pilot</div>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                        pilot.faction === 'Cyber Shadows' ? 'bg-purple-600/10 text-purple-500 border-purple-500/20' :
                                                        pilot.faction === 'The Vanguard' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' :
                                                        pilot.faction === 'Neon Pulse' ? 'bg-green-600/10 text-green-500 border-green-500/20' :
                                                        pilot.faction === 'Void Runners' ? 'bg-orange-600/10 text-orange-500 border-orange-500/20' :
                                                        'bg-slate-600/10 text-slate-500 border-slate-500/20'
                                                    }`}>
                                                        {pilot.faction || 'Neutral'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 font-black text-lg opacity-80 uppercase italic">
                                                    LVL {pilot.level || 1}
                                                </td>
                                                <td className="px-8 py-6 font-black text-lg text-blue-500 tabular-nums">
                                                    {pilot.xp || 0}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Link
                                                        to={`/profile/${pilot.slug || pilot._id}`}
                                                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border-main)] hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-90"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                                    </Link>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* Faction Standings View */
                    <motion.div 
                        key="factions"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {['Cyber Shadows', 'The Vanguard', 'Neon Pulse', 'Void Runners'].map((faction, index) => {
                            const factionMembers = leaders.filter(l => l.faction === faction);
                            const totalXP = factionMembers.reduce((sum, m) => sum + (m.xp || 0), 0);
                            const totalWins = factionMembers.reduce((sum, m) => sum + (m.stats?.wins || 0), 0);
                            
                            return (
                                <motion.div 
                                    key={faction}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-main)] rounded-[2.5rem] p-8 flex flex-col items-center text-center group hover:border-blue-500/30 transition-all shadow-xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full -mr-16 -mt-16" />
                                    
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl transition-transform group-hover:rotate-3 relative z-10 ${
                                        faction === 'Cyber Shadows' ? 'bg-purple-600 shadow-purple-500/30' :
                                        faction === 'The Vanguard' ? 'bg-blue-600 shadow-blue-500/30' :
                                        faction === 'Neon Pulse' ? 'bg-green-600 shadow-green-500/30' :
                                        'bg-orange-600 shadow-orange-500/30'
                                    }`}>
                                        <span className="text-white font-black text-3xl italic">{faction[0]}</span>
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight mb-2 uppercase italic relative z-10">{faction}</h3>
                                    <div className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-8 relative z-10">{factionMembers.length} ACTIVE OPERATIVES</div>
                                    
                                    <div className="grid grid-cols-2 w-full gap-4 mb-8 relative z-10 text-left">
                                        <div>
                                            <div className="text-2xl font-black tabular-nums">{totalXP}</div>
                                            <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">Total XP</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black tabular-nums text-blue-500">{totalWins}</div>
                                            <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">Team Wins</div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full h-2 bg-[var(--bg-main)] rounded-full overflow-hidden mb-4 border border-[var(--border-main)] relative z-10">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((totalXP / 10000) * 100, 100)}%` }}
                                            transition={{ duration: 1.5, ease: "circOut" }}
                                            className={`h-full rounded-full ${
                                                faction === 'Cyber Shadows' ? 'bg-purple-500 shadow-glow-faction-shadow' :
                                                faction === 'The Vanguard' ? 'bg-blue-500 shadow-glow-faction-vanguard' :
                                                faction === 'Neon Pulse' ? 'bg-green-500 shadow-glow-faction-pulse' :
                                                'bg-orange-500 shadow-glow-faction-void'
                                            }`}
                                        />
                                    </div>
                                    <div className="text-[7px] font-black opacity-30 uppercase tracking-widest relative z-10">Dominance Progress</div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
                </AnimatePresence>

                {/* Interactive Accents */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-20 flex flex-wrap gap-8 items-center border-t border-[var(--border-main)] pt-12 text-[var(--text-main)] opacity-40 overflow-hidden"
                >
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <span className="w-4 h-[1px] bg-blue-500"></span>
                        Last Telemetry Sync: {new Date().toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <span className="w-4 h-[1px] bg-blue-500"></span>
                        Active Operatives: {leaders.length}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-auto">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                        Quantum Streams Nominal
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
