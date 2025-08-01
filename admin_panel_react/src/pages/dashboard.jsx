import React from "react";
import BotonesAdmin from "@/components/BotonesAdmin";

function Dashboard() {
    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
            <BotonesAdmin />
        </div>
    );
}

export default Dashboard;