const EditUserRow = ({ formData, setFormData, onSave, onCancel }) => {
    return (
        <tr>
            <td className="p-2 border">
                <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="p-1 border rounded w-full"
                />
            </td>
            <td className="p-2 border">
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="p-1 border rounded w-full"
                />
            </td>
            <td className="p-2 border">
                <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    className="p-1 border rounded w-full"
                >
                    <option value="admin">Admin</option>
                    <option value="soporte">Soporte</option>
                    <option value="usuario">Usuario</option>
                </select>
            </td>
            <td className="p-2 border">
                <button
                    onClick={onSave}
                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                >
                    Guardar
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-400 text-white px-2 py-1 rounded"
                >
                    Cancelar
                </button>
            </td>
        </tr>
    );
};

export default EditUserRow;

