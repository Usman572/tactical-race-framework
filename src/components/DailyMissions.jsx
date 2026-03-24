import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { measureFetch } from '../utils/telemetry';

export default function DailyMissions() {
    const { user } = useAuth();
    const [missions, setMissions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchMissions = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await measureFetch(`${API_BASE_URL}/api/missions`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) setMissions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchMissions();
    }, [isOpen]);

    if (!user) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[60]">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative"
            >
                <div className="absolute inset-0 bg-blue-400 rounded-2xl animate-ping opacity-20 group-hover:opacity-40"></div>
                <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {missions.some(m => !m.isCompleted) && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-4 border-slate-950 rounded-full"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-20 right-0 w-[350px] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-blue-600/20 to-transparent">
                            <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">Daily Recon</h3>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Status: Active Operations</p>
                        </div>

                        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="py-12 flex justify-center">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : missions.map(mission => (
                                <div key={mission.id} className={`p-4 rounded-2xl border transition-all ${mission.isCompleted ? 'bg-green-500/10 border-green-500/20 opacity-60' : 'bg-white/5 border-white/10'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`text-xs font-black uppercase tracking-wider ${mission.isCompleted ? 'text-green-400' : 'text-white'}`}>
                                            {mission.title}
                                        </h4>
                                        <span className="text-[10px] font-black text-blue-500">+{mission.xpReward} XP</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-4">{mission.description}</p>
                                    
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                            <span className="text-slate-500">Progress</span>
                                            <span className={mission.isCompleted ? 'text-green-400' : 'text-white'}>
                                                {mission.currentValue} / {mission.targetValue}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(mission.currentValue / mission.targetValue) * 100}%` }}
                                                className={`h-full rounded-full ${mission.isCompleted ? 'bg-green-500' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-white/5 text-center">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Next Refresh: 00:00 UTC</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
