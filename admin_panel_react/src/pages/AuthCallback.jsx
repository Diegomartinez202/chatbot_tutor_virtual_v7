// src/pages/AuthCallback.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axiosClient from "@/services/axiosClient";

/** Extrae token desde query o hash: ?access_token=... o #access_token=... */
function getTokenFromLocation(location) {
    const search = new URLSearchParams(location.search || "");
    let t =
        search.get("access_token") ||
        search.get("token") ||
        search.get("t");
    if (t) return t;

    if (location.hash) {
        const hash = new URLSearchParams(String(location.hash).replace(/^#/, ""));
        t =
            hash.get("access_token") ||
            hash.get("token") ||
            hash.get("t");
    }
    return t || null;
}

export default function AuthCallback() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = getTokenFromLocation(location);

        (async () => {
            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            try {
                await login(token); // AuthContext persiste y hace /auth/me
                // Aseguramos rol:
                let role = "usuario";
                try {
                    const me = await axiosClient.get("/auth/me");
                    role = me?.data?.rol || me?.data?.role || "usuario";
                } catch {
                    // sigue como 'usuario'
                }

                if (role === "admin" || role === "soporte") {
                    navigate("/dashboard", { replace: true });
                } else {
                    navigate("/chat", { replace: true });
                }
            } catch {
                navigate("/login", { replace: true });
            }
        })();
    }, [location, login, navigate]);

    return (
        <div className="min-h-screen grid place-items-center">
            <p className="text-gray-600">Procesando autenticación…</p>
        </div>
    );
}