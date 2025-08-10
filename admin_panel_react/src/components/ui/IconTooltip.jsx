// src/components/ui/IconTooltip.jsx
import * as Tooltip from "@radix-ui/react-tooltip";

export function TooltipProvider({ children }) {
    return (
        <Tooltip.Provider delayDuration={200} skipDelayDuration={150}>
            {children}
        </Tooltip.Provider>
    );
}

// Wrapper reutilizable (no obliga a usar Provider local)
export default function IconTooltip({
    label,
    side = "top",
    align = "center",
    sideOffset = 6,
    children,
}) {
    return (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content
                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                    className="rounded-md bg-black/90 text-white text-xs px-2 py-1 shadow z-50"
                >
                    {label}
                    <Tooltip.Arrow className="fill-black/90" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
}