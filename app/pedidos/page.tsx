"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OrdenCalendar } from "@/components/ventas/OrdenCalendar";
import { useOrdenes } from "@/hooks/useOrdenes";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ArrowRight, Lock } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export default function PedidosPage() {
  const { ordenes, cargando, error, actualizarFechaEntrega } = useOrdenes();
  const { canAccess, getPlanDisplayName, cargando: cargandoPlan } = usePlanAccess();

  const puedeAcceder = canAccess("menu_ventas");

  if (cargandoPlan) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-t-transparent border-violet-500 animate-spin"></div>
            <p className="text-gray-700">Verificando acceso...</p>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!puedeAcceder) {
    return (
      <ProtectedRoute>
        <div className="p-6 max-w-md mx-auto mt-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-violet-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Calendario de Pedidos
          </h2>
          <p className="text-gray-700 mb-4 text-sm">
            Visualiza tus entregas y estados de venta en un calendario. Disponible desde el plan
            Básico.
          </p>
          <p className="text-xs text-gray-700 mb-5">
            Tu plan actual: <strong>{getPlanDisplayName()}</strong>
          </p>
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
              Ver Planes <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-sm text-gray-700">
              Calendario de entregas y estados
            </p>
          </div>
        </motion.div>

        {error && (
          <Card className="border-red-200 bg-red-50/20">
            <CardContent className="py-3 px-4 text-sm text-red-600">{error}</CardContent>
          </Card>
        )}

        <OrdenCalendar
          ordenes={ordenes}
          cargando={cargando}
          onActualizarFecha={actualizarFechaEntrega}
        />
      </div>
    </ProtectedRoute>
  );
}
