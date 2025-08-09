import { Edit, Trash2 } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

const UserRow = ({ user, onEdit, onDelete, renderRol }) => {
    return (
        <tr>
            <td className="p-2 border">{user.nombre}</td>
            <td className="p-2 border">{user.email}</td>

            {/* ✅ Badge visual para el rol si se pasa como prop */}
            <td className="p-2 border capitalize">
                {renderRol ? renderRol() : user.rol}
            </td>

            <td className="p-2 border">
                <div className="flex space-x-2">
                    <Tooltip.Provider>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <button
                                    onClick={() => onEdit(user)}
                                    className="p-1 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    aria-label="Editar usuario"
                                >
                                    <Edit className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content
                                    className="rounded-md bg-black text-white px-2 py-1 text-xs"
                                    side="top"
                                >
                                    Editar usuario
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    </Tooltip.Provider>

                    <Tooltip.Provider>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <button
                                    onClick={() => onDelete(user._id)}
                                    className="p-1 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                                    aria-label="Eliminar usuario"
                                >
                                    <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800" />
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content
                                    className="rounded-md bg-black text-white px-2 py-1 text-xs"
                                    side="top"
                                >
                                    Eliminar usuario
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                </div>
            </td>
        </tr>
    );
};

export default UserRow;