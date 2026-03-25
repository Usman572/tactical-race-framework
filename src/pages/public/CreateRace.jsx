import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRaces } from "../../context/RaceContext";

export default function CreateRace() {
    const navigate = useNavigate();
    const { addRace } = useRaces();
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        location: "",
        type: "Marathon",
        trackLength: "",
        status: "Active",
        participantsCount: 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await addRace(formData);
        if (result.success) {
            navigate("/");
        } else {
            alert(result.message || "Failed to create race. Please try again.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Create <span className="text-blue-600">Race</span>
            </h1>
            <p className="text-slate-500 mb-8">
                Submit a new race event for approval.
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
                        <label className="block text-sm font-bold text-slate-700 mb-2">Race Type</label>
                        <select
                            name="type"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="Marathon">Marathon</option>
                            <option value="Sprint">Sprint</option>
                            <option value="Street">Street Race</option>
                            <option value="Circuit">Circuit</option>
                            <option value="Drift">Drift</option>
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
                            <option value="1">1 KM (Sprint)</option>
                            <option value="2">2 KM (Short)</option>
                            <option value="5">5 KM (Short)</option>
                            <option value="10">10 KM (Medium)</option>
                            <option value="15">15 KM (Long)</option>
                            <option value="21.1">21.1 KM (Half Marathon)</option>
                            <option value="42.2">42.2 KM (Full Marathon)</option>
                            <option value="50">50 KM (Ultra)</option>
                            <option value="100">100 KM (Centurion)</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="px-6 py-3 rounded-full font-semibold text-[var(--color-text-muted)] hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 rounded-full bg-[var(--color-primary)] text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1"
                    >
                        Create Race
                    </button>

                </div>
            </form>
        </div>
    );
}
