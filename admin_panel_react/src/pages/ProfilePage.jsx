import React, { useEffect, useState } from "react";
import axios from "@/services/api";

function ProfilePage() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        axios.get("/auth/me").then((res) => setProfile(res.data));
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">👤 Mi Perfil</h1>
            {!profile ? (
                <p>Cargando...</p>
            ) : (
                <div className="space-y-2">
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>ID de usuario:</strong> {profile.user_id}</p>
                    <p><strong>Rol:</strong> {profile.role}</p>
                </div>
            )}
        </div>
    );
}

export default ProfilePage;