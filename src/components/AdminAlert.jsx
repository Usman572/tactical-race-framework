import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

const AdminAlert = () => {
    const socket = useSocket();
    const [activeAlert, setActiveAlert] = useState(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('admin_alert', (alert) => {
            setActiveAlert(alert);
            
            // Auto-clear after 10 seconds
            setTimeout(() => {
                setActiveAlert(null);
            }, 10000);
        });

        return () => {
            socket.off('admin_alert');
        };
    }, [socket]);

    const getAlertColor = (type) => {
        switch (type) {
            case 'Critical': return 'bg-red-600';
            case 'Security': return 'bg-orange-600';
            case 'Information': return 'bg-blue-600';
            default: return 'bg-slate-800';
        }
    };

    return (
        <AnimatePresence>
            {activeAlert && (
                <motion.div
                    initial={{ y: -100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -100, opacity: 0, scale: 0.9 }}
                    className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-lg"
                >
                    <div className={`${getAlertColor(activeAlert.type)} p-1 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative group`}>
                        {/* Glitch Background Effect */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)] animate-[scan_4s_linear_infinite]" />
                        </div>
                        
                        <div className="bg-black/90 backdrop-blur-xl p-8 rounded-xl flex items-center gap-8 relative z-10 border border-white/10">
                            {/* Icon / Signal Status */}
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-12 h-12 rounded-xl ${getAlertColor(activeAlert.type)} flex items-center justify-center text-2xl shadow-glow-primary animate-pulse`}>
                                    ⚠️
                                </div>
                                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Priority</span>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] italic">Tactical Broadcast</h4>
                                    <span className="text-[8px] font-black text-white/30 uppercase tabular-nums">
                                        {new Date(activeAlert.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-lg font-black text-white italic leading-tight uppercase tracking-tight">
                                    {activeAlert.message}
                                </p>
                            </div>

                            <button 
                                onClick={() => setActiveAlert(null)}
                                className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors text-xs"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Animated Border */}
                        <motion.div 
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AdminAlert;
