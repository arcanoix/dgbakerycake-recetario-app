"use client";

import { useState } from "react";
import { UnidadMedidaAdmin, UnidadMedidaFormData } from "@/types";
import { useUnidades } from "@/hooks/useUnidades";
import { UnidadForm } from "@/components/unidades/UnidadForm";
import { UnidadList } from "@/components/unidades/UnidadList";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/ui/loading";
import { motion } from "motion/react";
import { Plus, Scale, Search, Filter, X } from "lucide-react";

export default function UnidadesPage() {
  const { unidades, cargando, error, crearUnidad, actualizarUnidad, eliminar, desactivarUnidad, activarUnidad } = useUnidades();
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [unidadEditando, setUnidadEditando] = useState<UnidadMedidaAdmin | undefined>();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("activos");

  const unidadesFiltradas = unidades.filter(u => {
    const coincideBusqueda = terminoBusqueda
      ? u.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        u.simbolo.toLowerCase().includes(terminoBusqueda.toLowerCase())
      : true;
    
    const coincideTipo = filtroTipo === "todos" ? true : u.tipo === filtroTipo;
    const coincideEstado = filtroEstado === "todos" 
      ? true 
      : filtroEstado === "activos" 
        ? u.activo 
        : !u.activo;

    return coincideBusqueda && coincideTipo && coincideEstado;
  });

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
  };

  const handleToggleEstado = async (unidad: UnidadMedidaAdmin): Promise<boolean> => {
    if (unidad.activo) {
      return await desactivarUnidad(unidad.id);
    } else {
      return await activarUnidad(unidad.id);
    }
  };

  const handleNuevo = () => {
    setUnidadEditando(undefined);
    setMostrarFormulario(true);
  };

  const limpiarFiltros = () => {
    setTerminoBusqueda("");
    setFiltroTipo("todos");
    setFiltroEstado("activos");
  };

  const tieneFiltrosActivos = terminoBusqueda || filtroTipo !== "todos" || filtroEstado !== "activos";

  if (cargando) {
    return (
      <ProtectedRoute>
        <Loading text="Cargando unidades..." fullScreen />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              Unidades de Medida
            </h1>
            <p className="text-gray-700 mt-1">
              Administra las unidades de medida disponibles ({unidades.length} total)
            </p>
          </div>
          <Button 
            onClick={handleNuevo}
            size="lg"
            className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0"
          >
            <Plus className="w-4 h-4" />
            Nueva Unidad
          </Button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-red-200 bg-red-50/30">
              <CardContent className="py-4">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {mostrarFormulario ? (
          <UnidadForm
            unidad={unidadEditando}
            unidades={unidades}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                  </CardTitle>
                  {tieneFiltrosActivos && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={limpiarFiltros}
                      className="text-gray-700 hover:text-gray-700"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-700" />
                      Buscar
                    </label>
                    <Input
                      placeholder="Nombre o símbolo..."
                      value={terminoBusqueda}
                      onChange={(e) => setTerminoBusqueda(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Scale className="w-4 h-4 text-gray-700" />
                      Tipo
                    </label>
                    <Select
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                      className="h-10"
                    >
                      <option value="todos">Todos los tipos</option>
                      <option value="peso">⚖️ Peso</option>
                      <option value="volumen">💧 Volumen</option>
                      <option value="cantidad">🔢 Cantidad</option>
                      <option value="otro">📦 Otro</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-700" />
                      Estado
                    </label>
                    <Select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="h-10"
                    >
                      <option value="activos">✅ Solo activos</option>
                      <option value="inactivos">❌ Solo inactivos</option>
                      <option value="todos">📋 Todos</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 text-sm text-gray-700">
              Mostrando <span className="font-semibold">{unidadesFiltradas.length}</span> de {unidades.length} unidades
            </div>

            <div className="mt-4">
              <UnidadList
                unidades={unidadesFiltradas}
                onEdit={handleEdit}
                onDelete={eliminar}
                onToggleEstado={handleToggleEstado}
              />
            </div>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
