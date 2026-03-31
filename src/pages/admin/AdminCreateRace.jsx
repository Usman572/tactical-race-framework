import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRaces } from "../../context/RaceContext";

export default function AdminCreateRace() {
    const navigate = useNavigate();
    const { addRace } = useRaces();
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        location: "",
        type: "Marathon",
        trackLength: "",
        status: "Active",
        sector: "Neon District",
        bannerImage: "",
        maxParticipants: "",
        registrationDeadline: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await addRace(formData);
        if (result.success) {
            navigate("/admin/races");
        } else {
            alert(result.message || "Failed to create race.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Create <span className="text-blue-600">Race</span>
            </h1>
            <p className="text-slate-500 mb-8">
                Add a new race to the platform as Admin.
            </p>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Race Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                        placeholder="e.g. City Marathon"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                        <input
                            type="date"
                            name="date"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
                            value={formData.date}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                        <input
                            type="text"
                            name="location"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="e.g. London"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                        <select
                            name="status"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Track Length</label>
                        <select
                            name="trackLength"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
                            value={formData.trackLength}
                            onChange={handleChange}
                        >
                            <option value="">Select Distance</option>
                            <option value="1">1 KM</option>
                            <option value="2">2 KM</option>
                            <option value="5">5 KM</option>
                            <option value="10">10 KM</option>
                            <option value="15">15 KM</option>
                            <option value="21.1">21.1 KM</option>
                            <option value="42.2">42.2 KM</option>
                            <option value="50">50 KM</option>
                            <option value="100">100 KM</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tactical Sector</label>
                        <select
                            name="sector"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
                            value={formData.sector}
                            onChange={handleChange}
                        >
                            <option value="Neon District">Neon District</option>
                            <option value="Outlands">Outlands</option>
                            <option value="The Void">The Void</option>
                            <option value="Cyber City">Cyber City</option>
                            <option value="Industrial Zone">Industrial Zone</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Banner Image URL</label>
                        <input
                            type="text"
                            name="bannerImage"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="https://example.com/image.jpg"
                            value={formData.bannerImage}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Registration Flow Fields */}
                <div className="border-t border-slate-100 pt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Registration Settings</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Max Participants <span className="text-slate-400 font-medium">(optional)</span></label>
                            <input
                                type="number"
                                name="maxParticipants"
                                min="1"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                                placeholder="e.g. 50 (leave blank for unlimited)"
                                value={formData.maxParticipants}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Registration Deadline <span className="text-slate-400 font-medium">(optional)</span></label>
                            <input
                                type="date"
                                name="registrationDeadline"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
                                value={formData.registrationDeadline}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/races")}
                        className="px-6 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1"
                    >
                        Create Race
                    </button>
                </div>
            </form>
        </div>
    );
}
