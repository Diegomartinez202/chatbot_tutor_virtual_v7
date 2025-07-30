import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminLayout = () => {
    const { logout, user } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate("/login")
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar / Header */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col justify-between">
                <div className="p-4">
                    <h2 className="text-2xl font-bold mb-6">🤖 Panel Admin</h2>

                    {user && (
                        <div className="mb-6">
                            <p className="text-sm">📧 {user.email}</p>
                            <p className="text-sm">🔐 Rol: {user.rol}</p>
                        </div>
                    )}

                    <nav className="flex flex-col space-y-2">
                        <Link to="/dashboard" className="hover:bg-gray-700 px-3 py-2 rounded">📊 Dashboard</Link>
                        <Link to="/intents" className="hover:bg-gray-700 px-3 py-2 rounded">🧠 Intents</Link>
                        <Link to="/logs" className="hover:bg-gray-700 px-3 py-2 rounded">📄 Logs</Link>
                        <Link to="/stats" className="hover:bg-gray-700 px-3 py-2 rounded">📈 Estadísticas</Link>
                        <Link to="/test" className="hover:bg-gray-700 px-3 py-2 rounded">🧪 Pruebas</Link>
                    </nav>
                </div>

                <div className="p-4">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                    >
                        🚪 Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 bg-gray-100 p-6">
                <Outlet />
            </main>
        </div>
    )
}

export default AdminLayout
