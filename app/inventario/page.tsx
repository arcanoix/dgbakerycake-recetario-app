"use client";

import { useState } from "react";
import { MovimientoFormData } from "@/types";
import { useInventario } from "@/hooks/useInventario";
import { useProductos } from "@/hooks/useProductos";
import { MovimientoForm } from "@/components/inventario/MovimientoForm";
import { KardexTable } from "@/components/inventario/KardexTable";
import { StockList } from "@/components/inventario/StockList";
import { ConfigStock } from "@/components/inventario/ConfigStock";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { motion, AnimatePresence } from "framer-motion";
import {
  Warehouse,
  AlertTriangle,
  PackageSearch,
  ClipboardList,
  Settings,
  Plus,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  History,
  ShieldAlert,
  CheckCircle2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InventarioPage() {
  const {
    movimientos,
    stocks,
    configs,
    stocksCriticos,
    cargando,
    error,
    registrarMovimiento,
    eliminar,
    guardarConfig,
    eliminarConfig,
  } = useInventario();

  const { productos, cargando: cargandoProductos } = useProductos();

  const [tabActiva, setTabActiva] = useState<string>("stock");
  const [productoKardexFiltro, setProductoKardexFiltro] = useState<string>("");

  if (cargando || cargandoProductos) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Cargando inventario...</p>
      </div>
    );
  }

  const handleRegistrarMovimiento = async (datos: MovimientoFormData): Promise<boolean> => {
    const exito = await registrarMovimiento(datos);
    if (exito) setTabActiva("stock");
    return exito;
  };

  const movimientosFiltrados = productoKardexFiltro
    ? movimientos.filter((m) => m.productoId === productoKardexFiltro)
    : movimientos;

  const stocksConMovimientos = stocks.filter(
    (s) => movimientos.some((m) => m.productoId === s.productoId)
  );

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Inventario y Almacén
            </h2>
            <p className="text-sm text-muted-foreground">
              Control de stock, kardex y trazabilidad de insumos
            </p>
          </div>
          <Button
            onClick={() => setTabActiva("nuevo")}
            size="sm"
            className="gap-2 h-10 px-4 bg-primary shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Movimiento</span>
          </Button>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="py-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                <PackageSearch className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Productos</p>
                <p className="text-2xl font-bold">{stocksConMovimientos.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="py-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Movimientos</p>
                <p className="text-2xl font-bold">{movimientos.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className={`border-0 shadow-sm ${stocksCriticos.length > 0 ? "bg-red-500/10" : "bg-muted/30"}`}>
            <CardContent className="py-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stocksCriticos.length > 0 ? "bg-red-500/20 text-red-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Stock Crítico</p>
                <p className={`text-2xl font-bold ${stocksCriticos.length > 0 ? "text-red-600" : ""}`}>
                  {stocksCriticos.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="py-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Alertas</p>
                <p className="text-2xl font-bold">{configs.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerta global si hay stock crítico */}
        {stocksCriticos.length > 0 && tabActiva !== "alertas" && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-red-200 bg-red-50/50 shadow-none">
              <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-900 text-sm">
                      {stocksCriticos.length} producto{stocksCriticos.length !== 1 ? "s" : ""} con stock crítico
                    </p>
                    <p className="text-xs text-red-700">
                      Hay insumos que están por debajo del nivel mínimo establecido.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setTabActiva("alertas")}
                  className="gap-2 border-red-200 bg-white text-red-900 hover:bg-red-100"
                >
                  Revisar alertas
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {error && (
          <Card className="border-destructive/20 bg-destructive/5 shadow-none">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs Principales */}
        <Tabs value={tabActiva} onValueChange={setTabActiva} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 border h-11">
            <TabsTrigger value="stock" className="gap-2 h-9 px-4 font-bold data-[state=active]:shadow-sm">
              <PackageSearch className="w-4 h-4" />
              Stock Actual
            </TabsTrigger>
            <TabsTrigger value="kardex" className="gap-2 h-9 px-4 font-bold data-[state=active]:shadow-sm">
              <ClipboardList className="w-4 h-4" />
              Kardex
            </TabsTrigger>
            <TabsTrigger value="alertas" className="gap-2 h-9 px-4 font-bold data-[state=active]:shadow-sm relative">
              <AlertTriangle className="w-4 h-4" />
              Alertas
              {stocksCriticos.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white font-black shadow-sm">
                  {stocksCriticos.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2 h-9 px-4 font-bold data-[state=active]:shadow-sm">
              <Settings className="w-4 h-4" />
              Configurar
            </TabsTrigger>
            <TabsTrigger value="nuevo" className="gap-2 h-9 px-4 font-bold data-[state=active]:shadow-sm text-primary">
              <Plus className="w-4 h-4" />
              Nuevo
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={tabActiva}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="stock" className="m-0 space-y-4">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg">Control de Stock</CardTitle>
                    <CardDescription>Visualiza el nivel actual de todos tus productos e insumos.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <StockList
                      stocks={stocksConMovimientos.length > 0 ? stocksConMovimientos : stocks}
                      onSeleccionar={(id) => {
                        setProductoKardexFiltro(id);
                        setTabActiva("kardex");
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="kardex" className="m-0 space-y-4">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg">Historial de Movimientos</CardTitle>
                      <CardDescription>Trazabilidad completa de entradas, salidas y ajustes.</CardDescription>
                    </div>
                    {productoKardexFiltro && (
                      <Button variant="ghost" size="sm" onClick={() => setProductoKardexFiltro("")} className="text-xs h-8">
                        Limpiar filtro de producto
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="px-0">
                    <KardexTable
                      movimientos={movimientosFiltrados}
                      onEliminar={async (id) => {
                        await eliminar(id);
                      }}
                      productoFiltro={productoKardexFiltro}
                      onFiltroChange={setProductoKardexFiltro}
                      productos={productos}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alertas" className="m-0 space-y-4">
                {stocksCriticos.length === 0 ? (
                  <Card className="border-0 shadow-sm bg-muted/30">
                    <CardContent className="py-20 flex flex-col items-center justify-center text-center">
                      <div className="p-4 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <p className="text-lg font-bold text-emerald-900">¡Todo bajo control!</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                        No tienes productos con stock crítico en este momento.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-lg text-destructive">Productos en Alerta</CardTitle>
                      <CardDescription>Estos insumos requieren reposición inmediata.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                      <StockList
                        stocks={stocksCriticos}
                        onSeleccionar={(id) => {
                          setProductoKardexFiltro(id);
                          setTabActiva("kardex");
                        }}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="config" className="m-0 space-y-4">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg">Configuración de Alertas</CardTitle>
                    <CardDescription>Define los niveles mínimos de stock para cada producto.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <ConfigStock
                      productos={productos}
                      configs={configs}
                      onGuardar={guardarConfig}
                      onEliminar={eliminarConfig}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nuevo" className="m-0">
                <div className="max-w-3xl mx-auto">
                  <MovimientoForm
                    productos={productos}
                    onSubmit={handleRegistrarMovimiento}
                    onCancel={() => setTabActiva("stock")}
                  />
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
