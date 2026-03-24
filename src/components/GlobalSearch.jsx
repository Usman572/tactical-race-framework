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
            className="flex items-center gap-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 transition-all border border-slate-200 group truncate max-w-[150px] md:max-w-none"
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Search...</span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-white px-1.5 font-sans text-[10px] font-medium text-slate-400">
                <span className="text-xs">⌘</span>K
            </kbd>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={searchRef}
                className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-4 duration-300"
            >
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                    <svg className="text-blue-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search races, pilots, locations..."
                        className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-slate-900 placeholder:text-slate-300"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(-1);
                        }}
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(""); setSelectedIndex(-1); }}
                            className="text-slate-300 hover:text-slate-500 transition-colors p-2"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    )}
                    {isLoading && <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold p-2">ESC</button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                    {!query.trim() && (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-4">🏎️</div>
                            <div className="text-slate-900 font-black text-xl mb-2">Global Command Center</div>
                            <p className="text-slate-400 text-sm font-medium">Search for upcoming drifts, sprint events, or find your fellow pilots.</p>
                        </div>
                    )}

                    {query.trim() && results.races.length === 0 && results.users.length === 0 && !isLoading && (
                        <div className="p-8 text-center text-slate-400 font-bold">No matches found for "{query}"</div>
                    )}

                    {results.races.length > 0 && (
                        <div className="mb-6">
                            <div className="px-4 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Racing Events</div>
                            <div className="space-y-1">
                                {results.races.map((race, idx) => (
                                    <button
                                        key={race._id}
                                        onClick={() => handleSelect(`/races/${race._id}`)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`w-full text-left p-4 rounded-3xl transition-all group flex items-center justify-between ${selectedIndex === idx ? 'bg-blue-50/50 border-blue-100 ring-2 ring-blue-500/10' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 font-black text-xs uppercase italic group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                {race.type?.substring(0, 3) || 'RCE'}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic">{race.name}</div>
                                                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{race.location}</div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.users.length > 0 && (
                        <div>
                            <div className="px-4 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Elite Pilots</div>
                            <div className="space-y-1">
                                {results.users.map((pilot, idx) => (
                                    <button
                                        key={pilot._id}
                                        onClick={() => handleSelect(`/profile/${pilot.slug || pilot._id}`)}
                                        onMouseEnter={() => setSelectedIndex(results.races.length + idx)}
                                        className={`w-full text-left p-4 rounded-3xl transition-all group flex items-center justify-between ${selectedIndex === (results.races.length + idx) ? 'bg-blue-50/50 border-blue-100 ring-2 ring-blue-500/10' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full border-2 border-slate-100 overflow-hidden group-hover:border-blue-500 transition-all bg-slate-50">
                                                {pilot.profilePicture ? (
                                                    <img src={pilot.profilePicture} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-black text-slate-300">
                                                        {pilot.name.substring(0, 1)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{pilot.name}</div>
                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{pilot.role} operative</div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 font-black text-[10px] uppercase tracking-widest border border-blue-500 px-3 py-1 rounded-full">View Dossier</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="flex gap-4">
                        <span>↑↓ to navigate</span>
                        <span>↵ to select</span>
                    </div>
                    <div>Powered by Elite Telemetry</div>
                </div>
            </div>
        </div>
    );
}
