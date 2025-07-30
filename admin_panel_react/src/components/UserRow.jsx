const UserRow = ({ user, onEdit, onDelete }) => {
    return (
        <tr>
            <td className="p-2 border">{user.nombre}</td>
            <td className="p-2 border">{user.email}</td>
            <td className="p-2 border capitalize">{user.rol}</td>
            <td className="p-2 border">
                <button
                    onClick={() => onEdit(user)}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                    Editar
                </button>
                <button
                    onClick={() => onDelete(user.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                >
                    Eliminar
                </button>
            </td>
        </tr>
    );
};

export default UserRow;

