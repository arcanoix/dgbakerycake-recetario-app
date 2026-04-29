"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecetasRentablesTable } from "@/components/dashboard/RecetasRentablesTable";

// Recharts es ~300 KB — se carga de forma lazy para no bloquear el bundle inicial
const CostosChart = dynamic(
  () => import("@/components/dashboard/CostosChart").then((m) => ({ default: m.CostosChart })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-card rounded-lg border p-6 h-[352px] animate-pulse">
        <div className="h-5 w-40 bg-muted rounded mb-2" />
        <div className="h-3 w-56 bg-muted/50 rounded mb-6" />
        <div className="flex items-end gap-3 h-[240px]">
          {[60, 90, 45, 75, 55, 80, 40, 65].map((h, i) => (
            <div key={i} className="flex-1 bg-muted/50 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    ),
  }
);

const ProductosChart = dynamic(
  () => import("@/components/dashboard/ProductosChart").then((m) => ({ default: m.ProductosChart })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-card rounded-lg border p-6 h-[352px] animate-pulse">
        <div className="h-5 w-48 bg-muted rounded mb-2" />
        <div className="h-3 w-36 bg-muted/50 rounded mb-6" />
        <div className="flex items-center justify-center h-[240px]">
          <div className="w-40 h-40 rounded-full border-[24px] border-muted/50" />
        </div>
      </div>
    ),
  }
);

import { useAuth } from "@/contexts/AuthContext";
import { useProductos } from "@/hooks/useProductos";
import { useRecetas } from "@/hooks/useRecetas";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { useOrdenes } from "@/hooks/useOrdenes";
import { useClientes } from "@/hooks/useClientes";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { calcularEstadisticas, calcularValorInventario } from "@/lib/estadisticas";
import { formatearDualMoneda } from "@/lib/currency";
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  AlertCircle,
  Plus,
  FileText,
  UserPlus,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { productos, cargando: cargandoProductos, errorCarga: errorCargaProductos, cargarProductos } = useProductos();
  const { recetas, cargando: cargandoRecetas, errorCarga: errorCargaRecetas, cargarRecetas } = useRecetas();
  const { configuracion, cargando: cargandoConfiguracion, errorCarga: errorCargaConfiguracion, cargarConfiguracion } = useConfiguracion();
  const { ordenes, cargando: cargandoOrdenes, errorCarga: errorCargaOrdenes, cargarOrdenes } = useOrdenes();
  const { clientes, errorCarga: errorCargaClientes, cargarClientes } = useClientes();
  const { canAccess, getPlanDisplayName, cargando: cargandoPlan } = usePlanAccess();
  const [mounted, setMounted] = useState(false);
  const [recargandoDatos, setRecargandoDatos] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/";
    }
  }, [user, authLoading]);

  const recargarDashboard = async () => {
    setRecargandoDatos(true);
    try {
      await Promise.all([
        cargarConfiguracion(),
        cargarProductos(),
        cargarRecetas(),
        cargarOrdenes(),
        cargarClientes(),
      ]);
    } finally {
      setRecargandoDatos(false);
    }
  };

  const isInitialLoad = authLoading || !mounted || cargandoConfiguracion || cargandoPlan;

  if (isInitialLoad) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-2 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted/50 rounded" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-muted rounded mb-2" />
                <div className="h-3 w-32 bg-muted/50 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!configuracion && errorCargaConfiguracion) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Error de configuración
            </CardTitle>
            <CardDescription>{errorCargaConfiguracion}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => cargarConfiguracion()} className="w-full">
              Reintentar carga
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!configuracion) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Configuración requerida</CardTitle>
            <CardDescription>No se encontró configuración para tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/configuracion">
              <Button className="w-full">Ir a Configuración</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estadisticas = calcularEstadisticas(productos, recetas);
  const valorInventario = calcularValorInventario(productos);
  const tieneVentas = canAccess("menu_ventas");
  const tieneClientes = canAccess("menu_clientes");

  const totalVentas = ordenes
    .filter((o) => o.estado !== "cancelada")
    .reduce((acc, o) => acc + o.total, 0);
  const ordenesPendientes = ordenes.filter((o) => o.estado === "cotizacion").length;
  const ordenesConfirmadas = ordenes.filter((o) => o.estado === "confirmada").length;
  const ordenesEntregadas = ordenes.filter((o) => o.estado === "entregada").length;
  const ventasRecientes = [...ordenes]
    .sort((a, b) => new Date(b.fechaCreacion || 0).getTime() - new Date(a.fechaCreacion || 0).getTime())
    .slice(0, 5);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Resumen general de tu negocio de repostería
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={recargarDashboard}
            disabled={recargandoDatos}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${recargandoDatos ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Link href="/pricing">
            <Button size="sm" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Mejorar Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {(errorCargaProductos || errorCargaRecetas || errorCargaOrdenes || errorCargaClientes) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-900">
              Algunas secciones están usando datos parciales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-amber-800">
            {errorCargaProductos && <p>• Productos: {errorCargaProductos}</p>}
            {errorCargaRecetas && <p>• Recetas: {errorCargaRecetas}</p>}
            {errorCargaOrdenes && <p>• Órdenes: {errorCargaOrdenes}</p>}
            {errorCargaClientes && <p>• Clientes: {errorCargaClientes}</p>}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatearDualMoneda(valorInventario, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
            </div>
            <p className="text-xs text-muted-foreground">
              Inversión total en productos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recetas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalRecetas}</div>
            <p className="text-xs text-muted-foreground">
              Recetas creadas
            </p>
          </CardContent>
        </Card>

        {tieneVentas ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatearDualMoneda(totalVentas, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{ordenesEntregadas} órdenes entregadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Órdenes Activas</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ordenesConfirmadas}</div>
                <p className="text-xs text-muted-foreground">
                  {ordenesPendientes} cotizaciones pendientes
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.totalProductos}</div>
                <p className="text-xs text-muted-foreground">
                  Insumos registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Costo Promedio</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatearDualMoneda(estadisticas.costoPromedioReceta, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Promedio de recetas
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          {tieneVentas && <TabsTrigger value="sales">Ventas</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Distribución de Costos</CardTitle>
                <CardDescription>
                  Análisis de costos por receta
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <CostosChart recetas={recetas} moneda={configuracion.moneda} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Productos por Categoría</CardTitle>
                <CardDescription>
                  Distribución de insumos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductosChart productos={estadisticas.productosPorCategoria} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recetas Más Rentables</CardTitle>
                <CardDescription>
                  Top 5 recetas con mejor margen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecetasRentablesTable recetas={recetas} moneda={configuracion.moneda} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Accesos directos a funciones principales
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Link href="/productos/nuevo" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nuevo Producto</p>
                      <p className="text-xs text-muted-foreground">Agregar insumo al inventario</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>

                <Link href="/recetas/nueva" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                      <FileText className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nueva Receta</p>
                      <p className="text-xs text-muted-foreground">Crear receta con costos</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>

                {tieneVentas && (
                  <Link href="/ventas/nueva" className="block">
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer group">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                        <ShoppingCart className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nueva Venta</p>
                        <p className="text-xs text-muted-foreground">Registrar orden de venta</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )}

                {tieneClientes && (
                  <Link href="/clientes/nuevo" className="block">
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer group">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <UserPlus className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nuevo Cliente</p>
                        <p className="text-xs text-muted-foreground">Agregar cliente al sistema</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Costos</CardTitle>
                <CardDescription>
                  Desglose detallado de costos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CostosChart recetas={recetas} moneda={configuracion.moneda} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Productos</CardTitle>
                <CardDescription>
                  Categorías de insumos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductosChart productos={estadisticas.productosPorCategoria} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {tieneVentas && (
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ventas Recientes</CardTitle>
                <CardDescription>
                  Últimas 5 órdenes registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ventasRecientes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay ventas registradas
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ventasRecientes.map((orden) => (
                      <div key={orden.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Orden #{orden.id.substring(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(orden.fechaCreacion || "").toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatearDualMoneda(orden.total, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {orden.estado.replace("_", " ")}
                            </p>
                          </div>
                          <Link href={`/ventas/${orden.id}`}>
                            <Button variant="ghost" size="sm">
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
