// ✅ src/components/ui/badge.jsx
import React from "react";
import clsx from "clsx";

function Badge({ children, variant = "default" }) {
    const base = "inline-block px-2 py-1 text-xs font-semibold rounded";
    const variants = {
        default: "bg-gray-200 text-gray-800",
        success: "bg-green-100 text-green-700",
        destructive: "bg-red-100 text-red-700",
        warning: "bg-yellow-100 text-yellow-700",
        info: "bg-blue-100 text-blue-700",
    };

    return <span className={clsx(base, variants[variant])}>{children}</span>;
}

export { Badge };
