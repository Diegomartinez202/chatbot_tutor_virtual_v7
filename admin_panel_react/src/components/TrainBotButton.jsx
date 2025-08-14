// src/components/TrainBotButton.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import IconTooltip from "@/components/ui/IconTooltip";
import { trainBot } from "@/services/api";
import { toast } from "react-hot-toast";
import { Cog, Loader2 } from "lucide-react";

function TrainBotButton({
    className = "",
    variant = "default",
    size = "default",
    tooltipLabel = "Reentrenar modelo del bot",
    onTrained, // opcional: callback tras entrenamiento exitoso
}) {
    const [loading, setLoading] = useState(false);

    const handleTrain = async () => {
        setLoading(true);
        try {
            const res = await trainBot();
            if (res?.success === false) {
                toast.error(res?.error || "Error al reentrenar el bot");
            } else {
                toast.success(res?.message || "Bot reentrenado correctamente");
                if (typeof onTrained === "function") onTrained(res);
            }
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.detail || "Error al reentrenar el bot");
        } finally {
            setLoading(false);
        }
    };

    return (
        <IconTooltip label={tooltipLabel} side="top">
            {/* Nota: envolvemos en <span> para que el tooltip funcione aunque el botón esté disabled */}
            <span>
                <Button
                    onClick={handleTrain}
                    disabled={loading}
                    variant={variant}
                    size={size}
                    className={className}
                    aria-label="Reentrenar bot"
                    aria-busy={loading ? "true" : "false"}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Cog className="w-4 h-4 mr-2" />
                    )}
                    {loading ? "Entrenando…" : "Reentrenar bot"}
                </Button>
            </span>
        </IconTooltip>
    );
}

export default TrainBotButton;