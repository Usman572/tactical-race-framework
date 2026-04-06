import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRaces } from "../../context/RaceContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import RaceCard from "../../components/RaceCard";
import RaceCardSkeleton from "../../components/RaceCardSkeleton";
import TacticalFilter from "../../components/TacticalFilter";

export default function Races() {
    const { filteredRaces, filters, setFilters, loading, deleteRace } = useRaces();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this engagement dossier?")) {
            await deleteRace(id);
        }
    };

    return (
        <div className="min-h-screen pb-20 pt-[120px] bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 flex flex-col md:flex-row justify-between items-end gap-10"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                            <h1 className="text-6xl font-black tracking-tighter uppercase italic">
                                ACTIVE <span className="text-blue-600">ENGAGEMENTS</span>
                            </h1>
                        </div>
                        <p className="text-xl opacity-40 max-w-2xl font-medium italic">
                            Analyze and participate in upcoming race deployments across the verified circuit.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="group relative flex items-center gap-4 px-10 py-5 bg-[var(--header-bg)] rounded-2xl hover:border-blue-500/50 transition-all active:scale-95 border border-[var(--border-main)] shadow-xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex flex-col items-end mr-2 relative z-10">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Tactical</span>
                            <span className="text-sm font-black italic uppercase tracking-tighter text-[var(--text-main)]">Filter</span>
                        </div>
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-glow-primary group-hover:scale-110 transition-transform relative z-10">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                        </div>
                        { (filters.sectors.length > 0 || filters.types.length > 0 || filters.maxDistance < 1000) && (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[var(--bg-main)] z-20"
                            >
                                !
                            </motion.span>
                        )}
                    </button>
                </motion.div>

                {/* Races Grid */}
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
                    animate="show"
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
                                    onDelete={handleDelete}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-32 bg-[var(--glass-bg)] backdrop-blur-md rounded-[3rem] border border-[var(--border-main)] text-center shadow-2xl relative overflow-hidden group">
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--accent-primary-glow)_0%,_transparent_70%)] opacity-0 group-hover:opacity-10 transition-opacity duration-1000"></div>
                            <span className="opacity-20 font-black uppercase tracking-[0.5em] text-sm animate-pulse italic">
                                No matching engagements found in the matrix
                            </span>
                        </div>
                    )}
                </motion.div>
                <TacticalFilter 
                    filters={filters} 
                    setFilters={setFilters} 
                    isOpen={isFilterOpen} 
                    setIsOpen={setIsFilterOpen} 
                />
            </div>
        </div>
    );
}
