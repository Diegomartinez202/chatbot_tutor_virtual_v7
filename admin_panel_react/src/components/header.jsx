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
    FlaskConical
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

const Header = () => {
    const { user } = useAuth();

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
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <NavLink to="/dashboard" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </NavLink>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content className="tooltip" side="right">
                                    Vista general del sistema
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>

                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <NavLink to="/logs" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
                                    <FileText size={18} />
                                    Logs
                                </NavLink>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content className="tooltip" side="right">
                                    Historial de conversaciones
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>

                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <NavLink to="/intents-page" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
                                    <MessageSquareText size={18} />
                                    Intents
                                </NavLink>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content className="tooltip" side="right">
                                    Gestión de intents
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>

                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <NavLink to="/stadisticas-logs" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
                                    <BarChart2 size={18} />
                                    Estadísticas
                                </NavLink>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content className="tooltip" side="right">
                                    Métricas de uso
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>

                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <NavLink to="/test" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
                                    <FlaskConical size={18} />
                                    Pruebas
                                </NavLink>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content className="tooltip" side="right">
                                    Diagnóstico y conexión
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>
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