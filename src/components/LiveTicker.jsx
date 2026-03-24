import { motion } from "framer-motion";

const tickerItems = [
    "PROTOCOL BREAK: New Arena Unlocked in Kyoto Night Pass",
    "PILOT UPDATE: User 'SpeedDemon' achieved Elite Rank",
    "DEALER INTEL: Limited edition chassis available for Tokyo Drift",
    "LIVE FEED: 24 active engagements detected in Seoul Circuit",
    "SYSTEM ALERT: Tactical Mapping Phase 4 initialization imminent",
    "RANKING SHIFT: Top 3 pilots separated by less than 0.5s",
];

export default function LiveTicker() {
    return (
        <div className="bg-blue-600 h-12 flex items-center overflow-hidden border-y border-white/10 select-none">
            <div className="flex-none bg-blue-700 h-full px-6 flex items-center z-10 shadow-[20px_0_40px_rgba(0,0,0,0.2)]">
                <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Live Pulse
                </span>
            </div>

            <div className="flex-1 relative flex items-center">
                <motion.div
                    animate={{ x: ["0%", "-100%"] }}
                    transition={{
                        duration: 40,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="flex whitespace-nowrap gap-12 px-12"
                >
                    {[...tickerItems, ...tickerItems].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">•</span>
                            <span className="text-white font-bold text-xs uppercase tracking-wider">{item}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="flex-none px-6 text-white/50 text-[10px] font-black uppercase tracking-widest hidden md:block border-l border-white/10 h-full flex items-center">
                UTC {new Date().toISOString().substring(11, 16)}
            </div>
        </div>
    );
}
