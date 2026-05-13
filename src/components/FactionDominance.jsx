import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config/api";
import { useSocket } from "../context/SocketContext";

export default function FactionDominance({ participants = [], sectorName = null, userFaction = null }) {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [territory, setTerritory] = useState(null);
    const socket = useSocket();

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/factions/stats`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
            
            if (sectorName) {
                const terrRes = await fetch(`${API_BASE_URL}/api/factions/territories`);
                if (terrRes.ok) {
                    const terrData = await terrRes.json();
                    const sector = terrData.find(t => t.sectorName === sectorName);
                    setTerritory(sector);
                }
            }
        } catch (err) {
            console.error("Failed to fetch faction stats", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        if (socket) {
            socket.on('territory_update', fetchStats);
            socket.on('territory_flip', fetchStats);
            socket.on('race_completed', fetchStats);

            return () => {
                socket.off('territory_update');
                socket.off('territory_flip');
                socket.off('race_completed');
            };
        }
    }, [socket, sectorName]);

    const maxXP = Math.max(...stats.map(s => s.totalXP), 1);
    const totalTerritories = stats.reduce((acc, s) => acc + s.territoryCount, 0) || 1;

    const factionColors = {
        'Cyber Shadows': 'bg-blue-600',
        'The Vanguard': 'bg-amber-600',
        'Neon Pulse': 'bg-pink-600',
        'Void Runners': 'bg-purple-600'
    };

    const factionTextColors = {
        'Cyber Shadows': 'text-blue-400',
        'The Vanguard': 'text-amber-400',
        'Neon Pulse': 'text-pink-400',
        'Void Runners': 'text-purple-400'
    };

    const factionGlows = {
        'Cyber Shadows': 'shadow-[0_0_20px_rgba(37,99,235,0.3)]',
        'The Vanguard': 'shadow-[0_0_20px_rgba(217,119,6,0.3)]',
        'Neon Pulse': 'shadow-[0_0_20px_rgba(219,39,119,0.3)]',
        'Void Runners': 'shadow-[0_0_20px_rgba(147,51,234,0.3)]'
    };

    const ownerFaction = territory?.currentOwner || 'None';
    const isUserOwned = userFaction && userFaction === ownerFaction && ownerFaction !== 'None';

    if (loading) return (
        <div className="h-64 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white animate-pulse">Synchronizing Data...</div>
        </div>
    );

    return (
        <div className="bg-slate-950/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 p-8 flex flex-col gap-8 relative overflow-hidden group">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">
                            {sectorName ? `Sector Dominance: ${sectorName}` : 'Global Faction Dominance'}
                        </h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {sectorName ? `Control: ${ownerFaction}` : 'Real-time Sector Control Metrics'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Status: <span className="text-emerald-400">Live Uplink</span>
                    </div>
                    {isUserOwned && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[8px] font-black text-green-500 uppercase tracking-widest leading-none flex items-center gap-1 mr-2"
                        >
                            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                            XP Perk Active (+15%)
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Territory Bar */}
            <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-end px-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Territorial Distribution</span>
                    <span className="text-[10px] font-black text-white">{totalTerritories} Sectors Mapped</span>
                </div>
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/5 border border-white/5 p-0.5">
                    {stats.map(s => {
                        const percentage = (s.territoryCount / totalTerritories) * 100;
                        if (percentage === 0) return null;
                        return (
                            <motion.div 
                                key={s.faction}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className={`${factionColors[s.faction]} h-full transition-all duration-1000 relative group`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Faction Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {stats.map(s => {
                    const isLeading = s.totalXP === maxXP && s.totalXP > 0;
                    return (
                        <div 
                            key={s.faction} 
                            className={`p-6 rounded-[1.5rem] border transition-all duration-700 relative overflow-hidden group ${
                                isLeading 
                                ? `bg-white/10 border-white/20 ${factionGlows[s.faction]} scale-[1.02]` 
                                : 'bg-white/5 border-white/5 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'
                            }`}
                        >
                            {/* Card Background Decoration */}
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 blur-2xl ${factionColors[s.faction]}`} />
                            
                            <div className="flex flex-col gap-4 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className={`text-[8px] font-black uppercase tracking-[0.3em] mb-1 ${factionTextColors[s.faction]}`}>{s.faction}</span>
                                        <span className="text-2xl font-black text-white tracking-tighter italic">{s.territoryCount} SEC</span>
                                    </div>
                                    {isLeading && (
                                        <div className="px-2 py-0.5 bg-white text-black text-[7px] font-black uppercase tracking-tighter rounded-sm">Peak Power</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                        <span>Power Rating</span>
                                        <span className="text-white">{s.totalXP.toLocaleString()} XP</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(s.totalXP / maxXP) * 100}%` }}
                                            className={`h-full ${factionColors[s.faction]}`}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Operatives</span>
                                        <span className="text-[10px] font-black text-white">{s.memberCount}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Successes</span>
                                        <span className="text-[10px] font-black text-emerald-400">{s.totalWins}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
