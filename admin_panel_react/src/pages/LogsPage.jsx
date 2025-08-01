import React from "react";
import { useAuth } from "@/context/AuthContext";
import LogsTable from "@/components/LogsTable"; // Asegúrate de que este archivo exista

function LogsPage() {
    const { user } = useAuth();

    // 🔒 Restringir acceso solo a admin y soporte
    if (user?.rol !== "admin" && user?.rol !== "soporte") {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">📄 Logs</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
                    🔒 Acceso denegado. Esta sección es solo para personal autorizado.
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold mb-4">📄 Logs del Chatbot</h1>
            <LogsTable />
        </div>
    );
}

export default LogsPage;