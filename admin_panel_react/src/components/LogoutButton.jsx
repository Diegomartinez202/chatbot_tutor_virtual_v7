import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const LogoutButton = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate("/") // Redirige al login
    }

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
        >
            Cerrar sesión
        </button>
    )
}

export default LogoutButton
