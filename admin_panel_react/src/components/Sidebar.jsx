// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    User,
    Brain,
    BarChart,
    FlaskConical,
    FileText,
    Users,
    Download,
    Bug,
    PanelLeft
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const menuSections = {
        "Cuenta": [
            { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { to: "/profile", label: "Perfil", icon: User },
        ],
        "IA": [
            { to: "/intents-page", label: "Intents", icon: Brain },
            { to: "/stats-v2", label: "📊 Estadísticas v2", icon: BarChart },
            { to: "/test", label: "Diagnóstico", icon: FlaskConical },
        ],
        "Administración": [
            { to: "/logs", label: "Logs", icon: FileText },
            { to: "/user-management", label: "Usuarios", icon: Users },
            { to: "/exportaciones", label: "Exportaciones", icon: Download },
            { to: "/intentos-fallidos", label: "Fallos del bot", icon: Bug },
        ],
    };

    return (
        <aside className="bg-gray-900 text-white w-64 min-h-screen p-4 space-y-4">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <PanelLeft size={22} /> Panel Admin
            </h2>

            <Tooltip.Provider>
                {Object.entries(menuSections).map(([section, links]) => (
                    <div key={section}>
                        <p className="text-gray-400 uppercase text-sm mt-6 px-4">{section}</p>
                        {links.map(({ to, label, icon: Icon }) => (
                            <Tooltip.Root key={to}>
                                <Tooltip.Trigger asChild>
                                    <Link
                                        to={to}
                                        className={`flex items-center gap-2 py-2 px-4 rounded hover:bg-gray-700 ${isActive(to) ? "bg-gray-800 font-semibold" : ""}`}
                                    >
                                        <Icon size={18} />
                                        <span>{label}</span>
                                    </Link>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="tooltip" side="right">
                                        {label}
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