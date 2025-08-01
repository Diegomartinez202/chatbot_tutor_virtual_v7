import { useState } from "react";
import { uploadIntentJSON } from "@/services/api"; // ✅ Alias correcto
import { toast } from "react-hot-toast";

function UploadIntentsCSV() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === "application/json") {
            setFile(selected);
        } else {
            toast.error("❌ El archivo debe ser .json");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("❌ Selecciona un archivo .json válido");
            return;
        }

        try {
            setLoading(true);
            const text = await file.text();
            const jsonData = JSON.parse(text);
            await uploadIntentJSON(jsonData);
            toast.success("✅ Intent JSON subido y bot reentrenado");
        } catch (err) {
            console.error(err);
            toast.error("❌ Error al subir el archivo JSON");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border p-4 rounded bg-white shadow my-6">
            <h3 className="font-semibold mb-2">📤 Subir intent desde archivo JSON</h3>
            <input type="file" accept=".json" onChange={handleFileChange} />
            <button
                onClick={handleUpload}
                className="mt-2 bg-green-600 text-white px-4 py-1 rounded"
                disabled={loading}
            >
                {loading ? "Cargando..." : "Subir y entrenar"}
            </button>
        </div>
    );
}

export default UploadIntentsCSV;