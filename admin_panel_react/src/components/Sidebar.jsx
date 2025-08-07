import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    // 🎯 Menú agrupado por secciones
    const menuSections = {
        "Cuenta": [
            { to: "/dashboard", label: "🏠 Dashboard" },
            { to: "/profile", label: "👤 Perfil" },
        ],
        "IA": [
            { to: "/intents", label: "🧠 Intents" },
            { to: "/stats", label: "📊 Estadísticas" },
            { to: "/diagnostico", label: "🧪 Diagnóstico" },
        ],
        "Administración": [
            { to: "/logs", label: "📄 Logs" },
            { to: "/users", label: "👥 Usuarios" },
            { to: "/exportaciones", label: "📈 Exportaciones de Logs" },
            { to: "/intentos-fallidos", label: "📉 Fallos del bot" },
        ],
    };

    return (
        <aside className="bg-gray-900 text-white w-64 min-h-screen p-4 space-y-4">
            <h2 className="text-xl font-bold mb-6">🔧 Panel Admin</h2>

            {Object.entries(menuSections).map(([section, links]) => (
                <div key={section}>
                    <p className="text-gray-400 uppercase text-sm mt-6 px-4">{section}</p>
                    {links.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`block py-2 px-4 rounded hover:bg-gray-700 ${isActive(to) ? "bg-gray-800 font-semibold" : ""
                                }`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            ))}
        </aside>
    );
};

export default Sidebar;