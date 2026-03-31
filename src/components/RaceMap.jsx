import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Fix for default Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Sector Themes
const sectorThemes = {
    'Neon District': { color: '#00f3fe', glow: 'rgba(0,243,254,0.8)', icon: '🟦' },
    'Outlands': { color: '#ffb300', glow: 'rgba(255,179,0,0.8)', icon: '🟧' },
    'The Void': { color: '#d300ff', glow: 'rgba(211,0,255,0.8)', icon: '🟪' },
    'Cyber City': { color: '#ff0055', glow: 'rgba(255,0,85,0.8)', icon: '🎴' },
    'Industrial Zone': { color: '#00ff66', glow: 'rgba(0,255,102,0.8)', icon: '🟩' }
};

const getSectorIcon = (sector, isDimmed) => {
    const theme = sectorThemes[sector] || sectorThemes['Neon District'];
    const opacity = isDimmed ? 'opacity-20 grayscale saturate-0 scale-50' : 'opacity-100 scale-100 hover:scale-125';
    const animation = isDimmed ? '' : 'animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]';
    
    return new L.DivIcon({
        className: 'custom-sector-marker bg-transparent',
        html: `<div class="w-12 h-12 flex items-center justify-center relative transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${opacity}">
                 <!-- Massive outer pulse -->
                 <div class="absolute inset-0 bg-white/20 rounded-full blur-2xl ${animation}" style="background-color: ${theme.color}"></div>
                 
                 <!-- Inner aggressive ring -->
                 <div class="absolute inset-2 rounded-full border border-white/40 animate-[spin_4s_linear_infinite]" style="border-top-color: ${theme.color};"></div>
                 
                 <!-- Core Marker Base -->
                 <div class="w-8 h-8 rounded-full border-[3px] border-white backdrop-blur-sm flex items-center justify-center relative z-10 overflow-hidden group-hover:scale-110 transition-transform duration-300" style="background-color: ${theme.color}; box-shadow: 0 0 40px ${theme.glow}, inset 0 0 10px rgba(255,255,255,0.8)">
                   <!-- Center Diamond Target -->
                   <div class="w-2.5 h-2.5 bg-white shadow-[0_0_15px_white] animate-pulse" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);"></div>
                 </div>
               </div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24], 
    });
};

// Helper to generate deterministic marker positions based on race ID and sector
const generateMockCoords = (id, sector) => {
    let hash = 0;
    if (id) {
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
    }
    
    const sectorOffsets = {
        'Neon District': [0, 0],
        'Outlands': [5, 5],
        'The Void': [-5, 5],
        'Cyber City': [5, -5],
        'Industrial Zone': [-5, -5]
    };
    const offset = sectorOffsets[sector] || [0, 0];

    const lat = ((hash % 100) / 10) + 20 + offset[0]; 
    const lon = (((hash * 13) % 100) / 10) - 10 + offset[1];
    return [lat, lon];
};

// Map Controller for dynamic camera movement
function MapController({ races, selectedSector }) {
    const map = useMap();

    useEffect(() => {
        if (!selectedSector || selectedSector === 'ALL') {
             map.flyTo([20, 0], 3, { duration: 2, easeLinearity: 0.1 });
             return;
        }

        const filtered = races.filter(r => r.sector === selectedSector);
        if (filtered.length > 0) {
            let avgLat = 0, avgLon = 0;
            filtered.forEach(race => {
                const [lat, lon] = generateMockCoords(race._id, race.sector);
                avgLat += lat;
                avgLon += lon;
            });
            avgLat /= filtered.length;
            avgLon /= filtered.length;

            map.flyTo([avgLat, avgLon], 6, { duration: 2, easeLinearity: 0.1 });
        }
    }, [selectedSector, races, map]);

    return null;
}

export default function RaceMap({ races = [] }) {
    const center = [20, 0];
    const [selectedSector, setSelectedSector] = useState('ALL');
    const [stats, setStats] = useState({ active: 0, total: races.length });

    useEffect(() => {
        const filtered = selectedSector === 'ALL' ? races : races.filter(r => r.sector === selectedSector);
        setStats({
            active: filtered.filter(r => r.status === 'Active').length,
            total: filtered.length
        });
    }, [selectedSector, races]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, filter: 'brightness(0) contrast(2)' }}
            animate={{ opacity: 1, scale: 1, filter: 'brightness(1) contrast(1)' }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="w-full h-[700px] md:h-[800px] rounded-[1rem] md:rounded-[2rem] overflow-hidden border border-[#00f3fe]/30 shadow-[0_0_80px_-20px_rgba(0,243,254,0.3)] relative group bg-[#020617]"
        >
            <MapContainer center={center} zoom={3} style={{ height: '100%', width: '100%', background: '#020617' }} zoomControl={false}>
                {/* Hyper-dark high contrast tile layer */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                    className="opacity-80 mix-blend-screen"
                />
                
                <MapController races={races} selectedSector={selectedSector} />

                {races.map((race) => {
                    const position = generateMockCoords(race._id, race.sector);
                    const theme = sectorThemes[race.sector] || sectorThemes['Neon District'];
                    const isDimmed = selectedSector !== 'ALL' && selectedSector !== race.sector;

                    return (
                        <Marker key={race._id} position={position} icon={getSectorIcon(race.sector, isDimmed)} zIndexOffset={isDimmed ? 0 : 1000}>
                            <Popup className="tactical-popup border-none bg-transparent m-0 p-0" closeButton={false}>
                                <div className="p-0 bg-transparent min-w-[300px] pointer-events-auto">
                                    <div className="relative overflow-hidden bg-slate-950/90 backdrop-blur-2xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
                                        
                                        {/* Dynamic Header */}
                                        <div className="flex justify-between items-center p-4 border-b border-white/10 relative overflow-hidden group/header">
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/header:opacity-100 transition-opacity"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] px-3 py-1 bg-white/10 text-slate-300 relative z-10" style={{ borderLeft: `3px solid ${theme.color}` }}>
                                                {race.sector || 'Unassigned'}
                                            </span>
                                            <span className="text-xl drop-shadow-lg opacity-80">{theme.icon}</span>
                                        </div>

                                        {/* Core Data Block */}
                                        <div className="p-5">
                                            <h3 className="font-black italic uppercase tracking-tighter text-2xl leading-[1] text-white mb-2" style={{ textShadow: `0 0 20px ${theme.color}` }}>
                                                {race.name}
                                            </h3>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] truncate">{race.location}</p>
                                        </div>
                                        
                                        {/* Tactical Readouts */}
                                        <div className="px-5 pb-5 space-y-3">
                                            <div className="flex justify-between items-center bg-black/40 p-3 relative border border-white/5">
                                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Comm Status</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full animate-pulse ${race.status === 'Active' ? 'bg-[#00ff66]' : 'bg-[#00f3fe]'}`}></span>
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                                                        race.status === 'Active' ? 'text-[#00ff66]' : 'text-[#00f3fe]'
                                                    }`}>{race.status}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Distance Scan</span>
                                                <span className="text-white text-[11px] font-black tracking-widest">{race.trackLength || 0} KM</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <Link 
                                            to={`/races/${race._id}`}
                                            className="block w-full text-center p-4 bg-white text-black font-black uppercase text-[11px] tracking-[0.4em] transition-all duration-300 hover:bg-[#00f3fe] relative overflow-hidden group/btn"
                                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                                            <span className="relative z-10 flex items-center justify-center gap-3">Initiate Recon <div className="w-1.5 h-1.5 bg-current rotate-45 group-hover/btn:scale-150 transition-transform"></div></span>
                                        </Link>

                                    </div>
                                    
                                    {/* Line connecting popup to marker centrally */}
                                    <div className="w-[1px] h-8 bg-gradient-to-b from-white/30 to-transparent mx-auto"></div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Tactical Grid Background Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[400] mix-blend-overlay opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(0, 243, 254, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 254, 0.2) 1px, transparent 1px)', backgroundSize: '150px 150px'}}></div>

            {/* Massive Radar Sweep Effect */}
            <div className="absolute top-1/2 left-1/2 -ml-[100vw] -mt-[100vw] w-[200vw] h-[200vw] rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,243,254,0)_0deg,rgba(0,243,254,0.05)_300deg,rgba(0,243,254,0.2)_360deg)] animate-[spin_10s_linear_infinite] pointer-events-none z-[401] mix-blend-screen"></div>

            {/* Tactical Control Panel Overlay - Absolute Wow */}
            <div className="absolute top-8 right-8 bottom-8 z-[1000] w-[320px] pointer-events-none hidden lg:flex flex-col justify-between">
                
                {/* Upper Module: Global Status */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                    className="bg-[#020617]/90 backdrop-blur-3xl border-l-[3px] border-l-[#00f3fe] p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] pointer-events-auto"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="relative flex items-center justify-center w-4 h-4">
                            <span className="absolute w-full h-full rounded-full border border-[#00f3fe] animate-[ping_2s_ease-out_infinite]"></span>
                            <span className="absolute w-2 h-2 rounded-full bg-[#00f3fe]"></span>
                        </div>
                        <h4 className="text-[10px] font-black text-[#00f3fe] uppercase tracking-[0.5em] leading-none mt-1">Global Scan</h4>
                    </div>
                    
                    <div className="flex items-center justify-between text-white">
                         <div className="flex flex-col">
                             <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Targets Found</span>
                             <span className="text-4xl font-black tracking-tighter text-white" style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>{stats.total}</span>
                         </div>
                         <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                         <div className="flex flex-col items-end">
                             <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Engagements</span>
                             <span className="text-4xl font-black tracking-tighter text-[#00ff66]" style={{ textShadow: '0 0 20px rgba(0,255,102,0.4)' }}>{stats.active}</span>
                         </div>
                    </div>
                </motion.div>

                {/* Lower Module: Tactical Filter Hub */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, type: 'spring' }}
                    className="bg-[#020617]/80 backdrop-blur-3xl p-5 border border-white/5 pointer-events-auto"
                    style={{ clipPath: 'polygon(0 20px, 20px 0, 100% 0, 100% 100%, 0 100%)' }}
                >
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                       <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">Sector Filter Array</h4>
                       <div className="flex gap-1">
                           <div className="w-1.5 h-1.5 bg-white/20"></div>
                           <div className="w-1.5 h-1.5 bg-white/20"></div>
                           <div className="w-1.5 h-1.5 bg-white/60 animate-pulse"></div>
                       </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => setSelectedSector('ALL')}
                            className={`w-full flex items-center justify-between px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] transition-all bg-transparent group/btn ${selectedSector === 'ALL' ? 'text-white border-l-2 border-white' : 'text-slate-500 hover:text-white border-l-2 border-transparent'}`}
                        >
                            <span className="group-hover/btn:translate-x-2 transition-transform">Global Override</span>
                            {selectedSector === 'ALL' && <div className="w-2 h-2 bg-white rounded-sm animate-pulse shadow-[0_0_10px_white]"></div>}
                        </button>
                        
                        {Object.keys(sectorThemes).map(sector => (
                            <button
                                key={sector}
                                onClick={() => setSelectedSector(sector)}
                                className={`w-full flex items-center justify-between px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all group/btn ${selectedSector === sector ? 'text-white border-l-2' : 'text-slate-500 hover:text-white border-l-2 border-transparent'}`}
                                style={{ borderLeftColor: selectedSector === sector ? sectorThemes[sector].color : '' }}
                            >
                                <div className="flex items-center gap-3 group-hover/btn:translate-x-2 transition-transform">
                                    <span style={{ color: selectedSector === sector ? sectorThemes[sector].color : '' }}>{sector}</span>
                                </div>
                                {selectedSector !== sector && <span className="opacity-40 grayscale scale-75 transition-all group-hover/btn:opacity-100 group-hover/btn:grayscale-0 group-hover/btn:scale-100">{sectorThemes[sector].icon}</span>}
                                {selectedSector === sector && <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: sectorThemes[sector].color, boxShadow: `0 0 15px ${sectorThemes[sector].color}` }}></div>}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Corner Bracket / Target Lock HUD Designs */}
            <div className="absolute top-6 left-6 w-20 h-20 border-t-[3px] border-l-[3px] border-[#00f3fe]/70 pointer-events-none z-[400] shadow-[0_0_15px_rgba(0,243,254,0.4)]"></div>
            <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-white/30 pointer-events-none z-[400] m-2"></div>
            
            <div className="absolute bottom-6 left-6 w-20 h-20 border-b-[3px] border-l-[3px] border-[#00f3fe]/70 pointer-events-none z-[400] shadow-[0_0_15px_rgba(0,243,254,0.4)]"></div>
            <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-white/30 pointer-events-none z-[400] m-2"></div>
            
            <div className="absolute top-6 right-[400px] w-20 h-20 border-t-[3px] border-r-[3px] border-[#00f3fe]/70 pointer-events-none z-[400] shadow-[0_0_15px_rgba(0,243,254,0.4)] hidden 2xl:block"></div>
            
            {/* Cinematic Map Scan Line Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f3fe] to-transparent shadow-[0_0_30px_20px_rgba(0,243,254,0.15)] z-[402] animate-[scan_8s_cubic-bezier(0.4,0,0.2,1)_infinite] opacity-70 pointer-events-none mix-blend-screen"></div>

            {/* Mobile filter toggle warning (since control panel is hidden on mobile) */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] lg:hidden">
                <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-[#00f3fe] border border-[#00f3fe]/30 shadow-[0_0_20px_rgba(0,243,254,0.2)]">
                    Tactical Filter: Desktop Only
                </div>
            </div>
        </motion.div>
    );
}
