import { useRaces } from "../../context/RaceContext";

export default function PartnerDashboard() {
  const { races } = useRaces();
  const activeRaces = races.filter(r => r.status === "Active" || !r.status).length; // Default to active if no status
  const totalParticipants = races.reduce((sum, race) => sum + (parseInt(race.participants) || 0), 0);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-main)] mb-8">
        Partner <span className="text-[var(--color-secondary)]">Dashboard</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Total Races</p>
          <p className="text-4xl font-bold mt-2 text-[var(--color-text-main)] group-hover:text-[var(--color-secondary)] transition-colors">{races.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Active Races</p>
          <p className="text-4xl font-bold mt-2 text-[var(--color-text-main)] group-hover:text-green-600 transition-colors">{activeRaces}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Participants</p>
          <p className="text-4xl font-bold mt-2 text-[var(--color-text-main)] group-hover:text-blue-600 transition-colors">{totalParticipants.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
