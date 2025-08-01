// src/pages/UsersPage.jsx
import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "@/services/api"; // ✅ alias
import Header from "@/components/Header";                                       // ✅ alias
import UsersTable from "@/components/UsersTable";                               // ✅ alias
import ExportUsersButton from "@/components/ExportUsersButton";                 // ✅ alias
import AssignRoles from "@/components/AssignRoles";                             // ✅ alias
import { toast } from "react-hot-toast";

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [formData, setFormData] = useState({ nombre: "", email: "", rol: "usuario" });
    const [newUser, setNewUser] = useState({ nombre: "", email: "", rol: "usuario", password: "" });

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            toast.error("Error al cargar usuarios");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setEditingUserId(user._id);
        setFormData({ nombre: user.nombre, email: user.email, rol: user.rol });
    };

    const handleCancel = () => {
        setEditingUserId(null);
        setFormData({ nombre: "", email: "", rol: "usuario" });
    };

    const handleUpdate = async () => {
        try {
            await updateUser(editingUserId, formData);
            toast.success("Usuario actualizado");
            handleCancel();
            fetchUsers();
        } catch (err) {
            toast.error("Error al actualizar usuario");
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
        try {
            await deleteUser(userId);
            toast.success("Usuario eliminado");
            fetchUsers();
        } catch (err) {
            toast.error("Error al eliminar usuario");
        }
    };

    const handleCreate = async () => {
        if (!newUser.email || !newUser.password) {
            toast.error("Email y contraseña son obligatorios");
            return;
        }
        try {
            await createUser(newUser);
            toast.success("Usuario creado");
            setNewUser({ nombre: "", email: "", rol: "usuario", password: "" });
            fetchUsers();
        } catch (err) {
            toast.error("Error al crear usuario");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <Header title="👥 Gestión de Usuarios" />

            {/* Crear nuevo usuario */}
            <div className="mb-6 p-4 border rounded bg-green-100">
                <h3 className="font-semibold mb-2">➕ Crear Nuevo Usuario</h3>
                <input className="border px-2 py-1 mr-2" placeholder="Nombre" value={newUser.nombre}
                    onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })} />
                <input className="border px-2 py-1 mr-2" placeholder="Email" value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                <input className="border px-2 py-1 mr-2" placeholder="Contraseña" type="password"
                    value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                <select className="border px-2 py-1 mr-2" value={newUser.rol}
                    onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}>
                    <option value="admin">Admin</option>
                    <option value="soporte">Soporte</option>
                    <option value="usuario">Usuario</option>
                </select>
                <button onClick={handleCreate} className="bg-green-600 text-white px-3 py-1 rounded">Crear</button>
            </div>

            <ExportUsersButton users={users} />

            <UsersTable
                users={users}
                editingUserId={editingUserId}
                formData={formData}
                setFormData={setFormData}
                onEdit={handleEdit}
                onCancel={handleCancel}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />

            <div className="mt-10">
                <AssignRoles />
            </div>
        </div>
    );
};

export default UsersPage;