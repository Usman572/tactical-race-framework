import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

const NeuralGrid = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    const rotateX = useTransform(y, [0, 800], [5, -5]);
    const rotateY = useTransform(x, [0, 1200], [-5, 5]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <motion.div 
                style={{ 
                    rotateX, 
                    rotateY,
                    perspective: 1000,
                }}
                className="absolute inset-[-20%] opacity-20"
            >
                <div 
                    className="w-full h-full"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(0, 243, 254, 0.15) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 243, 254, 0.15) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                />
            </motion.div>
            
            {/* Dynamic Interactive Spotlight */}
            <motion.div 
                style={{ 
                    left: x, 
                    top: y,
                    translateX: '-50%',
                    translateY: '-50%'
                }}
                className="absolute w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen"
            />
        </div>
    );
};

const TargetingBrackets = ({ isFocused }) => {
    return (
        <AnimatePresence>
            {isFocused && (
                <div className="absolute -inset-2 pointer-events-none z-20">
                    {/* Top Left */}
                    <motion.div
                        initial={{ opacity: 0, x: -10, y: -10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: -10, y: -10 }}
                        className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-sm"
                    />
                    {/* Top Right */}
                    <motion.div
                        initial={{ opacity: 0, x: 10, y: -10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 10, y: -10 }}
                        className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-sm"
                    />
                    {/* Bottom Left */}
                    <motion.div
                        initial={{ opacity: 0, x: -10, y: 10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: -10, y: 10 }}
                        className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-sm"
                    />
                    {/* Bottom Right */}
                    <motion.div
                        initial={{ opacity: 0, x: 10, y: 10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 10, y: 10 }}
                        className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-sm"
                    />
                    
                    {/* Focus Pulse Glow */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500/5 blur-xl rounded-2xl"
                    />
                </div>
            )}
        </AnimatePresence>
    );
};

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const result = await login({ email, password });

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
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[var(--bg-main)] relative overflow-hidden">
            <NeuralGrid />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-4 py-1.5 mb-6 bg-blue-600/10 border border-blue-500/20 rounded-full"
                    >
                        <span className="text-blue-500 text-[9px] font-black uppercase tracking-[0.3em]">Secure Auth Terminal // 04</span>
                    </motion.div>
                    <h1 className="text-5xl font-black tracking-tighter text-[var(--text-main)] mb-4 italic uppercase relative group cursor-default">
                        <span className="relative z-10">ACCESS <span className="text-blue-600 font-black">PORTAL</span></span>
                        
                        {/* Glitch Layers */}
                        <motion.span 
                            animate={{ 
                                x: [-2, 2, -1, 0],
                                opacity: [0, 0.3, 0.1, 0]
                            }}
                            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                            className="absolute inset-0 text-red-500/40 z-0 select-none mix-blend-screen"
                        >ACCESS PORTAL</motion.span>
                        <motion.span 
                            animate={{ 
                                x: [2, -2, 1, 0],
                                opacity: [0, 0.3, 0.2, 0]
                            }}
                            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2.5 }}
                            className="absolute inset-0 text-cyan-500/40 z-0 select-none mix-blend-screen"
                        >ACCESS PORTAL</motion.span>
                    </h1>
                    <p className="text-[var(--text-main)] opacity-40 text-sm font-bold uppercase tracking-widest italic">Identity verification required</p>
                    {error && (
                        <motion.p 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-500 mt-4 text-xs font-black uppercase tracking-widest bg-red-500/10 py-2 border border-red-500/20 rounded-lg"
                        >
                            ⚠️ Error: {error}
                        </motion.p>
                    )}
                </div>

                <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onSubmit={handleLogin} 
                    className="bg-[var(--header-bg)] p-10 rounded-[2.5rem] shadow-2xl border border-[var(--border-main)] space-y-8 backdrop-blur-xl relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative z-10 space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-3 ml-1">Identity (Email)</label>
                            <div className="relative">
                                <TargetingBrackets isFocused={focusedField === 'email'} />
                                <input
                                    type="email"
                                    required
                                    disabled={isSubmitting}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:opacity-20 italic relative z-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="operative@elite-circuit.net"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-3 px-1">
                                <label className="block text-[10px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em]">Access Code</label>
                                <Link to="#" className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest">Recovery?</Link>
                            </div>
                            <div className="relative">
                                <TargetingBrackets isFocused={focusedField === 'password'} />
                                <input
                                    type="password"
                                    required
                                    disabled={isSubmitting}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:opacity-20 italic relative z-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-glow-primary transition-all active:scale-[0.98] text-xs uppercase tracking-[0.4em] relative overflow-hidden group/btn disabled:opacity-50"
                        >
                            <span className="relative z-10">{isSubmitting ? 'Verifying...' : 'Authorize Login'}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </motion.form>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-10"
                >
                    <p className="text-[var(--text-main)] opacity-40 text-xs font-bold uppercase tracking-widest italic">
                        New Operative? <Link to="/register" className="text-blue-600 font-black hover:text-blue-500 transition-colors ml-2">Initialize Profile</Link>
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-10 p-6 bg-[var(--header-bg)] rounded-2xl border border-[var(--border-main)] backdrop-blur-md"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                            <span className="text-blue-500 text-xs text-center">💡</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-main)] opacity-60 font-medium leading-relaxed italic">
                            <strong className="text-blue-600 uppercase mr-1">Intelligence:</strong> Use <span className="font-bold">admin@race.com</span> for Elite Admin level access.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
