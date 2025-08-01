import { Button } from "@/components/ui/button";
import axiosClient from "@/services/axiosClient"; // ✅ cambio aplicado
import { toast } from "react-hot-toast";

function ExportIntentsButton() {
    const handleExport = async () => {
        try {
            const res = await axiosClient.get("/admin/intents/export", {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.download = "intents_exportados.csv"; // o .json si cambia el backend
            link.click();
            URL.revokeObjectURL(url);

            toast.success("✅ Intents exportados correctamente");
        } catch (error) {
            console.error(error);
            toast.error("❌ Error al exportar intents");
        }
    };

    return (
        <Button onClick={handleExport} variant="outline">
            📥 Exportar Intents
        </Button>
    );
}

export default ExportIntentsButton;