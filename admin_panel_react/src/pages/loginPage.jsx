// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Input from "@/components/Input";
import { Button } from "@/components/ui/button";
import IconTooltip from "@/components/ui/IconTooltip";
import { Lock } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { login as apiLogin, me as apiMe } from "@/services/authApi";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    // Botón Zajuna visible solo si existe URL en .env
    const zajunaSSO =
        import.meta.env.VITE_ZAJUNA_SSO_URL ||
        import.meta.env.VITE_ZAJUNA_LOGIN_URL ||
        "";

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1) Login → token (vía authApi)
            const { token } = await apiLogin({ email, password });
            if (!token) throw new Error("Credenciales inválidas o error del servidor.");

            // 2) Persistir en tu AuthContext (mantiene tu lógica de negocio)
            await login(token);

            // 3) Obtener perfil para decidir ruta por rol
            let role = "usuario";
            try {
                const profile = await apiMe();
                role = profile?.rol || profile?.role || "usuario";
            } catch {
                // si falla, seguimos como 'usuario'
            }

            if (role === "admin" || role === "soporte") {
                navigate("/dashboard", { replace: true });
            } else {
                navigate("/chat", { replace: true });
            }
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Error de red, intenta nuevamente."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleZajuna = () => {
        if (zajunaSSO) {
            // SSO debe redirigir a /auth/callback con ?access_token=... o #access_token=...
            window.location.href = zajunaSSO;
        } else {
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
                    <Button
                        type="submit"
                        disabled={loading}
                        aria-busy={loading}
                        data-testid="login-submit"
                    >
                        {loading ? "Ingresando..." : "Ingresar"}
                    </Button>

                    {/* Botón SSO solo si hay URL configurada */}
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

                    {/* Invitado (sin registro) */}
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
                    Consejo: define <code>VITE_ZAJUNA_SSO_URL</code> en tu <code>.env</code>{" "}
                    para habilitar el botón de Zajuna.
                </p>
            )}
        </div>
    );
}

export default LoginPage;