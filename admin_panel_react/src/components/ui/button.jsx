// src/components/ui/button.jsx
import React from "react";
import clsx from "classnames";

export function Button({
    as: Comp = "button",
    children,
    className,
    variant = "primary",
    disabled,
    ...rest
}) {
    const base =
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition";
    const variants = {
        primary:
            "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed",
        secondary:
            "bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400",
        destructive:
            "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed",
        ghost: "bg-transparent hover:bg-gray-100",
    };
    return (
        <Comp
            className={clsx(base, variants[variant] || variants.primary, className)}
            disabled={disabled}
            {...rest}
        >
            {children}
        </Comp>
    );
}

export default Button;