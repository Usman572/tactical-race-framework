import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRaces } from "../context/RaceContext";
import { motion, AnimatePresence } from "framer-motion";
import Breadcrumbs from "../components/Breadcrumbs";
import XPPulse from "../components/XPPulse";
import PageTransition from "../components/PageTransition";
import LatencyIndicator from "../components/LatencyIndicator";
import ThemeToggle from "../components/ThemeToggle";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { pendingRequests, unreadCount } = useRaces();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Users", path: "/admin/users", icon: "👥" },
    { name: "Partners", path: "/admin/partners", icon: "🤝" },
    { name: "War Room", path: "/admin/war-room", icon: "📊" },
    { name: "Races", path: "/admin/races", icon: "🏁" },
    { name: "Requests", path: "/admin/requests", icon: "✋", badge: pendingRequests.length },
    { name: "Messages", path: "/messages", icon: "📩", badge: unreadCount },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-[var(--bg-main)] text-[var(--text-main)] font-sans relative overflow-hidden transition-colors duration-500">
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Evolved Command Bridge */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[var(--header-bg)] backdrop-blur-2xl border-r border-[var(--border-main)] flex-shrink-0 flex flex-col shadow-2xl z-[70] transition-transform duration-500 ease-out grid-pattern h-screen ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'}`}>
        <div className="p-8 border-b border-[var(--border-main)] relative scanline">
          <Link to="/" className="text-2xl font-black italic tracking-tighter text-blue-600 block mb-8 uppercase relative z-10">
            RACE<span className="text-slate-900">Hub</span>
          </Link>

          {/* User Quick-Profile */}
          <Link
            to={`/profile/${user?.slug || user?.id}`}
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 p-3 -mx-2 rounded-2xl hover:bg-[var(--glass-bg)] transition-all group border border-transparent hover:border-[var(--glass-border)]"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden border border-blue-200/30">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'A'
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                {user?.name || 'Admin'}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] uppercase font-black text-slate-400 tracking-[0.2em]">Command Level</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto flex-grow h-0 custom-scrollbar">
          <div className="px-4 mb-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Operational Modules</div>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl font-black transition-all duration-300 group relative ${isActive(link.path)
                ? "bg-slate-900 text-white shadow-xl shadow-black/10 translate-x-1"
                : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                }`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-xl transition-transform group-hover:scale-110 ${isActive(link.path) ? 'opacity-100' : 'opacity-40'}`}>{link.icon}</span>
                <span className="text-[10px] uppercase tracking-[0.2em]">{link.name}</span>
              </div>
              {link.badge > 0 && (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse-soft shadow-inner ${isActive(link.path) ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                  {link.badge}
                </span>
              )}
              {isActive(link.path) && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-600 rounded-r-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-[var(--border-main)] bg-[var(--glass-bg)] space-y-4">
          {/* Mobile Secondary Indicators */}
          <div className="lg:hidden flex items-center justify-between px-2 mb-4">
            <LatencyIndicator variant="pill" />
            <ThemeToggle />
          </div>
          
          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            className="w-full px-4 py-4 rounded-xl bg-white text-red-600 font-black hover:bg-red-600 hover:text-white transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 border border-red-100 hover:border-red-600 shadow-sm active:scale-95 group"
          >
            <span className="group-hover:rotate-12 transition-transform">🚪</span>
            Disconnect
          </button>
        </div>
      </aside>

      {/* Main content Bridge */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--bg-main)]">
        {/* Mobile Header / Top Command Bar */}
        <header className="h-[80px] bg-[var(--header-bg)] backdrop-blur-2xl border-b border-[var(--border-main)] px-6 sm:px-10 flex items-center justify-between z-50 shadow-sm sticky top-0 grid-pattern">
          <div className="flex items-center gap-6 overflow-hidden">
            {/* Hamburger Trigger */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-11 h-11 flex items-center justify-center bg-slate-900 text-white rounded-xl shadow-lg active:scale-90 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 whitespace-nowrap">War Room</h2>
              </div>
              <div className="hidden sm:block h-3 w-px bg-slate-200" />
              <div className="overflow-hidden">
                <Breadcrumbs variant="minimal" />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <LatencyIndicator variant="pill" />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 custom-scrollbar contents-fade-in">
          <div className="max-w-7xl mx-auto pb-20 lg:pb-0">
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Breadcrumbs />
                <XPPulse />
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
