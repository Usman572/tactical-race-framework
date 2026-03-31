import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";
import { motion } from "framer-motion";

export default function PartnerDashboard() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/partner/stats`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching partner stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-black uppercase">
            Partner <span className="text-blue-600">Analytics</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Operational Telemetry & Insights</p>
        </div>

        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-xl shadow-lg shadow-black/10">🤝</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Access</p>
            <p className="text-sm font-black text-black italic">Operative: <span className="text-purple-600 uppercase">{currentUser?.name || 'PARTNER'}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Total Engagements", value: stats?.totalRaces || 0, color: "from-blue-600 to-indigo-700", icon: "🏁" },
          { label: "Active Operations", value: stats?.activeRaces || 0, color: "from-emerald-500 to-teal-700", icon: "⚡" },
          { label: "Total Participants", value: stats?.totalParticipants || 0, color: "from-purple-600 to-fuchsia-700", icon: "👥" },
          { label: "Pending Requests", value: stats?.pendingRequests || 0, color: "from-orange-500 to-red-700", icon: "📩" }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative group cursor-default"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-3xl -z-10 shadow-xl shadow-slate-200/50 group-hover:shadow-2xl transition-all border border-slate-100" />

            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shadow-lg shadow-current/20`}>
                  {stat.icon}
                </div>
                <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={`h-full w-full bg-gradient-to-r ${stat.color}`}
                  />
                </div>
              </div>

              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-4xl font-black text-black tracking-tighter">
                {isLoading ? "..." : stat.value}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Live Feed Connected</span>
              </div>
            </div>

            <div className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 blur-sm transition-opacity -z-20`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
