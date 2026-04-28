"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Producto, ProductoFormData } from "@/types";
import { useProductos } from "@/hooks/useProductos";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { ProductoForm } from "@/components/productos/ProductoForm";
import { ProductoList } from "@/components/productos/ProductoList";
import { ImportarProductosModal } from "@/components/productos/ImportarProductosModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { motion } from "motion/react";
import { Package, AlertCircle, Lock, ArrowRight, Upload } from "lucide-react";

export default function ProductosPage() {
  const router = useRouter();
  const {
    productos,
    cargando,
    error,
    crearProducto,
    actualizarProducto,
    eliminar,
    buscarProductos,
    importarProductosMasivo,
  } = useProductos();

  const { getCurrentCount, getPlanDisplayName, getPlanName, cargando: cargandoPlan } = usePlanAccess();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarImportacion, setMostrarImportacion] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | undefined>();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  const productosFiltrados = terminoBusqueda
    ? buscarProductos(terminoBusqueda)
    : productos;

  const limitInfo = getCurrentCount('productos', productos.length);
  const canCreate = limitInfo.canCreate && getPlanName() !== 'free';

  const handleSubmit = async (datos: ProductoFormData): Promise<void> => {
    let exito = false;

    if (productoEditando) {
      exito = await actualizarProducto(productoEditando.id, datos);
    } else {
      exito = await crearProducto(datos);
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
    setMostrarImportacion(false);
    setProductoEditando(undefined);
  };

  const handleNuevo = () => {
    if (!canCreate) {
      router.push('/pricing');
      return;
    }
    setProductoEditando(undefined);
    setMostrarFormulario(true);
  };

  const handleImportar = () => {
    if (!canCreate) {
      router.push('/pricing');
      return;
    }
    setMostrarFormulario(false);
    setProductoEditando(undefined);
    setMostrarImportacion(true);
  };

  if (cargando || cargandoPlan) {
    return <Loading text="Cargando productos..." />;
  }

  const planName = getPlanName();
  const isLimited = planName === 'free' || planName === 'basico';

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
                <Package className="w-5 h-5 text-white" />
              </div>
              Productos e Insumos
            </h1>
            <p className="text-gray-700 mt-1">
              Gestiona los ingredientes y materiales para tus recetas
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleNuevo} 
              size="lg"
              disabled={!canCreate}
              className={`gap-2 ${canCreate ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0' : ''}`}
            >
              {canCreate ? (
                <> + Nuevo Producto</>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Límite alcanzado
                </>
              )}
            </Button>
            <Button
              onClick={handleImportar}
              size="lg"
              variant="outline"
              disabled={!canCreate}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar Excel/CSV
            </Button>
          </div>
        </motion.div>

        {isLimited && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-amber-200 bg-amber-50/30">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-amber-900">
                      Plan: {getPlanDisplayName()} - Límite de {limitInfo.limit} productos
                    </p>
                    <p className="text-sm text-amber-700">
                      Has usado {productos.length} de {limitInfo.limit} productos ({limitInfo.remaining} restantes)
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/pricing')}
                  className="gap-2"
                >
                  Actualizar plan
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {error && (
          <Card className="border-red-200">
            <CardContent className="py-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {mostrarFormulario && (
          <ProductoForm
            producto={productoEditando}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}

        {mostrarImportacion && (
          <ImportarProductosModal
            onImportar={importarProductosMasivo}
            onCerrar={handleCancel}
            canCreate={canCreate}
          />
        )}

        {!mostrarFormulario && !mostrarImportacion && (
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

        {!mostrarFormulario && !mostrarImportacion && productos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-gray-700">Total de Productos</p>
                <p className="text-2xl font-bold">{productos.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-gray-700">Resultados</p>
                <p className="text-2xl font-bold">{productosFiltrados.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-gray-700">Categorías</p>
                <p className="text-2xl font-bold">
                  {new Set(productos.map((p) => p.categoria).filter(Boolean)).size}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!mostrarFormulario && !mostrarImportacion && (
          <ProductoList
            productos={productosFiltrados}
            onEdit={handleEdit}
            onDelete={async (id: string) => {
              await eliminar(id);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
