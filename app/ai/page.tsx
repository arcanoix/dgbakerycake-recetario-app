"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { PremiumAIGate } from "@/components/ai/PremiumAIGate";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useInventario } from "@/hooks/useInventario";
import { Loading } from "@/components/ui/loading";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export default function AIPage() {
  const { canAccess, cargando: cargandoPlan } = usePlanAccess();
  const { stocks, cargando: cargandoInventario } = useInventario();

  const hasAIAccess = canAccess("ia_features");

  if (cargandoPlan || cargandoInventario) {
    return <Loading text="Cargando asistente de IA..." />;
  }

  // Build inventory list from stocks for context
  const inventarioDisponible = stocks
    .filter((s) => s.stockActual > 0)
    .map((s) => ({
      nombre: s.productoNombre,
      cantidad: s.stockActual,
      unidad: s.unidadMedidaSimbolo ?? s.unidadMedidaNombre ?? s.unidadMedida ?? "unidad",
    }));

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              Asistente de IA
            </h1>
            <p className="text-gray-700 mt-1">
              Herramientas impulsadas por inteligencia artificial para
              potenciar tu negocio de repostería
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PremiumAIGate hasAccess={hasAIAccess}>
            <AIAssistant inventarioDisponible={inventarioDisponible} />
          </PremiumAIGate>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
