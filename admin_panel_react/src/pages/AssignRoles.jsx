import { useEffect, useState } from "react";
import axiosClient from "@/services/axiosClient";         // ✅ corregido
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";          // ✅ corregido


const AssignRoles = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user: currentUser } = useAuth(); // Usuario actual autenticado

    const fetchUsers = async () => {
        try {
            const res = await axiosClient.get("/admin/users");
            setUsers(res.data);
        } catch (err) {
            toast.error("❌ Error al obtener usuarios");
            console.error(err);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            setLoading(true);
            const user = users.find((u) => u._id === userId);
            await axiosClient.put(`/admin/users/${userId}`, {
                email: user.email,
                nombre: user.nombre,
                rol: newRole,
            });
            toast.success("✅ Rol actualizado correctamente");
            await fetchUsers();
        } catch (err) {
            toast.error("❌ Error al actualizar rol");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">🔐 Asignar Roles de Usuario</h2>

            {loading && <p>Cargando...</p>}

            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Nombre</th>
                        <th className="p-2 border">Correo</th>
                        <th className="p-2 border">Rol actual</th>
                        <th className="p-2 border">Cambiar rol</th>
                    </tr>
                </thead>
                <tbody>
                    {users
                        .filter((u) => u.rol !== "superadmin") // Oculta superadmin (opcional)
                        .map((user) => (
                            <tr key={user._id} className="border-t">
                                <td className="p-2 border">{user.nombre}</td>
                                <td className="p-2 border">{user.email}</td>
                                <td className="p-2 border font-semibold text-gray-700">{user.rol}</td>
                                <td className="p-2 border">
                                    <select
                                        value={user.rol}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        disabled={user._id === currentUser._id} // ❌ No permitir editarse a sí mismo
                                        className="p-1 border rounded bg-white shadow-sm"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="soporte">Soporte</option>
                                        <option value="invitado">Invitado</option>
                                    </select>
                                    {user._id === currentUser._id && (
                                        <span className="text-xs text-gray-500 ml-2">(tú)</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssignRoles;