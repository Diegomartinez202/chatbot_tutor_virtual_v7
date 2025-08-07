import * as Tooltip from "@radix-ui/react-tooltip";

const TooltipWrapper = ({ children, label }) => (
    <Tooltip.Provider>
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                {children}
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content
                    className="bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-50"
                    sideOffset={5}
                >
                    {label}
                    <Tooltip.Arrow className="fill-black" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    </Tooltip.Provider>
);

export default TooltipWrapper;