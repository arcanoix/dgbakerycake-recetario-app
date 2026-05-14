"use client";

import { ConfiguracionFormData } from "@/types";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { ConfiguracionForm } from "@/components/configuracion/ConfiguracionForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, AlertCircle, RefreshCw, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfiguracionPage() {
  const { configuracion, cargando, error, actualizar, cargarConfiguracion, recetasRecalculadas } = useConfiguracion();

  const handleSubmit = async (datos: ConfiguracionFormData) => {
    await actualizar(datos);
  };

  if (cargando) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Cargando configuración...</p>
      </div>
    );
  }

  if (!configuracion && !cargando) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Error de Carga</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              No pudimos obtener la configuración del sistema. Por favor, intenta de nuevo.
            </p>
          </div>
          <Button onClick={() => cargarConfiguracion()} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Reintentar
          </Button>
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
              Ajustes del Sistema
            </h2>
            <p className="text-sm text-muted-foreground">
              Personaliza la moneda, tasas y márgenes de ganancia globales
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 shadow-none">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Recálculo automático de recetas */}
        <AnimatePresence>
          {recetasRecalculadas !== null && recetasRecalculadas > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="border-emerald-200 bg-emerald-50/60 shadow-none">
                <CardContent className="py-4 flex items-start gap-3">
                  <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-700 mt-0.5">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-emerald-800">
                      Recetas actualizadas automáticamente
                    </p>
                    <p className="text-xs text-emerald-700/90 leading-relaxed">
                      Se recalcularon {recetasRecalculadas} {recetasRecalculadas === 1 ? "receta" : "recetas"} con el nuevo costo de mano de obra por hora.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {recetasRecalculadas === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="border-muted bg-muted/30 shadow-none">
                <CardContent className="py-3 flex items-center gap-3">
                  <Calculator className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    No hay recetas existentes para recalcular. Las próximas recetas usarán el nuevo costo por hora.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario */}
        <div className="max-w-4xl">
          <ConfiguracionForm configuracion={configuracion!} onSubmit={handleSubmit} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
