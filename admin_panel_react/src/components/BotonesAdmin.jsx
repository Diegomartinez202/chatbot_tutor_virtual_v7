// src/components/BotonesAdmin.jsx
import React from "react";
import { useAdminActions } from "@/services/useAdminActions";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { BrainCog, Upload, RefreshCw, Download } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

function BotonesAdmin() {
    const {
        trainMutation,
        uploadMutation,
        restartMutation,
        exportMutation,
    } = useAdminActions();
    const { user } = useAuth();

    const allowed = user?.rol === "admin" || user?.rol === "soporte";
    if (!allowed) return null;

    return (
        <div className="flex flex-wrap gap-4">
            {/* 🧠 Entrenar Bot */}
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <Button
                        onClick={() =>
                            trainMutation.mutate(null, {
                                onSuccess: () => toast.success("✅ Bot entrenado correctamente"),
                                onError: () => toast.error("❌ Error al entrenar el bot"),
                            })
                        }
                        disabled={trainMutation.isLoading}
                        className="flex items-center gap-2"
                    >
                        <BrainCog className="w-5 h-5" />
                        {trainMutation.isLoading ? "Entrenando..." : "Entrenar Bot"}
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content className="bg-black text-white text-xs rounded px-2 py-1" side="top">
                        Reentrenar modelo Rasa con nuevos intents
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>

            {/* ⬆️ Subir Intents */}
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <Button
                        onClick={() =>
                            uploadMutation.mutate(null, {
                                onSuccess: () => toast.success("✅ Intents subidos correctamente"),
                                onError: () => toast.error("❌ Error al subir intents"),
                            })
                        }
                        disabled={uploadMutation.isLoading}
                        className="flex items-center gap-2"
                    >
                        <Upload className="w-5 h-5" />
                        {uploadMutation.isLoading ? "Subiendo..." : "Subir Intents"}
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content className="bg-black text-white text-xs rounded px-2 py-1" side="top">
                        Cargar intents desde archivo o panel
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>

            {/* 🔁 Reiniciar Servidor */}
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <Button
                        onClick={() =>
                            restartMutation.mutate(null, {
                                onSuccess: () => toast.success("🔁 Servidor reiniciado"),
                                onError: () => toast.error("❌ Error al reiniciar servidor"),
                            })
                        }
                        disabled={restartMutation.isLoading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        {restartMutation.isLoading ? "Reiniciando..." : "Reiniciar"}
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content className="bg-black text-white text-xs rounded px-2 py-1" side="top">
                        Reiniciar servidor de backend
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>

            {/* 📥 Exportar CSV */}
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <Button
                        onClick={() => exportMutation.mutate()}
                        disabled={exportMutation.isLoading}
                        className="flex items-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Exportar CSV
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content className="bg-black text-white text-xs rounded px-2 py-1" side="top">
                        Descargar resultados de diagnóstico
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </div>
    );
}

export default BotonesAdmin;