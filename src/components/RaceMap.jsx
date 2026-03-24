import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { useRaces } from '../context/RaceContext';
import { useEffect } from 'react';

// Fix for default Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Sector Themes
const sectorThemes = {
    'Neon District': { color: '#2563eb', glow: 'rgba(37,99,235,0.4)', icon: '🟦' },
    'Outlands': { color: '#ea580c', glow: 'rgba(234,88,12,0.4)', icon: '🟧' },
    'The Void': { color: '#9333ea', glow: 'rgba(147,51,234,0.4)', icon: '🟪' },
    'Cyber City': { color: '#db2777', glow: 'rgba(219,39,119,0.4)', icon: '🎴' },
    'Industrial Zone': { color: '#16a34a', glow: 'rgba(22,163,74,0.4)', icon: '🟩' }
};

const getSectorIcon = (sector) => {
    const theme = sectorThemes[sector] || sectorThemes['Neon District'];
    return new L.DivIcon({
        className: 'custom-sector-marker',
        html: `<div class="w-10 h-10 flex items-center justify-center relative">
                 <div class="absolute inset-0 bg-white/20 rounded-full blur-md animate-pulse"></div>
                 <div class="w-8 h-8 rounded-full border-4 border-white shadow-2xl flex items-center justify-center relative z-10 transition-all hover:scale-125" style="background-color: ${theme.color}; box-shadow: 0 0 20px ${theme.glow}">
                   <div class="w-2 h-2 bg-white rounded-full"></div>
                 </div>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });
};

// User Location Marker
const userIcon = new L.DivIcon({
    className: 'custom-user-marker',
    html: `<div class="w-10 h-10 bg-white rounded-full border-4 border-blue-600 shadow-2xl flex items-center justify-center">
             <div class="w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

// Helper to generate deterministic marker positions based on race ID and sector
const generateMockCoords = (id, sector) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Offset by sector to group them roughly
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

export default function RaceMap({ races }) {
    const center = [20, 0];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full h-[600px] rounded-[3rem] overflow-hidden border border-[var(--border-main)] shadow-2xl relative group"
        >
            <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                

                {races.map((race) => {
                    const position = generateMockCoords(race._id, race.sector);
                    const theme = sectorThemes[race.sector] || sectorThemes['Neon District'];

                    return (
                        <Marker key={race._id} position={position} icon={getSectorIcon(race.sector)}>
                            <Popup className="tactical-popup">
                                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-white/10 min-w-[200px]">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded bg-white/5 text-slate-400">
                                            {race.sector || 'Unassigned Sector'}
                                        </span>
                                        <span className="text-xl">{theme.icon}</span>
                                    </div>
                                    <h3 className="font-black italic uppercase tracking-tighter text-xl leading-none mb-1 text-blue-500">{race.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{race.location}</p>
                                    
                                    <div className="space-y-2 border-t border-white/5 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Status</span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                                race.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>{race.status}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                                            <span>Distance</span>
                                            <span className="text-white">{race.trackLength || 0} KM</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Tactical Overlay */}
            <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2">Global Coverage</h4>
                    <div className="flex items-center gap-4">
                        <div className="text-3xl font-black text-white tracking-tighter">{races.length}</div>
                        <div className="h-8 w-[1px] bg-white/10"></div>
                        <div className="text-[10px] font-bold text-white/40 uppercase leading-tight">Active Battle<br />Sectors Scan</div>
                    </div>
                </div>
            </div>

            {/* Corner Scan Line Effect */}
            <div className="absolute inset-0 pointer-events-none z-[1001] border-[20px] border-slate-900/20 rounded-[3rem]"></div>
            <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/20 z-[1002] animate-[scan_4s_linear_infinite]"></div>
        </motion.div>
    );
}
