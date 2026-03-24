import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useRaces } from "../context/RaceContext";
import GlobalSearch from "../components/GlobalSearch";
import ThemeToggle from "../components/ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import LiveTicker from "../components/LiveTicker";
import Breadcrumbs from "../components/Breadcrumbs";
import XPTracker from "../components/XPTracker";
import DailyMissions from "../components/DailyMissions";
import LatencyIndicator from "../components/LatencyIndicator";
import ErrorBoundary from "../components/ErrorBoundary";
import { API_BASE_URL } from "../config/api";

export default function PublicLayout() {
  const { user, logout, updateUser } = useAuth();
  const socket = useSocket();
  const { approveRequest, rejectRequest } = useRaces();
  const location = useLocation();
  const [toasts, setToasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial unread count
  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/notifications`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          if (res.status === 401) return logout();
          if (res.ok) {
            const data = await res.json();
            const unread = data.filter(m => !m.read).length;
            setUnreadCount(unread);
          }
        } catch (e) { console.error("Unread fetch failed", e); }
      };
      fetchUnread();
    }
  }, [user]);

  // Pulse check for role status to ensure Admin visibility
  useEffect(() => {
    if (user && !user.role) {
      const fetchRole = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/${user.id || user._id}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          if (res.status === 401) return logout();
          if (res.ok) {
            const data = await res.json();
            updateUser({ role: data.role });
          }
        } catch (e) { console.error("Role pulse failed", e); }
      };
      fetchRole();
    }
  }, [user]);

  // Handle incoming global real-time notifications
  useEffect(() => {
    if (socket && user) {
      socket.emit('join_room', user.id || user._id);

      socket.on('new_notification', (notification) => {
        // Increment unread count if not on messages page
        if (location.pathname !== '/messages') {
          setUnreadCount(prev => prev + 1);
        }

        // Don't show toast if we are already on the messages page
        if (location.pathname === '/messages') return;

        const id = Date.now();
        setToasts(prev => [...prev, { ...notification, toastId: id }]);

        // Auto-remove toast after 5 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.toastId !== id));
        }, 5000);
      });

      socket.on('user_update', (data) => {
        console.log("Tactical Update Received:", data);
        updateUser(data);
      });

      return () => {
        socket.off('new_notification');
        socket.off('user_update');
      };
    }
  }, [socket, location.pathname, updateUser]);

  // Reset unread count when entering messages page
  useEffect(() => {
    if (location.pathname === '/messages') {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      {/* Real-Time Toast Hub */}
      <div className="fixed top-[120px] right-8 z-[100] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.toastId}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto bg-black text-white p-5 rounded-2xl shadow-2xl border border-white/10 min-w-[320px] max-w-md relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
              <div className="flex items-center gap-4 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500 font-black text-xs border border-blue-500/20">
                  {toast.sender?.name?.[0] || 'S'}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">New Signal Received</p>
                  <p className="text-sm font-black tracking-tight">{toast.sender?.name}</p>
                </div>
                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.toastId !== toast.toastId))}
                  className="opacity-20 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed mb-4">
                {toast.message}
              </p>

              {toast.type === 'JoinRequest' ? (
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const res = await approveRequest(toast.joinRequest);
                      if (res.success) setToasts(prev => prev.filter(t => t.toastId !== toast.toastId));
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-center transition-all border border-blue-500/20 text-white"
                  >
                    Approve Access
                  </button>
                  <button
                    onClick={async () => {
                      const res = await rejectRequest(toast.joinRequest);
                      if (res.success) setToasts(prev => prev.filter(t => t.toastId !== toast.toastId));
                    }}
                    className="flex-1 py-2 bg-white/5 hover:bg-red-600/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-center transition-all border border-white/5"
                  >
                    Deny
                  </button>
                </div>
              ) : (
                <Link
                  to="/messages"
                  onClick={() => setToasts(prev => prev.filter(t => t.toastId !== toast.toastId))}
                  className="block w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-center transition-all border border-white/5"
                >
                  Access Signal Hub
                </Link>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-2xl border-b border-[var(--border-main)] px-6 lg:px-12 h-[90px] flex items-center justify-between transition-all duration-500 overflow-hidden">
        {/* Left Section: Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-2xl shadow-blue-500/30 ring-2 ring-white/10">
              <span className="text-white font-black text-2xl italic">E</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-black tracking-tighter text-[var(--text-main)] uppercase block leading-none">Circuit</span>
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] block mt-0.5">Quantum Framework</span>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-6 ml-4">
            <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-blue-500 transition-all">Home</Link>
            <Link to="/leaderboard" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-blue-500 transition-all">Leaderboard</Link>
            <Link to="/races" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-blue-500 transition-all">Races</Link>
          </nav>
        </div>

        {/* Center Section: Global Search */}
        <div className="flex-1 max-w-xl mx-8 relative group">
          <GlobalSearch />
        </div>

        {/* Right Section: Tactical HUD */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-4 bg-slate-50/50 backdrop-blur-md rounded-2xl border border-slate-100 p-1.5 pr-4 shadow-sm hover:border-blue-500/30 transition-all group">
               <XPTracker variant="minimal" />
               
               <div className="w-px h-6 bg-slate-200" />
               
               <div className="flex items-center gap-1">
                 <Link
                   to="/messages"
                   className="relative p-2 hover:bg-white hover:text-blue-600 rounded-xl transition-all active:scale-90 text-slate-400"
                   title="Signal Hub"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                   </svg>
                   {unreadCount > 0 && (
                     <span className="absolute top-0 right-0 bg-red-600 text-white text-[7px] font-black px-1 rounded-full ring-2 ring-white">
                       {unreadCount}
                     </span>
                   )}
                 </Link>

                 {user.role === 'admin' && (
                   <Link
                     to="/admin"
                     className="p-2 hover:bg-black hover:text-white rounded-xl transition-all active:scale-90 text-slate-400"
                     title="Command Hub"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                       <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                     </svg>
                   </Link>
                 )}
                 <ThemeToggle />
                 <LatencyIndicator />
               </div>
            </div>
          )}

          {/* User Profile / Access */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link to={`/profile/${user.slug || user.id}`} className="flex items-center gap-2 pr-3 hover:opacity-80 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black overflow-hidden border-2 ${user.role === 'admin' ? 'border-red-600/30' : 'border-blue-500/10'}`}>
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center text-xs">
                        {user.name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-[7px] font-black text-blue-500 uppercase tracking-widest leading-none mb-0.5 opacity-60">Operative</div>
                  <div className="text-[11px] font-black tracking-tight text-slate-900 leading-none">{user.name}</div>
                </div>
              </Link>
              <button
                onClick={logout}
                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-600 transition-all"
                title="Disconnect"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-[10px] font-black uppercase tracking-widest px-4 py-2 hover:text-blue-600 transition-all">Access</Link>
              <Link to="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 shadow-lg shadow-blue-500/20 transition-all active:scale-95">Initialize</Link>
            </div>
          )}
        </div>
      </header>

      {/* Spacer for sticky header */}
      <div className="h-[90px]" />

      {/* Main Content Area */}
      <main className="flex-grow relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 pt-6">
          <Breadcrumbs />
        </div>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </PageTransition>
        </AnimatePresence>
      </main>

      {user && <DailyMissions />}

      {/* Live Ticker */}
      <LiveTicker />

      <footer className="py-4 px-8 border-t border-[var(--border-main)] bg-[var(--header-bg)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[var(--text-main)] rounded-lg flex items-center justify-center">
              <span className="text-[var(--bg-main)] font-black text-xs italic">E</span>
            </div>
            <span className="font-black text-xs uppercase tracking-[0.2em] opacity-40">Elite Circuit Framework © 2026</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Protocol</a>
            <a href="#" className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Security</a>
            <a href="#" className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Telemetry</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

