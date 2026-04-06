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
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-[var(--text-main)] uppercase italic">
            PARTNER <span className="text-blue-600">ANALYTICS</span>
          </h1>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] italic opacity-60">Operational Telemetry & Insights</p>
        </div>

        <div className="flex items-center gap-4 bg-[var(--header-bg)] backdrop-blur-md p-5 rounded-2xl border border-[var(--border-main)] shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-glow-primary relative z-10 transition-transform group-hover:scale-110">🤝</div>
          <div className="relative z-10">
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Authorized Access</p>
            <p className="text-sm font-black text-[var(--text-main)] italic">Operative: <span className="text-purple-500 uppercase">{currentUser?.name || 'PARTNER'}</span></p>
          </div>
        </div>
      </div>

      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {[
          { label: "Total Engagements", value: stats?.totalRaces || 0, color: "from-blue-600 to-indigo-700", accent: "var(--accent-primary-glow)", icon: "🏁" },
          { label: "Active Operations", value: stats?.activeRaces || 0, color: "from-emerald-500 to-teal-700", accent: "rgba(16, 185, 129, 0.2)", icon: "⚡" },
          { label: "Total Participants", value: stats?.totalParticipants || 0, color: "from-purple-600 to-fuchsia-700", accent: "rgba(147, 51, 234, 0.2)", icon: "👥" },
          { label: "Pending Requests", value: stats?.pendingRequests || 0, color: "from-orange-500 to-red-700", accent: "var(--accent-secondary-glow)", icon: "📩" }
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -8, transition: { duration: 0.4, ease: "easeOut" } }}
            className="relative group cursor-default"
          >
            <div className="absolute inset-0 bg-[var(--header-bg)] rounded-[2.5rem] -z-10 shadow-2xl border border-[var(--border-main)] backdrop-blur-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-xl shadow-current/20 group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div className="h-1.5 w-16 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-main)]">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 1.5, delay: 0.5 + index * 0.1, ease: "circOut" }}
                    className={`h-full w-full bg-gradient-to-r ${stat.color}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black opacity-30 text-[var(--text-main)] uppercase tracking-[0.4em] mb-1 italic">{stat.label}</p>
                <p className="text-5xl font-black text-[var(--text-main)] tracking-tighter italic">
                  {isLoading ? "..." : stat.value}
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3 bg-[var(--bg-main)]/50 py-2 px-4 rounded-xl border border-[var(--border-main)] w-fit">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic leading-none">Live Telemetry</span>
              </div>
            </div>

            {/* Subtle glow effect on hover */}
            <div 
              style={{ background: stat.accent }}
              className="absolute -inset-px rounded-[2.5rem] opacity-0 group-hover:opacity-20 blur-xl transition-opacity -z-20" 
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
