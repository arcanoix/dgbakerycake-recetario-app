"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PerfilForm } from "@/components/perfil/PerfilForm";

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y credenciales de acceso</p>
        </div>
        <PerfilForm />
      </div>
    </ProtectedRoute>
  );
}
