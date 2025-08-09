// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "@/services/axiosClient";
import { STORAGE_KEYS } from "@/lib/constants";
// Si no tienes este helper, no pasa nada; es opcional
import { registerLogout } from "@/services/authHelper";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem(STORAGE_KEYS.accessToken) || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const role = user?.rol || user?.role || "usuario";

    const logout = async () => {
        try {
            await axiosClient.post("/auth/logout");
        } catch (err) {
            console.warn("Error cerrando sesión en backend", err);
        } finally {
            localStorage.removeItem(STORAGE_KEYS.accessToken);
            setUser(null);
            setToken(null);
            try {
                delete axiosClient.defaults.headers.common.Authorization;
            } catch { }
        }
    };

    useEffect(() => {
        try {
            registerLogout?.(logout);
        } catch { }
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

    // login espera que tu LoginPage le pase el access_token (si ya lo tienes así)
    const login = async (newToken) => {
        localStorage.setItem(STORAGE_KEYS.accessToken, newToken);
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