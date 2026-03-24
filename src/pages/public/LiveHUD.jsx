import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRaces } from "../../context/RaceContext";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import TacticalHUD from "../../components/TacticalHUD";

export default function LiveHUD() {
    const { id } = useParams();
    const { races, checkIn, startCountdown, completeRace } = useRaces();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(null);
    const [isFinishing, setIsFinishing] = useState(false);
    const [winnersList, setWinnersList] = useState([]);
    const countdownInterval = useRef(null);

    const race = races.find(r => r._id === id);
    const isCreator = race?.createdBy === user?.id || race?.createdBy?._id === user?.id || user?.role === 'admin';
    const isParticipant = race?.participants?.some(p => (p._id || p) === user?.id);

    useEffect(() => {
        if (race?.startTime) {
            const updateCountdown = () => {
                const now = new Date().getTime();
                const start = new Date(race.startTime).getTime();
                const diff = Math.max(0, Math.floor((start - now) / 1000));
                setTimeLeft(diff);
                if (diff === 0) {
                    clearInterval(countdownInterval.current);
                }
            };
            updateCountdown();
            const id = setInterval(updateCountdown, 1000);
            countdownInterval.current = id;
            return () => clearInterval(id);
        }
    }, [race?.startTime]);

    if (!race) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-black italic">INITIALIZING LINK...</div>;

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

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 px-6 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest leading-none">
                                {race.status === 'Completed' ? 'Mission Accomplished' : 'Tactical HUD Active'}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase">
                            {race.name}
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mt-2">{race.location}</p>
                    </div>

                    <div className="flex gap-4">
                        {isCreator && race.status !== 'Completed' && !race.startTime && (
                            <button
                                onClick={handleStartCountdown}
                                className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 transition-all uppercase tracking-widest text-xs italic"
                            >
                                Ignite Countdown
                            </button>
                        )}
                        {isCreator && race.status === 'Active' && timeLeft === 0 && !isFinishing && (
                            <button
                                onClick={() => setIsFinishing(true)}
                                className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl shadow-xl shadow-green-600/20 transition-all uppercase tracking-widest text-xs italic"
                            >
                                Secure Finish Line
                            </button>
                        )}
                    </div>
                </div>

                {/* Countdown / Race Status */}
                <AnimatePresence mode="wait">
                    {timeLeft > 0 ? (
                        <motion.div
                            key="countdown"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            className="flex flex-col items-center justify-center p-20 glass-premium rounded-[3rem] mb-12"
                        >
                            <div className="text-[12rem] md:text-[18rem] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-indigo-600 leading-none tracking-tighter">
                                {timeLeft}
                            </div>
                            <div className="text-2xl font-black uppercase tracking-[0.5em] text-blue-400 -mt-10">T-Minus to Burn</div>
                        </motion.div>
                    ) : timeLeft === 0 && race.status === 'Active' ? (
                        <motion.div
                            key="engaged"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center p-20 bg-blue-600 shadow-[0_0_100px_rgba(37,99,235,0.4)] rounded-[3rem] mb-12"
                        >
                            <div className="text-8xl md:text-9xl font-black italic tracking-tighter uppercase text-white animate-pulse">
                                Engaged
                            </div>
                            <div className="text-2xl font-black uppercase tracking-[0.5em] text-white/50">Tactical Phase Active</div>
                        </motion.div>
                    ) : race.status === 'Completed' && (
                        <motion.div
                             key="podium"
                             initial={{ y: 50, opacity: 0 }}
                             animate={{ y: 0, opacity: 1 }}
                             className="mb-12"
                        >
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-center text-yellow-500">🏆 Victors Podium 🏆</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[1, 2, 3].map(pos => {
                                    const victor = race.winners?.find(w => w.position === pos);
                                    return (
                                        <div key={pos} className={`p-8 rounded-[2rem] border transition-all ${
                                            pos === 1 ? 'bg-yellow-500/10 border-yellow-500/30 scale-105 shadow-[0_0_50px_rgba(234,179,8,0.1)]' :
                                            pos === 2 ? 'bg-slate-300/10 border-slate-300/30' :
                                            'bg-orange-500/10 border-orange-500/30'
                                        }`}>
                                            <div className="text-4xl font-black italic opacity-20 mb-4">#{pos}</div>
                                            {victor ? (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-black">
                                                        {victor.user?.name?.substring(0, 1)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xl font-black truncate">{victor.user?.name}</div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operative Rank {victor.user?.rank}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-slate-600 font-black italic text-sm">NO DATA</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Roster Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3">
                            Operative Roster
                            <span className="text-xs italic font-black px-2 py-0.5 bg-blue-600 rounded text-white">{race.participants?.length || 0}</span>
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {race.participants?.map(p => {
                                const isCheckedIn = race.checkIns?.some(cid => (cid._id || cid) === (p._id || p));
                                return (
                                    <div key={p._id} className={`p-6 rounded-3xl border transition-all flex items-center justify-between ${
                                        isCheckedIn ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10 opacity-60'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-black italic overflow-hidden">
                                                {p.profilePicture ? <img src={p.profilePicture} className="w-full h-full object-cover" /> : p.name?.substring(0, 1)}
                                            </div>
                                            <div>
                                                <div className="font-black text-lg leading-none mb-1">{p.name}</div>
                                                <div className={`text-[9px] font-black uppercase tracking-widest ${isCheckedIn ? 'text-green-400' : 'text-slate-500'}`}>
                                                    {isCheckedIn ? 'At Coordinates' : 'En Route'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {isCheckedIn ? (
                                            <span className="text-xl">✅</span>
                                        ) : p._id === user?.id ? (
                                            <button 
                                                onClick={handleCheckIn}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-widest"
                                            >
                                                Check In
                                            </button>
                                        ) : null}

                                        {isFinishing && (
                                            <div className="flex gap-2">
                                                {[1, 2, 3].map(pos => (
                                                    <button
                                                        key={pos}
                                                        onClick={() => toggleWinner(p._id, pos)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                                                            winnersList.find(w => w.user === p._id && w.position === pos)
                                                            ? 'bg-yellow-500 text-slate-900 border-none'
                                                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                                        }`}
                                                    >
                                                        {pos}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mission Intel */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-6 text-blue-500">Tactical Feed</h2>
                            <TacticalHUD />
                        </div>

                        <div>
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-6">Mission Ops</h2>
                            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] space-y-6">
                                <div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-right italic font-black">Circuit Spec</div>
                                    <div className="text-2xl font-black text-right">{race.type}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-right italic font-black">Engagement Distance</div>
                                    <div className="text-2xl font-black text-right">{race.trackLength} KM</div>
                                </div>
                                <div className="pt-6 border-t border-white/10">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-right italic font-black">Current Vector</div>
                                    <div className="text-2xl font-black text-right text-blue-500">{race.location}</div>
                                </div>
                            </div>
                        </div>

                        {isFinishing && (
                            <div className="p-8 bg-green-600 text-white rounded-[2.5rem] shadow-2xl space-y-4">
                                <h3 className="font-black italic uppercase tracking-widest text-sm">Seal Engagement Results</h3>
                                <p className="text-xs font-medium opacity-80">Confirm the top 3 operatives to archive this mission and award tactical points.</p>
                                <button 
                                    onClick={handleFinishLine}
                                    className="w-full py-4 bg-white text-green-600 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs"
                                >
                                    Transmit Final Results
                                </button>
                                <button 
                                    onClick={() => { setIsFinishing(false); setWinnersList([]); }}
                                    className="w-full py-3 bg-transparent border border-white/30 hover:bg-white/10 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                                >
                                    Abort Review
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <CommsChannel raceId={id} isLiveHUD={true} />
        </div>
    );
}
