import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";

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
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-500 font-black tracking-widest uppercase text-xs">Syncing Rankings</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-[100px] pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="relative mb-20 flex flex-col md:flex-row justify-between items-end gap-12">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Global Leaderboard — Season 1</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-6 leading-none">
                            ELITE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">PILOTS</span>
                        </h1>
                        <p className="text-slate-400 max-w-2xl text-lg font-medium">
                            Recognizing the fastest, most consistent drivers on the circuit. Only the top verified agents and factions are listed here.
                        </p>
                    </div>

                    <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
                        <button 
                            onClick={() => setView('pilots')}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'pilots' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            Operatives
                        </button>
                        <button 
                            onClick={() => setView('factions')}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'factions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            Factions
                        </button>
                    </div>
                </div>

                {view === 'pilots' ? (
                    <>
                        {/* Top 3 Podium */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                            {leaders.slice(0, 3).map((pilot, index) => (
                                <Link
                                    key={pilot._id}
                                    to={`/profile/${pilot.slug || pilot._id}`}
                                    className={`group relative p-1 rounded-[2.5rem] transition-all hover:-translate-y-2 ${index === 0 ? 'bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.2)]' :
                                        index === 1 ? 'bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 shadow-[0_0_50px_rgba(226,232,240,0.1)]' :
                                            'bg-gradient-to-br from-orange-400 via-orange-200 to-orange-600 shadow-[0_0_50px_rgba(194,65,12,0.1)]'
                                        }`}
                                >
                                    <div className="bg-slate-900 rounded-[2.3rem] p-8 h-full flex flex-col items-center text-center">
                                        <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center font-black text-xl border border-white/10">
                                            {index + 1}
                                        </div>
                                        <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-950 overflow-hidden mb-6 group-hover:border-white transition-all shadow-xl">
                                            {pilot.profilePicture ? (
                                                <img src={pilot.profilePicture} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-600">
                                                    {pilot.name.substring(0, 1)}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{pilot.name}</h3>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{pilot.faction !== 'None' ? pilot.faction : `${pilot.role} operative`}</div>

                                        <div className="flex gap-2 mb-6">
                                            <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                                {pilot.xp || 0} XP
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 w-full gap-4 pt-6 border-t border-white/5">
                                            <div>
                                                <div className="text-2xl font-black text-white">{pilot.level || 1}</div>
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Level</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-black text-white">{pilot.stats.wins}</div>
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Victories</div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* The List */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Position</th>
                                        <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Operative</th>
                                        <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Faction</th>
                                        <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Level</th>
                                        <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">XP</th>
                                        <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Link</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {leaders.slice(3).map((pilot, idx) => (
                                        <tr key={pilot._id} className={`hover:bg-white/[0.02] transition-colors group ${currentUser?.id === pilot._id ? 'bg-blue-600/5' : ''}`}>
                                            <td className="px-6 py-6 font-black text-xl italic text-slate-600 group-hover:text-blue-500 transition-colors">
                                                #{idx + 4}
                                            </td>
                                            <td className="px-6 py-6">
                                                <Link to={`/profile/${pilot.slug || pilot._id}`} className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full border-2 border-white/5 overflow-hidden group-hover:border-blue-500 transition-all">
                                                        {pilot.profilePicture ? (
                                                            <img src={pilot.profilePicture} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[10px] font-black">
                                                                {pilot.name.substring(0, 1)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-lg leading-none mb-1 group-hover:text-blue-400 transition-all">{pilot.name}</div>
                                                        <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{pilot.role} Pilot</div>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                    pilot.faction === 'Cyber Shadows' ? 'bg-purple-600/10 text-purple-500 border-purple-500/20' :
                                                    pilot.faction === 'The Vanguard' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' :
                                                    pilot.faction === 'Neon Pulse' ? 'bg-green-600/10 text-green-500 border-green-500/20' :
                                                    pilot.faction === 'Void Runners' ? 'bg-orange-600/10 text-orange-500 border-orange-500/20' :
                                                    'bg-slate-600/10 text-slate-500 border-slate-500/20'
                                                }`}>
                                                    {pilot.faction || 'Neutral'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 font-black text-lg text-white/80">
                                                {pilot.level || 1}
                                            </td>
                                            <td className="px-6 py-6 font-black text-lg text-blue-500">
                                                {pilot.xp || 0}
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <Link
                                                    to={`/profile/${pilot.slug || pilot._id}`}
                                                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-600 hover:border-blue-500 transition-all group-hover:scale-105"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    /* Faction Standings View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {['Cyber Shadows', 'The Vanguard', 'Neon Pulse', 'Void Runners'].map(faction => {
                            const factionMembers = leaders.filter(l => l.faction === faction);
                            const totalXP = factionMembers.reduce((sum, m) => sum + (m.xp || 0), 0);
                            const totalWins = factionMembers.reduce((sum, m) => sum + (m.stats?.wins || 0), 0);
                            
                            return (
                                <div key={faction} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center text-center group hover:bg-white/[0.08] transition-all">
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl transition-transform group-hover:rotate-3 ${
                                        faction === 'Cyber Shadows' ? 'bg-purple-600 shadow-purple-500/30' :
                                        faction === 'The Vanguard' ? 'bg-blue-600 shadow-blue-500/30' :
                                        faction === 'Neon Pulse' ? 'bg-green-600 shadow-green-500/30' :
                                        'bg-orange-600 shadow-orange-500/30'
                                    }`}>
                                        <span className="text-white font-black text-3xl italic">{faction[0]}</span>
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight mb-2">{faction}</h3>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">{factionMembers.length} ACTIVE OPERATIVES</div>
                                    
                                    <div className="grid grid-cols-2 w-full gap-4 mb-8">
                                        <div>
                                            <div className="text-2xl font-black text-white">{totalXP}</div>
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total XP</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-white">{totalWins}</div>
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Team Wins</div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                                        <div 
                                            className={`h-full rounded-full ${
                                                faction === 'Cyber Shadows' ? 'bg-purple-500' :
                                                faction === 'The Vanguard' ? 'bg-blue-500' :
                                                faction === 'Neon Pulse' ? 'bg-green-500' :
                                                'bg-orange-500'
                                            }`}
                                            style={{ width: `${Math.min((totalXP / 10000) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Dominance Progress</div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Interactive Accents */}
                <div className="mt-20 flex flex-wrap gap-8 items-center border-t border-white/5 pt-12 text-slate-500">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                        <span className="w-3 h-[1px] bg-blue-500"></span>
                        Last Telemetry Sync: {new Date().toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                        <span className="w-3 h-[1px] bg-blue-500"></span>
                        Active Operatives: {leaders.length}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest ml-auto">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                        Systems Nominal
                    </div>
                </div>
            </div>
        </div>
    );
}
