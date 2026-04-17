import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NeuralLink = ({ data, isActive = true }) => {
    // data: { heartRate, adrenaline, syncLevel, speed, user }
    
    const faction = data?.user?.faction || 'None';
    const factionColor = useMemo(() => {
        switch (faction) {
            case 'Cyber Shadows': return '#a855f7'; // purple-500
            case 'The Vanguard': return '#3b82f6'; // blue-500
            case 'Neon Pulse': return '#22c55e'; // green-500
            case 'Void Runners': return '#ef4444'; // red-500
            default: return '#64748b'; // slate-500
        }
    }, [faction]);

    // Calculate pulse duration based on heart rate (BPM to seconds)
    const pulseDuration = data?.heartRate ? 60 / data.heartRate : 0.8;

    return (
        <div className="relative overflow-hidden bg-[var(--bg-main)]/40 border border-[var(--border-main)] rounded-[2.5rem] backdrop-blur-xl p-8 shadow-2xl">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(${factionColor} 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* 1. Sync Status & Profile */}
                <div className="lg:col-span-3 flex flex-col justify-between border-r border-[var(--border-main)] pr-8">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-black border border-[var(--border-main)] overflow-hidden">
                                    {data?.user?.profilePicture ? (
                                        <img src={data.user.profilePicture} alt="" className="w-full h-full object-cover grayscale brightness-125" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl font-black italic opacity-20">
                                            {data?.user?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                <motion.div 
                                    animate={{ opacity: isActive ? [0.4, 1, 0.4] : 0.2 }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-4 border-black"
                                    style={{ backgroundColor: factionColor }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Operative Linked</span>
                                <h4 className="text-lg font-black italic uppercase tracking-tighter text-[var(--text-main)] truncate max-w-[120px]">
                                    {data?.user?.name || 'Unknown'}
                                </h4>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[8px] font-bold uppercase tracking-widest opacity-30">Neural Sync</span>
                                <span className="text-xl font-black italic tabular-nums tracking-tighter" style={{ color: factionColor }}>
                                    {data?.syncLevel || 0}%
                                </span>
                            </div>
                            <div className="h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data?.syncLevel || 0}%` }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: factionColor, boxShadow: `0 0 10px ${factionColor}` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-[var(--border-main)]">
                        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2 block">System Status</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-tight opacity-60">Neural Feed Active</span>
                        </div>
                    </div>
                </div>

                {/* 2. ECG Pulse Wave */}
                <div className="lg:col-span-6 flex flex-col justify-center items-center min-h-[200px] relative px-4">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[120px] font-black italic opacity-[0.02] uppercase tracking-tighter leading-none select-none">
                            Vitals
                        </span>
                    </div>

                    <div className="w-full relative h-32">
                        {/* Static Base Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800/30 -translate-y-1/2" />
                        
                        {/* Animated Wave */}
                        <svg className="w-full h-full relative z-20" viewBox="0 0 400 100" preserveAspectRatio="none">
                            <motion.path
                                d="M 0 50 Q 25 50 50 50 L 60 50 L 70 20 L 80 80 L 90 50 L 100 50 Q 125 50 150 50 L 160 50 L 170 10 L 185 90 L 200 50 Q 225 50 250 50 L 260 50 L 270 30 L 280 70 L 290 50 Q 315 50 340 50 L 350 50 L 360 0 L 375 100 L 390 50 L 400 50"
                                fill="transparent"
                                stroke={factionColor}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray="1000"
                                initial={{ strokeDashoffset: 1000 }}
                                animate={{ strokeDashoffset: [1000, 0] }}
                                transition={{ 
                                    duration: Math.max(0.1, pulseDuration), 
                                    repeat: Infinity, 
                                    ease: "linear" 
                                }}
                            />
                            {/* Inner Glow Path */}
                            <motion.path
                                d="M 0 50 Q 25 50 50 50 L 60 50 L 70 20 L 80 80 L 90 50 L 100 50 Q 125 50 150 50 L 160 50 L 170 10 L 185 90 L 200 50 Q 225 50 250 50 L 260 50 L 270 30 L 280 70 L 290 50 Q 315 50 340 50 L 350 50 L 360 0 L 375 100 L 390 50 L 400 50"
                                fill="transparent"
                                stroke={factionColor}
                                strokeWidth="6"
                                strokeLinecap="round"
                                opacity="0.15"
                                animate={{ opacity: [0.1, 0.3, 0.1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                        </svg>

                        {/* Scanner Line */}
                        <motion.div 
                            animate={{ left: ['0%', '100%'] }}
                            transition={{ duration: Math.max(0.2, pulseDuration * 2), repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 bottom-0 w-px bg-white/20 z-30 shadow-[0_0_15px_white]"
                        />
                    </div>

                    <div className="flex gap-12 mt-4">
                        <div className="text-center">
                            <span className="text-[10px] font-black italic tabular-nums block" style={{ color: factionColor }}>
                                {data?.heartRate || 70}
                            </span>
                            <span className="text-[7px] uppercase font-bold opacity-30 tracking-widest">BPM</span>
                        </div>
                        <div className="text-center">
                            <AnimatePresence mode="wait">
                                <motion.span 
                                    key={data?.speed}
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-[10px] font-black italic tabular-nums block text-blue-500"
                                >
                                    {data?.speed || 0}
                                </motion.span>
                            </AnimatePresence>
                            <span className="text-[7px] uppercase font-bold opacity-30 tracking-widest">KM/H</span>
                        </div>
                    </div>
                </div>

                {/* 3. Adrenaline & Stress Indicators */}
                <div className="lg:col-span-3 flex flex-col justify-center border-l border-[var(--border-main)] pl-8 space-y-8">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[8px] font-bold uppercase tracking-widest opacity-30">Adrenaline</span>
                            <span className="text-[10px] font-black italic text-red-500">{data?.adrenaline || 0}%</span>
                        </div>
                        <div className="grid grid-cols-10 gap-1 h-3">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="h-full rounded-sm bg-slate-800/50 overflow-hidden">
                                    <motion.div 
                                        animate={{ 
                                            backgroundColor: (data?.adrenaline || 0) / 10 > i ? '#ef4444' : '#1e293b',
                                            boxShadow: (data?.adrenaline || 0) / 10 > i ? '0 0 10px #ef4444' : 'none'
                                        }}
                                        className="w-full h-full transition-colors"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 border border-[var(--border-main)] p-3 rounded-2xl flex flex-col">
                            <span className="text-[7px] font-bold opacity-20 uppercase mb-1">Stress</span>
                            <span className={`text-[10px] font-black uppercase ${data?.adrenaline > 70 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                                {data?.adrenaline > 70 ? 'CRITICAL' : data?.adrenaline > 30 ? 'ELEVATED' : 'STABLE'}
                            </span>
                        </div>
                        <div className="bg-slate-900/50 border border-[var(--border-main)] p-3 rounded-2xl flex flex-col">
                            <span className="text-[7px] font-bold opacity-20 uppercase mb-1">Focus</span>
                            <span className={`text-[10px] font-black uppercase ${data?.syncLevel > 80 ? 'text-green-500' : 'text-slate-400'}`}>
                                {data?.syncLevel > 80 ? 'PEAK' : data?.syncLevel > 50 ? 'NOMINAL' : 'LOW'}
                            </span>
                        </div>
                    </div>
                    
                    <button className="w-full py-3 bg-[var(--bg-main)] hover:bg-slate-800 border border-[var(--border-main)] rounded-2xl text-[8px] font-black uppercase tracking-[0.3em] transition-all transform active:scale-95 text-blue-500">
                        View Neural History
                    </button>
                </div>
            </div>

            {/* Scanning Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-b from-transparent via-white/[0.02] to-transparent animate-[scan_4s_linear_infinite]" />
            </div>
        </div>
    );
};

export default NeuralLink;
