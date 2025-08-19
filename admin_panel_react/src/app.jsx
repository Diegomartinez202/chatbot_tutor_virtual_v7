// admin_panel_react/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/IconTooltip";
import { useAuth } from "@/context/AuthContext";

import ProtectedRoute from "@/components/ProtectedRoute";
import RequireRole from "@/components/RequireRole";

// Páginas públicas
import LoginPage from "@/pages/LoginPage";
import Unauthorized from "@/pages/Unauthorized";

// Páginas principales
import Dashboard from "@/pages/Dashboard";
import ProfilePage from "@/pages/ProfilePage";
import TestPage from "@/pages/TestPage";
import LogsPage from "@/pages/LogsPage";
import IntentsPage from "@/pages/IntentsPage";
import StatsPage from "@/pages/StatsPage";
import StatsPageV2 from "@/pages/StatsPageV2";
import UserManagementPage from "@/pages/UserManagementPage";
import AssignRoles from "@/pages/AssignRoles";
import UploadIntentsCSV from "@/components/UploadIntentsCSV";
import ExportacionesPage from "@/pages/ExportacionesPage";
import IntentosFallidosPage from "@/pages/IntentosFallidosPage";

// Chat “clásico” (lo dejamos como backup en /chat-old)
import ChatPage from "@/pages/ChatPage";

// Harness QA para el chat (página recomendada para /chat)
import Harness from "@/pages/Harness";

function CatchAllRedirect() {
    const { isAuthenticated } = useAuth();
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <TooltipProvider>
                <Routes>
                    {/* Públicas */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Chat: apuntamos /chat al Harness para QA/Playwright */}
                    <Route path="/chat" element={<Harness />} />
                    {/* Conserva tu chat real como fallback */}
                    <Route path="/chat-old" element={<ChatPage />} />
                    <Route path="/chat-embed" element={<ChatPage forceEmbed />} />
                    <Route path="/iframe/chat" element={<ChatPage forceEmbed />} />
                    <Route path="/widget" element={<ChatPage forceEmbed embedHeight="100vh" />} />

                    {/* Home protegida */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protegidas sin rol específico */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/diagnostico"
                        element={
                            <ProtectedRoute>
                                <TestPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* admin/soporte */}
                    <Route
                        path="/logs"
                        element={
                            <ProtectedRoute>
                                <RequireRole allowedRoles={["admin", "soporte"]}>
                                    <LogsPage />
                                </RequireRole>
                            </ProtectedRoute>
                        }
                    />

                    {/* admin-only */}
                    <Route
                        path="/intents"
                        element={
                            <ProtectedRoute>
                                <RequireRole allowedRoles={["admin"]}>
                                    <IntentsPage />
                                </RequireRole>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/stats"
                        element={
                            <ProtectedRoute>
                                <RequireRole allowedRoles={["admin"]}>
                                    <StatsPage />
                                </RequireRole>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/stats-v2"
                        element={
                            <ProtectedRoute>
                                <RequireRole allowedRoles={["admin"]}>
                                    <StatsPageV2 />
                                </RequireRole>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute>
                                <RequireRole allowedRoles={["admin"]}>
                                    <UserManagementPage />
                                </RequireRole>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/assign-roles"
                        element={
                            <ProtectedRoute>
                                <RequireRole allowedRoles={["admin"]}>
                                    <AssignRoles />
                                </RequireRole>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/upload-intents"
                        element={
                            <ProtectedRoute>
                                <RequireRole allowedRoles={["admin"]}>
                                    <UploadIntentsCSV />
                                </RequireRole>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/exportaciones"
                        element={
                            <ProtectedRoute>
                                <RequireRole allowedRoles={["admin"]}>
                                    <ExportacionesPage />
                                </RequireRole>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/intentos-fallidos"
                        element={
                            <ProtectedRoute>
                                <RequireRole allowedRoles={["admin"]}>
                                    <IntentosFallidosPage />
                                </RequireRole>
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch-all */}
                    <Route path="*" element={<CatchAllRedirect />} />
                </Routes>
            </TooltipProvider>
        </BrowserRouter>
    );
}