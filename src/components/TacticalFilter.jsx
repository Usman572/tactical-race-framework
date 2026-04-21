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
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-80 bg-[var(--header-bg)] border-l border-[var(--border-main)] z-[101] p-8 shadow-2xl overflow-y-auto relative"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] rounded-full -mr-16 -mt-16" />
                        
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-[var(--text-main)]">Tactical Filter</h3>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Targeting Parameters</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)] opacity-40 rounded-xl hover:opacity-100 hover:text-red-500 transition-all active:scale-90"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="space-y-10 relative z-10">
                            {/* Sector Filter */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-30 text-[var(--text-main)]">Sector Selection</h4>
                                <div className="space-y-3">
                                    {sectors.map(sector => (
                                        <button
                                            key={sector}
                                            onClick={() => toggleFilter('sectors', sector)}
                                            className={`w-full text-left px-5 py-4 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all italic active:scale-95 ${
                                                filters.sectors.includes(sector) 
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-glow-primary scale-[1.02]' 
                                                : 'bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-main)] opacity-60 hover:opacity-100 hover:border-blue-500/50'
                                            }`}
                                        >
                                            {sector}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Race Type Filter */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-30 text-[var(--text-main)]">Engagement Type</h4>
                                <div className="space-y-3">
                                    {types.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleFilter('types', type)}
                                            className={`w-full text-left px-5 py-4 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all italic active:scale-95 ${
                                                filters.types.includes(type) 
                                                ? 'bg-orange-600 border-orange-500 text-white shadow-glow-secondary scale-[1.02]' 
                                                : 'bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-main)] opacity-60 hover:opacity-100 hover:border-orange-500/50'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Distance Slider */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-[var(--text-main)]">Track Magnitude</h4>
                                    <span className="text-[10px] font-black text-blue-500 italic uppercase tracking-widest">{filters.maxDistance} KM</span>
                                </div>
                                <div className="relative pt-1 px-1">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="5000" 
                                        step="50"
                                        value={filters.maxDistance}
                                        onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                                        className="w-full h-1 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer accent-blue-600 border border-[var(--border-main)]"
                                    />
                                    <div className="flex justify-between mt-4">
                                        <span className="text-[9px] font-black opacity-20 text-[var(--text-main)] uppercase tracking-widest italic">Min Limit</span>
                                        <span className="text-[9px] font-black opacity-20 text-[var(--text-main)] uppercase tracking-widest italic">5K KM Limit</span>
                                    </div>
                                </div>
                            </div>

                            {/* Reset Button */}
                            <button
                                onClick={() => setFilters({ sectors: [], types: [], maxDistance: 5000 })}
                                className="w-full py-5 bg-[var(--bg-main)] text-[var(--text-main)] rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[var(--glass-bg)] hover:text-red-500 transition-all mt-10 border border-[var(--border-main)] group active:scale-95 italic"
                            >
                                <span className="group-hover:animate-pulse">Reset Parameters</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TacticalFilter;
