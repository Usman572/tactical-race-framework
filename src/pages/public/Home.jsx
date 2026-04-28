import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRaces } from "../../context/RaceContext";
import RaceMap from "../../components/RaceMap";
import RaceCard from "../../components/RaceCard";
import RaceCardSkeleton from "../../components/RaceCardSkeleton";
import { useScroll, useTransform } from "framer-motion";
import { API_BASE_URL } from "../../config/api";

const GuestHero = () => (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Deep Mesh Gradient Background */}
        <div className="absolute inset-0 z-0">
            {/* Cinematic Radial Layers */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_#1e3a8a_0%,_transparent_50%)] opacity-40 animate-[pulse_8s_infinite]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_#1e1b4b_0%,_transparent_50%)] opacity-40 animate-[pulse_12s_infinite]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#2563eb_0%,_transparent_70%)] opacity-20"></div>

            {/* Dark Cinematic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950"></div>

            {/* Dynamic Vignette */}
            <div className="absolute inset-0 ring-[150px] ring-inset ring-slate-950/60 pointer-events-none"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 mx-auto px-12 text-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full"
            >
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-white/80 text-[10px] font-black uppercase tracking-[0.4em]">Next Event: Tokyo Night Drift — 22:00</span>
            </motion.div>

            <div className="relative mb-10 mt-16">
                <h1 className="text-[12vw] md:text-[10vw] font-black text-white leading-[0.85] tracking-tighter italic select-none">
                    <motion.span
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="block"
                    >ELITE</motion.span>
                    <motion.span
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20"
                    >CIRCUIT</motion.span>
                </h1>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 blur-[100px] rounded-full"></div>
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-16 font-medium leading-relaxed"
            >
                Experience the pinnacle of competitive racing. Join a global community of elite drivers and build your legacy in the most immersive digital racing platform ever created.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col md:flex-row items-center justify-center gap-8"
            >
                <Link
                    to="/register"
                    className="group relative px-12 py-6 bg-white text-slate-950 rounded-[2rem] font-black text-xl uppercase tracking-widest transition-all hover:scale-105 hover:bg-blue-600 hover:text-white shadow-[0_0_50px_rgba(255,255,255,0.15)] active:scale-95 overflow-hidden"
                >
                    <span className="relative z-10">Sign Up</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link
                    to="/login"
                    className="px-12 py-6 bg-transparent backdrop-blur-md border-2 border-white/20 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest hover:border-white transition-all hover:bg-white/5 active:scale-95"
                >
                    Login
                </Link>
            </motion.div>

            {/* Bottom Stats Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-12"
            >
                <div className="group cursor-crosshair">
                    <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-blue-500 transition-colors">12.5K</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Verified Pilots</div>
                </div>
                <div className="group cursor-crosshair">
                    <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-blue-500 transition-colors">84+</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Global Arenas</div>
                </div>
                <div className="group cursor-crosshair">
                    <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-blue-500 transition-colors">LIVE</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Telemetry</div>
                </div>
                <div className="group cursor-crosshair">
                    <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-blue-500 transition-colors">4K</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">High Fidelity</div>
                </div>
            </motion.div>
        </div>

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay"></div>
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        {/* Floating Accents */}
        <motion.div
            style={{ y: useTransform(useScroll().scrollY, [0, 500], [0, -100]) }}
            className="absolute top-[20%] right-[10%] text-white/5 font-black text-9xl italic pointer-events-none select-none tracking-tighter"
        >
            SPD
        </motion.div>
        <motion.div
            style={{ y: useTransform(useScroll().scrollY, [0, 500], [0, 100]) }}
            className="absolute bottom-[20%] left-[5%] text-white/5 font-black text-9xl italic pointer-events-none select-none tracking-tighter"
        >
            LVL
        </motion.div>
    </div>
);

export default function Home() {
    const { races, filteredRaces, loading } = useRaces();
    const { user } = useAuth();
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 500], [0, 200]);
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    if (!user) {
        return (
            <>
                <style>{`
                    @keyframes slow-zoom {
                        from { transform: scale(1); }
                        to { transform: scale(1.1); }
                    }
                    @keyframes fade-in-down {
                        from { opacity: 0; transform: translateY(-20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes fade-in {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slide-in-left {
                        from { opacity: 0; transform: translateX(-50px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    @keyframes slide-in-right {
                        from { opacity: 0; transform: translateX(50px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                `}</style>
                <GuestHero />
            </>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pb-20 pt-[100px] bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
            {/* Hero Section */}
            <motion.section
                style={{ y: heroY, opacity: heroOpacity }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="py-20 text-center bg-[var(--header-bg)] border-b border-[var(--border-main)] w-full px-6 backdrop-blur-sm relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--accent-primary-glow)_0%,_transparent_50%)] opacity-20"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-block px-4 py-1.5 mb-8 bg-blue-600/10 border border-blue-500/20 rounded-full"
                    >
                        <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">System Link: Stable // Welcome Operative</span>
                    </motion.div>
                    <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] italic uppercase">
                        <span className="block">DOMINATE</span>
                        <span className="text-blue-600 block">THE CIRCUIT</span>
                    </h1>
                    <p className="text-xl md:text-2xl opacity-40 max-w-2xl mx-auto mb-12 font-medium italic">
                        Greetings, {user.name}. Your next tactical engagement is ready.
                    </p>
                    <div className="flex justify-center gap-6">
                        <Link to="/races/new" className="group relative bg-blue-600 text-white px-12 py-5 rounded-2xl font-black shadow-xl shadow-blue-500/20 text-xs uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 overflow-hidden">
                            <span className="relative z-10">Initialize Race</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Link>
                    </div>
                </div>
            </motion.section>

            {/* Tactical Mapping Section */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-6 mb-16"
                    >
                        <div className="w-2 h-10 bg-blue-600 rounded-full shadow-glow-primary" />
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic">
                            TACTICAL <span className="text-blue-600">OVERVIEW</span>
                        </h2>
                    </motion.div>

                    <div className="rounded-[3rem] overflow-hidden border border-[var(--border-main)] shadow-2xl bg-[var(--header-bg)]">
                        <RaceMap races={races} />
                    </div>
                </div>
            </section>

            {/* Races Grid */}
            <section className="py-24 px-6 bg-[var(--header-bg)]/30">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-6 mb-16"
                    >
                        <div className="w-2 h-10 bg-orange-600 rounded-full shadow-glow-secondary" />
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic">
                            ACTIVE <span className="text-orange-600">ENGAGEMENTS</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                    >
                        {loading ? (
                            Array(6).fill(0).map((_, i) => <RaceCardSkeleton key={i} />)
                        ) : filteredRaces.length > 0 ? (
                            filteredRaces.map((race) => (
                                <motion.div
                                    key={race._id}
                                    variants={{
                                        hidden: { opacity: 0, y: 30 },
                                        show: { opacity: 1, y: 0 }
                                    }}
                                >
                                    <RaceCard
                                        race={race}
                                        user={user}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-32 bg-[var(--glass-bg)] backdrop-blur-md rounded-[3rem] border border-[var(--border-main)] text-center shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--accent-primary-glow)_0%,_transparent_70%)] opacity-0 group-hover:opacity-10 transition-opacity duration-1000"></div>
                                <span className="opacity-20 font-black uppercase tracking-[0.3em] text-sm animate-pulse italic">
                                    No tactical matches found for current filters.
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
