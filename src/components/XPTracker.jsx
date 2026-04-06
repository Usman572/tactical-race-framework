import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function XPTracker({ variant = 'default' }) {
    const { user, updateUser } = useAuth();
    const socket = useSocket();
    const [lastGain, setLastGain] = useState(null);

    useEffect(() => {
        if (socket) {
            socket.on('xp_update', (data) => {
                // Update local user state
                updateUser({ 
                    xp: data.xp, 
                    level: data.level,
                    dailyXP: (user.dailyXP || 0) + (data.gain || 0) 
                });
                
                // Show gain animation
                setLastGain(data);
                setTimeout(() => setLastGain(null), 3000);
            });

            socket.on('level_up', (data) => {
                // Level up is handled by xp_update usually, but we could trigger a special modal here
                console.log('LEVEL UP!', data.level);
            });

            return () => {
                socket.off('xp_update');
                socket.off('level_up');
            };
        }
    }, [socket, updateUser, user.dailyXP]);

    if (!user) return null;

    const xpForCurrentLevel = (user.level - 1) * (user.level - 1) * 500;
    const xpForNextLevel = user.level * user.level * 500;
    const currentProgress = user.xp - xpForCurrentLevel;
    const totalNeeded = xpForNextLevel - xpForCurrentLevel;
    const percentage = Math.min((currentProgress / totalNeeded) * 100, 100);

    if (variant === 'minimal') {
        return (
            <div className="relative flex items-center gap-4 group/xp">
                <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-glow-primary border border-white/20 relative z-10"
                >
                    <span className="text-white font-black text-[12px] italic">{user.level || 1}</span>
                    <div className="absolute -inset-1 bg-blue-500/20 blur-md rounded-full opacity-0 group-hover/xp:opacity-100 transition-opacity" />
                </motion.div>
                <div className="hidden lg:flex flex-col gap-1.5 pt-0.5">
                    <div className="flex justify-between items-end w-24">
                        <span className="text-[9px] font-black uppercase text-blue-500 tracking-[0.3em] italic">XP</span>
                        <span className="text-[9px] font-black text-[var(--text-main)] opacity-30 italic">{Math.round(percentage)}%</span>
                    </div>
                    <div className="h-1.5 w-24 bg-[var(--header-bg)] rounded-full overflow-hidden border border-[var(--border-main)] p-[1.5px] shadow-inner backdrop-blur-xl">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className="h-full bg-blue-600 rounded-full shadow-glow-primary"
                        />
                    </div>
                </div>
                <AnimatePresence mode="popLayout">
                    {lastGain && (
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.5 }}
                            animate={{ opacity: 1, y: -30, scale: 1.2 }}
                            exit={{ opacity: 0, y: -50, scale: 0.8 }}
                            className="absolute -top-4 right-0 font-black text-blue-500 text-[10px] pointer-events-none drop-shadow-glow italic"
                        >
                            +{lastGain.gain} // SYNC
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="relative flex items-center gap-6 bg-[var(--header-bg)]/40 backdrop-blur-3xl px-6 py-3 rounded-[1.8rem] border border-[var(--border-main)] group/full hover:border-blue-500/30 transition-all shadow-2xl">
            {/* Level Badge */}
            <div className="relative">
                <motion.div 
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-glow-primary border border-white/20 relative z-10 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-grid-white/10 bg-[length:10px_10px]" />
                    <span className="text-white font-black text-sm uppercase tracking-tighter italic relative z-10">LVL</span>
                    <span className="absolute -bottom-1.5 -right-1.5 bg-[var(--text-main)] text-[var(--bg-main)] w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black border-2 border-blue-600 shadow-xl relative z-20">
                        {user.level || 1}
                    </span>
                </motion.div>
            </div>

            {/* XP Bar */}
            <div className="flex flex-col gap-2.5 min-w-[160px]">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 italic">Operative_XP</span>
                        <div className="text-[8px] font-black text-[var(--text-main)] opacity-20 uppercase tracking-[0.2em] mt-1">Class_IV Dossier</div>
                    </div>
                    <span className="text-[11px] font-black text-[var(--text-main)] opacity-40 italic tracking-tighter">{Math.floor(currentProgress)} <span className="text-blue-500 opacity-100">/</span> {totalNeeded}</span>
                </div>
                <div className="h-2.5 w-full bg-[var(--bg-main)]/50 rounded-full overflow-hidden border border-[var(--border-main)] p-[2px] shadow-inner">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-full shadow-glow-primary"
                    />
                </div>
            </div>

            {/* Gain Floaties */}
            <AnimatePresence mode="popLayout">
                {lastGain && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: -50, x: 20, scale: 1.1 }}
                        exit={{ opacity: 0, y: -80, scale: 0.5 }}
                        className="absolute right-0 font-black text-blue-500 text-sm pointer-events-none drop-shadow-glow italic"
                    >
                        <div className="flex flex-col items-end">
                            <span className="text-xl">+{lastGain.gain} XP</span>
                            <span className="text-[9px] opacity-40 uppercase tracking-[0.3em] mt-1">Intel_Sync: {lastGain.reason}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
