import { useState } from "react";
import UserForm from "./UserForm";

const UserModal = ({ onSubmit }) => {
    const [open, setOpen] = useState(false);

    const handleSubmit = (data) => {
        onSubmit(data);
        setOpen(false);
    };

    return (
        <div>
            <button
                onClick={() => setOpen(true)}
                className="bg-green-700 text-white px-4 py-2 rounded mb-4"
            >
                ➕ Crear Usuario
            </button>

            {open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-2 right-2 text-red-500 text-lg font-bold"
                        >
                            ✖
                        </button>
                        <h2 className="text-xl font-bold mb-4">Nuevo Usuario</h2>
                        <UserForm onSubmit={handleSubmit} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserModal;