// src/components/Header.jsx
import React from "react";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
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
    Home as HomeIcon,
    ChevronRight,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import SettingsPanel from "@/components/SettingsPanel";
import IconTooltip from "@/components/ui/IconTooltip";
import Badge from "@/components/Badge"; // ✅ Unificado (modo chat)

/* ──────────────────────────────────────────────────────────
   Helpers breadcrumb: convierte "/a/b/c" en items clicables
   sin romper rutas dinámicas. Puedes ajustar el mapa LABELS.
   ────────────────────────────────────────────────────────── */
function humanize(seg) {
    const map = {
        "": "Inicio",
        dashboard: "Dashboard",
        logs: "Logs",
        intents: "Intents",
        users: "Usuarios",
        chat: "Chat",
        "intentos-fallidos": "Intentos fallidos",
        "stadisticas-logs": "Estadísticas",
        admin: "Admin",
        diagnostico: "Pruebas",
          logs: "Exportar logs",
            exportaciones: "Exportaciones",
                "intents-page": "Intents (página)",
                    buscar: "Buscar",
                        list: "Listado",
                            new: "Nuevo",
                                edit: "Editar",
                                    unauthorized: "Acceso denegado",
                                        login: "Login",
  };
return map[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function useBreadcrumbs() {
    const { pathname } = useLocation();
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = [];
    let acc = "";
    for (let i = 0; i < segments.length; i++) {
        acc += `/${segments[i]}`;
        crumbs.push({
            to: acc,
            label: humanize(segments[i]),
            last: i === segments.length - 1,
        });
    }
    return crumbs;
}

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

    // 🔁 Menú lateral
    const navLinks = [
        // 🏠 Inicio (nuevo)
        { to: "/", label: "Inicio", icon: HomeIcon, roles: ["admin", "soporte", "usuario"], tip: "Página de bienvenida" },

        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "soporte", "usuario"], tip: "Vista general del sistema" },
        { to: "/logs", label: "Logs", icon: FileText, roles: ["admin", "soporte"], tip: "Historial de conversaciones" },
        { to: "/intents", label: "Intents", icon: MessageSquareText, roles: ["admin"], tip: "Gestión de intents" },

        // ✅ Ajustado a tu ruta real
        { to: "/stadisticas-logs", label: "Estadísticas", icon: BarChart2, roles: ["admin"], tip: "Métricas de uso" },

        // ✅ Ajustado a tu ruta real
        { to: "/admin/diagnostico", label: "Pruebas", icon: FlaskConical, roles: ["admin", "soporte"], tip: "Diagnóstico y conexión" },

        { to: "/users", label: "Usuarios", icon: UsersIcon, roles: ["admin"], tip: "Gestión de usuarios" },

        // 📌 Compatibilidad /chat: deja el alias y además intenta abrir el widget al click
        { to: "/chat", label: "Chat", icon: MessageSquareText, roles: ["admin", "soporte", "usuario"], tip: "Abrir chat de ayuda", isChat: true },

        // Histórico
        { to: "/intentos-fallidos", label: "Intentos fallidos", icon: BarChart2, roles: ["admin"], tip: "Intents no reconocidos" },
    ];

    const canSee = (l) => !l.roles || l.roles.includes(role);

    // Breadcrumbs top bar
    const crumbs = useBreadcrumbs();

    return (
        <>
            {/* 🔷 Top header bar (nuevo): botón Home + breadcrumbs + avatar mini */}
            <header className="sticky top-0 z-40 h-12 bg-white/80 backdrop-blur border-b flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-black/5"
                        aria-label="Ir a inicio"
                        title="Ir a inicio"
                    >
                        <HomeIcon size={18} />
                        <span className="text-sm font-medium hidden sm:inline">Inicio</span>
                    </Link>

                    {/* Separador visual */}
                    <div className="mx-1 h-5 w-px bg-black/10" />

                    {/* Breadcrumbs */}
                    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-gray-600">
                        <Link to="/" className="hover:underline">Inicio</Link>
                        {crumbs.map((c, idx) => (
                            <React.Fragment key={c.to}>
                                <ChevronRight size={14} className="mx-1 text-gray-400" />
                                {c.last ? (
                                    <span className="font-semibold text-gray-900 truncate max-w-[30vw] sm:max-w-none">{c.label}</span>
                                ) : (
                                    <Link to={c.to} className="hover:underline">{c.label}</Link>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                </div>

                <Link to="/" className="shrink-0" title="Ir al inicio">
                    <img
                        src="/bot-avatar.png"
                        alt="Home"
                        className="w-8 h-8 rounded-md object-contain"
                        loading="eager"
                    />
                </Link>
            </header>

            {/* 🔳 Sidebar existente (se conserva intacto y funcional) */}
            <aside className="h-screen w-64 bg-gray-900 text-white flex flex-col justify-between">
                <div className="p-6">
                    {/* Brand / Home: avatar mini + título clicable al inicio */}
                    <div className="flex items-center gap-3 mb-6">
                        <Link to="/" className="shrink-0">
                            <img
                                src="/bot-avatar.png"
                                alt="Home"
                                className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1"
                                loading="eager"
                            />
                        </Link>
                        <div className="flex-1">
                            <Link to="/" className="text-lg font-bold hover:underline">
                                Chatbot Tutor Virtual
                            </Link>
                            <div className="text-xs text-white/70">Panel de administración</div>
                        </div>

                        {/* 🔔 Badge global (opcional) al lado del título */}
                        <div className="ml-auto flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            <Badge mode="chat" size="xs" /> {/* ✅ escucha postMessage automáticamente */}
                        </div>
                    </div>

                    {/* 🧑 Encabezado secundario */}
                    <div className="flex items-center gap-2 mb-4">
                        <UserCircle className="w-5 h-5" />
                        <h2 className="text-sm font-semibold">Bienvenido</h2>
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

            {/* Panel de Configuración (se mantiene) */}
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