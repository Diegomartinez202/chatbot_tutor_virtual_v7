import { useState, useMemo } from "react";
import UserRow from "@/components/UserRow";
import EditUserRow from "@/components/EditUserRow";
import { ChevronLeft, ChevronRight } from "lucide-react";

const UsersTable = ({
    users = [],
    editingUserId,
    formData,
    setFormData,
    onUpdate,
    onEdit,
    onCancel,
    onDelete,
    // ⬇️ Recibimos el componente Badge desde el padre para unificar estilo
    Badge: BadgeComponent,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const totalPages = Math.max(1, Math.ceil(users.length / usersPerPage));

    const currentUsers = useMemo(() => {
        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser - usersPerPage;
        return users.slice(indexOfFirstUser, indexOfLastUser);
    }, [users, currentPage]);

    const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    return (
        <div className="overflow-x-auto mt-6">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-left">
                    <tr className="text-gray-700">
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
                        currentUsers.map((u) =>
                            editingUserId === u._id ? (
                                <EditUserRow
                                    key={u._id}
                                    formData={formData}
                                    setFormData={setFormData}
                                    onSave={onUpdate}
                                    onCancel={onCancel}
                                />
                            ) : (
                                <UserRow
                                    key={u._id}
                                    user={u}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    renderRol={() =>
                                        BadgeComponent ? (
                                            <BadgeComponent variant={u.rol}>{u.rol}</BadgeComponent>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-800">
                                                {u.rol}
                                            </span>
                                        )
                                    }
                                />
                            )
                        )
                    )}
                </tbody>
            </table>

            {/* Paginación */}
            {users.length > usersPerPage && (
                <div className="flex justify-center mt-4 items-center gap-3">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-gray-200 rounded disabled:opacity-50 inline-flex items-center gap-1"
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                    </button>

                    <span className="px-2 py-1 text-sm">
                        Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                    </span>

                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 bg-gray-200 rounded disabled:opacity-50 inline-flex items-center gap-1"
                        aria-label="Página siguiente"
                    >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default UsersTable;