import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";
import { measureFetch } from "../utils/telemetry";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("race_app_user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = async (userData) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                const formattedUser = { ...data, id: data.id || data._id };
                setUser(formattedUser);
                localStorage.setItem("race_app_user", JSON.stringify(formattedUser));
                return { success: true, data: formattedUser };
            } else {
                return { success: false, message: data.message || "Login failed" };
            }
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: error.message || "Server error" };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                const formattedUser = { ...data, id: data.id || data._id };
                setUser(formattedUser);
                localStorage.setItem("race_app_user", JSON.stringify(formattedUser));
                return { success: true, data: formattedUser };
            } else {
                return { success: false, message: data.message || "Signup failed" };
            }
        } catch (error) {
            console.error("Signup Error:", error);
            return { success: false, message: error.message || "Server error" };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("race_app_user");
    };

    const updateUserState = (newData) => {
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem("race_app_user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateUser: updateUserState }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
