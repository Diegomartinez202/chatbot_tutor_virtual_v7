// src/components/BackButton.jsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import IconTooltip from "@/components/ui/IconTooltip";
import { ArrowLeft } from "lucide-react";

const BackButton = ({
    to = "/",
    label = "Volver",
    className = "",
    icon: Icon = ArrowLeft,
    tooltip,
}) => {
    const navigate = useNavigate();

    return (
        <IconTooltip label={tooltip || label} side="top">
            <Button
                type="button"
                variant="outline"
                onClick={() => navigate(to)}
                className={className + " inline-flex items-center gap-2"}
                aria-label={label}
            >
                <Icon className="w-4 h-4" />
                {label}
            </Button>
        </IconTooltip>
    );
};

export default BackButton;