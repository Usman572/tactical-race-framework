import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRaces } from "../../context/RaceContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import TacticalHUD from "../../components/TacticalHUD";
import CommsChannel from "../../components/CommsChannel";

export default function LiveHUD() {
    const { id } = useParams();
    const { races, checkIn, startCountdown, completeRace, sendTelemetryPulse, sendRaceCommand } = useRaces();
    const { user } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(null);
    const [isFinishing, setIsFinishing] = useState(false);
    const [winnersList, setWinnersList] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const simulatorInterval = useRef(null);
    const pulseInterval = useRef(null);
    const countdownInterval = useRef(null);

    const race = races.find(r => r._id === id);
    const isCreator = race?.createdBy === user?.id || race?.createdBy?._id === user?.id || user?.role === 'admin';
    const isParticipant = race?.participants?.some(p => (p._id || p) === user?.id);

    useEffect(() => {
        if (socket && id) {
            socket.emit('join_live_hud', id);
            return () => socket.emit('leave_race_chat', id);
        }
    }, [socket, id]);

    useEffect(() => {
        if (race?.startTime) {
            const updateCountdown = () => {
                const now = new Date().getTime();
                const start = new Date(race.startTime).getTime();
                const diff = Math.max(0, Math.floor((start - now) / 1000));
                setTimeLeft(diff);
                if (diff === 0 && countdownInterval.current) {
                    clearInterval(countdownInterval.current);
                    if (isCreator && race.status === 'Active') {
                        sendRaceCommand(race._id, 'ENGAGE');
                    }
                }
            };
            updateCountdown();
            const intervalId = setInterval(updateCountdown, 1000);
            countdownInterval.current = intervalId;
            return () => clearInterval(intervalId);
        }
    }, [race?.startTime, race?.status, isCreator]);

    // Participant Telemetry Pulse
    useEffect(() => {
        if (race?.status === 'Live' && isParticipant && !isCreator) {
            const startPulse = () => {
                pulseInterval.current = setInterval(() => {
                    const myTelem = race.telemetry?.find(t => (t.user?._id || t.user) === user?.id);
                    sendTelemetryPulse(race._id, {
                        progress: Math.min(100, (myTelem?.progress || 0) + (Math.random() * 2)),
                        speed: 80 + Math.floor(Math.random() * 120),
                        status: 'En Route'
                    });
                }, 3000);
            };
            startPulse();
            return () => clearInterval(pulseInterval.current);
        }
    }, [race?.status, isParticipant, isCreator]);

    if (!race) return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
            <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-blue-500 font-black italic tracking-[0.5em] uppercase text-xl"
            >
                Establishing Uplink...
            </motion.div>
        </div>
    );

    const handleCheckIn = async () => {
        await checkIn(race._id);
    };

    const handleStartCountdown = async () => {
        await startCountdown(race._id);
    };

    const handleFinishLine = async () => {
        if (winnersList.length === 0) {
            alert("Select winners first!");
            return;
        }
        await completeRace(race._id, winnersList);
        setIsFinishing(false);
    };

    const toggleWinner = (participantId, position) => {
        setWinnersList(prev => {
            const exists = prev.find(w => w.user === participantId);
            if (exists) {
                if (exists.position === position) {
                    return prev.filter(w => w.user !== participantId);
                }
                return prev.map(w => w.user === participantId ? { ...w, position } : w);
            }
            return [...prev, { user: participantId, position, time: "N/A" }];
        });
    };

    const handleAbortRace = async () => {
        if (window.confirm("ABORT MISSION: This will cancel the current engagement. Confirm?")) {
            await sendRaceCommand(race._id, 'ABORT');
        }
    };

    const handleToggleSimulator = () => {
        if (isSimulating) {
            clearInterval(simulatorInterval.current);
            setIsSimulating(false);
        } else {
            setIsSimulating(true);
            simulatorInterval.current = setInterval(() => {
                race.participants?.forEach(p => {
                    const pId = p._id || p;
                    const currentTelem = race.telemetry?.find(t => (t.user?._id || t.user) === pId);
                    const currentProgress = currentTelem?.progress || 0;
                    
                    if (currentProgress < 100) {
                        sendTelemetryPulse(race._id, {
                            userId: pId, // Admin can update anyone in this simulation mode
                            progress: Math.min(100, currentProgress + (Math.random() * 5)),
                            speed: 120 + Math.floor(Math.random() * 150),
                            status: currentProgress + 5 >= 100 ? 'Finished' : 'En Route'
                        });
                    }
                });
            }, 2000);
        }
    };

    // Sort participants by progress for the leaderboard
    const sortedParticipants = [...(race.participants || [])].sort((a, b) => {
        const telemA = race.telemetry?.find(t => (t.user?._id || t.user) === (a._id || a));
        const telemB = race.telemetry?.find(t => (t.user?._id || t.user) === (b._id || b));
        return (telemB?.progress || 0) - (telemA?.progress || 0);
    });

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-24 pb-20 px-6 relative overflow-hidden transition-colors duration-500 font-tactical">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-[40rem] h-[40rem] bg-blue-600/5 blur-[150px] rounded-full animate-pulse-soft"></div>
                <div className="absolute bottom-1/4 -right-20 w-[40rem] h-[40rem] bg-purple-600/5 blur-[150px] rounded-full animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:40px_40px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8"
                >
                    <div>
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full mb-6">
                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping shadow-glow-primary"></span>
                            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] italic">
                                {race.status === 'Completed' ? 'MISSION STATUS: ACCOMPLISHED' : 'TACTICAL HUD // FEED ACTIVE'}
                            </span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
                            {race.name.split(' ').map((word, i) => (
                                <span key={i} className={i % 2 === 1 ? 'text-blue-600' : ''}>{word} </span>
                            ))}
                        </h1>
                        <p className="text-[var(--text-main)] opacity-30 font-black uppercase tracking-[0.5em] text-xs mt-4 italic">COORD: {race.location} // SECTOR {race.sector || 'ALPHA'}</p>
                    </div>

                    <div className="flex gap-6">
                        {isCreator && race.status !== 'Completed' && !race.startTime && (
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileInView={{ opacity: 1 }}
                                initial={{ opacity: 0 }}
                                onClick={handleStartCountdown}
                                className="px-10 py-5 bg-red-600 text-white font-black rounded-2xl shadow-glow-primary transition-all uppercase tracking-[0.3em] text-[10px] italic shadow-red-600/40"
                            >
                                Ignite Countdown
                            </motion.button>
                        )}
                        {isCreator && (race.status === 'Live' || (race.status === 'Active' && timeLeft === 0)) && !isFinishing && (
                            <div className="flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    onClick={handleToggleSimulator}
                                    className={`px-8 py-5 ${isSimulating ? 'bg-orange-600' : 'bg-blue-600'} text-white font-black rounded-2xl transition-all uppercase tracking-[0.3em] text-[10px] italic`}
                                >
                                    {isSimulating ? 'Kill Simulator' : 'Start Simulation'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    onClick={() => setIsFinishing(true)}
                                    className="px-8 py-5 bg-emerald-600 text-white font-black rounded-2xl transition-all uppercase tracking-[0.3em] text-[10px] italic shadow-emerald-600/40"
                                >
                                    End Mission
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    onClick={handleAbortRace}
                                    className="px-8 py-5 bg-zinc-800 text-red-500 font-black rounded-2xl border border-red-500/30 transition-all uppercase tracking-[0.3em] text-[10px] italic"
                                >
                                    Abort
                                </motion.button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Countdown / Race Status */}
                <AnimatePresence mode="wait">
                    {timeLeft > 0 ? (
                        <motion.div
                            key="countdown"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 2, opacity: 0, filter: "blur(20px)" }}
                            className="flex flex-col items-center justify-center p-20 bg-[var(--header-bg)] border border-[var(--border-main)] backdrop-blur-3xl rounded-[4rem] mb-16 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-grid-white/[0.03] bg-[length:20px_20px]" />
                            <div className="text-[14rem] md:text-[22rem] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-indigo-600 leading-none tracking-tighter drop-shadow-[0_0_80px_rgba(37,99,235,0.3)] animate-pulse-soft">
                                {timeLeft}
                            </div>
                            <div className="text-3xl font-black uppercase tracking-[0.8em] text-blue-500 animate-pulse italic">T-Minus to Burn</div>
                        </motion.div>
                    ) : timeLeft === 0 && (race.status === 'Active' || race.status === 'Live') ? (
                        <motion.div
                            key="engaged"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`flex flex-col items-center justify-center p-20 ${race.status === 'Live' ? 'bg-red-600 shadow-[0_0_150px_rgba(220,38,38,0.5)]' : 'bg-blue-600 shadow-[0_0_150px_rgba(37,99,235,0.5)]'} rounded-[4rem] mb-16 relative overflow-hidden transition-colors duration-1000`}
                        >
                             <motion.div 
                                animate={{ x: ['100%', '-100%'] }} 
                                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" 
                            />
                            <div className="text-8xl md:text-9xl font-black italic tracking-tighter uppercase text-white animate-bounce-slow relative z-10">
                                {race.status === 'Live' ? 'LIVE DEPLOYMENT' : 'ENGAGED'}
                            </div>
                            <div className="text-3xl font-black uppercase tracking-[0.8em] text-white/40 italic relative z-10">
                                {race.status === 'Live' ? 'REAL-TIME UPLINK ACTIVE' : 'Tactical Phase Active'}
                            </div>
                        </motion.div>
                    ) : race.status === 'Completed' && (
                        <motion.div
                             key="podium"
                             initial={{ y: 50, opacity: 0 }}
                             animate={{ y: 0, opacity: 1 }}
                             className="mb-16"
                        >
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-12 text-center text-yellow-500 flex items-center justify-center gap-6">
                                <span className="h-px bg-yellow-500/30 flex-1"></span>
                                🏆 VICTORS PODIUM 🏆
                                <span className="h-px bg-yellow-500/30 flex-1"></span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {[1, 2, 3].map(pos => {
                                    const victor = race.winners?.find(w => w.position === pos);
                                    return (
                                        <motion.div 
                                            key={pos} 
                                            whileHover={{ y: -5 }}
                                            className={`p-10 rounded-[3rem] border backdrop-blur-xl transition-all relative overflow-hidden ${
                                                pos === 1 ? 'bg-yellow-500/10 border-yellow-500/30 scale-105 shadow-[0_0_50px_rgba(234,179,8,0.15)] ring-2 ring-yellow-500/20' :
                                                pos === 2 ? 'bg-slate-300/5 border-[var(--border-main)]' :
                                                'bg-orange-500/5 border-[var(--border-main)]'
                                            }`}
                                        >
                                            <div className="absolute -top-10 -right-10 text-[10rem] font-black italic opacity-5">{pos}</div>
                                            <div className="text-5xl font-black italic opacity-20 mb-6 text-[var(--text-main)]">#{pos}</div>
                                            {victor ? (
                                                <div className="flex items-center gap-6 relative z-10">
                                                    <div className="w-20 h-20 rounded-[2rem] bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-3xl font-black italic shadow-xl group">
                                                        <span className="group-hover:scale-110 transition-transform">{victor.user?.name?.substring(0, 1)}</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-black truncate text-[var(--text-main)] uppercase tracking-tighter">{victor.user?.name}</div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mt-1 italic">Operative Clearance Level 4</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-[var(--text-main)] opacity-10 font-black italic text-lg tracking-widest">DATA_CORRUPT</div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Roster Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                                OPERATIVE ROSTER
                                <span className="text-sm italic font-black px-4 py-1 bg-blue-600 rounded-full text-white shadow-glow-primary">{race.participants?.length || 0}</span>
                            </h2>
                        </div>
                        
                        <motion.div 
                            variants={{
                                show: { transition: { staggerChildren: 0.05 } }
                            }}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {sortedParticipants.map(p => {
                                const isCheckedIn = race.checkIns?.some(cid => (cid._id || cid) === (p._id || p));
                                const telem = race.telemetry?.find(t => (t.user?._id || t.user) === (p._id || p));
                                return (
                                    <motion.div 
                                        key={p._id} 
                                        layout
                                        variants={{
                                            hidden: { opacity: 0, x: -20 },
                                            show: { opacity: 1, x: 0 }
                                        }}
                                        className={`p-6 rounded-[2.5rem] border backdrop-blur-xl transition-all flex flex-col relative overflow-hidden group ${
                                            isCheckedIn || telem ? 'bg-emerald-600/5 border-emerald-500/20' : 'bg-[var(--header-bg)] border-[var(--border-main)] opacity-60'
                                        }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="flex items-center justify-between mb-4 relative z-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center text-xl font-black italic overflow-hidden shadow-lg">
                                                    {p.profilePicture ? <img src={p.profilePicture} className="w-full h-full object-cover" /> : <span className="text-blue-500">{p.name?.substring(0, 1)}</span>}
                                                </div>
                                                <div>
                                                    <div className="font-black text-lg leading-none mb-1.5 uppercase tracking-tighter italic">{p.name}</div>
                                                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${isCheckedIn || telem ? 'text-emerald-500' : 'text-[var(--text-main)] opacity-30'}`}>
                                                        {telem?.status || (isCheckedIn ? 'At Coordinates' : 'En Route')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                {telem && (
                                                    <div className="text-2xl font-black italic text-blue-500 drop-shadow-glow">
                                                        {telem.speed} <span className="text-[10px] opacity-40 text-[var(--text-main)]">KM/H</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {(race.status === 'Live' || telem) && (
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative z-10 mb-2">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${telem?.progress || 0}%` }}
                                                    className="h-full bg-blue-600 shadow-glow-primary"
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">
                                                {telem ? `Progress: ${Math.floor(telem.progress)}%` : ''}
                                            </div>

                                            <div className="relative z-10">
                                                {isCheckedIn && !telem ? (
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                                                        <span className="animate-pulse">✓</span>
                                                    </div>
                                                ) : p._id === user?.id && !telem && !isCreator ? (
                                                    <button 
                                                        onClick={handleCheckIn}
                                                        className="px-6 py-3 bg-blue-600 hover:bg-black text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-[0.2em] italic shadow-glow-primary active:scale-95"
                                                    >
                                                        Check In
                                                    </button>
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-[var(--text-main)] opacity-10 animate-pulse" />
                                                )}
                                            </div>
                                        </div>

                                        {isFinishing && (
                                            <div className="absolute right-4 flex gap-2 z-20">
                                                {[1, 2, 3].map(pos => (
                                                    <button
                                                        key={pos}
                                                        onClick={(e) => { e.stopPropagation(); toggleWinner(p._id, pos); }}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                                                            winnersList.find(w => w.user === p._id && w.position === pos)
                                                            ? 'bg-yellow-500 text-black border-none shadow-glow-primary scale-110'
                                                            : 'bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] opacity-40 hover:opacity-100'
                                                        }`}
                                                    >
                                                        {pos}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>

                    {/* Mission Intel */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-10"
                    >
                        <div>
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-8 text-blue-500 border-b border-blue-500/20 pb-4">Tactical Feed</h2>
                            <TacticalHUD />
                        </div>

                        <div className="group">
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-8 text-[var(--text-main)] border-b border-[var(--border-main)] pb-4">Mission Specs</h2>
                            <div className="p-10 bg-[var(--header-bg)] backdrop-blur-3xl border border-[var(--border-main)] rounded-[3rem] space-y-8 relative overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-grid-white/[0.01] bg-[length:15px_15px]" />
                                <div className="relative z-10">
                                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2 text-right italic opacity-50">Circuit Classification</div>
                                    <div className="text-4xl font-black text-right italic uppercase tracking-tighter">{race.type}</div>
                                </div>
                                <div className="relative z-10 pt-8 border-t border-[var(--border-main)]">
                                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2 text-right italic opacity-50">Engagement Vector</div>
                                    <div className="text-4xl font-black text-right italic uppercase tracking-tighter">{race.trackLength} KM</div>
                                </div>
                                <div className="relative z-10 pt-8 border-t border-[var(--border-main)]">
                                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2 text-right italic opacity-50">Operational Sector</div>
                                    <div className="text-3xl font-black text-right text-blue-600 italic uppercase tracking-tighter">{race.location}</div>
                                </div>
                            </div>
                        </div>

                        {isFinishing && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-10 bg-emerald-600/10 border border-emerald-500/30 text-white rounded-[3rem] shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-emerald-600/5 animate-pulse" />
                                <h3 className="font-black italic uppercase tracking-[0.3em] text-[10px] text-emerald-500 relative z-10">Seal Engagement Results</h3>
                                <p className="text-xs font-bold text-[var(--text-main)] opacity-60 leading-relaxed uppercase tracking-tighter relative z-10 italic">Select the top 3 high-impact operatives to archive this mission and distribute tactical accolades.</p>
                                <div className="space-y-3 relative z-10">
                                    <button 
                                        onClick={handleFinishLine}
                                        className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all uppercase tracking-[0.3em] text-[10px] italic shadow-glow-primary"
                                    >
                                        Transmit Final Results
                                    </button>
                                    <button 
                                        onClick={() => { setIsFinishing(false); setWinnersList([]); }}
                                        className="w-full py-4 bg-transparent border border-white/10 hover:bg-white/5 text-[var(--text-main)] opacity-40 font-black rounded-2xl transition-all uppercase tracking-[0.3em] text-[9px] italic"
                                    >
                                        Abort Review
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
            
            <div className="mt-16 relative z-10">
                <CommsChannel raceId={id} isLiveHUD={true} />
            </div>
        </div>
    );
}
