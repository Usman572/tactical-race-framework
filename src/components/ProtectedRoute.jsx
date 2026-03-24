import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useAuth();

    if (!user) {
        // Not logged in
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in but wrong role (e.g. Partner trying to access Admin)
        return <Navigate to="/" replace />; // Or a "Not Authorized" page
    }

    return children;
}
