"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { StatsCard } from "@/components/dashboard/StatsCardImproved";
import { RecetasRentablesTable } from "@/components/dashboard/RecetasRentablesTable";
import { RecentSales } from "@/components/dashboard/RecentSales";

// Recharts es ~300 KB — se carga de forma lazy para no bloquear el bundle inicial
const CostosChart = dynamic(
  () => import("@/components/dashboard/CostosChartImproved").then((m) => ({ default: m.CostosChart })),
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
  () => import("@/components/dashboard/ProductosChartImproved").then((m) => ({ default: m.ProductosChart })),
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
import { formatearDualMoneda, formatearDualMonedaCompacto } from "@/lib/currency";
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
    <div className="flex-1 space-y-4 md:space-y-6 p-3 md:p-8 pt-4 md:pt-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-0.5 md:space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Dashboard
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Resumen general de tu negocio
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={recargarDashboard}
            disabled={recargandoDatos}
            className="gap-2 flex-1 md:flex-none"
          >
            <RefreshCw className={`h-4 w-4 ${recargandoDatos ? 'animate-spin' : ''}`} />
            <span className="text-xs md:text-sm">Actualizar</span>
          </Button>
          <Link href="/pricing" className="flex-1 md:flex-none">
            <Button size="sm" className="gap-2 w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs md:text-sm">Mejorar</span>
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
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Valor Inventario"
          value={formatearDualMonedaCompacto(valorInventario, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
          icon={DollarSign}
          description="Inversión total en productos"
          variant="success"
          trend={{
            value: 12.5,
            isPositive: true,
            label: "vs mes anterior"
          }}
          sparklineData={[45, 52, 48, 61, 58, 65, 70]}
        />

        <StatsCard
          title="Total Recetas"
          value={estadisticas.totalRecetas}
          icon={Package}
          description="Recetas creadas"
          variant="primary"
          trend={{
            value: 8.2,
            isPositive: true,
            label: "nuevas este mes"
          }}
        />

        {tieneVentas ? (
          <>
            <StatsCard
              title="Ventas Totales"
              value={formatearDualMonedaCompacto(totalVentas, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
              icon={CreditCard}
              description={`+${ordenesEntregadas} órdenes entregadas`}
              variant="success"
              trend={{
                value: 15.3,
                isPositive: true,
                label: "vs mes anterior"
              }}
              sparklineData={[30, 40, 35, 50, 49, 60, 70]}
            />

            <StatsCard
              title="Órdenes Activas"
              value={ordenesConfirmadas}
              icon={Activity}
              description={`${ordenesPendientes} cotizaciones pendientes`}
              variant="warning"
              trend={{
                value: 5.1,
                isPositive: false,
                label: "vs semana anterior"
              }}
            />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Productos"
              value={estadisticas.totalProductos}
              icon={Package}
              description="Insumos registrados"
              variant="primary"
            />

            <StatsCard
              title="Costo Promedio"
              value={formatearDualMonedaCompacto(estadisticas.costoPromedioReceta, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
              icon={BarChart3}
              description="Promedio de recetas"
              variant="default"
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
        <div className="overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
          <TabsList className="inline-flex md:grid w-full md:max-w-md md:grid-cols-3 min-w-max md:min-w-0">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background text-xs md:text-sm px-4 md:px-6">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-background text-xs md:text-sm px-4 md:px-6">
              Análisis
            </TabsTrigger>
            {tieneVentas && (
              <TabsTrigger value="sales" className="data-[state=active]:bg-background text-xs md:text-sm px-4 md:px-6">
                Ventas
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4 border-0 shadow-md">
              <CardHeader className="space-y-1 p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl font-semibold">Distribución de Costos</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Análisis de costos por receta
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 md:pl-2 md:pr-6 md:pb-6">
                <CostosChart recetas={recetas} moneda={configuracion.moneda} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3 border-0 shadow-md">
              <CardHeader className="space-y-1 p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl font-semibold">Productos por Categoría</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Distribución de insumos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <ProductosChart productos={estadisticas.productosPorCategoria} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4 border-0 shadow-md">
              <CardHeader className="space-y-1 p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl font-semibold">Recetas Más Rentables</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Top 5 recetas con mejor margen
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <RecetasRentablesTable recetas={recetas} moneda={configuracion.moneda} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3 border-0 shadow-md">
              <CardHeader className="space-y-1 p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl font-semibold">Acciones Rápidas</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Accesos directos a funciones principales
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 md:gap-3 p-4 md:p-6">
                <Link href="/productos/nuevo" className="block">
                  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-0 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md">
                    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                      <Plus className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs md:text-sm font-semibold text-foreground">Nuevo Producto</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Agregar insumo</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>

                <Link href="/recetas/nueva" className="block">
                  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-0 bg-gradient-to-br from-violet-500/5 to-violet-500/10 hover:from-violet-500/10 hover:to-violet-500/15 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md">
                    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 transition-all duration-300 group-hover:scale-110">
                      <FileText className="h-5 w-5 md:h-6 md:w-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs md:text-sm font-semibold text-foreground">Nueva Receta</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Crear receta</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground opacity-0 md:group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>

                {tieneVentas && (
                  <Link href="/ventas/nueva" className="block">
                    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-0 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 hover:from-emerald-500/10 hover:to-emerald-500/15 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md">
                      <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-all duration-300 group-hover:scale-110">
                        <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs md:text-sm font-semibold text-foreground">Nueva Venta</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Registrar orden</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground opacity-0 md:group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                )}

                {tieneClientes && (
                  <Link href="/clientes/nuevo" className="block">
                    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10 hover:from-blue-500/10 hover:to-blue-500/15 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md">
                      <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-300 group-hover:scale-110">
                        <UserPlus className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs md:text-sm font-semibold text-foreground">Nuevo Cliente</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Agregar cliente</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground opacity-0 md:group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-semibold">Análisis de Costos</CardTitle>
                <CardDescription className="text-sm">
                  Desglose detallado de costos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CostosChart recetas={recetas} moneda={configuracion.moneda} />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-semibold">Distribución de Productos</CardTitle>
                <CardDescription className="text-sm">
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
          <TabsContent value="sales" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-semibold">Ventas Recientes</CardTitle>
                <CardDescription className="text-sm">
                  Últimas 5 órdenes registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales 
                  ventas={ventasRecientes}
                  moneda={configuracion.moneda}
                  tasaCambio={configuracion.tasaCambioUSD || 50}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
