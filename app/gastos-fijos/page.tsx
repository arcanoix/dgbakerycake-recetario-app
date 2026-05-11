"use client";

import { useState } from "react";
import { GastoFijo, GastoFijoFormData } from "@/types";
import { useGastosFijos } from "@/hooks/useGastosFijos";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { GastosFijosTable } from "@/components/gastos-fijos/GastosFijosTable";
import { GastoFijoForm } from "@/components/gastos-fijos/GastoFijoForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, DollarSign, AlertCircle, RefreshCw, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GastosFijosPage() {
  const { gastosFijos, totales, cargando, error, crear, actualizar, eliminar, cargarGastosFijos } = useGastosFijos();
  const { configuracion } = useConfiguracion();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [gastoSeleccionado, setGastoSeleccionado] = useState<GastoFijo | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  const moneda = configuracion?.moneda || "USD";

  const handleNuevo = () => {
    setGastoSeleccionado(null);
    setModalAbierto(true);
  };

  const handleEditar = (gasto: GastoFijo) => {
    setGastoSeleccionado(gasto);
    setModalAbierto(true);
  };

  const handleSubmit = async (datos: GastoFijoFormData): Promise<boolean> => {
    const exitoso = gastoSeleccionado
      ? await actualizar(gastoSeleccionado.id, datos)
      : await crear(datos);

    if (exitoso) {
      setMensaje({
        tipo: "success",
        texto: gastoSeleccionado
          ? "Gasto fijo actualizado exitosamente"
          : "Gasto fijo creado exitosamente",
      });
      setTimeout(() => setMensaje(null), 3000);
    } else {
      setMensaje({
        tipo: "error",
        texto: error || "Error al guardar el gasto fijo",
      });
      setTimeout(() => setMensaje(null), 5000);
    }

    return exitoso;
  };

  const handleEliminar = async (id: string) => {
    const exitoso = await eliminar(id);

    if (exitoso) {
      setMensaje({
        tipo: "success",
        texto: "Gasto fijo eliminado exitosamente",
      });
      setTimeout(() => setMensaje(null), 3000);
    } else {
      setMensaje({
        tipo: "error",
        texto: error || "Error al eliminar el gasto fijo",
      });
      setTimeout(() => setMensaje(null), 5000);
    }
  };

  if (cargando) {
    return (
      <ProtectedRoute>
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Cargando gastos fijos...</p>
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
              Gastos Fijos
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestiona los gastos fijos mensuales para distribución de costos en recetas
            </p>
          </div>
          <Button onClick={handleNuevo} className="gap-2 shadow-lg">
            <Plus className="w-5 h-5" />
            Nuevo Gasto Fijo
          </Button>
        </div>

        {/* Mensajes */}
        <AnimatePresence>
          {mensaje && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card
                className={
                  mensaje.tipo === "success"
                    ? "border-emerald-500/20 bg-emerald-50/50"
                    : "border-destructive/20 bg-destructive/5"
                }
              >
                <CardContent className="py-4 flex items-center gap-3">
                  {mensaje.tipo === "success" ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                  <p
                    className={`text-sm font-medium ${
                      mensaje.tipo === "success" ? "text-emerald-700" : "text-destructive"
                    }`}
                  >
                    {mensaje.texto}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Card */}
        <Card className="border-blue-500/20 bg-blue-50/30">
          <CardContent className="py-4 flex items-start gap-3">
            <div className="p-2 rounded-full bg-blue-500/10">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-sm font-bold text-foreground">¿Cómo funcionan los gastos fijos?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Los gastos fijos se distribuyen entre tus productos según las unidades estimadas mensuales. 
                El <strong>costo asignado</strong> se calcula dividiendo el monto mensual entre las unidades estimadas, 
                y el <strong>porcentaje de distribución</strong> muestra qué proporción representa cada gasto del total.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <GastosFijosTable
          gastosFijos={gastosFijos}
          totales={totales}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          moneda={moneda}
        />

        {/* Modal Form */}
        <GastoFijoForm
          gastoFijo={gastoSeleccionado}
          open={modalAbierto}
          onOpenChange={setModalAbierto}
          onSubmit={handleSubmit}
          moneda={moneda}
        />
      </div>
    </ProtectedRoute>
  );
}
