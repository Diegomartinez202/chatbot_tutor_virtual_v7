import { Edit, Trash2 } from "lucide-react";
import TooltipWrapper from "./TooltipWrapper";

const UserRow = ({ user, onEdit, onDelete }) => {
    return (
        <tr>
            <td className="p-2 border">{user.nombre}</td>
            <td className="p-2 border">{user.email}</td>
            <td className="p-2 border capitalize">{user.rol}</td>
            <td className="p-2 border">
                <div className="flex space-x-2">
                    <TooltipWrapper label="Editar usuario">
                        <button
                            onClick={() => onEdit(user)}
                            className="p-1 rounded hover:bg-blue-100"
                        >
                            <Edit className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                        </button>
                    </TooltipWrapper>

                    <TooltipWrapper label="Eliminar usuario">
                        <button
                            onClick={() => onDelete(user._id)}
                            className="p-1 rounded hover:bg-red-100"
                        >
                            <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800" />
                        </button>
                    </TooltipWrapper>
                </div>
            </td>
        </tr>
    );
};

export default UserRow;