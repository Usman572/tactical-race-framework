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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-white">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase">War Room</h1>
                    <p className="text-blue-400 font-bold tracking-widest text-xs mt-2 uppercase">Platform Strategic Command</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black">{summary?.summary.activeOperatives}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Operatives (24h)</div>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Deployments', value: summary?.summary.totalRaces, color: 'blue' },
                    { label: 'Registered Assets', value: summary?.summary.totalUsers, color: 'emerald' },
                    { label: 'System Uptime', value: '99.9%', color: 'purple' }
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-3xl"
                    >
                        <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</div>
                        <div className={`text-3xl font-black text-${stat.color}-500`}>{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Faction Power Distribution */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] h-[450px]">
                    <h3 className="text-lg font-black uppercase tracking-wider mb-8">Faction Power Distribution (XP)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={summary?.factions}
                                cx="50%"
                                cy="40%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="xp"
                            >
                                {summary?.factions.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Race Deployment Trends */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] h-[450px]">
                    <h3 className="text-lg font-black uppercase tracking-wider mb-8">Deployment Velocity (30d)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends}>
                            <defs>
                                <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#475569" 
                                fontSize={10} 
                                tickFormatter={(val) => val.split('-').slice(1).join('/')}
                            />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="deployments" 
                                stroke="#3b82f6" 
                                fillOpacity={1} 
                                fill="url(#colorWave)" 
                                strokeWidth={4}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Sector Control Grid */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem]">
                <h3 className="text-lg font-black uppercase tracking-wider mb-8">Sector Intelligence</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {summary?.sectors.map((sector, i) => (
                        <div key={sector.name} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{sector.name}</div>
                            <div className="text-xl font-black">{sector.count}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
