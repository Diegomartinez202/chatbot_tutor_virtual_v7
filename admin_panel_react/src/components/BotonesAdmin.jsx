// src/components/BotonesAdmin.jsx
import React, { useState } from "react";
import { useAdminActions } from "@/services/useAdminActions";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { BrainCog, Upload, RefreshCw, Download } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import FiltrosFecha from "./FiltrosFecha";

function BotonesAdmin() {
    const { trainMutation, uploadMutation, restartMutation, exportMutation } = useAdminActions();
    const { user } = useAuth();

    const allowed = user?.rol === "admin" || user?.rol === "soporte";
    if (!allowed) return null;

    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");

    const handleTrain = () =>
        trainMutation.mutate(null, {
            onSuccess: () => toast.success("✅ Bot entrenado correctamente"),
            onError: () => toast.error("❌ Error al entrenar el bot"),
        });

    const handleUpload = () =>
        uploadMutation.mutate(null, {
            onSuccess: () => toast.success("✅ Intents subidos correctamente"),
            onError: () => toast.error("❌ Error al subir intents"),
        });

    const handleRestart = () =>
        restartMutation.mutate(null, {
            onSuccess: () => toast.success("🔁 Servidor reiniciado"),
            onError: () => toast.error("❌ Error al reiniciar servidor"),
        });

    const handleExport = () =>
        exportMutation.mutate(
            { desde, hasta },
            {
                onSuccess: () => toast.success("📤 Export en curso/descargado"),
                onError: () => toast.error("❌ Error al exportar CSV"),
            }
        );

    return (
        <>
            <FiltrosFecha desde={desde} hasta={hasta} setDesde={setDesde} setHasta={setHasta} />

            <div className="flex flex-wrap gap-4">
                <Tooltip.Provider>
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <Button
                                onClick={handleTrain}
                                disabled={trainMutation.isLoading}
                                className="flex items-center gap-2"
                                aria-label="Entrenar bot"
                            >
                                <BrainCog className="w-5 h-5" />
                                {trainMutation.isLoading ? "Entrenando..." : "Entrenar Bot"}
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content className="rounded-md bg-black text-white px-2 py-1 text-xs" side="top">
                                Reentrenar modelo con nuevos intents
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <Button
                                onClick={handleUpload}
                                disabled={uploadMutation.isLoading}
                                className="flex items-center gap-2"
                                aria-label="Subir intents"
                            >
                                <Upload className="w-5 h-5" />
                                {uploadMutation.isLoading ? "Subiendo..." : "Subir Intents"}
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content className="rounded-md bg-black text-white px-2 py-1 text-xs" side="top">
                                Cargar intents desde archivo o panel
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <Button
                                onClick={handleRestart}
                                disabled={restartMutation.isLoading}
                                className="flex items-center gap-2"
                                aria-label="Reiniciar servidor"
                            >
                                <RefreshCw className="w-5 h-5" />
                                {restartMutation.isLoading ? "Reiniciando..." : "Reiniciar"}
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content className="rounded-md bg-black text-white px-2 py-1 text-xs" side="top">
                                Reiniciar servidor de backend
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <Button
                                onClick={handleExport}
                                disabled={exportMutation.isLoading}
                                className="flex items-center gap-2"
                                aria-label="Exportar CSV de logs"
                            >
                                <Download className="w-5 h-5" />
                                {exportMutation.isLoading ? "Exportando..." : "Exportar CSV"}
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content className="rounded-md bg-black text-white px-2 py-1 text-xs" side="top">
                                Exportar logs del chatbot por rango de fechas
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </Tooltip.Provider>
            </div>
        </>
    );
}

export default BotonesAdmin;