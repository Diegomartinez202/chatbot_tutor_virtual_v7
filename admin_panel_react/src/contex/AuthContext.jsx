import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../services/axiosClient";
import { registerLogout } from "../services/authHelper"; // ✅ integración del helper

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔐 Rol con valor por defecto
    const role = user?.rol || "usuario";  // ← ⚠️ Mejora agregada

    // Logout seguro: borra token y cookie backend
    const logout = async () => {
        try {
            await axiosClient.post("/auth/logout"); // ← borra cookie refresh_token en backend
        } catch (err) {
            console.warn("Error cerrando sesión en backend", err);
        } finally {
            localStorage.removeItem("token");
            setUser(null);
            setToken(null);
        }
    };

    // ✅ Registrar logout para uso en axiosClient (global)
    useEffect(() => {
        registerLogout(logout);
    }, []);

    // Cargar usuario si ya hay token
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

    // Login: guarda token y actualiza estado
    const login = async (newToken) => {
        localStorage.setItem("token", newToken);
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
