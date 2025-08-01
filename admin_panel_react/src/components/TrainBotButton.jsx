import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trainBot } from "@/services/api"; // ✅ corregido
import { toast } from "react-hot-toast";

function TrainBotButton() {
    const [loading, setLoading] = useState(false);

    const handleTrain = async () => {
        setLoading(true);
        try {
            const res = await trainBot();
            if (res?.success === false) {
                toast.error(res?.error || "❌ Error al reentrenar el bot");
            } else {
                toast.success(res?.message || "✅ Bot reentrenado correctamente");
            }
        } catch (err) {
            toast.error(err?.response?.data?.detail || "❌ Error al reentrenar el bot");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleTrain} disabled={loading} variant="default">
            {loading ? "Entrenando..." : "⚙️ Reentrenar Bot"}
        </Button>
    );
}

export default TrainBotButton;