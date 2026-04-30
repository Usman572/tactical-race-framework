import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config/api";

export default function FactionDominance({ participants = [], sectorName = null, userFaction = null }) {
    const [territory, setTerritory] = useState(null);

    useEffect(() => {
        const fetchTerritory = async () => {
            if (!sectorName) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/factions/territories`);
                if (res.ok) {
                    const data = await res.json();
                    const sector = data.find(t => t.sectorName === sectorName);
                    setTerritory(sector);
                }
            } catch (err) {
                console.error("Failed to fetch territory in FactionDominance", err);
            }
        };
        fetchTerritory();
    }, [sectorName]);

    const ownerFaction = territory?.currentOwner || 'None';
    const isUserOwned = userFaction && userFaction === ownerFaction && ownerFaction !== 'None';
    // Factions to track
    const factions = ['Cyber Shadows', 'The Vanguard', 'Neon Pulse', 'Void Runners'];
    
    // Calculate counts
    const counts = participants.reduce((acc, p) => {
        if (p.faction && factions.includes(p.faction)) {
            acc[p.faction] = (acc[p.faction] || 0) + 1;
        }
        return acc;
    }, {});

    const maxCount = Math.max(...Object.values(counts), 1);
    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    const factionColors = {
        'Cyber Shadows': 'bg-purple-600',
        'The Vanguard': 'bg-blue-600',
        'Neon Pulse': 'bg-green-600',
        'Void Runners': 'bg-red-600'
    };

    const factionBorderColors = {
        'Cyber Shadows': 'border-purple-500/30',
        'The Vanguard': 'border-blue-500/30',
        'Neon Pulse': 'border-green-500/30',
        'Void Runners': 'border-red-500/30'
    };

    const factionGlows = {
        'Cyber Shadows': 'glow-shadow',
        'The Vanguard': 'glow-vanguard',
        'Neon Pulse': 'glow-pulse',
        'Void Runners': 'glow-void'
    };

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col gap-6 grid-pattern scanline hud-transition">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-soft" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Faction Dominance</h3>
                    {sectorName && (
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Sector Control:</span>
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none" style={{ color: ownerFaction !== 'None' ? (ownerFaction === 'Cyber Shadows' ? '#9333ea' : ownerFaction === 'The Vanguard' ? '#2563eb' : ownerFaction === 'Neon Pulse' ? '#16a34a' : '#dc2626') : '#94a3b8' }}>{ownerFaction}</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                        Power Metrics: <span className="text-white">{participants.length} Operatives</span>
                    </div>
                    {isUserOwned && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[8px] font-black text-green-500 uppercase tracking-widest leading-none flex items-center gap-1"
                        >
                            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                            XP Perk Active (+15%)
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="flex h-4 w-full rounded-full overflow-hidden bg-white/5 border border-white/5 p-1">
                {factions.map(faction => {
                    const percentage = ((counts[faction] || 0) / totalCount) * 100;
                    if (percentage === 0) return null;
                    return (
                        <motion.div 
                            key={faction}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className={`${factionColors[faction]} h-full first:rounded-l-full last:rounded-r-full transition-all duration-1000 relative group`}
                            title={`${faction}: ${counts[faction]} operatives`}
                        >
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {factions.map(faction => {
                    const count = counts[faction] || 0;
                    const isLeading = count === maxCount && count > 0;
                    return (
                        <div 
                            key={faction} 
                            className={`p-4 rounded-xl border ${factionBorderColors[faction]} bg-white/5 relative overflow-hidden group transition-all duration-500 ${isLeading ? `ring-1 ring-white/20 scale-[1.02] ${factionGlows[faction]}` : 'opacity-40 grayscale-[0.5] hover:opacity-60 hover:grayscale-0'}`}
                        >
                            {isLeading && (
                                <div className="absolute top-0 right-0 px-2 py-0.5 bg-white/10 text-[7px] font-black text-white uppercase tracking-tighter">Dominant</div>
                            )}
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-sm ${factionColors[faction]}`} />
                                {faction}
                            </div>
                            <div className="flex items-end justify-between">
                                <div className="flex flex-col">
                                    <span className={`text-2xl font-black leading-none ${isLeading ? 'text-white' : 'text-slate-500'}`}>{count}</span>
                                    <span className="text-[7px] font-black opacity-40 uppercase mt-1 tracking-tighter">Deployed Units</span>
                                </div>
                                <div className="text-[10px] font-black opacity-20 uppercase -mb-1 select-none">Metric</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
