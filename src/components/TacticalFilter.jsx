import { motion, AnimatePresence } from "framer-motion";

const TacticalFilter = ({ filters, setFilters, isOpen, setIsOpen }) => {
    const sectors = ['Neon District', 'Outlands', 'The Void', 'Cyber City', 'Industrial Zone'];
    const types = ['Marathon', 'Sprint', 'Street', 'Circuit', 'Drift'];

    const toggleFilter = (category, value) => {
        setFilters(prev => {
            const current = prev[category];
            const next = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [category]: next };
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-80 bg-[var(--bg-main)] border-l border-[var(--border-main)] z-[101] p-8 shadow-2xl overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Tactical Filter</h3>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Targeting Parameters</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-all"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Search Mockup (since we have Global Search elsewhere, this focuses on categories) */}
                        <div className="space-y-8">
                            {/* Sector Filter */}
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-slate-500">Sector Selection</h4>
                                <div className="space-y-2">
                                    {sectors.map(sector => (
                                        <button
                                            key={sector}
                                            onClick={() => toggleFilter('sectors', sector)}
                                            className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all ${filters.sectors.includes(sector) ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
                                        >
                                            {sector}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Race Type Filter */}
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-slate-500">Engagement Type</h4>
                                <div className="space-y-2">
                                    {types.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleFilter('types', type)}
                                            className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all ${filters.types.includes(type) ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Distance Slider Mock */}
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-slate-500">Track Distance (Max)</h4>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1000" 
                                    value={filters.maxDistance}
                                    onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: e.target.value }))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-[10px] font-bold text-slate-500 italic">0 KM</span>
                                    <span className="text-xs font-black text-blue-500 italic">{filters.maxDistance} KM</span>
                                    <span className="text-[10px] font-bold text-slate-500 italic">1000 KM</span>
                                </div>
                            </div>

                            {/* Reset Button */}
                            <button
                                onClick={() => setFilters({ sectors: [], types: [], maxDistance: 1000 })}
                                className="w-full py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all mt-10 border border-white/5"
                            >
                                Reset Targeting
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TacticalFilter;
