"use client";

import { useMemo, useState } from "react";
import { Orden, EstadoOrden } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
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

const WEEK_DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

interface OrdenCalendarProps {
  ordenes: Orden[];
  cargando: boolean;
  onActualizarFecha: (id: string, fechaEntrega: Date) => Promise<boolean>;
}

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatearFechaEntrega = (fecha: Date) =>
  fecha.toLocaleString("es-VE", { dateStyle: "medium", timeStyle: "short" });

const formatearHoraEntrega = (fecha: Date) =>
  fecha.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });

const esOrdenFinalizada = (orden: Orden) =>
  orden.estado === "entregada" || orden.estado === "cancelada";

export const OrdenCalendar = ({ ordenes, cargando, onActualizarFecha }: OrdenCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<Orden | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverDateKey, setHoverDateKey] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{ orden: Orden; fecha: Date } | null>(null);
  const [guardandoMovimiento, setGuardandoMovimiento] = useState(false);

  const { ordenesConEntrega, ordenesSinEntrega, ordenesPorFecha } = useMemo(() => {
    const conEntrega = ordenes.filter(o => o.fechaEntrega);
    const sinEntrega = ordenes.filter(o => !o.fechaEntrega);
    const agrupadas = new Map<string, Orden[]>();

    conEntrega.forEach(orden => {
      if (!orden.fechaEntrega) return;
      const key = getDateKey(orden.fechaEntrega);
      const lista = agrupadas.get(key) || [];
      lista.push(orden);
      agrupadas.set(key, lista);
    });

    return {
      ordenesConEntrega: conEntrega,
      ordenesSinEntrega: sinEntrega,
      ordenesPorFecha: agrupadas,
    };
  }, [ordenes]);

  const calendario = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const primerDiaMes = new Date(year, month, 1);
    const ultimoDiaMes = new Date(year, month + 1, 0);
    const diasEnMes = ultimoDiaMes.getDate();

    const primerDiaSemana = (primerDiaMes.getDay() + 6) % 7;
    const totalCeldas = Math.ceil((primerDiaSemana + diasEnMes) / 7) * 7;

    const celdas = Array.from({ length: totalCeldas }, (_, index) => {
      const dia = index - primerDiaSemana + 1;
      if (dia < 1 || dia > diasEnMes) return null;
      return new Date(year, month, dia);
    });

    return { celdas };
  }, [currentMonth]);

  const moverMes = (delta: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const nombreMes = currentMonth.toLocaleString("es-VE", {
    month: "long",
    year: "numeric",
  });

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  const handleSeleccionarOrden = (orden: Orden) => {
    setOrdenSeleccionada(prev => (prev?.id === orden.id ? null : orden));
  };

  const cerrarDrawer = () => {
    setOrdenSeleccionada(null);
  };

  const construirFechaEntrega = (orden: Orden, nuevaFecha: Date) => {
    const base = orden.fechaEntrega || new Date();
    const horas = base.getHours();
    const minutos = base.getMinutes();
    return new Date(
      nuevaFecha.getFullYear(),
      nuevaFecha.getMonth(),
      nuevaFecha.getDate(),
      horas,
      minutos,
      0,
      0
    );
  };

  const confirmarMovimiento = async () => {
    if (!pendingMove) return;
    const fechaEntrega = construirFechaEntrega(pendingMove.orden, pendingMove.fecha);
    setGuardandoMovimiento(true);
    const ok = await onActualizarFecha(pendingMove.orden.id, fechaEntrega);
    setGuardandoMovimiento(false);
    if (ok) {
      setPendingMove(null);
    }
  };

  const cancelarMovimiento = () => {
    setPendingMove(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-700">Pedidos con entrega</p>
              <p className="text-lg font-bold text-gray-900">
                {ordenesConEntrega.length} en el calendario
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 capitalize">
            {nombreMes}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => moverMes(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              }}
            >
              Hoy
            </Button>
            <Button variant="outline" size="sm" onClick={() => moverMes(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {ordenesSinEntrega.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/20">
          <CardContent className="py-3 px-4 text-sm text-amber-700 flex flex-wrap items-center gap-2">
            <span>⚠️</span>
            <span>
              Tienes {ordenesSinEntrega.length} pedido{ordenesSinEntrega.length !== 1 ? "s" : ""} sin
              fecha de entrega.{" "}
              <Link href="/ventas" className="font-semibold underline">
                Asignar fecha
              </Link>
            </span>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {WEEK_DAYS.map(dia => (
              <div key={dia} className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase">
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendario.celdas.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[120px] border-b border-r border-gray-100 bg-gray-50/40"
                  />
                );
              }

              const key = getDateKey(date);
              const pedidos = ordenesPorFecha.get(key) || [];
              const visible = pedidos.slice(0, 3);
              const ocultos = pedidos.length - visible.length;
              const esHoy = isSameDay(date, new Date());
              const esHover = hoverDateKey === key;

              return (
                <div
                  key={key}
                  className={`min-h-[120px] border-b border-r border-gray-100 p-2 space-y-2 transition-colors ${
                    esHover ? "bg-violet-50/40" : ""
                  }`}
                  onDragOver={e => {
                    if (!draggingId) return;
                    e.preventDefault();
                    setHoverDateKey(key);
                  }}
                  onDragLeave={() => {
                    if (hoverDateKey === key) setHoverDateKey(null);
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    const ordenId = e.dataTransfer.getData("text/plain");
                    setHoverDateKey(null);
                    setDraggingId(null);
                    const orden = ordenes.find(o => o.id === ordenId);
                    if (!orden || !orden.fechaEntrega) return;
                    if (esOrdenFinalizada(orden)) return;
                    if (isSameDay(orden.fechaEntrega, date)) return;
                    setPendingMove({ orden, fecha: date });
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${esHoy ? "text-violet-700" : "text-gray-700"}`}>
                      {date.getDate()}
                    </span>
                    {esHoy && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                        Hoy
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {visible.map(orden => {
                      const seleccionada = ordenSeleccionada?.id === orden.id;
                      const bloqueada = esOrdenFinalizada(orden);
                      return (
                        <button
                          key={orden.id}
                          type="button"
                          onClick={() => handleSeleccionarOrden(orden)}
                          draggable={!bloqueada}
                          onDragStart={e => {
                            if (bloqueada) return;
                            e.dataTransfer.setData("text/plain", orden.id);
                            setDraggingId(orden.id);
                          }}
                          onDragEnd={() => setDraggingId(null)}
                          className={`w-full text-left text-[10px] leading-tight px-1.5 py-1 rounded border transition-all ${ESTADO_COLORS[orden.estado]} ${
                            seleccionada ? "ring-2 ring-violet-400" : "hover:ring-1 hover:ring-violet-200"
                          } ${
                            bloqueada
                              ? "opacity-70 cursor-not-allowed"
                              : draggingId === orden.id
                                ? "opacity-60 cursor-grabbing"
                                : "cursor-grab"
                          }`}
                        >
                          <p className="font-semibold truncate">{orden.numeroOrden}</p>
                          <p className="truncate">{orden.clienteNombre || "Cliente"}</p>
                          {orden.fechaEntrega && (
                            <p className="text-[10px] opacity-80">
                              {formatearHoraEntrega(orden.fechaEntrega)}
                            </p>
                          )}
                        </button>
                      );
                    })}
                    {ocultos > 0 && (
                      <p className="text-[10px] text-gray-500">+{ocultos} más</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {ordenSeleccionada && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={cerrarDrawer}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 shadow-xl flex flex-col"
          >
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-gray-900">
                  {ordenSeleccionada.numeroOrden}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ESTADO_COLORS[ordenSeleccionada.estado]}`}
                >
                  {ESTADO_LABELS[ordenSeleccionada.estado]}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={cerrarDrawer}>
                <X className="w-4 h-4 mr-1" /> Cerrar
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p className="font-medium text-gray-900">
                    {ordenSeleccionada.clienteNombre || "Cliente"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Entrega</p>
                  <p className="font-medium text-gray-900">
                    {ordenSeleccionada.fechaEntrega
                      ? formatearFechaEntrega(ordenSeleccionada.fechaEntrega)
                      : "Sin fecha"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-gray-900">
                    {formatearUSD(ordenSeleccionada.total)}
                  </p>
                </div>
              </div>

              {ordenSeleccionada.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Artículos
                  </p>
                  <div className="space-y-1">
                    {ordenSeleccionada.items.map(item => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-gray-700">
                          {item.cantidad} × {item.nombreItem}
                        </span>
                        <span className="font-medium">{formatearUSD(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ordenSeleccionada.notas && (
                <div className="text-sm text-gray-700">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Notas
                  </p>
                  <p>{ordenSeleccionada.notas}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-sm items-center">
                {ordenSeleccionada.pagoAdelantado > 0 && (
                  <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    Adelanto: {formatearUSD(ordenSeleccionada.pagoAdelantado)}
                  </span>
                )}
                {ordenSeleccionada.saldoPendiente > 0 && (
                  <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                    Saldo: {formatearUSD(ordenSeleccionada.saldoPendiente)}
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => {
                    window.location.href = "/ventas";
                  }}
                >
                  Abrir en Ventas
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingMove && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={cancelarMovimiento} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-violet-100">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    Confirmar cambio de fecha
                  </p>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={cancelarMovimiento}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    Pedido <span className="font-semibold">{pendingMove.orden.numeroOrden}</span>
                  </p>
                  <p>
                    Nueva entrega:{" "}
                    <span className="font-semibold">
                      {formatearFechaEntrega(construirFechaEntrega(pendingMove.orden, pendingMove.fecha))}
                    </span>
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={cancelarMovimiento}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={confirmarMovimiento} disabled={guardandoMovimiento}>
                    {guardandoMovimiento ? "Guardando..." : "Confirmar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-gray-700">
        {Object.entries(ESTADO_LABELS).map(([estado, label]) => (
          <span
            key={estado}
            className={`px-2 py-1 rounded-full border font-medium ${ESTADO_COLORS[estado as EstadoOrden]}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
