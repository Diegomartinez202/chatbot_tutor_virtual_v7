import React from "react";
import BotonesAdmin from "@/components/BotonesAdmin";
import StatsChart from "@/components/StatsChart";
import React from "react";
import BotonesAdmin from "@/components/BotonesAdmin";
import StatsChart from "@/components/StatsChart";
import { useAuth } from "@/context/AuthContext"; // 🎯 Hook de autenticación

function StatsPage() {
    const { user } = useAuth(); // 🧠 Obtener usuario autenticado

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold mb-4">📊 Estadísticas del Chatbot</h1>

            {/* ✅ Mostrar botones solo si el rol es admin o soporte */}
            {(user?.rol === "admin" || user?.rol === "soporte") && (
                <BotonesAdmin />
            )}

            {/* ⚠️ Mostrar advertencia si no tiene permisos */}
            {(user?.rol !== "admin" && user?.rol !== "soporte") && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md">
                    🔒 Algunas funciones administrativas están restringidas para tu rol (<strong>{user?.rol}</strong>).
                </div>
            )}

            <StatsChart />
        </div>
    );
}

export default StatsPage;

export default StatsPage;