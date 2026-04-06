import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Register() {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const result = await signup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        });

        if (result.success) {
            const role = result.data.role;
            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'partner') {
                navigate('/partner');
            } else {
                navigate('/');
            }
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-[var(--bg-main)] relative overflow-hidden">
            {/* Cinematic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse-soft" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[150px] rounded-full animate-pulse-soft" style={{ animationDelay: '3s' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full relative z-10"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="inline-block px-4 py-1.5 mb-6 bg-blue-600/10 border border-blue-500/20 rounded-full"
                    >
                        <span className="text-blue-500 text-[9px] font-black uppercase tracking-[0.3em]">Initialize Operative Profile // V2.4</span>
                    </motion.div>
                    <h1 className="text-5xl font-black tracking-tighter text-[var(--text-main)] mb-4 italic uppercase">
                        JOIN THE <span className="text-blue-600">CIRCUIT</span>
                    </h1>
                    <p className="text-[var(--text-main)] opacity-40 text-sm font-bold uppercase tracking-widest italic leading-relaxed">
                        Establish your digital footprint in the elite racing matrix
                    </p>
                    {error && (
                        <motion.p 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-500 mt-6 text-xs font-black uppercase tracking-widest bg-red-500/10 py-3 border border-red-500/20 rounded-xl"
                        >
                            ⚠️ System Alert: {error}
                        </motion.p>
                    )}
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    onSubmit={handleSubmit}
                    className="bg-[var(--header-bg)] rounded-[3rem] shadow-2xl border border-[var(--border-main)] p-12 space-y-10 backdrop-blur-xl relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-3 ml-1">Callsign (Full Name)</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    disabled={isSubmitting}
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Operative Name"
                                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:opacity-20 italic"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-3 ml-1">Comm Link (Email)</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    disabled={isSubmitting}
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="operative-comm@net.net"
                                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:opacity-20 italic"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-3 ml-1">Access Cipher (Password)</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    disabled={isSubmitting}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••••••"
                                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:opacity-20 italic"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-3 ml-1">Designation Role</p>
                            <div className="grid grid-cols-1 gap-4">
                                <RoleCard
                                    label="Racer / Operative"
                                    desc="Compete in the circuit"
                                    icon="🏎️"
                                    value="user"
                                    active={formData.role === "user"}
                                    onChange={handleChange}
                                    activeClass="border-blue-600 bg-blue-600/10 text-blue-500 shadow-glow-primary"
                                />
                                <RoleCard
                                    label="Strategic Partner"
                                    desc="Manage events & teams"
                                    icon="🤝"
                                    value="partner"
                                    active={formData.role === "partner"}
                                    onChange={handleChange}
                                    activeClass="border-orange-500 bg-orange-600/10 text-orange-500 shadow-glow-secondary"
                                />
                                <RoleCard
                                    label="System Admin"
                                    desc="Manage platform logic"
                                    icon="⚡"
                                    value="admin"
                                    active={formData.role === "admin"}
                                    onChange={handleChange}
                                    activeClass="border-red-600 bg-red-600/10 text-red-500 shadow-glow-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-6 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-glow-primary transition-all active:scale-[0.98] text-xs uppercase tracking-[0.5em] relative overflow-hidden group/btn disabled:opacity-50 mt-4"
                    >
                        <span className="relative z-10">{isSubmitting ? 'Initializing...' : 'Authorize Registration'}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </button>
                </motion.form>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12"
                >
                    <p className="text-[var(--text-main)] opacity-40 text-[10px] font-black uppercase tracking-[0.2em] italic">
                        Established Identity? <Link to="/login" className="text-blue-600 font-black hover:text-blue-400 transition-colors ml-3 border-b border-blue-600/30">Initiate Access</Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}

function RoleCard({ label, desc, icon, value, active, onChange, activeClass }) {
    return (
        <label
            className={`cursor-pointer rounded-2xl border-2 p-4 transition-all relative overflow-hidden active:scale-95 flex items-center gap-4 ${active
                ? `${activeClass} border-opacity-100`
                : "bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-main)] opacity-40 hover:opacity-100 hover:border-white/20"
                }`}
        >
            <input
                type="radio"
                name="role"
                value={value}
                checked={active}
                onChange={onChange}
                className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-xl shadow-inner">
                {icon}
            </div>
            <div className="flex-1">
                <span className="block text-[11px] font-black uppercase tracking-widest italic">{label}</span>
                <span className="block text-[9px] font-bold opacity-60 uppercase tracking-tighter mt-0.5">{desc}</span>
            </div>
            {active && (
                <motion.div 
                    layoutId="role-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" 
                />
            )}
        </label>
    );
}
