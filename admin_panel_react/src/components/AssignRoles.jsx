// src/components/AssignRoles.jsx
import { useEffect, useState } from "react";
import axiosClient from "@/services/axiosClient"; // ✅ Cambio aquí

const rolesDisponibles = ["admin", "soporte", "usuario"];

function AssignRoles() {
    const [users, setUsers] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axiosClient.get("/admin/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Error al obtener usuarios", err);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            setCargando(true);
            setMensaje("");

            const user = users.find((u) => u.id === userId);
            await axiosClient.put(`/admin/users/${userId}`, {
                email: user.email,
                nombre: user.nombre,
                rol: newRole,
            });

            setMensaje("✅ Rol actualizado correctamente");
            await fetchUsers();
        } catch (err) {
            console.error("Error actualizando rol", err);
            setMensaje("❌ Error al actualizar rol");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">🧑‍💼 Asignar Roles</h2>

            {mensaje && <p className="mb-2 text-sm text-blue-600">{mensaje}</p>}

            <table className="w-full table-auto border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Nombre</th>
                        <th className="p-2 text-left">Correo</th>
                        <th className="p-2 text-left">Rol</th>
                        <th className="p-2">Cambiar Rol</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-t">
                            <td className="p-2">{user.nombre}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2 capitalize">{user.rol}</td>
                            <td className="p-2">
                                <select
                                    value={user.rol}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    disabled={cargando}
                                    className="border p-1 rounded"
                                >
                                    {rolesDisponibles.map((rol) => (
                                        <option key={rol} value={rol}>
                                            {rol}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AssignRoles;
