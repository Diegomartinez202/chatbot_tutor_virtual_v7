// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

function ProtectedRoute({ children, allowedRoles = [] }) {
    const token = localStorage.getItem("token"); // 🔁 Usa 'token' para mantener coherencia con AuthContext

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwt_decode(token);
        const userRole = decoded.rol;

        // 🚫 Si el rol del usuario no está en la lista de roles permitidos
        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/login" replace />;
        }

        return children;
    } catch (error) {
        // ⚠️ Si el token es inválido o no se puede decodificar
        return <Navigate to="/login" replace />;
    }
}

export default ProtectedRoute;