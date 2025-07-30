import { useNavigate } from "react-router-dom";
import ExportIntentsButton from "./ExportIntentsButton";
import { Button } from "@/components/ui/button";

function IntentNavBar() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-wrap gap-3 mb-4">
            <Button variant="outline" onClick={() => navigate("/intents")}>
                📥 Crear Intent
            </Button>
            <Button variant="outline" onClick={() => navigate("/intents/buscar")}>
                🔍 Buscar Intents
            </Button>
            <ExportIntentsButton />
        </div>
    );
}

export default IntentNavBar;