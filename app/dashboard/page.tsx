"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecetasRentablesTable } from "@/components/dashboard/RecetasRentablesTable";

// Recharts es ~300 KB — se carga de forma lazy para no bloquear el bundle inicial
const CostosChart = dynamic(
  () => import("@/components/dashboard/CostosChart").then((m) => ({ default: m.CostosChart })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-[352px] animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-56 bg-gray-100 rounded mb-6" />
        <div className="flex items-end gap-3 h-[240px]">
          {[60, 90, 45, 75, 55, 80, 40, 65].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-100 rounded-t" style={{ height: `${h}%` }} />
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-[352px] animate-pulse">
        <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-36 bg-gray-100 rounded mb-6" />
        <div className="flex items-center justify-center h-[240px]">
          <div className="w-40 h-40 rounded-full border-[24px] border-gray-100" />
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
  ShoppingBag,
  Users,
  TrendingUp,
  Clock,
  Lock,
  ArrowRight,
  Crown,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const estadoBadge: Record<string, string> = {
  cotizacion: "bg-amber-100 text-amber-700",
  confirmada: "bg-blue-100 text-blue-700",
  en_proceso: "bg-violet-100 text-violet-700",
  entregada: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-700",
};

const estadoLabel: Record<string, string> = {
  cotizacion: "Cotización",
  confirmada: "Confirmada",
  en_proceso: "En proceso",
  entregada: "Entregada",
  cancelada: "Cancelada",
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { productos, cargando: cargandoProductos } = useProductos();
  const { recetas, cargando: cargandoRecetas } = useRecetas();
  const { configuracion, cargando: cargandoConfiguracion } = useConfiguracion();
  const { ordenes, cargando: cargandoOrdenes } = useOrdenes();
  const { clientes } = useClientes();
  const { canAccess, getPlanDisplayName, cargando: cargandoPlan } = usePlanAccess();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to home if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/";
    }
  }, [user, authLoading]);

  // Mostrar skeleton si auth aún no resolvió o configuración no cargó
  // Los charts tienen su propio skeleton via dynamic() loading
  const isInitialLoad = authLoading || !mounted || cargandoConfiguracion || cargandoPlan;

  if (isInitialLoad) {
    return (
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 w-36 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-100 rounded" />
          </div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
                <div className="h-8 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-[352px] animate-pulse">
                <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-56 bg-gray-100 rounded mb-6" />
                <div className="flex items-end gap-3 h-[240px]">
                  {[60, 90, 45, 75, 55, 80, 40, 65].map((h, idx) => (
                    <div key={idx} className="flex-1 bg-gray-100 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!configuracion) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-700 mb-4">No se encontró configuración</p>
          <Link href="/configuracion">
            <Button>Ir a Configuración</Button>
          </Link>
        </div>
      </main>
    );
  }

  const estadisticas = calcularEstadisticas(productos, recetas);
  const valorInventario = calcularValorInventario(productos);

  // Plan access flags
  const tieneVentas = canAccess("menu_ventas");
  const tieneClientes = canAccess("menu_clientes");

  // Sales stats
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
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-700">Resumen general de tu negocio de repostería</p>
        </div>

        {/* ── Base Stats Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Productos"
            value={estadisticas.totalProductos}
            icon="📦"
            description="Insumos registrados"
            color="violet"
          />
          <StatsCard
            title="Total Recetas"
            value={estadisticas.totalRecetas}
            icon="📝"
            description="Recetas creadas"
            color="fuchsia"
          />
          <StatsCard
            title="Valor Inventario"
            value={formatearDualMoneda(valorInventario, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
            icon="💰"
            description="Inversión total en productos"
            color="emerald"
          />
          <StatsCard
            title="Costo Promedio"
            value={formatearDualMoneda(estadisticas.costoPromedioReceta, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
            icon="📊"
            description="Promedio de todas las recetas"
            color="cyan"
          />
        </div>

        {/* ── Ventas & Clientes Stats (plan-gated) ─────────────────── */}
        {tieneVentas && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-violet-600" />
              <h2 className="text-lg font-bold text-gray-900">Ventas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Ventas"
                value={formatearDualMoneda(totalVentas, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
                icon="💵"
                description="Ingresos (sin canceladas)"
                color="emerald"
              />
              <StatsCard
                title="Cotizaciones"
                value={ordenesPendientes}
                icon="🕐"
                description="Pendientes de confirmar"
                color="amber"
              />
              <StatsCard
                title="Confirmadas"
                value={ordenesConfirmadas}
                icon="📋"
                description="Listas para producción"
                color="cyan"
              />
              {tieneClientes ? (
                <StatsCard
                  title="Total Clientes"
                  value={clientes.length}
                  icon="👥"
                  description="Clientes registrados"
                  color="violet"
                />
              ) : (
                <StatsCard
                  title="Entregadas"
                  value={ordenesEntregadas}
                  icon="✅"
                  description="Órdenes completadas"
                  color="fuchsia"
                />
              )}
            </div>
          </motion.div>
        )}

        {/* ── Charts Row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {recetas.length > 0 ? (
            <CostosChart recetas={recetas} moneda={configuracion.moneda} />
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex items-center justify-center h-[400px]">
              <div className="text-center">
                <p className="text-4xl mb-4">📝</p>
                <p className="text-gray-700 mb-4">No hay recetas aún</p>
                {productos.length === 0 ? (
                  <>
                    <p className="text-sm text-amber-600 mb-4 max-w-xs mx-auto">
                      ⚠️ Primero debes registrar al menos un producto para poder crear recetas
                    </p>
                    <Link href="/productos">
                      <Button variant="default">Agregar Productos Primero</Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/recetas">
                    <Button>Crear Primera Receta</Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {estadisticas.productosPorCategoria.length > 0 ? (
            <ProductosChart productos={estadisticas.productosPorCategoria} />
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex items-center justify-center h-[400px]">
              <div className="text-center">
                <p className="text-4xl mb-4">🛒</p>
                <p className="text-gray-700 mb-4">No hay productos aún</p>
                <Link href="/productos">
                  <Button>Agregar Productos</Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom row: Table + Sidebar ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recetas Rentables Table — spans 2 cols */}
          <div className="lg:col-span-2">
            <RecetasRentablesTable recetas={recetas} moneda={configuracion.moneda} />
          </div>

          {/* Sidebar: Ventas Recientes OR Upgrade prompt */}
          <div className="flex flex-col gap-6">
            {tieneVentas ? (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
              >
                <Card className="shadow-lg border border-gray-100 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b border-gray-100">
                    <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-violet-600" />
                      Ventas Recientes
                    </CardTitle>
                    <Link
                      href="/ventas"
                      className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors"
                    >
                      Ver todas <ArrowRight className="w-3 h-3" />
                    </Link>
                  </CardHeader>
                  <CardContent className="p-0">
                    {cargandoOrdenes ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-violet-500 animate-spin" />
                      </div>
                    ) : ventasRecientes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 gap-2 text-center px-4">
                        <ShoppingBag className="w-8 h-8 text-gray-200" />
                        <p className="text-sm text-gray-500">No hay órdenes aún</p>
                        <Link href="/ventas">
                          <Button size="sm" variant="outline" className="mt-1 text-xs">
                            Crear primera orden
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-50">
                        {ventasRecientes.map((orden, i) => (
                          <motion.li
                            key={orden.id}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/80 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                #{orden.numeroOrden}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {orden.clienteNombre || "Cliente"}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                              <span className="text-sm font-bold text-gray-900">
                                {formatearDualMoneda(orden.total, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  estadoBadge[orden.estado] || "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {estadoLabel[orden.estado] || orden.estado}
                              </span>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              /* ── Upgrade prompt for free plan ── */
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
              >
                <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-violet-600 via-violet-700 to-fuchsia-700 text-white">
                  {/* decorative bg icon */}
                  <div className="absolute -top-6 -right-6 opacity-10 rotate-12 pointer-events-none">
                    <Crown size={130} />
                  </div>
                  <CardHeader className="pb-2 relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                      </div>
                      <span className="text-xs font-semibold text-violet-200 uppercase tracking-wider">
                        Módulo Pro
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold text-white leading-tight">
                      Gestiona tus ventas y clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-4">
                    <ul className="space-y-2 text-sm text-violet-100">
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                        Registro de órdenes y cotizaciones
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                        Base de clientes completa
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                        Export de cotizaciones en PDF
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                        Analytics de ventas
                      </li>
                    </ul>
                    <div className="pt-1">
                      <p className="text-xs text-violet-200 mb-3">
                        Tu plan actual:{" "}
                        <strong className="text-white">{getPlanDisplayName()}</strong>
                      </p>
                      <Link href="/pricing">
                        <Button className="w-full bg-white text-violet-700 hover:bg-violet-50 font-bold shadow-lg border-none">
                          Ver Planes <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-bold mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/productos">
              <Button className="w-full" variant="outline">
                <span className="mr-2">📦</span>
                Gestionar Productos
              </Button>
            </Link>

            {productos.length === 0 ? (
              <div className="relative">
                <Button className="w-full" variant="outline" disabled>
                  <span className="mr-2">📝</span>
                  Gestionar Recetas
                </Button>
                <p className="text-xs text-amber-600 mt-1 text-center">Requiere productos</p>
              </div>
            ) : (
              <Link href="/recetas">
                <Button className="w-full" variant="outline">
                  <span className="mr-2">📝</span>
                  Gestionar Recetas
                </Button>
              </Link>
            )}

            {tieneVentas && (
              <Link href="/ventas">
                <Button className="w-full" variant="outline">
                  <ShoppingBag className="w-4 h-4 mr-2 text-violet-600" />
                  Gestionar Ventas
                </Button>
              </Link>
            )}

            {tieneClientes && (
              <Link href="/clientes">
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2 text-violet-600" />
                  Gestionar Clientes
                </Button>
              </Link>
            )}

            <Link href="/configuracion">
              <Button className="w-full" variant="outline">
                <span className="mr-2">⚙️</span>
                Configuración
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Info Cards (Receta más costosa / más económica) ───────── */}
        {estadisticas.recetaMasCostosa && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6 border border-red-200">
              <h4 className="font-bold text-red-800 mb-2">🔴 Receta Más Costosa</h4>
              <p className="text-2xl font-bold text-red-900">{estadisticas.recetaMasCostosa.nombre}</p>
              <p className="text-red-700 mt-2">
                {formatearDualMoneda(estadisticas.recetaMasCostosa.costoTotal, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
              </p>
            </div>

            {estadisticas.recetaMasEconomica && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">🟢 Receta Más Económica</h4>
                <p className="text-2xl font-bold text-green-900">{estadisticas.recetaMasEconomica.nombre}</p>
                <p className="text-green-700 mt-2">
                  {formatearDualMoneda(estadisticas.recetaMasEconomica.costoTotal, configuracion.tasaCambioUSD || 50, configuracion.moneda === "USD")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
