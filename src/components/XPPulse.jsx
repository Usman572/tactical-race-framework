import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function XPPulse() {
    const { user, updateUser } = useAuth();
    const socket = useSocket();
    const [notification, setNotification] = useState(null);
    const [prevXP, setPrevXP] = useState(0);

    useEffect(() => {
        if (!socket) return;

        const handleXPUpdate = (data) => {
            // Set notification data
            setNotification({
                ...data,
                timestamp: Date.now(),
                isLevelUp: false
            });

            // Update user state globally
            updateUser({
                xp: data.xp,
                level: data.level
            });

            // Auto-hide after 5 seconds
            setTimeout(() => {
                setNotification(prev => prev?.timestamp === data.timestamp ? null : prev);
            }, 5000);
        };

        const handleLevelUp = (data) => {
            setNotification({
                ...data,
                timestamp: Date.now(),
                isLevelUp: true,
                gain: 0, // Level up might not have a gain value in the event
                reason: 'Promoted to Next Tier'
            });

            setTimeout(() => {
                setNotification(prev => prev?.timestamp === data.timestamp ? null : prev);
            }, 7000);
        };

        socket.on('xp_update', handleXPUpdate);
        socket.on('level_up', handleLevelUp);

        return () => {
            socket.off('xp_update', handleXPUpdate);
            socket.off('level_up', handleLevelUp);
        };
    }, [socket, updateUser]);

    // Keep track of XP for the filling animation
    useEffect(() => {
        if (user?.xp) {
            setPrevXP(user.xp);
        }
    }, [user?.xp]);

    if (!notification || !user) return null;

    const xpForCurrentLevel = (notification.level - 1) * (notification.level - 1) * 500;
    const xpForNextLevel = notification.level * notification.level * 500;
    
    // Calculate percentages for the animation
    const oldXP = notification.xp - notification.gain;
    const oldPercentage = Math.min(Math.max(((oldXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100, 0), 100);
    const newPercentage = Math.min(Math.max(((notification.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100, 0), 100);

    return (
        <AnimatePresence>
            <motion.div
                key={notification.timestamp}
                initial={{ opacity: 0, x: 100, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
                className="fixed top-24 right-8 z-[9999] w-80 pointer-events-none"
            >
                <div className={`relative p-6 rounded-2xl border backdrop-blur-2xl shadow-2xl overflow-hidden ${notification.isLevelUp ? 'bg-white/10 border-yellow-500/50 shadow-yellow-500/20' : 'bg-blue-950/40 border-blue-500/30 shadow-blue-500/20'}`}>
                    {/* Animated Background Grid */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--accent-primary-glow)_0%,_transparent_70%)] animate-pulse" />
                    <div className="absolute inset-0 bg-grid-white/5 bg-[length:15px_15px]" />

                    {/* Scanning Line */}
                    <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30 z-10"
                    />

                    <div className="relative z-20 flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${notification.isLevelUp ? 'text-yellow-500' : 'text-blue-400'}`}>
                                    {notification.isLevelUp ? '// PROMOTION_SIGNAL' : '// DATA_SYNC_COMPLETE'}
                                </span>
                                <h3 className="text-white font-black text-lg italic uppercase tracking-tighter">
                                    {notification.isLevelUp ? 'Level Up' : `+${notification.gain} XP`}
                                </h3>
                            </div>
                            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-black italic ${notification.isLevelUp ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-blue-600 border-blue-400 text-white shadow-glow-primary'}`}>
                                {notification.level}
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Source:</span>
                            <span className="text-[10px] text-white/90 font-medium italic">{notification.reason}</span>
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Live_Progression</span>
                                <span className="text-[10px] font-black text-blue-400 tabular-nums">
                                    {Math.floor(notification.xp - xpForCurrentLevel)} / {xpForNextLevel - xpForCurrentLevel}
                                </span>
                            </div>
                            
                            <div className="h-2 bg-black/40 rounded-full border border-white/10 p-[1.5px] overflow-hidden">
                                <motion.div 
                                    initial={{ width: `${oldPercentage}%` }}
                                    animate={{ width: `${newPercentage}%` }}
                                    transition={{ duration: 2, ease: "circOut", delay: 0.5 }}
                                    className={`h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] ${notification.isLevelUp ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`}
                                />
                            </div>
                        </div>

                        {/* Targeting Brackets */}
                        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20" />
                        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20" />
                        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/20" />
                        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20" />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
