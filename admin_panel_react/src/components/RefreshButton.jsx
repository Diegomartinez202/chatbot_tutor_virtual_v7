import { Button } from "@/components/ui/button";

const RefreshButton = ({ onClick, loading = false, className = "" }) => {
    return (
        <Button
            onClick={onClick}
            disabled={loading}
            className={className}
        >
            {loading ? "Cargando..." : "🔄 Refrescar"}
        </Button>
    );
};

export default RefreshButton;