// src/components/Badge.jsx
import React from "react";
import IconTooltip from "@/components/ui/IconTooltip";
import {
    ROLE_STYLES,
    STATUS_STYLES,
    INTENT_STYLES,
} from "@/lib/constants";

// Fallback si no tienes util cn()
const cn = (...args) => args.filter(Boolean).join(" ");

export default function Badge({
    type = "neutral",         // "role" | "status" | "intent" | "neutral"
    value = "",
    variant,                  // compat: si llega, se asume type="role" y value=variant
    className = "",
    children,
    size = "sm",              // "xs" | "sm" | "md"
    tooltip,                  // si viene, se usa IconTooltip
    leadingIcon: LeadingIcon, // opcional: componente de ícono (lucide)
    trailingIcon: TrailingIcon, // opcional
    "aria-label": ariaLabel,
}) {
    // Compat hacia atrás
    if (variant && !value) {
        value = variant;
        if (type === "neutral") type = "role";
    }

    const maps = {
        role: ROLE_STYLES || {},
        status: STATUS_STYLES || {},
        intent: INTENT_STYLES || {},
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

    const content = (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full font-medium",
                sizing[size] || sizing.sm,
                style,
                className
            )}
            title={!tooltip && typeof value === "string" ? value : undefined}
            aria-label={ariaLabel || (typeof value === "string" ? value : undefined)}
        >
            {LeadingIcon ? <LeadingIcon className="w-3.5 h-3.5" /> : null}
            {children ?? value ?? ""}
            {TrailingIcon ? <TrailingIcon className="w-3.5 h-3.5" /> : null}
        </span>
    );

    // Si hay tooltip, envolvemos; si no, devolvemos directo (con title fallback arriba)
    return tooltip ? (
        <IconTooltip label={tooltip} side="top">
            {content}
        </IconTooltip>
    ) : (
        content
    );
}