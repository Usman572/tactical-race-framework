import { useState, useEffect } from 'react';
import { subscribeToTelemetry } from '../utils/telemetry';
import { motion } from 'framer-motion';

export default function LatencyIndicator() {
    const [latency, setLatency] = useState(0);

    useEffect(() => {
        return subscribeToTelemetry((data) => {
            setLatency(data.lastLatency);
        });
    }, []);

    const getColor = (ms) => {
        if (ms < 100) return 'text-green-500';
        if (ms < 300) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div 
            className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5 pointer-events-none group"
            title="Real-time Matrix Latency"
        >
            <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                    <motion.div 
                        key={i}
                        animate={{ height: [2, 6, 2], opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className={`w-0.5 rounded-full ${latency > 300 ? 'bg-red-500' : 'bg-blue-500'}`}
                    />
                ))}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${getColor(latency)}`}>
                Ping: {latency}ms
            </span>
        </div>
    );
}
