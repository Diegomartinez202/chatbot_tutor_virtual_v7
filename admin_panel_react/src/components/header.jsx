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
    Bell,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import SettingsPanel from "@/components/SettingsPanel";
import IconTooltip from "@/components/ui/IconTooltip";
import Badge from "@/components/Badge"; // ✅ Unificado (modo chat)

const Header = () => {
    const { user, logout: doLogout } = useAuth();
    const logout = doLogout || (() => { });
    const role = user?.rol || "usuario";
    const isAuthenticated = !!user;
    const navigate = useNavigate();

    const [openSettings, setOpenSettings] = React.useState(false);

    // Abrir el widget de chat si está presente; si no, navegar a /chat (alias histórico)
    const openChat = (e) => {
        try {
            if (window.ChatWidget?.open) {
                e?.preventDefault?.();
                window.ChatWidget.open();
            } else {
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

                        {/* 🔔 Badge global (opcional) al lado del título */}
                        <div className="ml-auto flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            <Badge mode="chat" size="xs" /> {/* ✅ escucha postMessage automáticamente */}
                        </div>
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

                                            {/* 🔔 Badge en el item "Chat" del menú (opcional) */}
                                            {isChat && <Badge mode="chat" size="xs" className="ml-auto" />}
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