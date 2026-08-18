"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PerfilForm } from "@/components/perfil/PerfilForm";
import { motion } from "framer-motion";
import { User, ShieldCheck } from "lucide-react";

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Perfil de Usuario
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestiona tu información personal, seguridad y preferencias de cuenta
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Cuenta Verificada</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <PerfilForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
