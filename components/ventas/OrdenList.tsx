"use client";

import { useState } from "react";
import { Orden, EstadoOrden } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { Select } from "@/components/ui/select";
import {
  Search,
  Edit2,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Download,
} from "lucide-react";
import { formatearUSD } from "@/lib/currency";

const ESTADO_VARIANTS: Record<EstadoOrden, "default" | "secondary" | "destructive" | "outline"> = {
  cotizacion: "outline",
  confirmada: "default",
  entregada: "secondary",
  cancelada: "destructive",
};

const ESTADO_LABELS: Record<EstadoOrden, string> = {
  cotizacion: "Cotización",
  confirmada: "Confirmada",
  entregada: "Entregada",
  cancelada: "Cancelada",
};

const esOrdenFinalizada = (orden: Orden) =>
  orden.estado === "entregada" || orden.estado === "cancelada";

const formatearFechaEntrega = (fecha: Date) =>
  fecha.toLocaleString("es-VE", { dateStyle: "short", timeStyle: "short" });

interface OrdenListProps {
  ordenes: Orden[];
  cargando: boolean;
  onEditar: (orden: Orden) => void;
  onEliminar: (id: string) => void;
  onCambiarEstado: (id: string, estado: EstadoOrden) => void;
  onExportarPDF?: (orden: Orden) => void;
  puedeExportarPDF?: boolean;
}

export const OrdenList = ({
  ordenes,
  cargando,
  onEditar,
  onEliminar,
  onCambiarEstado,
  onExportarPDF,
  puedeExportarPDF,
}: OrdenListProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoOrden | "">("");
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<string | null>(null);
  const [accionEnCursoId, setAccionEnCursoId] = useState<string | null>(null);

  const ordenesFiltradas = ordenes.filter(o => {
    const matchBusqueda =
      !busqueda ||
      o.numeroOrden.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = !filtroEstado || o.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const handleEliminar = (id: string) => {
    if (accionEnCursoId === id) {
      return;
    }

    if (confirmandoEliminar === id) {
      setAccionEnCursoId(id);
      Promise.resolve(onEliminar(id)).finally(() => {
        setAccionEnCursoId(null);
        setConfirmandoEliminar(null);
      });
    } else {
      setConfirmandoEliminar(id);
      setTimeout(() => setConfirmandoEliminar(null), 3000);
    }
  };

  const handleCambiarEstado = (ordenId: string, estado: EstadoOrden) => {
    if (accionEnCursoId === ordenId) {
      return;
    }

    setAccionEnCursoId(ordenId);
    Promise.resolve(onCambiarEstado(ordenId, estado)).finally(() => {
      setAccionEnCursoId(null);
    });
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por N° de orden o cliente..."
            className="pl-9"
          />
        </div>
        <Select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value as EstadoOrden | "")}
          className="sm:w-44"
        >
          <option value="">Todos los estados</option>
          <option value="cotizacion">Cotización</option>
          <option value="confirmada">Confirmada</option>
          <option value="entregada">Entregada</option>
          <option value="cancelada">Cancelada</option>
        </Select>
      </div>

      {ordenesFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="font-medium">
            {busqueda || filtroEstado ? "No se encontraron órdenes" : "Sin órdenes registradas"}
          </p>
          <p className="text-sm mt-1">
            {!busqueda && !filtroEstado && "Crea tu primera orden para empezar a gestionar tus ventas"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordenesFiltradas.map((orden, index) => (
            <motion.div
              key={orden.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="truncate font-mono">{orden.numeroOrden}</span>
                      </CardTitle>
                    </div>
                    <Badge variant={ESTADO_VARIANTS[orden.estado]} className="flex-shrink-0">
                      {ESTADO_LABELS[orden.estado]}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-1 mt-2">
                    {orden.clienteNombre || "Cliente desconocido"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">

                  <div className="bg-muted/50 rounded-lg p-4 space-y-3 border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        Total
                      </span>
                      <span className="text-lg font-bold">{formatearUSD(orden.total)}</span>
                    </div>

                    {orden.saldoPendiente > 0 && (
                      <>
                        <div className="h-px bg-border" />
                        <div className="flex items-center justify-between text-orange-600">
                          <span className="text-xs font-semibold">Saldo Pendiente</span>
                          <span className="text-sm font-bold">{formatearUSD(orden.saldoPendiente)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {orden.fechaEntrega && (
                    <div className="text-xs text-muted-foreground">
                      📅 Entrega: {formatearFechaEntrega(orden.fechaEntrega)}
                    </div>
                  )}

                  {orden.items.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      📦 {orden.items.length} {orden.items.length === 1 ? 'artículo' : 'artículos'}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => onEditar(orden)}
                      disabled={esOrdenFinalizada(orden) || accionEnCursoId === orden.id}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </Button>
                    {puedeExportarPDF && onExportarPDF && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => onExportarPDF(orden)}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (esOrdenFinalizada(orden)) return;
                        handleEliminar(orden.id);
                      }}
                      disabled={esOrdenFinalizada(orden) || accionEnCursoId === orden.id}
                    >
                      {accionEnCursoId === orden.id ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
