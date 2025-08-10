// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RequireRole from "@/components/RequireRole";

import LoginPage from "@/pages/LoginPage";
import Unauthorized from "@/pages/Unauthorized";

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
import IntentosFallidosPage from "@/pages/IntentosFallidosPage"; // ✅ NUEVO

import { TooltipProvider } from "@/components/ui/IconTooltip"; // ✅ Provider global

function CatchAllRedirect() {
    const { isAuthenticated } = useAuth();
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function App() {
    return (
        <TooltipProvider>
            <Routes>
                {/* 🌐 Públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Home protegido */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* 🔐 Protegidas sin rol */}
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

                {/* 🛠️ admin/soporte */}
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
                <Route
                    path="/diagnostico"
                    element={
                        <ProtectedRoute>
                            <RequireRole allowedRoles={["admin", "soporte"]}>
                                <TestPage />
                            </RequireRole>
                        </ProtectedRoute>
                    }
                />

                {/* 👑 admin-only */}
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

                {/* ✅ NUEVA RUTA: Fallos del bot (admin) */}
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
    );
}

export default App;