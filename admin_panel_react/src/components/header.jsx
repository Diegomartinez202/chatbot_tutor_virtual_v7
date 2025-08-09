// src/components/Header.jsx
import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

const Header = () => {
    const { user } = useAuth();
    const role = user?.rol || "usuario";

    const navLinks = [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "soporte", "usuario"], tip: "Vista general del sistema" },
        { to: "/logs", label: "Logs", icon: FileText, roles: ["admin", "soporte"], tip: "Historial de conversaciones" },
        { to: "/intents", label: "Intents", icon: MessageSquareText, roles: ["admin"], tip: "Gestión de intents" },
        { to: "/stats", label: "Estadísticas", icon: BarChart2, roles: ["admin"], tip: "Métricas de uso" },
        { to: "/diagnostico", label: "Pruebas", icon: FlaskConical, roles: ["admin", "soporte"], tip: "Diagnóstico y conexión" },
        { to: "/users", label: "Usuarios", icon: UsersIcon, roles: ["admin"], tip: "Gestión de usuarios" },
        // 👇 nuevo
        { to: "/intentos-fallidos", label: "Intentos fallidos", icon: BarChart2, roles: ["admin"], tip: "Intents no reconocidos" },
    ];

    const canSee = (l) => !l.roles || l.roles.includes(role);

    return (
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
                    <Tooltip.Provider>
                        {navLinks.filter(canSee).map(({ to, label, icon: Icon, tip }) => (
                            <Tooltip.Root key={to}>
                                <Tooltip.Trigger asChild>
                                    <NavLink
                                        to={to}
                                        className={({ isActive }) =>
                                            [
                                                "hover:bg-gray-700 p-2 rounded flex items-center gap-2 transition-colors",
                                                isActive ? "bg-gray-800 font-semibold" : "",
                                            ].join(" ")
                                        }
                                    >
                                        <Icon size={18} />
                                        {label}
                                    </NavLink>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        className="rounded-md bg-black text-white px-2 py-1 text-xs"
                                        side="right"
                                    >
                                        {tip || label}
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        ))}
                    </Tooltip.Provider>
                </nav>
            </div>

            {/* 🔚 Logout */}
            <div className="p-6">
                <LogoutButton />
            </div>
        </aside>
    );
};

export default Header;