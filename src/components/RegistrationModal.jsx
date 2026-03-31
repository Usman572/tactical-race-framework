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
                    className="bg-white w-full sm:max-w-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
                >
                    {/* Step Indicator */}
                    <div className="px-8 pt-8 pb-0 flex items-center gap-2">
                        {STEPS.map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-300 ${i <= step ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {i < step ? "✓" : i + 1}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${i === step ? 'text-slate-900' : 'text-slate-300'}`}>{s}</span>
                                {i < STEPS.length - 1 && <div className={`h-px w-8 transition-colors ${i < step ? 'bg-slate-900' : 'bg-slate-200'}`} />}
                            </div>
                        ))}
                        <button onClick={onClose} className="ml-auto p-2 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>

                    {/* Step Content */}
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Operative Brief</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Confirm mission parameters before deployment request</p>
                                </div>

                                {/* Race Summary Card */}
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Assignment</p>
                                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{race.name}</h3>
                                        </div>
                                        <span className="shrink-0 bg-blue-600/10 text-blue-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-blue-500/10">{race.type}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                            <p className="text-xs font-bold text-slate-700 mt-0.5">📍 {race.location}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                            <p className="text-xs font-bold text-slate-700 mt-0.5">📅 {new Date(race.date).toLocaleDateString()}</p>
                                        </div>
                                        {slotsLeft !== null && (
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Slots</p>
                                                <p className={`text-xs font-bold mt-0.5 ${slotsLeft <= 2 ? 'text-red-500' : 'text-emerald-600'}`}>
                                                    {isFull ? '🔴 Full' : `🟢 ${slotsLeft} remaining`}
                                                </p>
                                            </div>
                                        )}
                                        {deadline && (
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Deadline</p>
                                                <p className={`text-xs font-bold mt-0.5 ${isClosed ? 'text-red-500' : 'text-slate-700'}`}>
                                                    {isClosed ? '⛔ Closed' : `⏳ ${deadline.toLocaleDateString()}`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {/* Capacity Bar */}
                                    {race.maxParticipants && (
                                        <div className="pt-2">
                                            <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                                <span>Capacity</span>
                                                <span>{race.participants?.length || 0} / {race.maxParticipants}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-blue-600'}`}
                                                    style={{ width: `${Math.min(100, ((race.participants?.length || 0) / race.maxParticipants) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {(isFull || isClosed) ? (
                                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center">
                                        <p className="text-sm font-black text-red-600 uppercase tracking-tight">{isFull ? '🔴 Race is Full' : '⛔ Registration Closed'}</p>
                                        <p className="text-[10px] text-red-400 mt-1">{isFull ? 'No deployment slots available.' : 'The registration deadline has passed.'}</p>
                                    </div>
                                ) : (
                                    <button onClick={() => setStep(1)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10">
                                        Proceed to Deployment Intel →
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Deployment Intel</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Provide your operative profile for mission command review</p>
                                </div>

                                {/* Experience Level */}
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Operative Classification</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {EXPERIENCE_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setForm(f => ({ ...f, experience: opt.value }))}
                                                className={`p-3 rounded-2xl border-2 text-center transition-all ${form.experience === opt.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300'}`}
                                            >
                                                <div className="text-xl mb-1">{opt.icon}</div>
                                                <div className="text-[9px] font-black uppercase tracking-widest">{opt.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Vehicle Details */}
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Vehicle / Machine (optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2024 Dodge Challenger SRT"
                                        value={form.vehicleDetails}
                                        onChange={e => setForm(f => ({ ...f, vehicleDetails: e.target.value }))}
                                        className="w-full h-12 px-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600/40 focus:bg-white transition-all text-sm font-medium text-slate-800 placeholder:text-slate-300"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Message to Command (optional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Anything mission command should know about this operative..."
                                        value={form.message}
                                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600/40 focus:bg-white transition-all text-sm font-medium text-slate-800 placeholder:text-slate-300 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setStep(0)} className="px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                                        ← Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Transmitting Signal..." : "⚡ Transmit Request"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center space-y-6">
                                {result?.success ? (
                                    <>
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }} className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-3xl mx-auto shadow-2xl shadow-blue-500/30">⚡</motion.div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Signal Transmitted</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Awaiting operative authorization</p>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">Your deployment request has been sent to mission command. You'll receive a signal confirmation once approved.</p>
                                        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all">
                                            Return to Briefing
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-red-100 rounded-[1.5rem] flex items-center justify-center text-3xl mx-auto">⛔</div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Transmission Failed</h2>
                                            <p className="text-sm text-red-500 font-bold mt-2">{result?.message || "Signal blocked. Try again."}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => { setStep(1); }} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Retry</button>
                                            <button onClick={onClose} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all">Abort</button>
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
