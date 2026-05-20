import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

const HEX_POOL = ['5A', 'C2', 'E9', '8B', 'FF', '00', 'AA', '4E', 'D3', '7A', '1F', '9C', 'B6', 'D7', '3E', '8F'];

export default function DecryptionGame({ message, onSuccess, onClose }) {
    const { user } = useAuth();
    const [targetSequence, setTargetSequence] = useState([]);
    const [grid, setGrid] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [gameState, setGameState] = useState('playing'); // 'playing' | 'success' | 'failed'
    const [isSaving, setIsSaving] = useState(false);
    const [shake, setShake] = useState(false);

    // Initialize Game
    useEffect(() => {
        // Pick 3 random target hex codes
        const sequence = [];
        const pool = [...HEX_POOL];
        for (let i = 0; i < 3; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            sequence.push(pool.splice(idx, 1)[0]);
        }
        setTargetSequence(sequence);

        // Fill grid: target sequence elements + random fillers
        const gridItems = [...sequence];
        while (gridItems.length < 16) {
            const randomHex = HEX_POOL[Math.floor(Math.random() * HEX_POOL.length)];
            gridItems.push(randomHex);
        }

        // Shuffle grid
        const shuffledGrid = gridItems
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

        setGrid(shuffledGrid);
    }, [message]);

    // Timer logic
    useEffect(() => {
        if (gameState !== 'playing') return;

        if (timeLeft <= 0) {
            setGameState('failed');
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, gameState]);

    const handleHexClick = async (value, index) => {
        if (gameState !== 'playing') return;

        const expected = targetSequence[currentIndex];
        if (value === expected) {
            // Correct click
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);

            if (nextIndex === targetSequence.length) {
                setGameState('success');
                await saveDecryptedStatus();
            }
        } else {
            // Wrong click: penalize time, shake grid
            setTimeLeft(prev => Math.max(0, prev - 4));
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    const saveDecryptedStatus = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/chat/decrypt/${message._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (res.ok) {
                const updatedMsg = await res.json();
                setTimeout(() => {
                    onSuccess(updatedMsg);
                }, 1500);
            } else {
                console.error('Failed to save decryption on server');
                // Even if server fails, allow client unlock for UI robustness
                setTimeout(() => {
                    onSuccess({ ...message, decryptedBy: [...(message.decryptedBy || []), user.id] });
                }, 1500);
            }
        } catch (err) {
            console.error('Decryption save error:', err);
            setTimeout(() => {
                onSuccess({ ...message, decryptedBy: [...(message.decryptedBy || []), user.id] });
            }, 1500);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRetry = () => {
        setCurrentIndex(0);
        setTimeLeft(20);
        setGameState('playing');
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
            {/* Ambient Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,1)_2px,rgba(255,255,255,1)_4px)]" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg bg-black border-2 border-red-500/30 rounded-[3rem] p-8 md:p-10 relative shadow-[0_0_50px_rgba(239,68,68,0.15)]"
            >
                {/* Decorative Tech Corners */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-red-500/50" />
                <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-red-500/50" />
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-red-500/50" />
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-red-500/50" />

                {gameState === 'playing' && (
                    <>
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-red-500 italic uppercase tracking-tighter animate-pulse">
                                SECURE LINK COMPROMISED
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
                                Bypass Signal Encryption Matrix
                            </p>
                        </div>

                        {/* Status bar */}
                        <div className="flex justify-between items-center bg-slate-900/50 border border-white/5 px-6 py-4 rounded-2xl mb-8">
                            <div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Timer Link</span>
                                <span className={`text-xl font-black tracking-tight ${timeLeft <= 5 ? 'text-red-500 animate-ping' : 'text-orange-500'}`}>
                                    {timeLeft}s
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Bypass Node</span>
                                <span className="text-sm font-black text-blue-500 uppercase tracking-widest">
                                    {currentIndex} / {targetSequence.length}
                                </span>
                            </div>
                        </div>

                        {/* Target Sequence */}
                        <div className="mb-8">
                            <div className="text-center mb-3">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.28em]">TARGET SIGNAL KEY</span>
                            </div>
                            <div className="flex justify-center gap-4">
                                {targetSequence.map((hex, idx) => {
                                    const isCompleted = idx < currentIndex;
                                    const isActive = idx === currentIndex;
                                    return (
                                        <div
                                            key={idx}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border transition-all ${
                                                isCompleted
                                                    ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                                    : isActive
                                                    ? 'bg-blue-600 border-blue-500 text-white animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                                    : 'bg-slate-900 border-white/5 text-slate-600'
                                            }`}
                                        >
                                            {hex}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Hex Grid */}
                        <motion.div
                            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            className="grid grid-cols-4 gap-3 bg-slate-950 p-4 border border-white/5 rounded-3xl mb-8"
                        >
                            {grid.map((hex, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleHexClick(hex, idx)}
                                    className="aspect-square bg-slate-900 hover:bg-red-500 hover:text-white border border-white/5 hover:border-red-400 rounded-xl flex items-center justify-center font-bold text-sm text-slate-300 hover:scale-105 active:scale-95 transition-all"
                                >
                                    {hex}
                                </button>
                            ))}
                        </motion.div>

                        <div className="flex justify-center">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest hover:border-red-500/50 hover:text-red-500 rounded-xl transition-all"
                            >
                                Abort Bypass
                            </button>
                        </div>
                    </>
                )}

                {gameState === 'success' && (
                    <div className="text-center py-10 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-4xl mb-6 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.2)] animate-pulse">
                            ✓
                        </div>
                        <h3 className="text-3xl font-black text-green-400 italic uppercase tracking-tighter mb-2">
                            DECRYPTION SUCCESS
                        </h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">
                            Intel Stream Restored / Signal Clean
                        </p>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1.2 }}
                                className="h-full bg-green-500"
                            />
                        </div>
                    </div>
                )}

                {gameState === 'failed' && (
                    <div className="text-center py-8 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-4xl mb-6 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                            ⚠️
                        </div>
                        <h3 className="text-3xl font-black text-red-500 italic uppercase tracking-tighter mb-2">
                            LINK SEVERED
                        </h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">
                            Bypass Failed / Encryption Resynced
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleRetry}
                                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/20"
                            >
                                Retry Bypass
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest hover:border-white hover:text-white rounded-xl transition-all"
                            >
                                Disconnect
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
