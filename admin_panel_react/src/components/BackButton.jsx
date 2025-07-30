import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BackButton = ({ to = "/", label = "Volver", className = "" }) => {
    const navigate = useNavigate();
    return (
        <Button
            variant="outline"
            onClick={() => navigate(to)}
            className={className}
        >
            ⬅️ {label}
        </Button>
    );
};

export default BackButton;