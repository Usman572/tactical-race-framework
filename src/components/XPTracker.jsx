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
            <div className="relative flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <span className="text-white font-black text-[10px]">{user.level || 1}</span>
                </div>
                <div className="hidden lg:flex flex-col gap-0.5">
                    <div className="flex justify-between w-20">
                        <span className="text-[7px] font-black uppercase text-blue-500 tracking-widest">XP</span>
                        <span className="text-[7px] font-black opacity-30">{Math.round(percentage)}%</span>
                    </div>
                    <div className="h-1 w-20 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className="h-full bg-blue-600"
                        />
                    </div>
                </div>
                <AnimatePresence>
                    {lastGain && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: -25 }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-2 right-0 font-black text-blue-400 text-[9px] pointer-events-none"
                        >
                            +{lastGain.gain}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="relative flex items-center gap-4 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 group">
            {/* Level Badge */}
            <div className="relative">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-transform">
                    <span className="text-white font-black text-xs uppercase tracking-tighter">LVL</span>
                    <span className="absolute -bottom-1 -right-1 bg-white text-blue-600 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black border-2 border-blue-600">
                        {user.level || 1}
                    </span>
                </div>
            </div>

            {/* XP Bar */}
            <div className="flex flex-col gap-1.5 min-w-[120px]">
                <div className="flex justify-between items-end">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-500">Operative XP</span>
                    <span className="text-[9px] font-black opacity-40">{Math.floor(currentProgress)} / {totalNeeded}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    />
                </div>
            </div>

            {/* Gain Floaties */}
            <AnimatePresence>
                {lastGain && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, x: 20 }}
                        animate={{ opacity: 1, y: -40, x: 20 }}
                        exit={{ opacity: 0, y: -60 }}
                        className="absolute right-0 font-black text-blue-400 text-xs pointer-events-none drop-shadow-2xl"
                    >
                        +{lastGain.gain} XP
                        <div className="text-[8px] opacity-60 uppercase tracking-tighter">{lastGain.reason}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
