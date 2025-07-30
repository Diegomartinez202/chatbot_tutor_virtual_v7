import { NavLink } from "react-router-dom"
import LogoutButton from "./LogoutButton"
import { useAuth } from "../context/AuthContext"

const Header = () => {
    const { user } = useAuth()

    return (
        <aside className="h-screen w-64 bg-gray-900 text-white flex flex-col justify-between">
            <div className="p-6">
                <h2 className="text-lg font-bold mb-4">👤 Bienvenido</h2>
                {user && (
                    <div className="mb-6">
                        <p className="text-sm">📧 {user.email}</p>
                        <p className="text-sm">🔐 Rol: {user.rol}</p>
                    </div>
                )}

                <nav className="flex flex-col gap-2">
                    <NavLink to="/dashboard" className="hover:bg-gray-700 p-2 rounded">
                        📊 Dashboard
                    </NavLink>
                    <NavLink to="/logs" className="hover:bg-gray-700 p-2 rounded">
                        📝 Logs
                    </NavLink>
                    <NavLink to="/intents" className="hover:bg-gray-700 p-2 rounded">
                        💬 Intents
                    </NavLink>
                    <NavLink to="/stats" className="hover:bg-gray-700 p-2 rounded">
                        📈 Estadísticas
                    </NavLink>
                    <NavLink to="/test" className="hover:bg-gray-700 p-2 rounded">
                        🧪 Pruebas
                    </NavLink>
                </nav>
            </div>

            <div className="p-6">
                <LogoutButton />
            </div>
        </aside>
    )
}

export default Header
