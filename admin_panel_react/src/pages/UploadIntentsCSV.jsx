import { useState } from "react";
import axiosClient from "../services/axiosClient";

const UploadIntentsCSV = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const response = await axiosClient.post("/admin/intents/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.detail || "Error al subir el archivo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">📤 Cargar Intents desde CSV</h2>

            <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-4"
            />
            <br />
            <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {loading ? "Cargando..." : "Subir CSV"}
            </button>

            {message && (
                <div className="mt-4 text-green-700 bg-green-100 p-2 rounded border">
                    {message}
                </div>
            )}
        </div>
    );
};

export default UploadIntentsCSV;