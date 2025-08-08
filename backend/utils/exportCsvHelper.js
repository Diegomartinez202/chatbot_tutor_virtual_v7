// src/utils/exportCsvHelper.js

export function exportToCSV(data, filename = "exportacion.csv") {
    if (!Array.isArray(data) || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h]).join(",")).join("\n");
    const csvContent = [headers.join(","), rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
}