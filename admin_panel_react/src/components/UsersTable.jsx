import { useState } from "react";
import UserRow from "@/components/UserRow";
import EditUserRow from "@/components/EditUserRow";
import Badge from "@/components/ui/Badge"; // ✅ Integración del Badge

const UsersTable = ({
    users,
    editingUserId,
    formData,
    setFormData,
    onUpdate,
    onEdit,
    onCancel,
    onDelete,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);

    const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    return (
        <div className="overflow-x-auto mt-6">
            <table className="w-full text-sm border">
                <thead className="bg-gray-100 text-left">
                    <tr>
                        <th className="p-2 border">Nombre</th>
                        <th className="p-2 border">Email</th>
                        <th className="p-2 border">Rol</th>
                        <th className="p-2 border">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center p-4 text-gray-500">
                                No hay usuarios coincidentes.
                            </td>
                        </tr>
                    ) : (
                        currentUsers.map((user) =>
                            editingUserId === user._id ? (
                                <EditUserRow
                                    key={user._id}
                                    formData={formData}
                                    setFormData={setFormData}
                                    onSave={onUpdate}
                                    onCancel={onCancel}
                                />
                            ) : (
                                <UserRow
                                    key={user._id}
                                    user={user}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    renderRol={() => (
                                        <Badge variant={user.rol}>{user.rol}</Badge>
                                    )}
                                />
                            )
                        )
                    )}
                </tbody>
            </table>

            {/* Paginación */}
            {users.length > usersPerPage && (
                <div className="flex justify-center mt-4 space-x-4">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        ← Anterior
                    </button>
                    <span className="px-2 py-1">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Siguiente →
                    </button>
                </div>
            )}
        </div>
    );
};

export default UsersTable;