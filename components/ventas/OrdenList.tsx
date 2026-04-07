"use client";

import { useState } from "react";
import { Orden, EstadoOrden } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

const ESTADO_COLORS: Record<EstadoOrden, string> = {
  cotizacion: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmada: "bg-blue-100 text-blue-800 border-blue-200",
  entregada: "bg-green-100 text-green-800 border-green-200",
  cancelada: "bg-red-100 text-red-800 border-red-200",
};

const ESTADO_LABELS: Record<EstadoOrden, string> = {
  cotizacion: "Cotización",
  confirmada: "Confirmada",
  entregada: "Entregada",
  cancelada: "Cancelada",
};

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
  const [expandida, setExpandida] = useState<string | null>(null);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<string | null>(null);

  const ordenesFiltradas = ordenes.filter(o => {
    const matchBusqueda =
      !busqueda ||
      o.numerOrden.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = !filtroEstado || o.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const toggleExpandir = (id: string) => {
    setExpandida(expandida === id ? null : id);
  };

  const handleEliminar = (id: string) => {
    if (confirmandoEliminar === id) {
      onEliminar(id);
      setConfirmandoEliminar(null);
    } else {
      setConfirmandoEliminar(id);
      setTimeout(() => setConfirmandoEliminar(null), 3000);
    }
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
        <div className="text-center py-12 text-gray-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">
            {busqueda || filtroEstado ? "No se encontraron órdenes" : "Sin órdenes registradas"}
          </p>
          <p className="text-sm mt-1">
            {!busqueda && !filtroEstado && "Crea tu primera orden para empezar a gestionar tus ventas"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ordenesFiltradas.map(orden => (
            <Card key={orden.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Order header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleExpandir(orden.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {orden.numerOrden}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ESTADO_COLORS[orden.estado]}`}
                      >
                        {ESTADO_LABELS[orden.estado]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {orden.clienteNombre || "Cliente desconocido"}
                      {orden.fechaEntrega && (
                        <span className="ml-2 text-xs text-gray-400">
                          · Entrega: {orden.fechaEntrega.toLocaleDateString("es-VE")}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{formatearUSD(orden.total)}</p>
                    {orden.saldoPendiente > 0 && (
                      <p className="text-xs text-orange-500">
                        Saldo: {formatearUSD(orden.saldoPendiente)}
                      </p>
                    )}
                  </div>

                  {expandida === orden.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </div>

                {/* Expanded details */}
                {expandida === orden.id && (
                  <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-4">
                    {/* Items list */}
                    {orden.items.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Artículos
                        </p>
                        <div className="space-y-1">
                          {orden.items.map(item => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-800 last:border-0"
                            >
                              <span className="text-gray-700 dark:text-gray-300">
                                {item.cantidad} × {item.nombreItem}
                              </span>
                              <span className="font-medium">{formatearUSD(item.subtotal)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1 text-sm">
                          {orden.descuentoPorcentaje > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Descuento ({orden.descuentoPorcentaje}%)</span>
                              <span>-{formatearUSD(orden.descuentoMonto)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>{formatearUSD(orden.total)}</span>
                          </div>
                          {orden.pagoAdelantado > 0 && (
                            <div className="flex justify-between text-blue-600">
                              <span>Pago Adelantado</span>
                              <span>-{formatearUSD(orden.pagoAdelantado)}</span>
                            </div>
                          )}
                          {orden.saldoPendiente > 0 && (
                            <div className="flex justify-between text-orange-600 font-semibold">
                              <span>Saldo Pendiente</span>
                              <span>{formatearUSD(orden.saldoPendiente)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {orden.notas && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Notas
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{orden.notas}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {/* State change */}
                      <Select
                        value={orden.estado}
                        onChange={e => onCambiarEstado(orden.id, e.target.value as EstadoOrden)}
                        className="text-xs h-8 w-auto"
                      >
                        <option value="cotizacion">→ Cotización</option>
                        <option value="confirmada">→ Confirmada</option>
                        <option value="entregada">→ Entregada</option>
                        <option value="cancelada">→ Cancelada</option>
                      </Select>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditar(orden)}
                        className="h-8 text-xs"
                      >
                        <Edit2 className="w-3 h-3 mr-1" /> Editar
                      </Button>

                      {puedeExportarPDF && onExportarPDF && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onExportarPDF(orden)}
                          className="h-8 text-xs text-violet-600 border-violet-200 hover:bg-violet-50"
                        >
                          <Download className="w-3 h-3 mr-1" /> PDF
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEliminar(orden.id)}
                        className={`h-8 text-xs ${
                          confirmandoEliminar === orden.id
                            ? "border-red-300 bg-red-50 text-red-600"
                            : "text-red-500 border-red-200 hover:bg-red-50"
                        }`}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        {confirmandoEliminar === orden.id ? "Confirmar" : "Eliminar"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
