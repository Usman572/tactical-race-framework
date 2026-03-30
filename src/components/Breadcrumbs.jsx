import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Breadcrumbs({ className = "", variant = "default" }) {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    const breadcrumbMap = {
        races: "Races",
        leaderboard: "Leaderboard",
        login: "Access",
        register: "Initialize",
        admin: "Command Center",
        users: "Agent Roster",
        profile: "Operative",
    };

    const getLabel = (name) => {
        return breadcrumbMap[name] || name.charAt(0).toUpperCase() + name.slice(1);
    };

    const isNonLinkable = (name) => name === "profile";

    return (
        <nav className={`flex py-4 ${className}`} aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {variant !== "minimal" && (
                    <li className="inline-flex items-center">
                        <Link
                            to="/"
                            className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors"
                        >
                            <span className="mr-2">⚡</span> CORE
                        </Link>
                    </li>
                )}
                {pathnames.map((name, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                    const isLast = index === pathnames.length - 1;
                    const label = getLabel(name);
                    const isNonLink = isNonLinkable(name);

                    return (
                        <motion.li
                            key={name}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`inline-flex items-center ${variant === 'minimal' && !isLast && index < pathnames.length - 1 ? 'hidden sm:inline-flex' : 'inline-flex'}`}
                        >
                            <span className="mx-2 text-slate-200 font-light">/</span>
                            {isLast || isNonLink ? (
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLast ? "text-black" : "text-slate-300"}`}>
                                    {label}
                                </span>
                            ) : (
                                <Link
                                    to={routeTo}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {label}
                                </Link>
                            )}
                        </motion.li>
                    );
                })}
            </ol>
        </nav>
    );
}
