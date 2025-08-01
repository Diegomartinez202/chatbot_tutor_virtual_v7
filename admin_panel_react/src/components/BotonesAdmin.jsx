import React from "react";
import { useAdminActions } from "@/services/useAdminActions";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

function BotonesAdmin() {
    const { trainMutation, uploadMutation } = useAdminActions();
    const { user } = useAuth();

    // Validar rol permitido
    const allowed = user?.rol === "admin"; // o usar: ["admin", "soporte"].includes(user?.rol)

    if (!allowed) return null;

    return (
        <div className="space-x-4">
            <Button onClick={() =>
                trainMutation.mutate(null, {
                    onSuccess: () => toast.success("✅ Bot entrenado correctamente"),
                    onError: () => toast.error("❌ Error al entrenar el bot"),
                })
            } disabled={trainMutation.isLoading}>
                {trainMutation.isLoading ? "Entrenando..." : "🤖 Entrenar Bot"}
            </Button>

            <Button onClick={() =>
                uploadMutation.mutate(null, {
                    onSuccess: () => toast.success("✅ Intents subidos correctamente"),
                    onError: () => toast.error("❌ Error al subir intents"),
                })
            } disabled={uploadMutation.isLoading}>
                {uploadMutation.isLoading ? "Subiendo..." : "⬆️ Subir Intents"}
            </Button>
        </div>
    );
}

export default BotonesAdmin;