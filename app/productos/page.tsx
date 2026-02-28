"use client";

import { useState } from "react";
import { Producto, ProductoFormData } from "@/types";
import { useProductos } from "@/hooks/useProductos";
import { ProductoForm } from "@/components/productos/ProductoForm";
import { ProductoList } from "@/components/productos/ProductoList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductosPage() {
  const {
    productos,
    cargando,
    error,
    crearProducto,
    actualizarProducto,
    eliminar,
    buscarProductos,
  } = useProductos();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | undefined>();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  const productosFiltrados = terminoBusqueda
    ? buscarProductos(terminoBusqueda)
    : productos;

  const handleSubmit = (datos: ProductoFormData) => {
    let exito = false;

    if (productoEditando) {
      exito = actualizarProducto(productoEditando.id, datos);
    } else {
      exito = crearProducto(datos);
    }

    if (exito) {
      setMostrarFormulario(false);
      setProductoEditando(undefined);
    }
  };

  const handleEdit = (producto: Producto) => {
    setProductoEditando(producto);
    setMostrarFormulario(true);
  };

  const handleCancel = () => {
    setMostrarFormulario(false);
    setProductoEditando(undefined);
  };

  const handleNuevo = () => {
    setProductoEditando(undefined);
    setMostrarFormulario(true);
  };

  if (cargando) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Productos e Insumos</h1>
          <p className="text-muted-foreground">
            Gestiona los ingredientes y materiales para tus recetas
          </p>
        </div>
        <Button onClick={handleNuevo} size="lg">
          + Nuevo Producto
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <ProductoForm
          producto={productoEditando}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Búsqueda */}
      {!mostrarFormulario && (
        <div className="flex gap-4">
          <Input
            placeholder="Buscar productos por nombre, categoría o proveedor..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="max-w-md"
          />
          {terminoBusqueda && (
            <Button variant="outline" onClick={() => setTerminoBusqueda("")}>
              Limpiar
            </Button>
          )}
        </div>
      )}

      {/* Estadísticas */}
      {!mostrarFormulario && productos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Total de Productos</p>
              <p className="text-2xl font-bold">{productos.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Resultados</p>
              <p className="text-2xl font-bold">{productosFiltrados.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Categorías</p>
              <p className="text-2xl font-bold">
                {new Set(productos.map((p) => p.categoria).filter(Boolean)).size}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Productos */}
      {!mostrarFormulario && (
        <ProductoList
          productos={productosFiltrados}
          onEdit={handleEdit}
          onDelete={eliminar}
        />
      )}
    </div>
  );
}
