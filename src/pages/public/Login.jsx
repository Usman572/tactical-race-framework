import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        const result = await login({ email, password });

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
        <div className="max-w-md mx-auto py-16 px-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
                    WELCOME <span className="text-blue-600 italic">BACK</span>
                </h1>
                <p className="text-slate-500 text-lg">Log in to your account.</p>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus://blue-500/10 outline-none transition-all placeholder:text-slate-400"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98] text-lg"
                >
                    Access Portal
                </button>
            </form>

            <div className="text-center mt-8">
                <p className="text-slate-500">
                    Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Sign Up</Link>
                </p>
            </div>

            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-center text-xs text-slate-500 font-medium">
                    💡 Demo Tip: Use <strong>admin@race.com</strong> for Admin, <strong>partner@race.com</strong> for Partner.
                </p>
            </div>
        </div>
    );
}
