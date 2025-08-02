
// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "@/services/axiosClient";
import { registerLogout } from "@/services/authHelper";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("accessToken") || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const role = user?.rol || "usuario";

    const logout = async () => {
        try {
            await axiosClient.post("/auth/logout");
        } catch (err) {
            console.warn("Error cerrando sesión en backend", err);
        } finally {
            localStorage.removeItem("accessToken");
            setUser(null);
            setToken(null);
        }
    };

    useEffect(() => {
        registerLogout(logout);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axiosClient.get("/auth/me");
                setUser(res.data);
            } catch (err) {
                console.error("Token inválido:", err);
                await logout();
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    const login = async (newToken) => {
        localStorage.setItem("accessToken", newToken);
        setToken(newToken);

        try {
            const res = await axiosClient.get("/auth/me");
            setUser(res.data);
        } catch (err) {
            console.error("Error al obtener perfil tras login:", err);
        }
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ token, user, role, login, logout, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);