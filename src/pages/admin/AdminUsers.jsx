import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";
import { motion } from "framer-motion";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const { user: currentUser } = useAuth(); // Rename to avoid confusion with users list
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
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageUser = async (recipientId) => {
    const message = prompt("Enter message for user:");
    if (!message) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          recipient: recipientId,
          message: `Admin message: ${message}`
        })
      });
      if (res.ok) {
        alert("Message sent successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      if (res.ok) {
        setUsers(users.filter(u => (u._id || u.id) !== userId));
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading users...</div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-black uppercase">
          Agent <span className="text-blue-600">Roster</span>
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Personnel Management & Authorization</p>
      </div>

      <div className="grid gap-4">
        {users.map((user, index) => (
          <motion.div
            key={user._id || user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-white rounded-2xl -z-10 shadow-sm border border-slate-100 group-hover:border-blue-500/30 transition-all" />

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name[0]
                  )}
                </div>

                <div>
                  <Link
                    to={`/profile/${user.slug || user._id || user.id}`}
                    className="text-lg font-black text-black uppercase tracking-tight hover:text-blue-600 transition-colors block"
                  >
                    {user.name}
                  </Link>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-mono text-slate-400">{user.email}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${user.role === "admin"
                        ? "bg-purple-50 text-purple-600 border-purple-200"
                        : user.role === "partner"
                          ? "bg-orange-50 text-orange-600 border-orange-200"
                          : "bg-blue-50 text-blue-600 border-blue-200"
                      }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleMessageUser(user._id || user.id)}
                  className="bg-slate-50 hover:bg-blue-600 text-slate-400 hover:text-white p-3 rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
                  title="Direct Message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                </button>
                <button
                  onClick={() => deleteUser(user._id || user.id)}
                  className="bg-slate-50 hover:bg-red-600 text-slate-400 hover:text-white p-3 rounded-xl border border-slate-100 transition-all active:scale-95 shadow-sm"
                  title="Revoke Access"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
