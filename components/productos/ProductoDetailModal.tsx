"use client";

import { Producto } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { PrecioDual } from "@/components/ui/precio-dual";
import { formatearNumero } from "@/lib/constants";
import { 
  Package, 
  DollarSign, 
  Scale,
  Calendar,
  FileText,
  ShoppingCart,
  Tag
} from "lucide-react";

interface ProductoDetailModalProps {
  producto: Producto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductoDetailModal = ({ producto, open, onOpenChange }: ProductoDetailModalProps) => {
  const { configuracion } = useConfiguracion();

  if (!producto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-black mb-2">{producto.nombre}</DialogTitle>
              {producto.categoria && (
                <Badge variant="secondary" className="mb-2">
                  {producto.categoria}
                </Badge>
              )}
            </div>
            <Package className="w-8 h-8 text-primary" />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información de Presentación */}
          <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-xl p-5 border-2 border-primary/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Presentación del Producto
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Cantidad por Presentación */}
              <div className="bg-background/50 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tamaño Presentación
                  </span>
                </div>
                <p className="text-2xl font-black">
                  {formatearNumero(producto.tamañoPresentacion)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {producto.unidadMedidaSimbolo || producto.unidadMedida}
                </p>
              </div>

              {/* Precio por Presentación */}
              <div className="bg-background/50 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Precio
                  </span>
                </div>
                <PrecioDual 
                  valorUSD={producto.precioPorPresentacion} 
                  tasaCambio={configuracion?.tasaCambioUSD || 50}
                  monedaPorDefecto={configuracion?.moneda || 'VES'}
                  className="text-2xl font-black"
                />
              </div>
            </div>
          </div>

          {/* Precio por Unidad */}
          <div className="bg-muted/30 rounded-xl p-4 border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Precio por Unidad
            </h3>
            <div className="flex items-baseline gap-2">
              <PrecioDual 
                valorUSD={producto.precioPorUnidad} 
                tasaCambio={configuracion?.tasaCambioUSD || 50}
                monedaPorDefecto={configuracion?.moneda || 'VES'}
                className="text-3xl font-black text-primary"
              />
              <span className="text-sm text-muted-foreground">
                por {producto.unidadMedidaSimbolo || producto.unidadMedida}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Calculado: ${formatearNumero(producto.precioPorPresentacion)} ÷ {formatearNumero(producto.tamañoPresentacion)} {producto.unidadMedidaSimbolo || producto.unidadMedida}
            </p>
          </div>

          {/* Proveedor */}
          {producto.proveedor && (
            <div className="bg-muted/30 rounded-xl p-4 border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Proveedor
              </h3>
              <p className="text-lg font-semibold">{producto.proveedor}</p>
            </div>
          )}

          {/* Notas */}
          {producto.notas && (
            <div className="bg-muted/30 rounded-xl p-4 border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notas
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{producto.notas}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Creado: {producto.fechaCreacion.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Última actualización: {producto.fechaActualizacion.toLocaleDateString('es-ES', { 
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
