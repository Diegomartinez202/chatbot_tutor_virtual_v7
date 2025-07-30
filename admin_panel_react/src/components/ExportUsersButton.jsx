import { saveAs } from "file-saver";
import axiosClient from "../services/axiosClient";

const ExportUsersButton = () => {
    const exportarUsuarios = async () => {
        try {
            const res = await axiosClient.get("/admin/users/export", {
                responseType: "blob",
            });

            const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, "usuarios_exportados.csv");
        } catch (error) {
            alert("❌ Error al exportar usuarios");
            console.error("Error exportando usuarios:", error);
        }
    };

    return (
        <button
            onClick={exportarUsuarios}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
            📤 Exportar Usuarios (CSV)
        </button>
    );
};

export default ExportUsersButton;