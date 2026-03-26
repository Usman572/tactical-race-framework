import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

export default function GlobalMissionAlert() {
    const [activeEvents, setActiveEvents] = useState([]);
    const socket = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchEvents();
        }
    }, [user]);

    useEffect(() => {
        if (socket) {
            const handleNewEvent = (event) => {
                setActiveEvents(prev => [...prev, event]);
            };
            socket.on('global_mission_alert', handleNewEvent);
            return () => socket.off('global_mission_alert', handleNewEvent);
        }
    }, [socket]);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/events`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setActiveEvents(data);
            }
        } catch (err) {
            console.error('Failed to fetch events', err);
        }
    };

    if (activeEvents.length === 0) return null;

    return (
        <div className="w-full bg-black border-y border-white/5 relative overflow-hidden">
            {/* Animated Background Pulse */}
            <motion.div 
                className="absolute inset-0 bg-blue-600/5"
                animate={{ opacity: [0, 0.2, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between relative z-10">
                <AnimatePresence mode="wait">
                    {activeEvents.map((event, idx) => (
                        <motion.div 
                            key={event._id || idx}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="flex items-center gap-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 italic">Global Mission Active</span>
                            </div>

                            <div className="h-4 w-px bg-white/10 hidden md:block" />

                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                <h4 className="text-xs font-black text-white uppercase tracking-tighter group">
                                    <span className="opacity-40 mr-2">[{event.id || 'EVT-PULSE'}]</span>
                                    {event.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-medium opacity-80 line-clamp-1">{event.description}</p>
                            </div>

                            {event.type === 'XP_BOOST' && (
                                <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full">
                                    <span className="text-[9px] font-black text-blue-500 uppercase">XP Multiplier:</span>
                                    <span className="text-xs font-black text-blue-400">x{event.multiplier}</span>
                                </div>
                            )}

                            <div className="hidden lg:flex items-center gap-2 ml-4">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expires In:</span>
                                <Countdown date={event.endTime} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

function Countdown({ date }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(date).getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft('EXPIRED');
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(timer);
    }, [date]);

    return <span className="text-[10px] font-mono font-black text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">{timeLeft}</span>;
}
