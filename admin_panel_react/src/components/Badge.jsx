import React from "react";
import { cn } from "@/lib/utils"; // si no tienes cn, reemplaza cn(a,b) por [a,b].filter(Boolean).join(" ")
import { ROLE_STYLES, STATUS_STYLES, INTENT_STYLES } from "@/lib/constants";

export default function Badge({
    type = "neutral",      // "role" | "status" | "intent" | "neutral"
    value = "",
    variant,               // legacy: si te llega, se asume type="role" y value=variant
    className = "",
    children,
    size = "sm",           // "xs" | "sm" | "md"
}) {
    // Compatibilidad hacia atrás
    if (variant && !value) {
        value = variant;
        if (type === "neutral") type = "role";
    }

    const maps = {
        role: ROLE_STYLES,
        status: STATUS_STYLES,
        intent: INTENT_STYLES,
        neutral: {},
    };

    const sizing = {
        xs: "px-1.5 py-0.5 text-[10px]",
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
    };

    const style =
        (maps[type] && maps[type][String(value).toLowerCase()]) ||
        "bg-gray-100 text-gray-800";

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full font-medium",
                sizing[size] || sizing.sm,
                style,
                className
            )}
            title={typeof value === "string" ? value : undefined}
        >
            {children ?? value ?? ""}
        </span>
    );
}