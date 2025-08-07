import React, { useState } from "react";
import { useAdminActions } from "@/services/useAdminActions";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { BrainCog, Upload, RefreshCw, Download } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import FiltrosFecha from "./FiltrosFecha"; // ✅ Nuevo componente

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

    // 📅 Estados para fechas dinámicas
    const [desde, setDesde] = useState("2025-07-01");
    const [hasta, setHasta] = useState("2025-08-31");

    return (
        <>
            {/* 📅 Filtro de Fechas */}
            <FiltrosFecha
                desde={desde}
                hasta={hasta}
                setDesde={setDesde}
                setHasta={setHasta}
            />

            <div className="flex flex-wrap gap-4">
                <Tooltip.Provider>
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
                            <Tooltip.Content className="tooltip" side="top">
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
                            <Tooltip.Content className="tooltip" side="top">
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
                            <Tooltip.Content className="tooltip" side="top">
                                Reiniciar servidor de backend
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    {/* 📤 Exportar CSV */}
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <Button
                                onClick={() => exportMutation.mutate({ desde, hasta })}
                                disabled={exportMutation.isLoading}
                                className="flex items-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                {exportMutation.isLoading ? "Exportando..." : "Exportar CSV"}
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content className="tooltip" side="top">
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