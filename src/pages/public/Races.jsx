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
                    className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6"
                >
                    <div className="flex-1">
                        <h1 className="text-6xl font-black tracking-tighter mb-4">
                            ACTIVE <span className="text-blue-600">RACES</span>
                        </h1>
                        <p className="text-xl opacity-60 max-w-2xl font-medium">
                            Analyze and participate in upcoming race deployments across the verified circuit.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="group flex items-center gap-3 px-8 py-4 glass-premium rounded-2xl hover:border-blue-500/50 transition-all active:scale-95"
                    >
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Tactical</span>
                            <span className="text-sm font-black italic uppercase tracking-tighter">Filter</span>
                        </div>
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                        </div>
                        { (filters.sectors.length > 0 || filters.types.length > 0 || filters.maxDistance < 1000) && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-[var(--bg-main)]">!</span>
                        )}
                    </button>
                </motion.div>

                {/* Races Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => <RaceCardSkeleton key={i} />)
                    ) : filteredRaces.length > 0 ? (
                        filteredRaces.map((race) => (
                            <RaceCard 
                                key={race._id}
                                race={race}
                                user={user}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 bg-[var(--glass-bg)] backdrop-blur-md rounded-[2.5rem] border border-[var(--border-main)] text-center shadow-2xl">
                            <span className="opacity-40 font-black uppercase tracking-[0.2em] text-[var(--text-main)]">
                                No active engagements found in the matrix
                            </span>
                        </div>
                    )}
                </div>
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
