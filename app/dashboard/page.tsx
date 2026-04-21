"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CostosChart } from "@/components/dashboard/CostosChart";
import { ProductosChart } from "@/components/dashboard/ProductosChart";
import { RecetasRentablesTable } from "@/components/dashboard/RecetasRentablesTable";
import { useAuth } from "@/contexts/AuthContext";
import { useProductos } from "@/hooks/useProductos";
import { useRecetas } from "@/hooks/useRecetas";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { calcularEstadisticas, calcularValorInventario } from "@/lib/estadisticas";
import { formatearDualMoneda } from "@/lib/currency";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { productos, cargando: cargandoProductos } = useProductos();
  const { recetas, cargando: cargandoRecetas } = useRecetas();
  const { configuracion, cargando: cargandoConfiguracion } = useConfiguracion();
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

  if (authLoading || !mounted || cargandoProductos || cargandoRecetas || cargandoConfiguracion) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-700">Cargando dashboard...</p>
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
  const costoTotalRecetas = recetas.reduce((sum, r) => sum + r.costoTotal, 0);

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-700">
            Resumen general de tu negocio de repostería
          </p>
        </div>

        {/* Stats Cards */}
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
            value={formatearDualMoneda(valorInventario, configuracion.tasaCambioUSD || 50, configuracion.moneda === 'USD')}
            icon="💰"
            description="Inversión total en productos"
            color="emerald"
          />
          <StatsCard
            title="Costo Promedio"
            value={formatearDualMoneda(estadisticas.costoPromedioReceta, configuracion.tasaCambioUSD || 50, configuracion.moneda === 'USD')}
            icon="📊"
            description="Promedio de todas las recetas"
            color="cyan"
          />
        </div>

        {/* Charts Row */}
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

        {/* Recetas Rentables Table */}
        <div className="mb-8">
          <RecetasRentablesTable recetas={recetas} moneda={configuracion.moneda} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-bold mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-xs text-amber-600 mt-1 text-center">
                  Requiere productos
                </p>
              </div>
            ) : (
              <Link href="/recetas">
                <Button className="w-full" variant="outline">
                  <span className="mr-2">📝</span>
                  Gestionar Recetas
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

        {/* Info Cards */}
        {estadisticas.recetaMasCostosa && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6 border border-red-200">
              <h4 className="font-bold text-red-800 mb-2">🔴 Receta Más Costosa</h4>
              <p className="text-2xl font-bold text-red-900">{estadisticas.recetaMasCostosa.nombre}</p>
              <p className="text-red-700 mt-2">
                {formatearDualMoneda(estadisticas.recetaMasCostosa.costoTotal, configuracion.tasaCambioUSD || 50, configuracion.moneda === 'USD')}
              </p>
            </div>
            
            {estadisticas.recetaMasEconomica && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">🟢 Receta Más Económica</h4>
                <p className="text-2xl font-bold text-green-900">{estadisticas.recetaMasEconomica.nombre}</p>
                <p className="text-green-700 mt-2">
                  {formatearDualMoneda(estadisticas.recetaMasEconomica.costoTotal, configuracion.tasaCambioUSD || 50, configuracion.moneda === 'USD')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
