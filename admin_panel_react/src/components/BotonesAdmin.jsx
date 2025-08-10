// src/components/BotonesAdmin.jsx
import React, { useState } from "react";
import { useAdminActions } from "@/services/useAdminActions";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { BrainCog, Upload, RefreshCw, Download, CheckCircle, XCircle } from "lucide-react";
import FiltrosFecha from "./FiltrosFecha";
import IconTooltip from "@/components/ui/IconTooltip"; // ✅ wrapper de tooltips

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
                <IconTooltip label="Reentrenar modelo con nuevos intents" side="top">
                    <Button
                        onClick={handleTrain}
                        disabled={trainMutation.isLoading}
                        className="flex items-center gap-2"
                        aria-label="Entrenar bot"
                        type="button"
                    >
                        <BrainCog className="w-5 h-5" />
                        {trainMutation.isLoading ? "Entrenando..." : "Entrenar Bot"}
                    </Button>
                </IconTooltip>

                <IconTooltip label="Cargar intents desde archivo o panel" side="top">
                    <Button
                        onClick={handleUpload}
                        disabled={uploadMutation.isLoading}
                        className="flex items-center gap-2"
                        aria-label="Subir intents"
                        type="button"
                    >
                        <Upload className="w-5 h-5" />
                        {uploadMutation.isLoading ? "Subiendo..." : "Subir Intents"}
                    </Button>
                </IconTooltip>

                <IconTooltip label="Reiniciar servidor de backend" side="top">
                    <Button
                        onClick={handleRestart}
                        disabled={restartMutation.isLoading}
                        className="flex items-center gap-2"
                        aria-label="Reiniciar servidor"
                        type="button"
                    >
                        <RefreshCw className="w-5 h-5" />
                        {restartMutation.isLoading ? "Reiniciando..." : "Reiniciar"}
                    </Button>
                </IconTooltip>

                <IconTooltip label="Exportar logs del chatbot por rango de fechas" side="top">
                    <Button
                        onClick={handleExport}
                        disabled={exportMutation.isLoading}
                        className="flex items-center gap-2"
                        aria-label="Exportar CSV de logs"
                        type="button"
                    >
                        <Download className="w-5 h-5" />
                        {exportMutation.isLoading ? "Exportando..." : "Exportar CSV"}
                    </Button>
                </IconTooltip>
            </div>
        </>
    );
}

export default BotonesAdmin;