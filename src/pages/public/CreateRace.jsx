import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRaces } from "../../context/RaceContext";
import { motion } from "framer-motion";

export default function CreateRace() {
    const navigate = useNavigate();
    const { addRace } = useRaces();
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        location: "",
        type: "Marathon",
        trackLength: "",
        status: "Active",
        participantsCount: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const result = await addRace(formData);
        if (result.success) {
            navigate("/");
        } else {
            alert(result.message || "Failed to create race. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] py-20 px-4 relative overflow-hidden transition-colors duration-500">
            {/* Cinematic Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[150px] rounded-full animate-pulse-soft" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/5 blur-[150px] rounded-full animate-pulse-soft" style={{ animationDelay: '3s' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl mx-auto relative z-10"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="inline-block px-4 py-1.5 mb-6 bg-blue-600/10 border border-blue-500/20 rounded-full"
                    >
                        <span className="text-blue-500 text-[9px] font-black uppercase tracking-[0.3em]">Operational Commission // PROTOCOL 7</span>
                    </motion.div>
                    <h1 className="text-5xl font-black tracking-tighter text-[var(--text-main)] mb-4 italic uppercase">
                        INITIALIZE <span className="text-blue-600">OPERATION</span>
                    </h1>
                    <p className="text-[var(--text-main)] opacity-40 text-sm font-bold uppercase tracking-widest italic leading-relaxed">
                        Register a new high-stakes engagement for sector clearance
                    </p>
                </div>

                <motion.form 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit} 
                    className="bg-[var(--header-bg)] p-12 rounded-[3rem] shadow-2xl border border-[var(--border-main)] space-y-10 backdrop-blur-xl relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px] pointer-events-none" />
                    
                    <div className="relative z-10 space-y-10">
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-3 ml-1 italic">Tactical Name (Race Event)</label>
                            <input
                                type="text"
                                name="name"
                                required
                                disabled={isSubmitting}
                                className="w-full px-6 py-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] font-black focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:opacity-20 italic text-sm"
                                placeholder="Operation: Velocity"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-3 ml-1 italic">Deployment Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-6 py-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] font-black focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all italic text-sm"
                                    value={formData.date}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-3 ml-1 italic">Sector Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-6 py-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] font-black focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:opacity-20 italic text-sm"
                                    placeholder="e.g. Neo Tokyo Sector 7"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-3 ml-1 italic">Engagement Class</label>
                                <select
                                    name="type"
                                    disabled={isSubmitting}
                                    className="w-full px-6 py-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] font-black focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all italic text-sm appearance-none"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="Marathon">Marathon</option>
                                    <option value="Sprint">Sprint</option>
                                    <option value="Street">Street Race</option>
                                    <option value="Circuit">Circuit</option>
                                    <option value="Drift">Drift</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-3 ml-1 italic">Track Vector Length</label>
                                <select
                                    name="trackLength"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-6 py-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] font-black focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all italic text-sm appearance-none"
                                    value={formData.trackLength}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Distance</option>
                                    <option value="1">1 KM (Sprint)</option>
                                    <option value="2">2 KM (Short)</option>
                                    <option value="5">5 KM (Short)</option>
                                    <option value="10">10 KM (Medium)</option>
                                    <option value="15">15 KM (Long)</option>
                                    <option value="21.1">21.1 KM (Half Marathon)</option>
                                    <option value="42.2">42.2 KM (Full Marathon)</option>
                                    <option value="50">50 KM (Ultra)</option>
                                    <option value="100">100 KM (Centurion)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-8 flex items-center justify-end gap-6">
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                disabled={isSubmitting}
                                className="px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-[var(--text-main)] opacity-40 hover:opacity-100 hover:bg-white/5 transition-all italic"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-12 py-5 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-glow-primary transition-all hover:bg-blue-700 hover:-translate-y-1 active:scale-95 italic disabled:opacity-50"
                            >
                                {isSubmitting ? "Initializing..." : "Authorize Commission"}
                            </button>
                        </div>
                    </div>
                </motion.form>
            </motion.div>
        </div>
    );
}
