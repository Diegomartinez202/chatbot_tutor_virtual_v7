import { useState, useEffect } from "react";

const EditUserModal = ({ user, onUpdate, onClose }) => {
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        rol: "usuario",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || "",
                email: user.email || "",
                rol: user.rol || "usuario",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(user._id, formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-red-500 text-lg font-bold"
                >
                    ✖
                </button>
                <h2 className="text-xl font-bold mb-4">✏️ Editar Usuario</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        className="border px-2 py-1 mb-2 w-full"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Nombre"
                    />
                    <input
                        className="border px-2 py-1 mb-2 w-full"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                    />
                    <select
                        className="border px-2 py-1 mb-4 w-full"
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                    >
                        <option value="admin">Admin</option>
                        <option value="soporte">Soporte</option>
                        <option value="usuario">Usuario</option>
                    </select>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-3 py-1 rounded w-full"
                    >
                        Guardar cambios
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;