// src/components/Header.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/context/AuthContext";
import {
    UserCircle,
    Mail,
    ShieldCheck,
    LayoutDashboard,
    FileText,
    MessageSquareText,
    BarChart2,
    FlaskConical,
    Users as UsersIcon,
    Cog,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import SettingsPanel from "@/components/SettingsPanel";
import IconTooltip from "@/components/ui/IconTooltip";

// 🔒 Orígenes permitidos para mensajes del iframe (mismo valor que usa ChatUI/launcher)
const ALLOWED_ORIGINS = (import.meta.env.VITE_ALLOWED_HOST_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const originOK = (origin) => !ALLOWED_ORIGINS.length || ALLOWED_ORIGINS.includes(origin);

const Header = () => {
    const { user, logout: doLogout } = useAuth();
    const logout = doLogout || (() => { });
    const role = user?.rol || "usuario";
    const isAuthenticated = !!user;
    const navigate = useNavigate();

    const [openSettings, setOpenSettings] = React.useState(false);

    // ✅ Badge interno opcional en la SPA (no reemplaza el del launcher; lo refleja)
    const [chatBadge, setChatBadge] = React.useState(0);
    React.useEffect(() => {
        const onMsg = (ev) => {
            const data = ev.data || {};
            if (!originOK(ev.origin)) return;
            if (data.type === "chat:badge" && typeof data.count === "number") {
                setChatBadge(data.count);
            }
            if (data.type === "chat:visibility" && data.open === true) {
                setChatBadge(0);
            }
        };
        window.addEventListener("message", onMsg);
        return () => window.removeEventListener("message", onMsg);
    }, []);

    // Abrir el widget de chat si está presente; si no, navegar a /chat (alias histórico)
    const openChat = (e) => {
        try {
            if (window.ChatWidget?.open) {
                e?.preventDefault?.();
                window.ChatWidget.open();
            } else {
                // fallback a ruta interna si la app la expone
                navigate("/chat");
            }
        } catch {
            navigate("/chat");
        }
    };

    const navLinks = [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "soporte", "usuario"], tip: "Vista general del sistema" },
        { to: "/logs", label: "Logs", icon: FileText, roles: ["admin", "soporte"], tip: "Historial de conversaciones" },
        { to: "/intents", label: "Intents", icon: MessageSquareText, roles: ["admin"], tip: "Gestión de intents" },
        { to: "/stats", label: "Estadísticas", icon: BarChart2, roles: ["admin"], tip: "Métricas de uso" },
        { to: "/diagnostico", label: "Pruebas", icon: FlaskConical, roles: ["admin", "soporte"], tip: "Diagnóstico y conexión" },
        { to: "/users", label: "Usuarios", icon: UsersIcon, roles: ["admin"], tip: "Gestión de usuarios" },
        // 📌 Compatibilidad /chat: deja el alias y además intenta abrir el widget al click
        { to: "/chat", label: "Chat", icon: MessageSquareText, roles: ["admin", "soporte", "usuario"], tip: "Abrir chat de ayuda", isChat: true },
        // Nuevo pedido
        { to: "/intentos-fallidos", label: "Intentos fallidos", icon: BarChart2, roles: ["admin"], tip: "Intents no reconocidos" },
    ];

    const canSee = (l) => !l.roles || l.roles.includes(role);

    return (
        <>
            <aside className="h-screen w-64 bg-gray-900 text-white flex flex-col justify-between">
                <div className="p-6">
                    {/* 🧑 Encabezado */}
                    <div className="flex items-center gap-2 mb-4">
                        <UserCircle className="w-5 h-5" />
                        <h2 className="text-lg font-bold">Bienvenido</h2>
                    </div>

                    {/* 📧 Info de usuario */}
                    {user && (
                        <div className="mb-6 space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Rol: {user.rol}</span>
                            </div>
                        </div>
                    )}

                    {/* 🌐 Navegación */}
                    <nav className="flex flex-col gap-2">
                        <Tooltip.Provider delayDuration={200} skipDelayDuration={150}>
                            {navLinks.filter(canSee).map(({ to, label, icon: Icon, tip, isChat }) => (
                                <Tooltip.Root key={to}>
                                    <Tooltip.Trigger asChild>
                                        <NavLink
                                            to={to}
                                            onClick={isChat ? openChat : undefined}
                                            className={({ isActive }) =>
                                                [
                                                    "hover:bg-gray-700 p-2 rounded flex items-center gap-2 transition-colors",
                                                    isActive ? "bg-gray-800 font-semibold" : "",
                                                ].join(" ")
                                            }
                                        >
                                            <Icon size={18} />
                                            <span className="truncate">{label}</span>
                                            {/* 🔔 Badge opcional dentro del menú (solo para Chat) */}
                                            {isChat && chatBadge > 0 && (
                                                <span
                                                    aria-label={`${chatBadge} mensajes sin leer`}
                                                    className="ml-auto inline-flex min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] items-center justify-center"
                                                >
                                                    {chatBadge}
                                                </span>
                                            )}
                                        </NavLink>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content
                                            className="rounded-md bg-black/90 text-white px-2 py-1 text-xs shadow"
                                            side="right"
                                            sideOffset={6}
                                        >
                                            {tip || label}
                                            <Tooltip.Arrow className="fill-black/90" />
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                            ))}
                        </Tooltip.Provider>
                    </nav>
                </div>

                {/* ⚙️ Config + 🔚 Logout */}
                <div className="p-6 flex items-center justify-between gap-2">
                    <IconTooltip label="Configuración" side="top">
                        <button
                            onClick={() => setOpenSettings(true)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-white/10 hover:bg-white/20"
                            aria-label="Configuración"
                            type="button"
                        >
                            <Cog size={16} /> Config.
                        </button>
                    </IconTooltip>
                    <LogoutButton />
                </div>
            </aside>

            {/* Panel de Configuración */}
            <SettingsPanel
                open={openSettings}
                onClose={() => setOpenSettings(false)}
                isAuthenticated={isAuthenticated}
                onLogout={logout}
                onCloseChat={() => window.dispatchEvent(new CustomEvent("chat:close"))}
                onLanguageChange={(lang) =>
                    window.dispatchEvent(new CustomEvent("app:lang", { detail: { lang } }))
                }
            />
        </>
    );
};

export default Header;