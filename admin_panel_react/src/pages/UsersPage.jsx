import { useEffect, useState } from "react";
import { fetchUsers, deleteUser, updateUser } from "../services/api";
import apiClient from "../services/axiosClient";
import AssignRoles from "./AssignRoles";
import UserModal from "../components/UserModal";
import EditUserModal from "../components/EditUserModal";

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    const loadUsers = async () => {
        const { data } = await fetchUsers();
        setUsers(data);
    };

    const handleDelete = async (userId) => {
        if (window.confirm("¿Eliminar este usuario?")) {
            await deleteUser(userId);
            loadUsers();
        }
    };

    const handleCreateUser = async (userData) => {
        try {
            await apiClient.post("/admin/create-user", userData);
            loadUsers();
        } catch (error) {
            alert("❌ Error al crear usuario: " + (error.response?.data?.detail || error.message));
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">👥 Gestión de Usuarios</h1>
            <UserModal onSubmit={handleCreateUser} />

            {/* ✅ Formulario de edición con modal */}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onUpdate={async (id, data) => {
                        await updateUser(id, data);
                        setEditingUser(null);
                        loadUsers();
                    }}
                    onClose={() => setEditingUser(null)}
                />
            )}

            {/* ✅ Tabla de usuarios */}
            <table className="w-full border text-sm mt-6">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="border px-2 py-1">Nombre</th>
                        <th className="border px-2 py-1">Email</th>
                        <th className="border px-2 py-1">Rol</th>
                        <th className="border px-2 py-1">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u._id}>
                            <td className="border px-2 py-1">{u.nombre || "-"}</td>
                            <td className="border px-2 py-1">{u.email}</td>
                            <td className="border px-2 py-1">{u.rol}</td>
                            <td className="border px-2 py-1">
                                <button
                                    onClick={() => setEditingUser(u)}
                                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(u._id)}
                                    className="bg-red-600 text-white px-2 py-1 rounded"
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ✅ Cambiar roles de forma masiva */}
            <div className="mt-12">
                <AssignRoles />
            </div>
        </div>
    );
};

export default UsersPage;