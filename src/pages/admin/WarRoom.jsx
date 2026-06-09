import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { API_BASE_URL } from '../../config/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import NeuralLink from '../../components/NeuralLink';

// Map marker for operative
const operativeIcon = new L.DivIcon({
    className: 'operative-marker',
    html: `<div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)] flex items-center justify-center animate-pulse"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const WarRoom = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [liveRaces, setLiveRaces] = useState([]);
    const [telemetry, setTelemetry] = useState({}); // { raceId: { userId: telem } }
    const [activeTab, setActiveTab] = useState('feeds'); // feeds | broadcast | intel
    const [isLoading, setIsLoading] = useState(true);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [alertType, setAlertType] = useState('Critical');

    // Fetch initial live races
    useEffect(() => {
        const fetchLiveRaces = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/races/live/all`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setLiveRaces(data);
                    
                    // Initialize telemetry state from existing race data
                    const initialTelem = {};
                    data.forEach(race => {
                        if (race.telemetry && race.telemetry.length > 0) {
                            // Store an array of all telemetry items for the race
                            initialTelem[race._id] = race.telemetry;
                        }
                    });
                    setTelemetry(initialTelem);
                }
            } catch (err) {
                console.error('War Room fetch failed:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchLiveRaces();
    }, [user]);

    // Socket Monitoring
    useEffect(() => {
        if (!socket) return;

        socket.emit('join_admin_feed');

        socket.on('telemetry_pulse', ({ raceId, telemetry: data }) => {
            setTelemetry(prev => {
                const raceTelem = prev[raceId] ? [...prev[raceId]] : [];
                const idx = raceTelem.findIndex(t => (t.user?._id || t.user) === (data.user?._id || data.user));
                if (idx > -1) {
                    raceTelem[idx] = data;
                } else {
                    raceTelem.push(data);
                }
                return { ...prev, [raceId]: raceTelem };
            });
        });

        socket.on('race_completed', (completedRace) => {
            setLiveRaces(prev => prev.filter(r => r._id !== completedRace._id));
            setTelemetry(prev => {
                const newTelem = { ...prev };
                delete newTelem[completedRace._id];
                return newTelem;
            });
        });

        // Listen for new races turning 'Live'
        socket.on('command_pulse', ({ raceId, command }) => {
           if (command === 'ENGAGE') {
               // Re-fetch to get the full race object
               fetch(`${API_BASE_URL}/api/races/${raceId}`, {
                   headers: { 'Authorization': `Bearer ${user.token}` }
               })
               .then(res => res.json())
               .then(data => {
                   setLiveRaces(prev => [...prev.filter(r => r._id !== raceId), data]);
               });
           }
        });

        return () => {
            socket.off('telemetry_pulse');
            socket.off('race_completed');
            socket.off('command_pulse');
        };
    }, [socket, user]);

    const handleBroadcast = async () => {
        if (!broadcastMsg) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/races/broadcast-alert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    message: broadcastMsg,
                    type: alertType,
                    raceId: 'global'
                })
            });
            if (res.ok) {
                // Also trigger instant global pulse via socket
                if (socket) {
                    socket.emit('global_mission_pulse', {
                        message: broadcastMsg,
                        type: alertType,
                        timestamp: new Date()
                    });
                }
                setBroadcastMsg('');
                // Pulse feedback
            }
        } catch (err) {
            console.error('Broadcast failed:', err);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-glow-primary" />
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse">Initializing Command Bridge</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600/30">
            {/* Background Matrix-style Grid Overlay */}
            <div className="fixed inset-0 opacity-[0.05] pointer-events-none z-0">
                <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(255,255,255,0.05)_1px,rgba(255,255,255,0.05)_2px)]" />
                <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,rgba(255,255,255,0.05)_1px,rgba(255,255,255,0.05)_2px)]" />
            </div>

            <div className="relative z-10 flex flex-col h-screen">
                {/* 1. Tactical Header */}
                <header className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-black/80 backdrop-blur-3xl">
                    <div className="flex items-center gap-6">
                        <div className="w-1.5 h-10 bg-red-600 rounded-full shadow-[0_0_15px_#ef4444]" />
                        <div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">The War Room</h1>
                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] italic mt-1">Platform Strategic Command // LIVE</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-12">
                        <div className="text-right">
                            <div className="text-3xl font-black text-blue-500 tabular-nums leading-none tracking-tighter">{liveRaces.length}</div>
                            <div className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1">Active Deployments</div>
                        </div>
                        <div className="h-10 w-px bg-white/10" />
                        <div className="text-right">
                            <div className="text-3xl font-black text-green-500 flex items-center gap-2 justify-end leading-none tracking-tighter">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                99.9%
                            </div>
                            <div className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1">Sync Stability</div>
                        </div>
                    </div>
                </header>

                {/* 2. Main Layout Hub */}
                <div className="flex-1 flex overflow-hidden">
                    {/* A. Sidebar Controls */}
                    <div className="w-[380px] border-r border-white/10 bg-black/40 flex flex-col">
                        <div className="p-8 space-y-1">
                            {['feeds', 'broadcast', 'intel'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`w-full py-4 px-6 rounded-2xl flex items-center justify-between group transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-glow-primary' : 'hover:bg-white/5 text-white/40'}`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">{tab} Center</span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${activeTab === tab ? 'bg-white' : 'bg-transparent group-hover:bg-blue-600/50'}`} />
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {activeTab === 'broadcast' && (
                                    <motion.div
                                        key="broadcast"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="bg-red-600/10 border border-red-500/20 p-6 rounded-[2rem]">
                                            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 italic">Tactical Broadcast</h4>
                                            <textarea 
                                                value={broadcastMsg}
                                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                                rows={4}
                                                placeholder="Enter mission-critical command..."
                                                className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-xs font-black uppercase tracking-tight focus:border-red-600 focus:outline-none transition-colors"
                                            />
                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                {['Critical', 'Security', 'Information'].map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setAlertType(t)}
                                                        className={`py-2 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${alertType === t ? 'bg-white text-black border-white' : 'border-white/10 text-white/30 hover:border-white/20'}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={handleBroadcast}
                                                className="w-full mt-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all active:scale-95 shadow-glow-primary"
                                            >
                                                ⚡ Execute Broadcast
                                            </button>
                                        </div>

                                        <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-[2rem]">
                                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 italic">Recent Logs</h4>
                                            <div className="space-y-4 opacity-40">
                                                <div className="text-[9px] font-bold uppercase leading-relaxed font-mono">
                                                    [21:40] ADMIN: SECURITY BREACH AUTHENTICATED
                                                </div>
                                                <div className="text-[9px] font-bold uppercase leading-relaxed font-mono">
                                                    [21:35] SYSTEM: NEW DEPLOYMENT AT NEON DISTRICT
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'feeds' && (
                                    <motion.div
                                        key="feeds"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Live Deployments</span>
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest tabular-nums">{liveRaces.length}</span>
                                        </div>
                                        {liveRaces.map(race => (
                                            <div key={race._id} className="p-5 bg-white/5 border border-white/10 rounded-2xl group hover:border-blue-600/40 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black italic uppercase tracking-tight text-white/60 truncate max-w-[200px]">{race.name}</span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic">{race.sector}</span>
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">{race.type}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {liveRaces.length === 0 && (
                                            <div className="py-12 text-center">
                                                <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em] italic">No active neural links found.</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'intel' && (
                                    <motion.div
                                        key="intel"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 relative group"
                                    >
                                        <div className="absolute top-4 left-4 z-[1000] bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-blue-500/30">
                                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Live Asset Tracking</span>
                                        </div>
                                        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', background: '#020617' }} zoomControl={false}>
                                            <TileLayer
                                                url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                                                className="opacity-80 mix-blend-screen"
                                            />
                                            {/* Render all operatives with location data */}
                                            {Object.values(telemetry).flat().map((telem, i) => {
                                                if (telem?.location?.lat && telem?.location?.lng) {
                                                    return (
                                                        <Marker 
                                                            key={telem.user?._id || telem.user || i} 
                                                            position={[telem.location.lat, telem.location.lng]}
                                                            icon={operativeIcon}
                                                        >
                                                            <Popup className="bg-slate-900 text-white border border-blue-500/30">
                                                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">
                                                                    Operative Link
                                                                </div>
                                                                <div className="text-[9px] font-bold opacity-70">
                                                                    Status: {telem.status}<br/>
                                                                    Heart Rate: {telem.heartRate} BPM<br/>
                                                                    Sync: {telem.syncLevel}%
                                                                </div>
                                                            </Popup>
                                                        </Marker>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </MapContainer>
                                        <div className="absolute inset-0 pointer-events-none z-[400] mix-blend-overlay opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(0, 243, 254, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 254, 0.2) 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* B. Live Feed Grid */}
                    <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
                        <AnimatePresence mode="popLayout">
                            <motion.div 
                                layout
                                className="grid grid-cols-1 xl:grid-cols-2 gap-10"
                            >
                                {liveRaces.map(race => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={race._id}
                                        className="relative"
                                    >
                                        <div className="absolute -top-4 -left-4 z-20 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-glow-primary shadow-blue-500/30">
                                            {race.sector} // FEED ACTIVE
                                        </div>
                                        
                                        <NeuralLink 
                                            data={telemetry[race._id]?.[0] || (race.telemetry && race.telemetry[0])} 
                                            isActive={true} 
                                        />
                                        
                                        <div className="mt-4 flex items-center justify-between px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-[10px] font-black italic uppercase tracking-tight text-white/40">{race.name}</span>
                                            </div>
                                            <button className="text-[8px] font-black text-blue-500 uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                                                Analyze Stream
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {liveRaces.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center space-y-8">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center">
                                        <div className="w-24 h-24 rounded-full border border-white/10 animate-ping opacity-20" />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 text-2xl">📡</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-black italic uppercase italic tracking-tighter mb-2 text-white/60">Waiting for Operations</h3>
                                    <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.4em] italic leading-relaxed">System standby. Monitor enabled. Establish neural link to begin broadcast.</p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
            `}</style>
        </div>
    );
};

export default WarRoom;
