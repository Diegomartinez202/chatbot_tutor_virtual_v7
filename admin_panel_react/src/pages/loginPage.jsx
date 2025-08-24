// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "@/components/Input";
import IconTooltip from "@/components/ui/IconTooltip";
import { Lock } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { login as apiLogin, me as apiMe } from "@/services/authApi";

const ENABLE_LOCAL = String(import.meta.env.VITE_ENABLE_LOCAL_LOGIN) === "true";
const ZAJUNA_SSO = import.meta.env.VITE_ZAJUNA_SSO_URL || "";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!ENABLE_LOCAL) return;
        setLoading(true);
        setError("");

        try {
            // 1) Login → token (si habilitas login local)
            const { token } = await apiLogin({ email, password });

            // 2) Persistir en tu AuthContext
            await login(token);

            // 3) Perfil → decidir ruta
            let role = "usuario";
            try {
                const profile = await apiMe();
                role = profile?.rol || profile?.role || "usuario";
            } catch { }

            if (role === "admin" || role === "soporte") navigate("/dashboard", { replace: true });
            else navigate("/chat", { replace: true });
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Error de red, intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleZajuna = () => {
        if (ZAJUNA_SSO) {
            // Ir a SSO de Zajuna: debe volver a /auth/callback con el token
            window.location.href = ZAJUNA_SSO;
        }
    };

    const handleGuest = () => {
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

            {/* —— SSO de Zajuna (principal) —— */}
            {ZAJUNA_SSO ? (
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleZajuna}
                        disabled={loading}
                        data-testid="login-zajuna"
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
                    >
                        Ingresar con Zajuna
                    </button>

                    <button
                        type="button"
                        onClick={handleGuest}
                        disabled={loading}
                        data-testid="login-guest"
                        className="inline-flex items-center justify-center rounded-lg bg-transparent text-gray-900 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                        Entrar como invitado (sin registro)
                    </button>
                </div>
            ) : (
                <p className="text-sm text-gray-600">
                    Configura <code>VITE_ZAJUNA_SSO_URL</code> en tu <code>.env</code> para habilitar el acceso SSO de Zajuna.
                </p>
            )}

            {/* —— Formulario local (opcional) —— */}
            {ENABLE_LOCAL && (
                <>
                    <div className="my-4 h-px bg-gray-200" />
                    <form onSubmit={handleLogin} aria-describedby="login-error">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
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
                            name="password"
                            placeholder="Contraseña"
                            data-testid="login-password"
                        />

                        <div className="flex flex-col gap-3 mt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                aria-busy={loading}
                                data-testid="login-submit"
                                className="inline-flex items-center justify-center rounded-lg bg-white text-gray-900 px-5 py-2.5 text-sm font-medium border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
                            >
                                {loading ? "Ingresando..." : "Ingresar (login local)"}
                            </button>
                        </div>
                    </form>
                </>
            )}

            {error && (
                <p id="login-error" className="text-red-600 mt-2" role="alert">
                    {error}
                </p>
            )}

            <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
                <Link to="/" className="hover:underline">← Volver al inicio</Link>
                <Link to="/auth/callback" className="hover:underline">¿Tienes token? Procesar callback</Link>
            </div>
        </div>
    );
}

export default LoginPage;
