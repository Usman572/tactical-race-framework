import { motion } from 'framer-motion';

export default function MissionCertificate({ race, user }) {
    if (!race || !user) return null;

    const isWinner = race.winners?.some(w => (w.user._id || w.user) === user._id && w.position === 1);
    const participationData = race.winners?.find(w => (w.user._id || w.user) === user._id);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full aspect-[16/9] bg-slate-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl"
        >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#2563eb_0,transparent_50%)]"></div>
                <div className="absolute inset-0 bg-grid-white/[0.02]"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative h-full flex flex-col items-center justify-between p-12 text-center">
                {/* Header */}
                <div className="w-full flex justify-between items-start">
                    <div className="text-left">
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Operative Record</div>
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">ID: {race._id.slice(-8).toUpperCase()}</div>
                    </div>
                    <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl rotate-45">
                        <span className="text-white font-black text-2xl -rotate-45 italic">{user.name[0]}</span>
                    </div>
                </div>

                {/* Main Body */}
                <div className="my-8">
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-4"
                    >
                        Mission Clearance: Level {user.level || 1}
                    </motion.div>
                    
                    <h2 className="text-5xl font-black italic tracking-tighter text-white mb-4 leading-none uppercase">
                        {isWinner ? 'ELITE PERFORMANCE' : 'MISSION COMPLETE'}
                    </h2>
                    
                    <p className="text-slate-400 max-w-lg text-xs font-medium leading-relaxed italic opacity-60">
                        This document certifies that operative <span className="text-white font-black">{user.name}</span> has successfully completed 
                        deployment <span className="text-white font-black underline decoration-blue-500/50">{race.name}</span> in the 
                        <span className="text-blue-500 font-black"> {race.sector || 'Unassigned'} Sector</span>.
                    </p>
                </div>

                {/* Footer Stats */}
                <div className="w-full flex justify-center gap-12 border-t border-white/5 pt-8">
                    <div className="text-center">
                        <div className="text-2xl font-black text-white">{participationData?.position || 'FINISHER'}</div>
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Deployment Rank</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-white">{race.trackLength || 'S/A'}KM</div>
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Sector Distance</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-blue-500">+{isWinner ? 250 : 100} XP</div>
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Accrued Yield</div>
                    </div>
                </div>
            </div>

            {/* Floating Accents */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full"></div>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full"></div>
        </motion.div>
    );
}
