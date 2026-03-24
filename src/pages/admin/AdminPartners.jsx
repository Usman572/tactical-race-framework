import { API_BASE_URL } from "../../config/api";

export default function AdminPartners() {
  const [users, setUsers] = useState([]);
  const { user: currentUser } = useAuth();
  const { races } = useRaces();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await response.json();
      // Filter only partners
      const partnersOnly = data.filter(u => u.role === 'partner');
      setUsers(partnersOnly);
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRaceCount = (partnerId) => {
    // Assuming race.creator is an object (populated) or string ID.
    // After populate, it's an object. If not populated, it's ID.
    // But wait, getRaces calls populate('creator'). So race.creator is an object with _id.
    return races.filter(r => (r.creator._id === partnerId || r.creator === partnerId)).length;
  };

  if (isLoading) return <div className="p-10 text-center">Loading partners...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-main)] mb-2">
        Our <span className="text-[var(--color-secondary)]">Partners</span>
      </h1>

      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Total Races</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr><td colSpan="3" className="p-4 text-center text-gray-500">No partners found.</td></tr>
            ) : (
              users.map((partner) => (
                <tr key={partner._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 font-medium text-[var(--color-text-main)] group-hover:text-[var(--color-secondary)] transition-colors">{partner.name}</td>
                  <td className="p-4 text-[var(--color-text-muted)]">
                    <span className="font-bold text-[var(--color-text-main)]">{getRaceCount(partner._id)}</span> Races
                  </td>
                  <td className="p-4 text-right">
                    {/* No delete action for now, or use deleteUser */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
