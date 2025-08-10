// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    User as UserIcon,
    Brain,
    BarChart,
    FlaskConical,
    FileText,
    Users,
    Download,
    Bug,
    PanelLeft,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

// 🔧 Si en el futuro agregas la ruta /intentos-fallidos,
// pon esto en true para mostrar el ítem en el menú.
const ENABLE_INTENTOS_FALLIDOS = true;

const Sidebar = () => {
    const { user } = useAuth();
    const role = user?.rol || "usuario";

    const menuSections = {
        Cuenta: [
            { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "soporte", "usuario"] },
            { to: "/profile", label: "Perfil", icon: UserIcon, roles: ["admin", "soporte", "usuario"] },
        ],
        IA: [
            { to: "/intents", label: "Intents", icon: Brain, roles: ["admin"] },
            { to: "/stats-v2", label: "Estadísticas v2", icon: BarChart, roles: ["admin"] },
            { to: "/diagnostico", label: "Diagnóstico", icon: FlaskConical, roles: ["admin", "soporte"] },
        ],
        Administración: [
            { to: "/logs", label: "Logs", icon: FileText, roles: ["admin", "soporte"] },
            { to: "/users", label: "Usuarios", icon: Users, roles: ["admin"] },
            { to: "/admin/exportaciones", label: "Exportaciones", icon: Download, roles: ["admin"] },
            // Oculto por defecto hasta que exista la ruta:
            { to: "/intentos-fallidos", label: "Fallos del bot", icon: Bug, roles: ["admin"], hidden: !ENABLE_INTENTOS_FALLIDOS },
        ],
    };

    const canSee = (link) => (!link.roles || link.roles.includes(role)) && !link.hidden;

    return (
        <aside className="bg-gray-900 text-white w-64 min-h-screen p-4 space-y-4">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <PanelLeft size={22} /> Panel Admin
            </h2>

            {/* Mantengo Provider/Root/Trigger/Portal/Content/Arrow (mínimo diff) */}
            <Tooltip.Provider delayDuration={200} skipDelayDuration={150}>
                {Object.entries(menuSections).map(([section, links]) => (
                    <div key={section}>
                        <p className="text-gray-400 uppercase text-sm mt-6 px-4">{section}</p>
                        {links.filter(canSee).map(({ to, label, icon: Icon }) => (
                            <Tooltip.Root key={to}>
                                <Tooltip.Trigger asChild>
                                    <NavLink
                                        to={to}
                                        className={({ isActive }) =>
                                            [
                                                "flex items-center gap-2 py-2 px-4 rounded hover:bg-gray-700 transition-colors",
                                                isActive ? "bg-gray-800 font-semibold" : "",
                                            ].join(" ")
                                        }
                                    >
                                        <Icon size={18} />
                                        <span>{label}</span>
                                    </NavLink>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        className="rounded-md bg-black/90 text-white px-2 py-1 text-xs shadow"
                                        side="right"
                                        sideOffset={6}
                                    >
                                        {label}
                                        <Tooltip.Arrow className="fill-black/90" />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        ))}
                    </div>
                ))}
            </Tooltip.Provider>
        </aside>
    );
};

export default Sidebar;