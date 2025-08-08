// src/components/ui/Badge.jsx
import React from "react";
import clsx from "clsx";

// 🎨 Paleta de colores centralizada
const colorMap = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
};

// 🧠 Lógicas de colores por tipo
const statusColors = {
    200: "green",
    201: "green",
    400: "yellow",
    401: "orange",
    403: "orange",
    404: "gray",
    500: "red",
};

const roleColors = {
    admin: "green",
    soporte: "purple",
    usuario: "gray",
};

const intentColors = {
    info: "blue",
    warning: "yellow",
    error: "red",
    soporte: "purple",
    soporte_intent: "purple",
    default: "gray",
};

function Badge({ children, variant = "default", status }) {
    const baseColor =
        (status && statusColors[status]) ||
        roleColors[variant] ||
        intentColors[variant] ||
        intentColors.default;

    const finalClass = colorMap[baseColor] || colorMap.gray;

    return (
        <span
            className={clsx(
                "inline-block px-2 py-1 rounded text-xs font-semibold whitespace-nowrap",
                finalClass
            )}
        >
            {children || variant}
        </span>
    );
}

export default Badge;