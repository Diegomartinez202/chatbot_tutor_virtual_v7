import React from "react";
import { useAuth } from "@/context/AuthContext";
import BotonesAdmin from "@/components/BotonesAdmin";
import IntentsForm from "@/components/IntentsForm";
import IntentsTable from "@/components/IntentsTable";
import { Brain } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

function IntentsPage() {
    const { user } = useAuth(); // ✅ Autenticación

    return (
        <div className="p-6 space-y-4">
            {/* 🧠 Título con ícono y tooltip */}
            <div className="flex items-center gap-2">
                <Tooltip.Provider>
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <Brain className="w-6 h-6 text-gray-700" />
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content className="tooltip" side="top">
                                Gestión de intents del chatbot
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </Tooltip.Provider>
                <h1 className="text-2xl font-bold">Gestión de Intents</h1>
            </div>

            {/* 🔘 Botones de administración */}
            {(user?.rol === "admin" || user?.rol === "soporte") && (
                <BotonesAdmin />
            )}

            {/* 🎯 Control de permisos para cargar intents */}
            {(user?.rol === "admin" || user?.rol === "soporte") ? (
                <IntentsForm />
            ) : (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md">
                    🔒 No tienes permisos para cargar o editar intents.
                </div>
            )}

            {/* 📋 Tabla de intents siempre visible */}
            <IntentsTable />
        </div>
    );
}

export default IntentsPage;