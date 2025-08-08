// src/components/ui/Badge.jsx
import React from "react";
import clsx from "clsx";
import {
    STATUS_COLORS,
    ROLE_COLORS,
    INTENT_COLORS
} from "@/utils/constants";

// 🎨 Paleta de clases Tailwind centralizada
const colorMap = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
};

function Badge({ children, variant = "default", status }) {
    const baseColor =
        (status && STATUS_COLORS[status]) ||
        ROLE_COLORS[variant] ||
        INTENT_COLORS[variant] ||
        INTENT_COLORS.default;

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