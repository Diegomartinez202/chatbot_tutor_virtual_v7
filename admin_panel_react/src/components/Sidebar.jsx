import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <aside className="bg-gray-900 text-white w-64 min-h-screen p-4 space-y-4">
            <h2 className="text-xl font-bold mb-6">🔧 Panel Admin</h2>

            {/* 👤 Cuenta */}
            <Link
                to="/dashboard"
                className={`block py-2 px-4 rounded hover:bg-gray-700 ${isActive("/dashboard") ? "bg-gray-800 font-semibold" : ""}`}
            >
                🏠 Dashboard
            </Link>
            <Link
                to="/profile"
                className={`block py-2 px-4 rounded hover:bg-gray-700 ${isActive("/profile") ? "bg-gray-800 font-semibold" : ""}`}
            >
                👤 Perfil
            </Link>

            {/* 🧠 IA */}
            <p className="text-gray-400 uppercase text-sm mt-6 px-4">IA</p>
            <Link
                to="/intents"
                className={`block py-2 px-4 rounded hover:bg-gray-700 ${isActive("/intents") ? "bg-gray-800 font-semibold" : ""}`}
            >
                🧠 Intents
            </Link>
            <Link
                to="/stats"
                className={`block py-2 px-4 rounded hover:bg-gray-700 ${isActive("/stats") ? "bg-gray-800 font-semibold" : ""}`}
            >
                📊 Estadísticas
            </Link>
            <Link
                to="/diagnostico"
                className={`block py-2 px-4 rounded hover:bg-gray-700 ${isActive("/diagnostico") ? "bg-gray-800 font-semibold" : ""}`}
            >
                🧪 Diagnóstico
            </Link>

            {/* 🛠️ Administración */}
            <p className="text-gray-400 uppercase text-sm mt-6 px-4">Administración</p>
            <Link
                to="/logs"
                className={`block py-2 px-4 rounded hover:bg-gray-700 ${isActive("/logs") ? "bg-gray-800 font-semibold" : ""}`}
            >
                📄 Logs
            </Link>
            <Link
                to="/users"
                className={`block py-2 px-4 rounded hover:bg-gray-700 ${isActive("/users") ? "bg-gray-800 font-semibold" : ""}`}
            >
                👥 Usuarios
            </Link>
            <Link
                to="/stadisticas-logs"
                className={`block py-2 px-4 rounded hover:bg-gray-700 ${isActive("/stadisticas-logs") ? "bg-gray-800 font-semibold" : ""}`}
            >
                📈 Exportaciones CSV
            </Link>
            <Link
                to="/intentos-fallidos"
                className={`block py-2 px-4 rounded hover:bg-gray-700 ${isActive("/intentos-fallidos") ? "bg-gray-800 font-semibold" : ""}`}
            >
                📉 Fallos del bot
            </Link>
        </aside>
    );
};

export default Sidebar;