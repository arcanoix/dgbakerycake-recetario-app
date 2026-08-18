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
import { OrdenDetailModal } from "@/components/ordenes/OrdenDetailModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { exportarCotizacionPDF } from "@/lib/pdfCotizacion";
import { generarEnlaceWhatsApp } from "@/lib/whatsapp";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Plus, 
  Lock, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  FileText,
  X,
  AlertCircle,
  RefreshCw,
  Search
} from "lucide-react";
import Link from "next/link";
import { formatearUSD } from "@/lib/currency";

export default function VentasPage() {
  const { ordenes, cargando, error, errorCarga, crear, actualizar, cambiarEstado, eliminar, cargarOrdenes } = useOrdenes();
  const { clientes, errorCarga: errorCargaClientes, cargarClientes } = useClientes();
  const { recetas, errorCarga: errorCargaRecetas, cargarRecetas } = useRecetas();
  const { configuracion } = useConfiguracion();
  const { canAccess, getPlanDisplayName, getPlanName, cargando: cargandoPlan } = usePlanAccess();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ordenEditando, setOrdenEditando] = useState<Orden | undefined>();
  const [ordenVisualizando, setOrdenVisualizando] = useState<Orden | null>(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

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
    let exito = false;
    if (ordenEditando) {
      exito = await actualizar(ordenEditando.id, datos);
    } else {
      exito = await crear(datos);
    }
    
    if (exito) {
      setMostrarFormulario(false);
      setOrdenEditando(undefined);
    }
    return exito;
  };

  const handleEditar = (orden: Orden) => {
    setOrdenEditando(orden);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVer = (orden: Orden) => {
    setOrdenVisualizando(orden);
    setModalDetalleAbierto(true);
  };

  const handleCancelar = () => {
    setOrdenEditando(undefined);
    setMostrarFormulario(false);
  };

  const handleExportarPDF = (orden: Orden) => {
    exportarCotizacionPDF(orden, configuracion);
  };

  const handleCompartirWhatsApp = (orden: Orden) => {
    const cliente = clientes.find(c => c.id === orden.clienteId);
    const url = generarEnlaceWhatsApp(orden, configuracion, cliente?.telefono);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (cargandoPlan) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Verificando acceso...</p>
      </div>
    );
  }

  if (!puedeAcceder) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Módulo de Ventas</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Gestiona tus órdenes y cotizaciones, registra pagos y emite facturas. 
              Disponible desde el plan <strong>Básico</strong>.
            </p>
          </div>
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
            <p className="text-sm font-medium">Plan actual: <span className="text-primary font-bold uppercase">{getPlanDisplayName()}</span></p>
          </div>
          <Link href="/pricing">
            <Button className="gap-2 h-11 px-6 shadow-lg bg-primary">
              Ver Planes <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Ventas y Órdenes
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestiona tus pedidos, cotizaciones y seguimiento de entregas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              size="sm"
              variant={mostrarFormulario ? "outline" : "default"}
              disabled={clientes.length === 0 && !mostrarFormulario}
              className={`gap-2 h-10 px-4 ${!mostrarFormulario && puedeCrear ? 'bg-primary shadow-sm' : ''}`}
            >
              {mostrarFormulario ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{mostrarFormulario ? "Cancelar" : "Nueva Orden"}</span>
            </Button>
          </div>
        </div>

        {/* Clientes warning */}
        {clientes.length === 0 && !cargando && (
          <Card className="border-amber-200 bg-amber-50/50 shadow-none">
            <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-sm font-medium text-amber-900">
                  Necesitas registrar al menos un cliente antes de crear órdenes.
                </p>
              </div>
              <Link href="/clientes">
                <Button variant="outline" size="sm" className="gap-2 border-amber-200 bg-white text-amber-900">
                  Ir a Clientes <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {!mostrarFormulario && !cargando && ordenes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ventas Totales</p>
                  <p className="text-xl font-bold">{formatearUSD(totalVentas)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cotizaciones</p>
                  <p className="text-xl font-bold">{ordenesPendientes}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirmadas</p>
                  <p className="text-xl font-bold">{ordenesConfirmadas}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Entregadas</p>
                  <p className="text-xl font-bold">{ordenesEntregadas}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error */}
        {(error || errorCarga) && (
          <Card className="border-destructive/20 bg-destructive/5 shadow-none">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm font-medium text-destructive">{error || errorCarga}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => cargarOrdenes()} className="h-8">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {mostrarFormulario ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <OrdenForm
                orden={ordenEditando}
                clientes={clientes}
                recetas={recetas}
                onGuardar={handleGuardar}
                onCancelar={handleCancelar}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <OrdenList
                ordenes={ordenes}
                cargando={cargando}
                onEditar={handleEditar}
                onVer={handleVer}
                onEliminar={eliminar}
                onCambiarEstado={cambiarEstado}
                onExportarPDF={puedeExportarPDF ? handleExportarPDF : undefined}
                puedeExportarPDF={puedeExportarPDF}
                onCompartirWhatsApp={handleCompartirWhatsApp}
              />

              {/* Modal de Detalles */}
              <OrdenDetailModal 
                orden={ordenVisualizando}
                open={modalDetalleAbierto}
                onOpenChange={setModalDetalleAbierto}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
