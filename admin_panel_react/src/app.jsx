import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireRole from "./components/RequireRole";

import LoginPage from "./pages/LoginPage";
import Unauthorized from "./pages/Unauthorized";

import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import TestPage from "./pages/TestPage";

import LogsPage from "./pages/LogsPage";
import IntentsPage from "./pages/IntentsPage";
import StatsPage from "./pages/StatsPage";
import UsersPage from "./pages/UsersPage";
import AssignRoles from "./pages/AssignRoles";
import UploadIntentsCSV from "./components/UploadIntentsCSV";

function App() {
    return (
        <Routes>

            {/* 🌐 Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<LoginPage />} />

            {/* 🔐 Rutas protegidas (requieren autenticación) */}
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

            {/* 🛠️ Rutas con rol: admin o soporte */}
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

            {/* 👑 Rutas exclusivas para admin */}
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
                path="/users"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin"]}>
                            <UsersPage />
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

        </Routes>
    );
}

export default App;