import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const result = await signup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        });

        if (result.success) {
            const role = result.data.role;
            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'partner') {
                navigate('/partner');
            } else {
                navigate('/');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Join <span className="text-blue-600 italic">RaceApp</span>
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Create your account and start racing smarter.
                    </p>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6"
                >
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-700 mb-3">
                            Select your role
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <RoleCard
                                label="Racer"
                                icon="🏃"
                                value="user"
                                active={formData.role === "user"}
                                onChange={handleChange}
                                activeClass="border-blue-600 bg-blue-50 text-blue-700"
                            />
                            <RoleCard
                                label="Partner"
                                icon="🤝"
                                value="partner"
                                active={formData.role === "partner"}
                                onChange={handleChange}
                                activeClass="border-orange-500 bg-orange-50 text-orange-600"
                            />
                            <RoleCard
                                label="Admin"
                                icon="⚡"
                                value="admin"
                                active={formData.role === "admin"}
                                onChange={handleChange}
                                activeClass="border-slate-800 bg-slate-100 text-slate-800"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition active:scale-[0.98]"
                    >
                        Create Account
                    </button>
                </form>

                <p className="text-center text-slate-500 mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}

function RoleCard({ label, icon, value, active, onChange, activeClass }) {
    return (
        <label
            className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${active
                ? `${activeClass} font-semibold shadow-sm`
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
        >
            <input
                type="radio"
                name="role"
                value={value}
                checked={active}
                onChange={onChange}
                className="hidden"
            />
            <span className="block text-2xl mb-1">{icon}</span>
            <span className="text-sm">{label}</span>
        </label>
    );
}
