// src/snapshots/ChatHarness.jsx
import React from "react";
import ProviderHarness from "./ProviderHarness";

// TODO: ajusta import a tu página de chat real (si existe):
import ChatAdminPage from "@/pages/ChatPage";

export default function ChatHarness() {
    return (
        <ProviderHarness>
            <main data-testid="app-root" className="p-6">
                <ChatAdminPage />
            </main>
        </ProviderHarness>
    );
}
