import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Brief", "Intel", "Signal"];

const EXPERIENCE_OPTIONS = [
    { value: "Rookie", label: "Rookie", icon: "🟢", desc: "First deployment. Learning the grid." },
    { value: "Veteran", label: "Veteran", icon: "🔵", desc: "Multiple deployments. Battle-hardened." },
    { value: "Elite", label: "Elite", icon: "🔴", desc: "Top-tier operative. Faction legend." },
];

export default function RegistrationModal({ race, onClose, onSubmit, isSubmitting, result }) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({ message: "", vehicleDetails: "", experience: "Rookie" });

    const now = new Date();
    const deadline = race.registrationDeadline ? new Date(race.registrationDeadline) : null;
    const isFull = race.maxParticipants && race.participants?.length >= race.maxParticipants;
    const isClosed = deadline && now > deadline;
    const slotsLeft = race.maxParticipants ? race.maxParticipants - (race.participants?.length || 0) : null;

    const handleSubmit = () => {
        onSubmit(form);
        setStep(2);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
            >
                <motion.div
                    initial={{ y: 80, opacity: 0, scale: 0.96 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 80, opacity: 0, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-[var(--bg-main)] w-full sm:max-w-xl rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-[var(--border-main)] overflow-hidden relative transition-colors duration-500"
                >
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:25px_25px] pointer-events-none" />

                    {/* Step Indicator */}
                    <div className="px-10 pt-10 pb-0 flex items-center gap-3 relative z-10">
                        {STEPS.map((s, i) => (
                            <div key={s} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all duration-500 shadow-xl ${i <= step ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-[var(--header-bg)] text-[var(--text-main)] opacity-30'}`}>
                                    {i < step ? "✓" : i + 1}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-[0.3em] transition-colors italic ${i === step ? 'text-blue-500' : 'text-[var(--text-main)] opacity-20'}`}>{s}</span>
                                {i < STEPS.length - 1 && <div className={`h-[2px] w-8 rounded-full transition-all duration-500 ${i < step ? 'bg-blue-600' : 'bg-[var(--border-main)]'}`} />}
                            </div>
                        ))}
                        <button onClick={onClose} className="ml-auto p-3 rounded-2xl text-[var(--text-main)] opacity-20 hover:opacity-100 hover:bg-white/5 transition-all active:scale-90">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>

                    {/* Step Content */}
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-10 space-y-8 relative z-10">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter text-[var(--text-main)] uppercase italic">Operative Brief</h2>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mt-2 italic">Confirm mission parameters before deployment request</p>
                                </div>

                                {/* Race Summary Card */}
                                <div className="bg-[var(--header-bg)]/50 backdrop-blur-3xl rounded-[2rem] p-8 border border-[var(--border-main)] space-y-6 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    <div className="flex items-start justify-between gap-4 relative z-10">
                                        <div>
                                            <p className="text-[9px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-2 italic">Target Assignment</p>
                                            <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight italic leading-none">{race.name}</h3>
                                        </div>
                                        <span className="shrink-0 bg-blue-600/10 text-blue-500 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl border border-blue-500/20 italic shadow-xl">{race.type}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[var(--border-main)] relative z-10">
                                        <div>
                                            <p className="text-[8px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] italic mb-1.5">Location</p>
                                            <p className="text-xs font-black text-[var(--text-main)] flex items-center gap-2 italic uppercase">
                                                <span className="text-blue-500 text-sm">📍</span> {race.location}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] italic mb-1.5">Launch_Time</p>
                                            <p className="text-xs font-black text-[var(--text-main)] flex items-center gap-2 italic uppercase">
                                                <span className="text-blue-500 text-sm">📅</span> {new Date(race.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {slotsLeft !== null && (
                                            <div>
                                                <p className="text-[8px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] italic mb-1.5">Availability</p>
                                                <p className={`text-xs font-black italic uppercase flex items-center gap-2 ${slotsLeft <= 2 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {isFull ? <span className="w-2 h-2 rounded-full bg-red-500 shadow-glow-red animate-pulse" /> : <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-emerald animate-pulse" />}
                                                    {isFull ? 'Sector Full' : `${slotsLeft} Slots Remaining`}
                                                </p>
                                            </div>
                                        )}
                                        {deadline && (
                                            <div>
                                                <p className="text-[8px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] italic mb-1.5">Signal_Cutoff</p>
                                                <p className={`text-xs font-black italic uppercase flex items-center gap-2 ${isClosed ? 'text-red-500' : 'text-blue-500'}`}>
                                                    <span className="text-sm">⏳</span> {isClosed ? 'Signal Lost' : deadline.toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {/* Capacity Bar */}
                                    {race.maxParticipants && (
                                        <div className="pt-4 relative z-10">
                                            <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.4em] mb-2.5 italic">
                                                <span className="text-[var(--text-main)] opacity-30">Sector Occupancy</span>
                                                <span className={isFull ? 'text-red-500' : 'text-blue-600'}>{race.participants?.length || 0} / {race.maxParticipants}</span>
                                            </div>
                                            <div className="h-2 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-main)] p-[2px] shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, ((race.participants?.length || 0) / race.maxParticipants) * 100)}%` }}
                                                    transition={{ duration: 1.5, ease: "circOut" }}
                                                    className={`h-full rounded-full shadow-lg ${isFull ? 'bg-red-600 shadow-red-600/20' : 'bg-blue-600 shadow-blue-600/20'}`}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {(isFull || isClosed) ? (
                                    <div className="p-6 bg-red-600/10 rounded-2xl border border-red-500/20 text-center shadow-xl">
                                        <p className="text-xs font-black text-red-500 uppercase tracking-[0.2em] italic">{isFull ? 'Sector Max Capacity' : 'Signal Transmission Expired'}</p>
                                        <p className="text-[9px] font-black text-red-500 opacity-40 mt-1.5 uppercase italic">{isFull ? 'No deployment slots available.' : 'The registration deadline has passed.'}</p>
                                    </div>
                                ) : (
                                    <button onClick={() => setStep(1)} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-[0.98] shadow-glow-primary italic relative overflow-hidden group/btn">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                        Initialize Intelligence →
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-10 space-y-8 relative z-10">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter text-[var(--text-main)] uppercase italic">Deployment Intel</h2>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mt-2 italic">Provide your operative profile for mission command review</p>
                                </div>

                                {/* Experience Level */}
                                <div>
                                    <p className="text-[9px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] mb-4 italic">Operative Grade</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {EXPERIENCE_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setForm(f => ({ ...f, experience: opt.value }))}
                                                className={`p-5 rounded-2xl border-2 text-center transition-all shadow-xl active:scale-95 group/opt relative overflow-hidden ${form.experience === opt.value ? 'border-blue-600 bg-blue-600 shadow-blue-600/20' : 'border-[var(--border-main)] bg-[var(--header-bg)] hover:border-blue-600/40'}`}
                                            >
                                                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover/opt:opacity-100 transition-opacity" />
                                                <div className="text-3xl mb-2 relative z-10 group-hover/opt:scale-110 transition-transform">{opt.icon}</div>
                                                <div className={`text-[10px] font-black uppercase tracking-[0.2em] relative z-10 italic ${form.experience === opt.value ? 'text-white' : 'text-[var(--text-main)] opacity-60'}`}>{opt.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Vehicle Details */}
                                <div>
                                    <label className="text-[9px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] block mb-2.5 italic">Machine_ID (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="E.G. 2024 DODGE CHALLENGER SRT"
                                        value={form.vehicleDetails}
                                        onChange={e => setForm(f => ({ ...f, vehicleDetails: e.target.value }))}
                                        className="w-full h-14 px-6 bg-[var(--header-bg)] rounded-2xl border-2 border-transparent focus:border-blue-600/40 transition-all text-sm font-black text-[var(--text-main)] placeholder:opacity-20 uppercase tracking-widest italic shadow-inner"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="text-[9px] font-black text-[var(--text-main)] opacity-30 uppercase tracking-[0.3em] block mb-2.5 italic">Comms_Feed (Optional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="SIGNAL DATA FOR COMMAND..."
                                        value={form.message}
                                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                        className="w-full px-6 py-4 bg-[var(--header-bg)] rounded-2xl border-2 border-transparent focus:border-blue-600/40 transition-all text-sm font-black text-[var(--text-main)] placeholder:opacity-20 uppercase tracking-widest italic shadow-inner resize-none h-32"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(0)} className="px-8 py-5 rounded-2xl bg-[var(--header-bg)] text-[var(--text-main)] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white/5 transition-all border border-[var(--border-main)] italic shadow-xl">
                                        ← Abort
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-[0.98] shadow-glow-primary italic disabled:opacity-30 relative overflow-hidden group/send"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover/send:translate-x-full transition-transform duration-1000" />
                                        {isSubmitting ? "SYNCING..." : "Transmit_Intel ⚡"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-10 text-center space-y-8 relative z-10">
                                {result?.success ? (
                                    <>
                                        <motion.div 
                                            initial={{ scale: 0, rotate: -180 }} 
                                            animate={{ scale: 1, rotate: 0 }} 
                                            transition={{ type: "spring", damping: 15, delay: 0.2 }} 
                                            className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-emerald-500/30 text-white"
                                        >
                                            ⚡
                                        </motion.div>
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tighter text-[var(--text-main)] uppercase italic">Signal Transmitted</h2>
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mt-2 italic underline decoration-blue-500/30 underline-offset-4">Awaiting operative authorization</p>
                                        </div>
                                        <p className="text-sm text-[var(--text-main)] opacity-40 font-black uppercase tracking-tight italic leading-relaxed">Your deployment request has been synced with mission command. You'll receive a signal confirmation once cleared.</p>
                                        <button onClick={onClose} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-glow-primary italic">
                                            Return to Sector Feed
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-24 h-24 bg-red-600/10 rounded-[2rem] flex items-center justify-center text-4xl mx-auto border-2 border-red-500/20 text-red-500 shadow-xl">⛔</div>
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tighter text-[var(--text-main)] uppercase italic">Transmission Error</h2>
                                            <p className="text-sm font-black text-red-500 uppercase italic tracking-widest mt-4">{result?.message || "Signal blocked by external factors."}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => { setStep(1); }} className="flex-1 py-5 bg-[var(--header-bg)] text-[var(--text-main)] rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white/5 transition-all border border-[var(--border-main)] italic shadow-xl">Retry_Link</button>
                                            <button onClick={onClose} className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black transition-all italic shadow-xl shadow-red-600/20">Abort_Protocol</button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
