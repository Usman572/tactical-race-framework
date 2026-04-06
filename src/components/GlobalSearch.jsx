import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState({ races: [], users: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const flattenedResults = [
        ...results.races.map(r => ({ ...r, type: 'race', path: `/races/${r._id}` })),
        ...results.users.map(u => ({ ...u, type: 'user', path: `/profile/${u.slug || u._id}` }))
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
            if (isOpen) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % flattenedResults.length);
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + flattenedResults.length) % flattenedResults.length);
                } else if (e.key === "Enter" && selectedIndex >= 0) {
                    e.preventDefault();
                    handleSelect(flattenedResults[selectedIndex].path);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, selectedIndex, flattenedResults]); // handleSelect is stable via navigate, but flattenedResults changes

    useEffect(() => {
        if (!query.trim()) {
            setResults({ races: [], users: [] });
            setSelectedIndex(-1);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/races/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSelect = (path) => {
        setIsOpen(false);
        setQuery("");
        navigate(path);
    };

    if (!isOpen) return (
        <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-4 px-6 py-2.5 bg-[var(--header-bg)]/50 hover:bg-black rounded-full text-[var(--text-main)] opacity-60 hover:opacity-100 transition-all border border-[var(--border-main)] hover:border-blue-500 shadow-xl group truncate max-w-[180px] md:max-w-none backdrop-blur-xl group/search"
        >
            <div className="text-blue-500 group-hover/search:scale-110 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] hidden md:inline italic">Search_Database...</span>
            <kbd className="hidden lg:inline-flex h-6 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 font-black text-[9px] text-blue-500 shadow-inner">
                <span className="text-[11px]">⌘</span>K
            </kbd>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[1002] flex items-start justify-center pt-[15vh] px-6 bg-[var(--bg-main)]/80 backdrop-blur-md animate-in fade-in duration-300">
            <div
                ref={searchRef}
                className="w-full max-w-3xl bg-[var(--header-bg)] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-[var(--border-main)] overflow-hidden animate-in slide-in-from-top-10 duration-500 relative"
            >
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px] pointer-events-none" />

                <div className="p-8 md:p-10 border-b border-[var(--border-main)] flex items-center gap-6 bg-[var(--bg-main)]/50 relative z-10">
                    <div className="text-blue-600 animate-pulse">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                    </div>
                    <input
                        autoFocus
                        type="text"
                        placeholder="SCAN_FOR_RACES_OPERATIVES_SECTORS..."
                        className="flex-1 bg-transparent border-none outline-none text-2xl font-black text-[var(--text-main)] placeholder:opacity-20 uppercase tracking-tighter italic"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(-1);
                        }}
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(""); setSelectedIndex(-1); }}
                            className="text-[var(--text-main)] opacity-20 hover:opacity-100 transition-opacity p-2"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    )}
                    {isLoading && <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
                    <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-white/5 rounded-xl text-[var(--text-main)] opacity-20 hover:opacity-100 font-black text-[10px] uppercase tracking-widest transition-all">ESC_ABORT</button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-6 md:p-8 custom-scrollbar relative z-10">
                    {!query.trim() && (
                        <div className="p-16 text-center space-y-6">
                            <div className="w-24 h-24 bg-blue-600/5 rounded-[2.5rem] border border-blue-600/10 flex items-center justify-center text-5xl mx-auto shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-600/10 blur-2xl rounded-full translate-y-10 group-hover:translate-y-0 transition-transform" />
                                <span className="relative z-10">📡</span>
                            </div>
                            <div>
                                <div className="text-[var(--text-main)] font-black text-3xl mb-2 uppercase tracking-tighter italic leading-none">Global_Comms_Link</div>
                                <p className="text-[var(--text-main)] opacity-30 text-[10px] font-black uppercase tracking-[0.4em] italic leading-relaxed">Search for upcoming drifts, sprint events, or find elite pilots in sector.</p>
                            </div>
                        </div>
                    )}

                    {query.trim() && results.races.length === 0 && results.users.length === 0 && !isLoading && (
                        <div className="p-16 text-center">
                            <div className="text-3xl mb-4 opacity-20">🚫</div>
                            <div className="text-[var(--text-main)] opacity-20 font-black uppercase text-[10px] tracking-[0.5em] italic">No Matches Detected for: {query}</div>
                        </div>
                    )}

                    {results.races.length > 0 && (
                        <div className="mb-10">
                            <div className="px-5 mb-5 text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic underline decoration-blue-500/20 underline-offset-8">RACING_PROTOCOLS</div>
                            <div className="space-y-2">
                                {results.races.map((race, idx) => (
                                    <button
                                        key={race._id}
                                        onClick={() => handleSelect(`/races/${race._id}`)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`w-full text-left p-6 rounded-[2rem] transition-all group flex items-center justify-between border ${selectedIndex === idx ? 'bg-blue-600 text-white border-blue-500 shadow-glow-primary scale-[1.02]' : 'bg-[var(--bg-main)]/50 border-[var(--border-main)] hover:border-blue-600/30'}`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase italic transition-all shadow-xl ${selectedIndex === idx ? 'bg-white text-blue-600' : 'bg-blue-600/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                                {race.type?.substring(0, 3) || 'RCE'}
                                            </div>
                                            <div>
                                                <div className={`font-black text-xl tracking-tighter uppercase italic leading-none mb-1.5 ${selectedIndex === idx ? 'text-white' : 'text-[var(--text-main)] group-hover:text-blue-500'}`}>{race.name}</div>
                                                <div className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${selectedIndex === idx ? 'text-white/60' : 'text-[var(--text-main)] opacity-30'}`}>LOC_ID: {race.location}</div>
                                            </div>
                                        </div>
                                        <div className={`transition-all ${selectedIndex === idx ? 'translate-x-0 opacity-100 text-white' : 'translate-x-4 opacity-0 text-blue-500'}`}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.users.length > 0 && (
                        <div>
                            <div className="px-5 mb-5 text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic underline decoration-emerald-500/20 underline-offset-8">ELITE_DOSSIERS</div>
                            <div className="space-y-2">
                                {results.users.map((pilot, idx) => {
                                    const realIdx = results.races.length + idx;
                                    return (
                                        <button
                                            key={pilot._id}
                                            onClick={() => handleSelect(`/profile/${pilot.slug || pilot._id}`)}
                                            onMouseEnter={() => setSelectedIndex(realIdx)}
                                            className={`w-full text-left p-6 rounded-[2rem] transition-all group flex items-center justify-between border ${selectedIndex === realIdx ? 'bg-emerald-600 text-white border-emerald-500 shadow-glow-emerald scale-[1.02]' : 'bg-[var(--bg-main)]/50 border-[var(--border-main)] hover:border-emerald-600/30'}`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl border-2 overflow-hidden transition-all shadow-xl ${selectedIndex === realIdx ? 'border-white' : 'border-[var(--border-main)] group-hover:border-emerald-500'}`}>
                                                    {pilot.profilePicture ? (
                                                        <img src={pilot.profilePicture} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-black text-2xl uppercase italic bg-[var(--bg-main)]">
                                                            {pilot.name.substring(0, 1)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className={`font-black text-xl tracking-tighter uppercase italic leading-none mb-1.5 ${selectedIndex === realIdx ? 'text-white' : 'text-[var(--text-main)] group-hover:text-emerald-500'}`}>{pilot.name}</div>
                                                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${selectedIndex === realIdx ? 'text-white/60' : 'text-[var(--text-main)] opacity-30'}`}>{pilot.role} operative // CLASS_IV</div>
                                                </div>
                                            </div>
                                            <div className={`transition-all px-4 py-1.5 rounded-full border font-black text-[9px] uppercase tracking-[0.3em] italic ${selectedIndex === realIdx ? 'bg-white text-emerald-600 border-white' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 opacity-0'}`}>View Dossier</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 md:p-8 bg-[var(--bg-main)] border-t border-[var(--border-main)] flex justify-between items-center text-[9px] font-black text-[var(--text-main)] opacity-20 uppercase tracking-[0.4em] italic relative z-10">
                    <div className="flex gap-8">
                        <span className="flex items-center gap-2.5"><span className="text-blue-500 text-sm">↑↓</span> TO NAVIGATE</span>
                        <span className="flex items-center gap-2.5"><span className="text-blue-500 text-sm">↵</span> TO AUTHORIZE_LINK</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        POWERED_BY_ELITE_COMM_TRANSCEIVER_v4.2
                    </div>
                </div>
            </div>
        </div>
    );
}
