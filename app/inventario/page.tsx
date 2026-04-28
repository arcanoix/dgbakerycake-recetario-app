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
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { motion } from "motion/react";
import {
  Warehouse,
  AlertTriangle,
  PackageSearch,
  ClipboardList,
  Settings,
  Plus,
} from "lucide-react";

type TabId = "stock" | "kardex" | "nuevo" | "alertas" | "config";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "stock", label: "Stock Actual", icon: <PackageSearch className="w-4 h-4" /> },
  { id: "kardex", label: "Kardex", icon: <ClipboardList className="w-4 h-4" /> },
  { id: "nuevo", label: "Nuevo Movimiento", icon: <Plus className="w-4 h-4" /> },
  { id: "alertas", label: "Alertas", icon: <AlertTriangle className="w-4 h-4" /> },
  { id: "config", label: "Configuración", icon: <Settings className="w-4 h-4" /> },
];

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

  const [tabActiva, setTabActiva] = useState<TabId>("stock");
  const [productoKardexFiltro, setProductoKardexFiltro] = useState<string>("");

  if (cargando || cargandoProductos) {
    return <Loading text="Cargando inventario..." />;
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
      <div className="container mx-auto p-6 space-y-6">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-white" />
              </div>
              Inventario / Almacén
            </h1>
            <p className="text-gray-700 mt-1">
              Control de stock, kardex y trazabilidad de insumos
            </p>
          </div>
          <Button
            onClick={() => setTabActiva("nuevo")}
            size="lg"
            className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 border-0 text-white"
          >
            <Plus className="w-4 h-4" />
            Nuevo Movimiento
          </Button>
        </motion.div>

        {/* Tarjetas de resumen */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-gray-600">Productos rastreados</p>
              <p className="text-2xl font-bold">{stocksConMovimientos.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-gray-600">Movimientos registrados</p>
              <p className="text-2xl font-bold">{movimientos.length}</p>
            </CardContent>
          </Card>
          <Card className={stocksCriticos.length > 0 ? "border-red-300 bg-red-50/30" : ""}>
            <CardContent className="py-4">
              <p className="text-sm text-gray-600">Stock crítico</p>
              <p className={`text-2xl font-bold ${stocksCriticos.length > 0 ? "text-red-600" : ""}`}>
                {stocksCriticos.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-gray-600">Alertas configuradas</p>
              <p className="text-2xl font-bold">{configs.length}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerta global si hay stock crítico */}
        {stocksCriticos.length > 0 && tabActiva !== "alertas" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-red-300 bg-red-50/40">
              <CardContent className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-800 font-medium text-sm">
                    {stocksCriticos.length} producto{stocksCriticos.length !== 1 ? "s" : ""} con stock crítico:{" "}
                    {stocksCriticos
                      .slice(0, 3)
                      .map((s) => s.productoNombre)
                      .join(", ")}
                    {stocksCriticos.length > 3 && ` y ${stocksCriticos.length - 3} más`}.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => setTabActiva("alertas")}
                >
                  Ver alertas
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

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tabActiva === tab.id
                  ? "bg-white shadow text-violet-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "alertas" && stocksCriticos.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {stocksCriticos.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido de cada tab */}
        <motion.div
          key={tabActiva}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {tabActiva === "stock" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Stock actual de todos los productos que tienen al menos un movimiento registrado.
                Haz clic en un producto para ver su kardex.
              </p>
              <StockList
                stocks={stocksConMovimientos.length > 0 ? stocksConMovimientos : stocks}
                onSeleccionar={(id) => {
                  setProductoKardexFiltro(id);
                  setTabActiva("kardex");
                }}
              />
            </div>
          )}

          {tabActiva === "kardex" && (
            <div className="space-y-4">
              {/* Filtro por producto */}
              <div className="flex gap-3 items-center flex-wrap">
                <select
                  value={productoKardexFiltro}
                  onChange={(e) => setProductoKardexFiltro(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Todos los productos</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                {productoKardexFiltro && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProductoKardexFiltro("")}
                  >
                    Limpiar filtro
                  </Button>
                )}
                <span className="text-sm text-gray-500">
                  {movimientosFiltrados.length} movimiento{movimientosFiltrados.length !== 1 ? "s" : ""}
                </span>
              </div>
              <KardexTable
                movimientos={movimientosFiltrados}
                onEliminar={async (id) => {
                  await eliminar(id);
                }}
              />
            </div>
          )}

          {tabActiva === "nuevo" && (
            <MovimientoForm
              productos={productos}
              onSubmit={handleRegistrarMovimiento}
              onCancel={() => setTabActiva("stock")}
            />
          )}

          {tabActiva === "alertas" && (
            <div className="space-y-4">
              {stocksCriticos.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-gray-500">
                    <p className="text-green-700 font-medium">✓ No hay alertas activas.</p>
                    <p className="text-sm mt-1">
                      Todos los productos están por encima de su nivel mínimo de stock.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Los siguientes productos están por debajo de su nivel mínimo configurado:
                  </p>
                  <StockList
                    stocks={stocksCriticos}
                    onSeleccionar={(id) => {
                      setProductoKardexFiltro(id);
                      setTabActiva("kardex");
                    }}
                  />
                </>
              )}
            </div>
          )}

          {tabActiva === "config" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Configura el nivel mínimo de stock para cada producto. Recibirás alertas cuando el
                stock caiga por debajo del mínimo establecido.
              </p>
              <ConfigStock
                productos={productos}
                configs={configs}
                onGuardar={guardarConfig}
                onEliminar={eliminarConfig}
              />
            </div>
          )}
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
