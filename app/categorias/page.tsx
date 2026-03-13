"use client";

import { useState } from "react";
import { CategoriaAdmin, CategoriaFormData, TipoCategoria } from "@/types";
import { useCategorias } from "@/hooks/useCategorias";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoriaForm } from "@/components/categorias/CategoriaForm";
import { CategoriaList } from "@/components/categorias/CategoriaList";

export default function CategoriasPage() {
  const {
    categorias,
    cargando,
    error,
    crearCategoria,
    actualizarCategoria,
    eliminar,
    activarCategoria,
    desactivarCategoria,
    obtenerCategoriasPorTipo,
  } = useCategorias();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaAdmin | undefined>();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoCategoria | "todos">("todos");
  const [filtroEstado, setFiltroEstado] = useState<"activos" | "inactivos" | "todos">("activos");

  const handleSubmit = async (datos: CategoriaFormData) => {
    let exito = false;
    
    if (categoriaEditando) {
      exito = await actualizarCategoria(categoriaEditando.id, datos);
    } else {
      exito = await crearCategoria(datos);
    }

    if (exito) {
      setMostrarFormulario(false);
      setCategoriaEditando(undefined);
    }
  };

  const handleEdit = (categoria: CategoriaAdmin) => {
    setCategoriaEditando(categoria);
    setMostrarFormulario(true);
  };

  const handleCancel = () => {
    setMostrarFormulario(false);
    setCategoriaEditando(undefined);
  };

  const handleToggleEstado = async (categoria: CategoriaAdmin): Promise<boolean> => {
    if (categoria.activo) {
      return await desactivarCategoria(categoria.id);
    } else {
      return await activarCategoria(categoria.id);
    }
  };

  const categoriasFiltradas = categorias.filter((cat) => {
    const coincideBusqueda = cat.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase());
    const coincideTipo = filtroTipo === "todos" || cat.tipo === filtroTipo;
    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "activos" && cat.activo) ||
      (filtroEstado === "inactivos" && !cat.activo);

    return coincideBusqueda && coincideTipo && coincideEstado;
  });

  if (cargando) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-muted-foreground">Cargando categorías...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🏷️ Categorías</h1>
            <p className="text-muted-foreground">
              Administra las categorías de productos y recetas
            </p>
          </div>
          <Button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            size="lg"
          >
            {mostrarFormulario ? "Cancelar" : "+ Nueva Categoría"}
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
          <CategoriaForm
            categoria={categoriaEditando}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <>
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Buscar</label>
                    <Input
                      placeholder="Buscar por nombre..."
                      value={terminoBusqueda}
                      onChange={(e) => setTerminoBusqueda(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value as TipoCategoria | "todos")}
                    >
                      <option value="todos">Todos</option>
                      <option value="producto">Productos</option>
                      <option value="receta">Recetas</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value as "activos" | "inactivos" | "todos")}
                    >
                      <option value="activos">Activos</option>
                      <option value="inactivos">Inactivos</option>
                      <option value="todos">Todos</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Categorías */}
            <CategoriaList
              categorias={categoriasFiltradas}
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
