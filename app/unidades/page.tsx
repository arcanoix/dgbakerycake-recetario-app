"use client";

import { useState } from "react";
import { UnidadMedidaAdmin, UnidadMedidaFormData } from "@/types";
import { useUnidades } from "@/hooks/useUnidades";
import { UnidadForm } from "@/components/unidades/UnidadForm";
import { UnidadList } from "@/components/unidades/UnidadList";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Scale, 
  Search, 
  Filter, 
  X, 
  AlertCircle, 
  RefreshCw,
  Ruler
} from "lucide-react";

export default function UnidadesPage() {
  const { 
    unidades, 
    cargando, 
    error, 
    errorCarga, 
    crearUnidad, 
    actualizarUnidad, 
    eliminar, 
    desactivarUnidad, 
    activarUnidad, 
    cargarUnidades 
  } = useUnidades();
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [unidadEditando, setUnidadEditando] = useState<UnidadMedidaAdmin | undefined>();

  const handleSubmit = async (datos: UnidadMedidaFormData) => {
    let exito = false;
    if (unidadEditando) {
      exito = await actualizarUnidad(unidadEditando.id, datos);
    } else {
      exito = await crearUnidad(datos);
    }

    if (exito) {
      resetForm();
    }
  };

  const resetForm = () => {
    setMostrarFormulario(false);
    setUnidadEditando(undefined);
  };

  const handleEdit = (unidad: UnidadMedidaAdmin) => {
    setUnidadEditando(unidad);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleEstado = async (unidad: UnidadMedidaAdmin): Promise<boolean> => {
    if (unidad.activo) {
      return await desactivarUnidad(unidad.id);
    } else {
      return await activarUnidad(unidad.id);
    }
  };

  if (cargando) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Cargando unidades...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Unidades de Medida
            </h2>
            <p className="text-sm text-muted-foreground">
              Define y gestiona las magnitudes de peso, volumen y cantidad
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              size="sm"
              variant={mostrarFormulario ? "outline" : "default"}
              className={`gap-2 h-10 px-4 ${!mostrarFormulario ? 'bg-primary shadow-sm' : ''}`}
            >
              {mostrarFormulario ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{mostrarFormulario ? "Cancelar" : "Nueva Unidad"}</span>
            </Button>
          </div>
        </div>

        {/* Stats Rápidas */}
        {!mostrarFormulario && unidades.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Peso/Masa</p>
                  <p className="text-2xl font-bold">{unidades.filter(u => u.tipo === 'peso').length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Volumen</p>
                  <p className="text-2xl font-bold">{unidades.filter(u => u.tipo === 'volumen').length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Activas</p>
                  <p className="text-2xl font-bold">{unidades.filter(u => u.activo).length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error */}
        {(error || errorCarga) && (
          <Card className="border-destructive/20 bg-destructive/5 shadow-none">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm font-medium text-destructive">{error || errorCarga}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => cargarUnidades()} className="h-8">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {mostrarFormulario ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <UnidadForm
                unidad={unidadEditando}
                unidades={unidades}
                onSubmit={handleSubmit}
                onCancel={resetForm}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <UnidadList
                unidades={unidades}
                onEdit={handleEdit}
                onDelete={eliminar}
                onToggleEstado={handleToggleEstado}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
