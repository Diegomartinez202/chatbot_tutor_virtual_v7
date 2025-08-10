// src/components/BotonesAdmin.jsx
import React, { useState } from "react";
import { useAdminActions } from "@/services/useAdminActions";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { BrainCog, Upload, RefreshCw, Download, CheckCircle, XCircle } from "lucide-react";
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
            onSuccess: () =>
                toast.success("Bot entrenado correctamente", {
                    icon: <CheckCircle className="w-4 h-4" />,
                }),
            onError: () =>
                toast.error("Error al entrenar el bot", {
                    icon: <XCircle className="w-4 h-4" />,
                }),
        });

    const handleUpload = () =>
        uploadMutation.mutate(null, {
            onSuccess: () =>
                toast.success("Intents subidos correctamente", {
                    icon: <CheckCircle className="w-4 h-4" />,
                }),
            onError: () =>
                toast.error("Error al subir intents", {
                    icon: <XCircle className="w-4 h-4" />,
                }),
        });

    const handleRestart = () =>
        restartMutation.mutate(null, {
            onSuccess: () =>
                toast.success("Servidor reiniciado", {
                    icon: <RefreshCw className="w-4 h-4" />,
                }),
            onError: () =>
                toast.error("Error al reiniciar servidor", {
                    icon: <XCircle className="w-4 h-4" />,
                }),
        });

    const handleExport = () =>
        exportMutation.mutate(
            { desde, hasta },
            {
                onSuccess: () =>
                    toast.success("Export en curso/descargado", {
                        icon: <Download className="w-4 h-4" />,
                    }),
                onError: () =>
                    toast.error("Error al exportar CSV", {
                        icon: <XCircle className="w-4 h-4" />,
                    }),
            }
        );

    return (
        <>
            <FiltrosFecha desde={desde} hasta={hasta} setDesde={setDesde} setHasta={setHasta} />

            <div className="flex flex-wrap gap-4">
                {/* ✅ Mantengo Provider/Root/Trigger/Portal, añado delays + Arrow para consistencia */}
                <Tooltip.Provider delayDuration={200} skipDelayDuration={150}>
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
                            <Tooltip.Content
                                className="rounded-md bg-black/90 text-white px-2 py-1 text-xs shadow"
                                side="top"
                                sideOffset={6}
                            >
                                Reentrenar modelo con nuevos intents
                                <Tooltip.Arrow className="fill-black/90" />
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
                            <Tooltip.Content
                                className="rounded-md bg-black/90 text-white px-2 py-1 text-xs shadow"
                                side="top"
                                sideOffset={6}
                            >
                                Cargar intents desde archivo o panel
                                <Tooltip.Arrow className="fill-black/90" />
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
                            <Tooltip.Content
                                className="rounded-md bg-black/90 text-white px-2 py-1 text-xs shadow"
                                side="top"
                                sideOffset={6}
                            >
                                Reiniciar servidor de backend
                                <Tooltip.Arrow className="fill-black/90" />
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
                            <Tooltip.Content
                                className="rounded-md bg-black/90 text-white px-2 py-1 text-xs shadow"
                                side="top"
                                sideOffset={6}
                            >
                                Exportar logs del chatbot por rango de fechas
                                <Tooltip.Arrow className="fill-black/90" />
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </Tooltip.Provider>
            </div>
        </>
    );
}

export default BotonesAdmin;