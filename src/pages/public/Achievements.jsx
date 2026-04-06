import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { motion } from 'framer-motion';

const ACHIEVEMENT_DEFS = {
    FIRST_BLOOD: { id: 'FIRST_BLOOD', name: 'First Blood', description: 'Join your first race.', icon: '🏁' },
    COMMANDER: { id: 'COMMANDER', name: 'Commander', description: 'Create your first race.', icon: '🛰️' },
    OPERATIVE: { id: 'OPERATIVE', name: 'Social Operative', description: 'Transmit 50 signal messages.', icon: '📡' },
    VETERAN_JOINER: { id: 'VETERAN_JOINER', name: 'Veteran Joiner', description: 'Participate in 10 races.', icon: '🎖️' }
};

const RANKS = [
    { name: 'Rookie', minXP: 0, color: 'bg-slate-400' },
    { name: 'Scout', minXP: 101, color: 'bg-green-500' },
    { name: 'Veteran', minXP: 501, color: 'bg-blue-600' },
    { name: 'Elite Operative', minXP: 2001, color: 'bg-purple-600' }
];

const Achievements = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/users/${user._id || user.id}`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchUserData();
    }, [user]);

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const currentPoints = stats?.stats?.points || 0;
    const currentRank = stats?.rank || 'Rookie';
    const unlockedIds = (stats?.achievements || []).map(a => a.id);

    const nextRank = RANKS.find(r => currentPoints < r.minXP);
    const prevRank = [...RANKS].reverse().find(r => currentPoints >= r.minXP);
    
    const progressToNext = nextRank 
        ? ((currentPoints - prevRank.minXP) / (nextRank.minXP - prevRank.minXP)) * 100 
        : 100;

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 text-[var(--text-main)]">
            {/* Header Section */}
            <header className="mb-12">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 mb-2"
                >
                    <span className="text-4xl filter drop-shadow-xl">🎖️</span>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-[var(--text-main)]">Operative Dossier</h1>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-[0.3em]">Tactical Progression & Awards</p>
                    </div>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rank Progress Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-[var(--glass-border)] h-full overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full -mr-16 -mt-16" />
                        
                        <div className="text-center mb-8 relative z-10">
                            <motion.div 
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4 ${RANKS.find(r => r.name === currentRank)?.color || 'bg-slate-400'}`}
                            >
                                {currentRank[0]}
                            </motion.div>
                            <h2 className="text-2xl font-black tracking-tight uppercase italic text-[var(--text-main)]">{currentRank}</h2>
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">{currentPoints} XP Accumulated</p>
                        </div>

                        {nextRank && (
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
                                    <span>Progress to {nextRank.name}</span>
                                    <span>{Math.floor(progressToNext)}%</span>
                                </div>
                                <div className="h-4 bg-[var(--bg-main)] rounded-full overflow-hidden p-1 border border-[var(--border-main)]">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressToNext}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                    />
                                </div>
                                <p className="text-[10px] font-medium opacity-40 text-center italic">
                                    Gain {nextRank.minXP - currentPoints} more XP to reach {nextRank.name} rank.
                                </p>
                            </div>
                        )}
                        
                        <div className="mt-12 space-y-4 relative z-10">
                            <div className="p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)]">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Combat Missions</p>
                                <p className="text-lg font-black tracking-tight">{stats?.stats?.racesJoined || 0} Races Joined</p>
                            </div>
                            <div className="p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)]">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Signal Intel</p>
                                <p className="text-lg font-black tracking-tight">{stats?.stats?.messagesSent || 0} Messages Transmitted</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Achievements Grid */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.values(ACHIEVEMENT_DEFS).map((ach, index) => {
                            const isUnlocked = unlockedIds.includes(ach.id);
                            return (
                                <motion.div 
                                    key={ach.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (index * 0.1) }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className={`p-6 rounded-[2rem] border-2 transition-all duration-300 ${isUnlocked ? 'bg-[var(--glass-bg)] border-blue-500/20 shadow-xl' : 'bg-[var(--bg-main)] border-dashed border-[var(--border-main)] opacity-40'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${isUnlocked ? 'bg-blue-600/10 border border-blue-500/20' : 'bg-[var(--bg-main)] grayscale opacity-50'}`}>
                                            {ach.icon}
                                        </div>
                                        <div>
                                            <h3 className={`font-black text-lg tracking-tight uppercase italic ${isUnlocked ? 'text-[var(--text-main)]' : 'opacity-40'}`}>
                                                {ach.name}
                                            </h3>
                                            <p className={`text-xs font-medium leading-relaxed mt-1 ${isUnlocked ? 'opacity-60' : 'opacity-40'}`}>
                                                {ach.description}
                                            </p>
                                            {isUnlocked && (
                                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/10 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    Authorized
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mt-8 p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/30 overflow-hidden relative group"
                    >
                        <div className="relative z-10">
                            <h3 className="text-xl font-black uppercase italic tracking-tight mb-2">Tactical Advantage</h3>
                            <p className="text-sm text-blue-100 font-medium leading-relaxed max-w-md">
                                Higher ranks grant increased operational authority and unique identifiers in signals. Maintain active participation to ascend the command chain.
                            </p>
                        </div>
                        <motion.div 
                            animate={{ rotate: [12, 15, 12] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-10 -bottom-10 text-[120px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"
                        >
                            🎖️
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Achievements;
