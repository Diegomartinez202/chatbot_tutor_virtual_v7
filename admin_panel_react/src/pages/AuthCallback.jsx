// src/pages/AuthCallback.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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
            if (token) {
                try {
                    // tu AuthContext persiste token y hace /auth/me
                    await login(token);
                    navigate("/dashboard", { replace: true });
                } catch {
                    navigate("/login", { replace: true });
                }
            } else {
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