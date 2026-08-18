"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OrdenCalendar } from "@/components/ventas/OrdenCalendar";
import { useOrdenes } from "@/hooks/useOrdenes";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ArrowRight, Lock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PedidosPage() {
  const { ordenes, cargando, error, actualizarFechaEntrega } = useOrdenes();
  const { canAccess, getPlanDisplayName, cargando: cargandoPlan } = usePlanAccess();

  const puedeAcceder = canAccess("menu_ventas");

  if (cargandoPlan) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Verificando acceso...</p>
      </div>
    );
  }

  if (!puedeAcceder) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Calendario de Pedidos</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Visualiza tus entregas y estados de venta en un calendario dinámico. 
              Disponible desde el plan <strong>Básico</strong>.
            </p>
          </div>
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
            <p className="text-sm font-medium">Plan actual: <span className="text-primary font-bold uppercase">{getPlanDisplayName()}</span></p>
          </div>
          <Link href="/pricing">
            <Button className="gap-2 h-11 px-6 shadow-lg bg-primary">
              Ver Planes <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Agenda de Pedidos
            </h2>
            <p className="text-sm text-muted-foreground">
              Cronograma de entregas y seguimiento logístico
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Link href="/ventas">
               <Button variant="outline" size="sm" className="h-10 px-4 gap-2">
                 Ver todas las órdenes
               </Button>
             </Link>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/20 bg-destructive/5 shadow-none">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="bg-card rounded-3xl border shadow-sm p-2">
          <OrdenCalendar
            ordenes={ordenes}
            cargando={cargando}
            onActualizarFecha={actualizarFechaEntrega}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
