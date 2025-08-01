import React from "react";
import BotonesAdmin from "@/components/BotonesAdmin";
// Importar tabla o formulario de intents si tienes

function IntentsPage() {
    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold mb-4">🧠 Gestión de Intents</h1>
            <BotonesAdmin />
            {/* Aquí va tu tabla o editor de intents */}
        </div>
    );
}
function IntentsPage() {
    const { user } = useAuth(); // ⬅️ Dentro del componente

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">🧠 Intents</h1>

            {(user?.rol === "admin" || user?.rol === "soporte") ? (
                <>
                    {/* ⬅️ Aquí va tu formulario de carga de intents */}
                    <IntentsForm />
                </>
            ) : (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md mb-4">
                    🔒 No tienes permisos para cargar o editar intents.
                </div>
            )}

            <IntentsTable />
        </div>
    );
}
export default IntentsPage;