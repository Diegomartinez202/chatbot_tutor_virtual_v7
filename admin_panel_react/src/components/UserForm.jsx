import { useState } from "react";

const UserForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        password: "",
        rol: "usuario",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            alert("Email y contraseña son obligatorios");
            return;
        }

        onSubmit(formData);
        setFormData({ nombre: "", email: "", password: "", rol: "usuario" });
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-green-100">
            <h3 className="font-semibold mb-2">➕ Crear Nuevo Usuario</h3>
            <input
                className="border px-2 py-1 mr-2"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                required
            />
            <input
                className="border px-2 py-1 mr-2"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                type="email"
                required
            />
            <input
                className="border px-2 py-1 mr-2"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña"
                type="password"
                required
            />
            <select
                className="border px-2 py-1 mr-2"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
            >
                <option value="admin">Admin</option>
                <option value="soporte">Soporte</option>
                <option value="usuario">Usuario</option>
            </select>
            <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
                Crear
            </button>
        </form>
    );
};

export default UserForm;