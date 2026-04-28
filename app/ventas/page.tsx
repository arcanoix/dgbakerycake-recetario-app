"use client";

import { useState } from "react";
import { Orden, OrdenFormData, EstadoOrden } from "@/types";
import { useOrdenes } from "@/hooks/useOrdenes";
import { useClientes } from "@/hooks/useClientes";
import { useRecetas } from "@/hooks/useRecetas";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { OrdenForm } from "@/components/ventas/OrdenForm";
import { OrdenList } from "@/components/ventas/OrdenList";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { exportarCotizacionPDF } from "@/lib/pdfCotizacion";
import { motion } from "motion/react";
import { ShoppingBag, Plus, Lock, ArrowRight, TrendingUp, Clock, CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";
import { formatearUSD } from "@/lib/currency";

export default function VentasPage() {
  const { ordenes, cargando, error, errorCarga, crear, actualizar, cambiarEstado, eliminar, cargarOrdenes } = useOrdenes();
  const { clientes, errorCarga: errorCargaClientes, cargarClientes } = useClientes();
  const { recetas, errorCarga: errorCargaRecetas, cargarRecetas } = useRecetas();
  const { configuracion } = useConfiguracion();
  const { canAccess, getPlanDisplayName, cargando: cargandoPlan } = usePlanAccess();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ordenEditando, setOrdenEditando] = useState<Orden | undefined>();

  const puedeAcceder = canAccess("menu_ventas");
  const puedeCrear = canAccess("crear_ordenes");
  const puedeExportarPDF = canAccess("exportar_cotizacion_pdf");

  // Stats
  const totalVentas = ordenes
    .filter(o => o.estado !== "cancelada")
    .reduce((acc, o) => acc + o.total, 0);
  const ordenesConfirmadas = ordenes.filter(o => o.estado === "confirmada").length;
  const ordenesPendientes = ordenes.filter(o => o.estado === "cotizacion").length;
  const ordenesEntregadas = ordenes.filter(o => o.estado === "entregada").length;

  const handleGuardar = async (datos: OrdenFormData): Promise<boolean> => {
    if (ordenEditando) {
      return actualizar(ordenEditando.id, datos);
    }
    return crear(datos);
  };

  const handleEditar = (orden: Orden) => {
    setOrdenEditando(orden);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setOrdenEditando(undefined);
    setMostrarFormulario(false);
  };

  const handleExportarPDF = (orden: Orden) => {
    exportarCotizacionPDF(orden, configuracion);
  };

  // Mostrar loading mientras se verifica el plan
  if (cargandoPlan) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-t-transparent border-violet-500 animate-spin"></div>
            <p className="text-gray-700">Verificando acceso...</p>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!puedeAcceder) {
    return (
      <ProtectedRoute>
        <div className="p-6 max-w-md mx-auto mt-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-violet-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Módulo de Ventas
          </h2>
          <p className="text-gray-700 mb-4 text-sm">
            Gestiona tus órdenes y cotizaciones, registra pagos adelantados y emite facturas
            proforma en PDF. Disponible desde el plan Básico.
          </p>
          <p className="text-xs text-gray-700 mb-5">
            Tu plan actual: <strong>{getPlanDisplayName()}</strong>
          </p>
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
              Ver Planes <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
              <p className="text-sm text-gray-700">
                Órdenes y cotizaciones
              </p>
            </div>
          </div>

          {!mostrarFormulario && puedeCrear && (
            <Button
              onClick={() => setMostrarFormulario(true)}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
              disabled={clientes.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" /> Nueva Orden
            </Button>
          )}
        </motion.div>

        {/* Clientes warning */}
        {clientes.length === 0 && !cargando && (
          <Card className="border-amber-200 bg-amber-50/20">
            <CardContent className="py-3 px-4 text-sm text-amber-700 flex items-center gap-2">
              <span>⚠️</span>
              <span>
                No tienes clientes registrados.{" "}
                <Link href="/clientes" className="font-semibold underline">
                  Registra un cliente
                </Link>{" "}
                antes de crear una orden.
              </span>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {!cargando && ordenes.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-violet-500" />
                  <span className="text-xs text-gray-700">Ventas Totales</span>
                </div>
                <p className="text-lg font-bold">{formatearUSD(totalVentas)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-700">Cotizaciones</span>
                </div>
                <p className="text-lg font-bold">{ordenesPendientes}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-700">Confirmadas</span>
                </div>
                <p className="text-lg font-bold">{ordenesConfirmadas}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-700">Entregadas</span>
                </div>
                <p className="text-lg font-bold">{ordenesEntregadas}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50/20">
            <CardContent className="py-3 px-4 text-sm text-red-600">{error}</CardContent>
          </Card>
        )}

        {!cargando && errorCarga && ordenes.length === 0 && (
          <Card className="border-amber-200 bg-amber-50/70">
            <CardContent className="py-4 space-y-3">
              <p className="font-semibold text-amber-900">No pudimos cargar las órdenes</p>
              <p className="text-amber-800 text-sm">{errorCarga}</p>
              <Button variant="outline" onClick={() => cargarOrdenes()} className="border-amber-300 text-amber-900 hover:bg-amber-100">
                Reintentar carga
              </Button>
            </CardContent>
          </Card>
        )}

        {!cargando && errorCarga && ordenes.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="py-3 px-4 text-sm text-amber-800">
              {errorCarga}
            </CardContent>
          </Card>
        )}

        {!cargando && errorCargaClientes && clientes.length === 0 && (
          <Card className="border-amber-200 bg-amber-50/70">
            <CardContent className="py-4 space-y-3">
              <p className="font-semibold text-amber-900">No pudimos cargar los clientes</p>
              <p className="text-amber-800 text-sm">{errorCargaClientes}</p>
              <Button variant="outline" onClick={() => cargarClientes()} className="border-amber-300 text-amber-900 hover:bg-amber-100">
                Reintentar carga
              </Button>
            </CardContent>
          </Card>
        )}

        {!cargando && errorCargaRecetas && recetas.length === 0 && (
          <Card className="border-amber-200 bg-amber-50/70">
            <CardContent className="py-4 space-y-3">
              <p className="font-semibold text-amber-900">No pudimos cargar las recetas</p>
              <p className="text-amber-800 text-sm">{errorCargaRecetas}</p>
              <Button variant="outline" onClick={() => cargarRecetas()} className="border-amber-300 text-amber-900 hover:bg-amber-100">
                Reintentar carga
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        {mostrarFormulario && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <OrdenForm
              orden={ordenEditando}
              clientes={clientes}
              recetas={recetas}
              onGuardar={handleGuardar}
              onCancelar={handleCancelar}
            />
          </motion.div>
        )}

        {/* List */}
        {!errorCarga || ordenes.length > 0 ? (
          <OrdenList
            ordenes={ordenes}
            cargando={cargando}
            onEditar={handleEditar}
            onEliminar={eliminar}
            onCambiarEstado={cambiarEstado}
            onExportarPDF={puedeExportarPDF ? handleExportarPDF : undefined}
            puedeExportarPDF={puedeExportarPDF}
          />
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
