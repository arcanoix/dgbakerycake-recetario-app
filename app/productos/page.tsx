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
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { motion } from "motion/react";
import { 
  Package, 
  AlertCircle, 
  Lock, 
  ArrowRight, 
  Upload, 
  RefreshCw,
  Plus,
  ArrowUpRight,
  Tags,
  Boxes
} from "lucide-react";

export default function ProductosPage() {
  const router = useRouter();
  const {
    productos,
    cargando,
    error,
    errorCarga,
    crearProducto,
    actualizarProducto,
    eliminar,
    importarProductosMasivo,
    cargarProductos,
  } = useProductos();

  const { getCurrentCount, getPlanDisplayName, getPlanName, cargando: cargandoPlan } = usePlanAccess();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarImportacion, setMostrarImportacion] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | undefined>();

  const limitInfo = getCurrentCount('productos', productos.length);
  const canCreate = limitInfo.canCreate;
  const isDataLoading = cargando || cargandoPlan;

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

  const planName = getPlanName();
  const isLimited = planName === 'free' || planName === 'basico';

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-6">
        {/* Header con estética shadcn-admin */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Productos e Insumos
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestiona los ingredientes y materiales para tus recetas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleImportar}
              variant="outline"
              size="sm"
              disabled={isDataLoading || !canCreate}
              className="gap-2 h-10 px-4"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </Button>
            <Button 
              onClick={handleNuevo} 
              size="sm"
              disabled={isDataLoading || !canCreate}
              className="gap-2 h-10 px-4 bg-primary shadow-sm"
            >
              {isDataLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : canCreate ? (
                <Plus className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{isDataLoading ? 'Cargando...' : canCreate ? 'Nuevo Producto' : 'Límite alcanzado'}</span>
            </Button>
          </div>
        </div>

        {/* Alerta de Límite de Plan */}
        {!cargandoPlan && isLimited && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-amber-200 bg-amber-50/50 shadow-none">
              <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-100">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">
                      Plan: {getPlanDisplayName()} - Límite de {limitInfo.limit} productos
                    </p>
                    <p className="text-xs text-amber-700">
                      Has usado {productos.length} de {limitInfo.limit} productos ({limitInfo.remaining} restantes)
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/pricing')}
                  className="gap-2 border-amber-200 bg-white text-amber-900 hover:bg-amber-100"
                >
                  Actualizar plan
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Estadísticas Rápidas */}
        {!mostrarFormulario && !mostrarImportacion && !cargando && productos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Productos</p>
                  <p className="text-2xl font-bold">{productos.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600">
                  <Tags className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categorías</p>
                  <p className="text-2xl font-bold">
                    {new Set(productos.map((p) => p.categoria).filter(Boolean)).size}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Stock Registrado</p>
                  <p className="text-2xl font-bold">{productos.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Errores */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 shadow-none">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => cargarProductos()} className="h-8">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Formularios y Contenido */}
        {mostrarFormulario && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ProductoForm
              producto={productoEditando}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </motion.div>
        )}

        {mostrarImportacion && (
          <ImportarProductosModal
            onImportar={importarProductosMasivo}
            onCerrar={handleCancel}
            canCreate={canCreate}
          />
        )}

        {cargando ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Cargando tus productos...</p>
          </div>
        ) : !mostrarFormulario && !mostrarImportacion && !(errorCarga && productos.length === 0) ? (
          <ProductoList
            productos={productos}
            onEdit={handleEdit}
            onDelete={async (id: string) => {
              await eliminar(id);
            }}
          />
        ) : null}
      </div>
    </ProtectedRoute>
  );
}

