"use client";

import { useState } from "react";
import { UnidadMedidaAdmin } from "@/types";
import { useUnidades } from "@/hooks/useUnidades";
import { UnidadForm } from "@/components/unidades/UnidadForm";
import { UnidadList } from "@/components/unidades/UnidadList";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

  const handleSubmit = async (datos: any) => {
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

  const handleToggleEstado = async (unidad: UnidadMedidaAdmin) => {
    if (unidad.activo) {
      await desactivarUnidad(unidad.id);
    } else {
      await activarUnidad(unidad.id);
    }
  };

  if (cargando) return <div className="container mx-auto p-6">Cargando...</div>;

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Unidades de Medida</h1>
            <p className="text-muted-foreground">Administra las unidades de medida disponibles en el sistema</p>
          </div>
          <Button 
            onClick={() => setMostrarFormulario(!mostrarFormulario)} 
            size="lg"
          >
            {mostrarFormulario ? "Cancelar" : "+ Nueva Unidad"}
          </Button>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="py-4">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {mostrarFormulario ? (
          <UnidadForm
            unidad={unidadEditando}
            unidades={unidades}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Buscar por nombre o símbolo..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                className="max-w-md"
              />
              
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="todos">Todos los tipos</option>
                <option value="peso">Peso</option>
                <option value="volumen">Volumen</option>
                <option value="cantidad">Cantidad</option>
                <option value="otro">Otro</option>
              </select>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="activos">Solo activos</option>
                <option value="inactivos">Solo inactivos</option>
                <option value="todos">Todos</option>
              </select>
            </div>

            <UnidadList
              unidades={unidadesFiltradas}
              onEdit={handleEdit}
              onDelete={eliminar}
              onToggleEstado={handleToggleEstado}
            />
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
