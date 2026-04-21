"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PerfilForm } from "@/components/perfil/PerfilForm";
import { motion } from "motion/react";
import { User } from "lucide-react";

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-2xl space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            Mi Perfil
          </h1>
          <p className="text-gray-700 mt-1">
            Gestiona tu información personal y credenciales de acceso
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PerfilForm />
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
