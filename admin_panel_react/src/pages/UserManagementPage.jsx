// src/pages/UserManagementPage.jsx
import { useEffect, useState } from "react";
import { getUsers, updateUser, deleteUser, exportUsersCSV } from "@/services/api";
import UsersTable from "@/components/UsersTable";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Search, FileDown, Loader2, Users, Lock } from "lucide-react";
import Badge from "@/components/Badge";
import IconTooltip from "@/components/ui/IconTooltip"; // ✅ tooltips reutilizables

const UserManagementPage = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [formData, setFormData] = useState({ nombre: "", email: "", rol: "usuario" });
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRol, setFilterRol] = useState("");
    const [loading, setLoading] = useState(false);

    if (user?.rol !== "admin") {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" /> Gestión de Usuarios
                </h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Solo los administradores pueden acceder a esta sección.
                </div>
            </div>
        );
    }

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error("Error al obtener usuarios");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (u) => {
        setEditingUserId(u._id);
        setFormData({ nombre: u.nombre, email: u.email, rol: u.rol });
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
        if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
        try {
            await deleteUser(userId);
            toast.success("Usuario eliminado");
            fetchUsers();
        } catch (err) {
            toast.error("Error al eliminar usuario");
        }
    };

    const filteredUsers = users.filter((u) => {
        const term = (searchTerm || "").toLowerCase();
        const name = (u.nombre || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const roleMatch = filterRol === "" || u.rol === filterRol;
        return (name.includes(term) || email.includes(term)) && roleMatch;
    });

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5" /> Gestión de Usuarios
            </h1>

            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full max-w-md">{/* ← corregido w/full a w-full */}
                    <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email"
                        className="pl-10 pr-3 py-2 border w-full rounded"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="border px-3 py-2 rounded"
                    value={filterRol}
                    onChange={(e) => setFilterRol(e.target.value)}
                >
                    <option value="">Todos los roles</option>
                    <option value="admin">Admin</option>
                    <option value="soporte">Soporte</option>
                    <option value="usuario">Usuario</option>
                </select>

                {/* ✅ Tooltip con wrapper reutilizable */}
                <IconTooltip label="Exporta el listado actual de usuarios a CSV" side="top">
                    <button
                        onClick={async () => {
                            try {
                                await exportUsersCSV();
                                toast.success("CSV exportado");
                            } catch (err) {
                                toast.error("Error al exportar usuarios");
                            }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2"
                        type="button"
                    >
                        <FileDown className="w-4 h-4" />
                        Exportar usuarios
                    </button>
                </IconTooltip>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                    Cargando usuarios...
                </div>
            ) : (
                <UsersTable
                    users={filteredUsers}
                    editingUserId={editingUserId}
                    formData={formData}
                    setFormData={setFormData}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    Badge={Badge}
                />
            )}
        </div>
    );
};

export default UserManagementPage;