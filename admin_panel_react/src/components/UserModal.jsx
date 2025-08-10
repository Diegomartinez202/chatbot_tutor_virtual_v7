// src/components/UserModal.jsx
import { useState, useCallback, useEffect } from "react";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import IconTooltip from "@/components/ui/IconTooltip";
import UserForm from "./UserForm";

const UserModal = ({ onSubmit }) => {
    const [open, setOpen] = useState(false);

    const handleSubmit = (data) => {
        onSubmit?.(data);
        setOpen(false);
    };

    const onClose = () => setOpen(false);

    const onBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const onEsc = useCallback(
        (e) => {
            if (e.key === "Escape") onClose();
        },
        []
    );

    useEffect(() => {
        if (!open) return;
        document.addEventListener("keydown", onEsc);
        return () => document.removeEventListener("keydown", onEsc);
    }, [open, onEsc]);

    return (
        <div>
            <Button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2"
                type="button"
            >
                <UserPlus className="w-4 h-4" />
                Crear Usuario
            </Button>

            {open && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                    onMouseDown={onBackdrop}
                >
                    <div
                        className="bg-white p-6 rounded shadow-md w-full max-w-md relative"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="new-user-title"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <IconTooltip label="Cerrar" side="left">
                            <button
                                onClick={onClose}
                                className="absolute top-2 right-2 text-red-500 p-1 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                                aria-label="Cerrar modal"
                                type="button"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </IconTooltip>

                        <h2 id="new-user-title" className="text-xl font-bold mb-4">
                            Nuevo Usuario
                        </h2>

                        <UserForm onSubmit={handleSubmit} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserModal;