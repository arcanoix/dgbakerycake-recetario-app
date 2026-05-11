"use client";

import { Orden } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { PrecioDual } from "@/components/ui/precio-dual";
import { formatearNumero } from "@/lib/constants";
import { 
  ShoppingCart, 
  DollarSign, 
  Calendar,
  FileText,
  User,
  Phone,
  MapPin,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

interface OrdenDetailModalProps {
  orden: Orden | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getEstadoBadge = (estado: string) => {
  const badges = {
    cotizacion: { variant: "secondary" as const, icon: FileText, label: "Cotización" },
    confirmada: { variant: "default" as const, icon: CheckCircle2, label: "Confirmada" },
    entregada: { variant: "default" as const, icon: CheckCircle2, label: "Entregada" },
    cancelada: { variant: "destructive" as const, icon: XCircle, label: "Cancelada" },
  };
  return badges[estado as keyof typeof badges] || badges.cotizacion;
};

export const OrdenDetailModal = ({ orden, open, onOpenChange }: OrdenDetailModalProps) => {
  const { configuracion } = useConfiguracion();

  if (!orden) return null;

  const estadoBadge = getEstadoBadge(orden.estado);
  const EstadoIcon = estadoBadge.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-2xl font-black">Orden #{orden.numeroOrden}</DialogTitle>
                <Badge variant={estadoBadge.variant} className="gap-1">
                  <EstadoIcon className="w-3 h-3" />
                  {estadoBadge.label}
                </Badge>
              </div>
              {orden.clienteNombre && (
                <p className="text-sm text-muted-foreground">Cliente: {orden.clienteNombre}</p>
              )}
            </div>
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información del Cliente */}
          {orden.clienteNombre && (
            <div className="bg-muted/30 rounded-xl p-4 border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Información del Cliente
              </h3>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{orden.clienteNombre}</p>
                  <p className="text-xs text-muted-foreground">ID: {orden.clienteId}</p>
                </div>
              </div>
            </div>
          )}

          {/* Fecha de Entrega */}
          {orden.fechaEntrega && (
            <div className="bg-muted/30 rounded-xl p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Fecha de Entrega
                </span>
              </div>
              <p className="text-sm font-semibold">
                {orden.fechaEntrega.toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Items de la Orden */}
          <div className="bg-muted/30 rounded-xl p-4 border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Items ({orden.items.length})
            </h3>
            <div className="space-y-2">
              {orden.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.nombreItem}</p>
                    <p className="text-xs text-muted-foreground">
                      Cantidad: {formatearNumero(item.cantidad)}
                      {item.precioUnitario && (
                        <> • Precio unitario: <PrecioDual 
                          valorUSD={item.precioUnitario} 
                          tasaCambio={configuracion?.tasaCambioUSD || 50}
                          monedaPorDefecto={configuracion?.moneda || 'VES'}
                          className="text-xs font-medium inline"
                        /></>
                      )}
                    </p>
                  </div>
                  {item.subtotal && (
                    <PrecioDual 
                      valorUSD={item.subtotal} 
                      tasaCambio={configuracion?.tasaCambioUSD || 50}
                      monedaPorDefecto={configuracion?.moneda || 'VES'}
                      className="text-sm font-bold"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-xl p-5 border-2 border-primary/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Resumen Financiero
            </h3>
            
            <div className="space-y-3">
              {/* Subtotal */}
              {orden.subtotal !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Subtotal</span>
                  <PrecioDual 
                    valorUSD={orden.subtotal} 
                    tasaCambio={configuracion?.tasaCambioUSD || 50}
                    monedaPorDefecto={configuracion?.moneda || 'VES'}
                    className="text-sm font-bold"
                  />
                </div>
              )}

              {/* Descuento */}
              {orden.descuentoMonto > 0 && (
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-muted-foreground">Descuento</span>
                    {orden.descuentoPorcentaje > 0 && (
                      <span className="text-xs text-muted-foreground">{orden.descuentoPorcentaje}%</span>
                    )}
                  </div>
                  <PrecioDual 
                    valorUSD={-orden.descuentoMonto} 
                    tasaCambio={configuracion?.tasaCambioUSD || 50}
                    monedaPorDefecto={configuracion?.moneda || 'VES'}
                    className="text-sm font-bold text-destructive"
                  />
                </div>
              )}

              <div className="h-px bg-border my-2" />

              {/* Total */}
              <div className="flex justify-between items-center bg-primary/10 rounded-lg p-3">
                <span className="text-sm font-black uppercase text-primary">Total</span>
                <PrecioDual 
                  valorUSD={orden.total} 
                  tasaCambio={configuracion?.tasaCambioUSD || 50}
                  monedaPorDefecto={configuracion?.moneda || 'VES'}
                  className="text-lg font-black text-primary"
                />
              </div>

              {/* Pago Adelantado y Saldo */}
              {(orden.pagoAdelantado > 0 || orden.saldoPendiente > 0) && (
                <>
                  <div className="h-px bg-border my-2" />
                  {orden.pagoAdelantado > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-emerald-600">Pago Adelantado</span>
                      <PrecioDual 
                        valorUSD={orden.pagoAdelantado} 
                        tasaCambio={configuracion?.tasaCambioUSD || 50}
                        monedaPorDefecto={configuracion?.moneda || 'VES'}
                        className="text-sm font-bold text-emerald-600"
                      />
                    </div>
                  )}
                  {orden.saldoPendiente > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-amber-600">Saldo Pendiente</span>
                      <PrecioDual 
                        valorUSD={orden.saldoPendiente} 
                        tasaCambio={configuracion?.tasaCambioUSD || 50}
                        monedaPorDefecto={configuracion?.moneda || 'VES'}
                        className="text-sm font-bold text-amber-600"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Notas */}
          {orden.notas && (
            <div className="bg-muted/30 rounded-xl p-4 border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notas
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{orden.notas}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Creada: {orden.fechaCreacion.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Última actualización: {orden.fechaActualizacion.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
