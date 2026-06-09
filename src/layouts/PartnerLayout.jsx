import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRaces } from "../context/RaceContext";
import Breadcrumbs from "../components/Breadcrumbs";
import XPPulse from "../components/XPPulse";

export default function PartnerLayout() {
  const { user, logout } = useAuth();
  const { pendingRequests, unreadCount } = useRaces();
  return (
    <div className="min-h-screen flex bg-[var(--bg-main)] text-[var(--text-main)] font-sans transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--header-bg)] backdrop-blur-2xl border-r border-[var(--border-main)] flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-[var(--border-main)]">
          <Link to="/" className="text-2xl font-bold tracking-tighter italic text-blue-600 block mb-6">
            RACE<span className="text-[var(--text-main)]">APP</span>
          </Link>

          <Link to={`/profile/${user?.slug || user?.id}`} className="flex items-center gap-3 hover:bg-[var(--glass-bg)] p-2 -m-2 rounded-xl transition-all group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden ${user?.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'P'
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{user?.name || 'Partner'}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase font-extrabold tracking-wider">
                Partner
              </span>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            to="/partner"
            className="block px-4 py-3 rounded-lg hover:bg-[var(--color-secondary)]/10 hover:text-[var(--color-secondary)] text-[var(--color-text-muted)] font-medium transition-all"
          >
            Dashboard
          </Link>

          <Link
            to="/partner/races"
            className="block px-4 py-3 rounded-lg hover:bg-[var(--color-secondary)]/10 hover:text-[var(--color-secondary)] text-[var(--color-text-muted)] font-medium transition-all"
          >
            My Races
          </Link>

          <Link
            to="/partner/requests"
            className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[var(--color-secondary)]/10 hover:text-[var(--color-secondary)] text-[var(--color-text-muted)] font-medium transition-all"
          >
            <span>Requests</span>
            {pendingRequests.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse-soft">
                {pendingRequests.length}
              </span>
            )}
          </Link>

          <Link
            to="/messages"
            className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[var(--glass-bg)] text-[var(--text-main)] font-black transition-all border border-transparent hover:border-[var(--glass-border)]"
          >
            <div className="flex items-center gap-2">
              <span>📩</span>
              <span>Messages</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse-soft">
                {unreadCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="p-4 mt-auto border-t border-[var(--glass-border)]">
          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            className="w-full px-4 py-3 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all uppercase text-sm tracking-wide text-left flex items-center gap-2"
          >
            <span>←</span> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-[var(--bg-main)] overflow-y-auto transition-colors duration-500">
        <Breadcrumbs />
        <XPPulse />
        <Outlet />
      </main>
    </div>
  );
}
