// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Input from "@/components/Input";
import { Button } from "@/components/ui/button";
import { login as loginApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Lock } from "lucide-react";
import IconTooltip from "@/components/ui/IconTooltip";
import axiosClient from "@/services/axiosClient";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    // URL del SSO de Zajuna (si existe en .env)
    const zajunaSSO =
        import.meta.env.VITE_ZAJUNA_SSO_URL ||
        import.meta.env.VITE_ZAJUNA_LOGIN_URL ||
        "";

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // ⚠️ loginApi espera credenciales como objeto
            const res = await loginApi({ email, password });

            // Acepta varios nombres de campo
            const token =
                res?.data?.access_token ??
                res?.data?.token ??
                res?.access_token ??
                res?.token ??
                null;

            if (!token) {
                setError("Credenciales inválidas o error del servidor.");
                setLoading(false);
                return;
            }

            // Persiste y obtiene perfil (AuthContext hace /auth/me internamente)
            await login(token);

            // Aseguramos el rol consultando /auth/me (para decidir navegación)
            let role = "usuario";
            try {
                const me = await axiosClient.get("/auth/me");
                role = me?.data?.rol || me?.data?.role || "usuario";
            } catch {
                // Si falla, asumimos "usuario" para no bloquear navegación
            }

            // Redirección por rol
            if (role === "admin" || role === "soporte") {
                navigate("/dashboard", { replace: true });
            } else {
                // Usuarios normales al chatbot
                navigate("/chat", { replace: true });
            }
        } catch (err) {
            setError(
                err?.response?.data?.message || err?.message || "Error de red, intenta nuevamente."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleZajuna = () => {
        if (zajunaSSO) {
            // Te lleva al proveedor de SSO (debe redirigir luego a /auth/callback con el token)
            window.location.href = zajunaSSO;
        } else {
            // Fallback si no hay SSO configurado
            navigate("/login");
        }
    };

    const handleGuest = () => {
        // Sin registro → directo al chat
        navigate("/chat");
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-4">
                <IconTooltip label="Iniciar sesión" side="top">
                    <Lock className="w-6 h-6 text-gray-700" />
                </IconTooltip>
                <h2 className="text-xl font-semibold">Iniciar sesión</h2>
            </div>

            <form onSubmit={handleLogin} aria-describedby="login-error">
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    // 👇 añadidos para tests
                    name="email"
                    placeholder="Correo"
                    data-testid="login-email"
                />

                <Input
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    // 👇 añadidos para tests
                    name="password"
                    placeholder="Contraseña"
                    data-testid="login-password"
                />

                <div className="flex flex-col gap-3 mt-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        aria-busy={loading}
                        data-testid="login-submit"
                    >
                        {loading ? "Ingresando..." : "Ingresar"}
                    </Button>

                    {/* Botón para autenticación con Zajuna (SSO) — SOLO si hay SSO configurado */}
                    {zajunaSSO && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleZajuna}
                            disabled={loading}
                            data-testid="login-zajuna"
                        >
                            Ingresar con Zajuna
                        </Button>
                    )}

                    {/* Entrar como invitado (sin registro) */}
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleGuest}
                        disabled={loading}
                        data-testid="login-guest"
                    >
                        Entrar como invitado (sin registro)
                    </Button>
                </div>
            </form>

            {error && (
                <p id="login-error" className="text-red-600 mt-2" role="alert">
                    {error}
                </p>
            )}

            {/* Enlaces de ayuda */}
            <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
                <Link to="/" className="hover:underline">
                    ← Volver al inicio
                </Link>
                <Link to="/auth/callback" className="hover:underline">
                    ¿Tienes token? Procesar callback
                </Link>
            </div>

            {/* Pista de configuración */}
            {!zajunaSSO && (
                <p className="text-[11px] text-gray-400 mt-4">
                    Consejo: define <code>VITE_ZAJUNA_SSO_URL</code> en tu <code>.env.local</code> para habilitar el botón de Zajuna.
                </p>
            )}
        </div>
    );
}

export default LoginPage;