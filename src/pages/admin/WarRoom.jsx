import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { measureFetch } from '../../utils/telemetry';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function WarRoom() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [summaryRes, trendsRes] = await Promise.all([
                    measureFetch(`${API_BASE_URL}/api/stats/summary`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    }),
                    measureFetch(`${API_BASE_URL}/api/stats/trends`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    })
                ]);

                const summaryData = await summaryRes.json();
                const trendsData = await trendsRes.json();

                setSummary(summaryData);
                setTrends(trendsData);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchStats();
    }, [user]);

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--accent-primary-glow)_0%,_transparent_50%)] opacity-20"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-glow-primary"></div>
        </div>
    );

    return (
        <div className="p-4 sm:p-10 space-y-12 bg-[var(--bg-main)] min-h-screen text-[var(--text-main)] w-full overflow-hidden transition-colors duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-1.5 h-10 bg-blue-600 rounded-full shadow-glow-primary" />
                        <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase">War Room</h1>
                    </div>
                    <p className="text-blue-500 font-black tracking-[0.4em] text-[10px] uppercase italic opacity-60">Platform Strategic Command // Level 4 Clear</p>
                </div>
                <div className="text-left sm:text-right relative z-10 bg-[var(--header-bg)] p-6 rounded-2xl border border-[var(--border-main)] shadow-xl min-w-[200px] group overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-4xl font-black text-blue-600 group-hover:scale-110 transition-transform duration-500">{summary?.summary.activeOperatives}</div>
                    <div className="text-[9px] opacity-30 font-black uppercase tracking-[0.3em] mt-1 italic">Active Operatives (24h)</div>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <motion.div 
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                {[
                    { label: 'Total Deployments', value: summary?.summary.totalRaces, color: 'text-blue-500', glow: 'shadow-glow-primary' },
                    { label: 'Registered Assets', value: summary?.summary.totalUsers, color: 'text-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' },
                    { label: 'System Uptime', value: '99.9%', color: 'text-purple-500', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]' }
                ].map((stat, i) => (
                    <motion.div 
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                        }}
                        key={stat.label}
                        whileHover={{ y: -5, transition: { duration: 0.3 } }}
                        className="bg-[var(--header-bg)] backdrop-blur-xl border border-[var(--border-main)] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mb-4 italic">{stat.label}</div>
                        <div className={`text-4xl font-black ${stat.color} tracking-tighter italic ${stat.glow}`}>{stat.value}</div>
                        <div className="absolute bottom-4 right-8 opacity-5 text-4xl font-black italic uppercase select-none">{stat.label.split(' ')[1]}</div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full min-w-0">
                {/* Faction Power Distribution */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[var(--header-bg)] backdrop-blur-xl border border-[var(--border-main)] p-6 sm:p-10 rounded-[3rem] h-[400px] sm:h-[500px] min-w-0 shadow-2xl relative"
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                        <h3 className="text-sm sm:text-lg font-black uppercase tracking-[0.2em] italic">Faction Distribution</h3>
                    </div>
                    <div className="w-full h-[calc(100%-5rem)] min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={summary?.factions}
                                cx="50%"
                                cy="45%"
                                innerRadius={80}
                                outerRadius={130}
                                paddingAngle={8}
                                dataKey="xp"
                                stroke="none"
                            >
                                {summary?.factions.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'var(--header-bg)', 
                                    border: '1px solid var(--border-main)', 
                                    borderRadius: '1.5rem',
                                    backdropFilter: 'blur(20px)',
                                    fontWeight: '900',
                                    textTransform: 'uppercase',
                                    fontSize: '10px',
                                    letterSpacing: '0.1em'
                                }}
                                itemStyle={{ color: 'var(--text-main)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Race Deployment Trends */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[var(--header-bg)] backdrop-blur-xl border border-[var(--border-main)] p-6 sm:p-10 rounded-[3rem] h-[400px] sm:h-[500px] min-w-0 overflow-hidden shadow-2xl relative"
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                        <h3 className="text-sm sm:text-lg font-black uppercase tracking-[0.2em] italic">Deployment Velocity</h3>
                    </div>
                    <div className="w-full h-[calc(100%-5rem)] min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends}>
                            <defs>
                                <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" opacity={0.3} vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="var(--text-main)" 
                                opacity={0.3}
                                fontSize={9} 
                                tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis 
                                stroke="var(--text-main)" 
                                opacity={0.3}
                                fontSize={9} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'var(--header-bg)', 
                                    border: '1px solid var(--border-main)', 
                                    borderRadius: '1.5rem',
                                    backdropFilter: 'blur(20px)',
                                    fontWeight: '900',
                                    textTransform: 'uppercase',
                                    fontSize: '10px',
                                    letterSpacing: '0.1em'
                                }}
                                itemStyle={{ color: '#3b82f6' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="deployments" 
                                stroke="#3b82f6" 
                                fillOpacity={1} 
                                fill="url(#colorWave)" 
                                strokeWidth={4}
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Sector Control Grid */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[var(--header-bg)] backdrop-blur-xl border border-[var(--border-main)] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                    <h3 className="text-lg font-black uppercase tracking-[0.2em] italic">Sector Intelligence</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {summary?.sectors.map((sector, i) => (
                        <div key={sector.name} className="p-6 bg-[var(--bg-main)]/50 rounded-[2rem] border border-[var(--border-main)] flex flex-col items-center group hover:border-blue-500/50 transition-colors duration-500">
                            <div className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] mb-2 group-hover:opacity-100 group-hover:text-blue-500 transition-all">{sector.name}</div>
                            <div className="text-3xl font-black italic tracking-tighter truncate w-full text-center">{sector.count}</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
