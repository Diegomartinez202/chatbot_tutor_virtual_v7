// src/pages/Dashboard.jsx
import React from "react";
import BotonesAdmin from "@/components/BotonesAdmin";
import { LayoutDashboard, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import IconTooltip from "@/components/ui/IconTooltip"; // ✅ wrapper de tooltips

function Dashboard() {
    return (
        <div className="p-6 space-y-4">
            {/* Encabezado con ícono y tooltip */}
            <div className="flex items-center gap-2 mb-4">
                <IconTooltip label="Vista general del administrador" side="top">
                    <LayoutDashboard className="w-6 h-6 text-gray-700" />
                </IconTooltip>
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
            </div>

            {/* Botones principales (entrenar, exportar, etc.) */}
            <BotonesAdmin />

            {/* Botón adicional para ir a Estadísticas v2 */}
            <Link
                to="/stats-v2"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
                <BarChart size={18} /> Ver estadísticas v2
            </Link>
        </div>
    );
}

export default Dashboard;