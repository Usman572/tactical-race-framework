import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRaces } from "../context/RaceContext";
import Breadcrumbs from "../components/Breadcrumbs";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { pendingRequests, unreadCount } = useRaces();
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Users", path: "/admin/users", icon: "👥" },
    { name: "Partners", path: "/admin/partners", icon: "🤝" },
    { name: "Races", path: "/admin/races", icon: "🏁" },
    { name: "Requests", path: "/admin/requests", icon: "✋", badge: pendingRequests.length },
    { name: "Messages", path: "/messages", icon: "📩", badge: unreadCount },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar - Aligned with App Theme */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col shadow-sm">
        <div className="p-8 border-b border-slate-50">
          <Link to="/" className="text-2xl font-bold tracking-tighter italic text-blue-600 block mb-8">
            RACE<span className="text-slate-900">APP</span>
          </Link>

          {/* Contextual User Quick-Profile */}
          <Link
            to={`/profile/${user?.slug || user?.id}`}
            className="flex items-center gap-3 p-3 -mx-2 rounded-2xl hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg group-hover:bg-purple-600 group-hover:text-white transition-all overflow-hidden border border-purple-200 shadow-sm">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className=" object-cover" />
              ) : (
                user?.name?.charAt(0) || 'A'
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-slate-900 truncate group-hover:text-purple-600 transition-colors uppercase tracking-tight">
                {user?.name || 'Admin'}
              </p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Admin</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(link.path)
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "text-slate-500 hover:bg-purple-50 hover:text-purple-600"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{link.icon}</span>
                <span className="text-sm uppercase tracking-wide">{link.name}</span>
              </div>
              {link.badge > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse-soft ${isActive(link.path) ? 'bg-white text-purple-600' : 'bg-red-500 text-white'}`}>
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-50">
          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            className="w-full px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2 border border-red-100"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Unified Top Header Bar */}
        <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between z-40 shadow-sm">
          <div className="flex items-center gap-2 py-2">
            <Breadcrumbs />
          </div>

          {/* <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> API: Stable</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> DB: Up</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg hover:bg-purple-50 hover:text-purple-600 transition-colors cursor-pointer">⚙️</div>
          </div> */}
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
