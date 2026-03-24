import { Link, useNavigate } from "react-router-dom";
import { useRaces } from "../../context/RaceContext";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function PartnerRaces() {
  const { races, deleteRace } = useRaces();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);

  // Close dropdown on click outside
  useEffect(() => {
    const close = () => setOpenDropdown(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this race?")) {
      await deleteRace(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-main)]">
          My <span className="text-[var(--color-secondary)]">Races</span>
        </h1>
        <Link to="/partner/races/new" className="bg-[var(--color-secondary)] text-white px-4 py-2 rounded-lg font-bold shadow-md shadow-orange-500/20 hover:bg-orange-700 transition-all">
          + Create Race
        </Link>
      </div>

      <div className="bg-[var(--glass-bg)] backdrop-blur-md rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b border-[var(--border-main)]">
            <tr>
              <th className="px-6 py-5 font-black text-[var(--text-main)] text-[10px] uppercase tracking-[0.2em]">Assignment</th>
              <th className="px-6 py-5 font-black text-[var(--text-main)] text-[10px] uppercase tracking-[0.2em]">Schedule</th>
              <th className="px-6 py-5 font-black text-[var(--text-main)] text-[10px] uppercase tracking-[0.2em]">Engagement</th>
              <th className="px-6 py-5 font-black text-[var(--text-main)] text-[10px] uppercase tracking-[0.2em]">Telemetry</th>
              <th className="px-6 py-5 font-black text-[var(--text-main)] text-[10px] uppercase tracking-[0.2em] text-right">Admin</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-main)]">
            {races.map((race) => (
              <tr
                key={race._id}
                className="hover:bg-blue-500/5 transition-all group cursor-pointer"
                onClick={() => navigate(`/races/${race._id}`)}
              >
                <td className="px-6 py-6">
                  <div className="font-black text-[var(--text-main)] text-xl tracking-tight leading-none mb-1 group-hover:text-blue-500 transition-colors uppercase">{race.name}</div>
                  <div className="text-[9px] text-[var(--text-main)] opacity-30 font-bold uppercase tracking-widest">{race._id.substring(0, 8)}</div>
                </td>
                <td className="px-6 py-6 text-[var(--text-main)] opacity-60 font-black text-xs whitespace-nowrap">
                  {new Date(race.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-6 relative">
                  {race.participants?.length > 0 ? (
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === race._id ? null : race._id);
                        }}
                        className="flex items-center gap-2 bg-[var(--bg-main)] text-[var(--text-main)] px-4 py-2 rounded-xl border border-[var(--border-main)] font-black hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer shadow-sm active:scale-95 group/btn"
                      >
                        <span className="font-black text-xs text-blue-500">{race.participants.length} Active</span>
                        <svg className={`transition-transform duration-300 ${openDropdown === race._id ? 'rotate-180' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>

                      {openDropdown === race._id && (
                        <div className="absolute left-0 mt-4 w-72 bg-[var(--header-bg)] backdrop-blur-xl border border-[var(--border-main)] rounded-3xl shadow-2xl z-50 p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="px-3 pb-3 border-b border-[var(--border-main)] mb-4 flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-[var(--text-main)] opacity-40 uppercase tracking-widest">Active Operatives</h4>
                          </div>
                          <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {race.participants.map((p) => (
                              <div key={p._id} className="flex items-center justify-between p-3 hover:bg-blue-500/5 rounded-2xl group/item transition-all mb-1">
                                <Link
                                  to={`/profile/${p.slug || p._id}`}
                                  className="flex items-center gap-3 text-[var(--text-main)] hover:text-blue-600 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-blue-600 border border-[var(--border-main)] uppercase font-black">
                                    {p.name?.substring(0, 1)}
                                  </div>
                                  <span className="text-sm font-black opacity-80 group-hover/item:opacity-100 transition-opacity">{p.name}</span>
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[var(--text-main)] opacity-30 font-black text-[10px] uppercase tracking-widest italic">Negative Contact</span>
                  )}
                </td>
                <td className="px-6 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${race.status === "Active"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                    {race.status || "Active"}
                  </span>
                </td>
                <td className="px-6 py-6 flex items-center justify-end gap-2">
                  <Link
                    to={`/partner/races/${race._id}/edit`}
                    className="p-3 rounded-2xl text-[var(--text-main)] opacity-40 hover:opacity-100 hover:bg-blue-500 hover:text-white transition-all border border-transparent hover:border-blue-400 active:scale-90"
                    title="Modify Directive"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </Link>
                  <button
                    onClick={(e) => handleDelete(e, race._id)}
                    className="p-3 rounded-2xl text-[var(--text-main)] opacity-40 hover:opacity-100 hover:bg-red-600 hover:text-white transition-all border border-transparent hover:border-red-400 active:scale-90"
                    title="Abort Engagement"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
