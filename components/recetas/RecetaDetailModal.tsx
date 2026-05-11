"use client";

import { Receta } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { useGastosFijos } from "@/hooks/useGastosFijos";
import { PrecioDual } from "@/components/ui/precio-dual";
import { formatearMoneda, formatearNumero } from "@/lib/constants";
import { calcularCostoGastosFijos } from "@/lib/calculations";
import { 
  Package, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Calculator,
  ChefHat,
  FileText
} from "lucide-react";

interface RecetaDetailModalProps {
  receta: Receta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecetaDetailModal = ({ receta, open, onOpenChange }: RecetaDetailModalProps) => {
  const { configuracion } = useConfiguracion();
  const { totales } = useGastosFijos();

  if (!receta) return null;

  // Recalcular gastos fijos en tiempo real
  const totalGastosMensuales = totales.totalMontoMensual;
  const porcentajeGastosFijos = configuracion?.porcentajeGastosFijos || 0;
  const costoGastosFijos = calcularCostoGastosFijos(totalGastosMensuales, porcentajeGastosFijos);
  const costoTotalRecalculado = receta.costoMateriales + receta.costoManoObra + costoGastosFijos;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-black mb-2">{receta.nombre}</DialogTitle>
              {receta.categoria && (
                <Badge variant="secondary" className="mb-2">
                  {receta.categoria}
                </Badge>
              )}
              {receta.descripcion && (
                <p className="text-sm text-muted-foreground mt-2">{receta.descripcion}</p>
              )}
            </div>
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información de Producción */}
          {receta.rendimiento && (
            <div className="bg-muted/30 rounded-xl p-4 border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Rendimiento
              </h3>
              <p className="text-lg font-bold">
                {formatearNumero(receta.rendimiento)} {receta.unidadRendimiento || 'unidades'}
              </p>
            </div>
          )}

          {/* Materiales */}
          <div className="bg-muted/30 rounded-xl p-4 border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Materiales ({receta.materiales.length})
            </h3>
            <div className="space-y-2">
              {receta.materiales.map((material) => (
                <div key={material.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{material.nombreProducto}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatearNumero(material.cantidadUtilizada)} {material.unidadMedida}
                    </p>
                  </div>
                  <PrecioDual 
                    valorUSD={material.costoMaterial} 
                    tasaCambio={configuracion?.tasaCambioUSD || 50}
                    monedaPorDefecto={configuracion?.moneda || 'VES'}
                    className="text-sm font-bold"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desglose de Costos */}
          <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-xl p-5 border-2 border-primary/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Desglose de Costos
            </h3>
            
            <div className="space-y-3">
              {/* Materiales */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">Costo de Materiales</span>
                <PrecioDual 
                  valorUSD={receta.costoMateriales} 
                  tasaCambio={configuracion?.tasaCambioUSD || 50}
                  monedaPorDefecto={configuracion?.moneda || 'VES'}
                  className="text-sm font-bold"
                />
              </div>

              {/* Mano de Obra */}
              {receta.costoManoObra > 0 && (
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-muted-foreground">Mano de Obra</span>
                    <span className="text-xs text-muted-foreground">
                      {formatearNumero(receta.cantidadHoras)}h × {formatearMoneda(receta.costoPorHora, configuracion?.moneda, configuracion?.tasaCambioUSD || 50)}/h
                    </span>
                  </div>
                  <PrecioDual 
                    valorUSD={receta.costoManoObra} 
                    tasaCambio={configuracion?.tasaCambioUSD || 50}
                    monedaPorDefecto={configuracion?.moneda || 'VES'}
                    className="text-sm font-bold"
                  />
                </div>
              )}

              {/* Gastos Fijos */}
              {costoGastosFijos > 0 && (
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-muted-foreground">Gastos Fijos</span>
                    <span className="text-xs text-muted-foreground">
                      {formatearNumero(porcentajeGastosFijos)}% de {formatearMoneda(totalGastosMensuales, configuracion?.moneda, configuracion?.tasaCambioUSD || 50)}
                    </span>
                  </div>
                  <PrecioDual 
                    valorUSD={costoGastosFijos} 
                    tasaCambio={configuracion?.tasaCambioUSD || 50}
                    monedaPorDefecto={configuracion?.moneda || 'VES'}
                    className="text-sm font-bold"
                  />
                </div>
              )}

              <div className="h-px bg-border my-2" />

              {/* Costo Total */}
              <div className="flex justify-between items-center bg-primary/10 rounded-lg p-3">
                <span className="text-sm font-black uppercase text-primary">Costo Total</span>
                <PrecioDual 
                  valorUSD={costoTotalRecalculado} 
                  tasaCambio={configuracion?.tasaCambioUSD || 50}
                  monedaPorDefecto={configuracion?.moneda || 'VES'}
                  className="text-lg font-black text-primary"
                />
              </div>

              {/* Precio de Venta */}
              {receta.precioVentaSugerido && receta.margenGanancia && (
                <>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-emerald-600">Precio de Venta Sugerido</span>
                      <span className="text-xs text-muted-foreground">
                        Margen: {formatearNumero(receta.margenGanancia)}%
                      </span>
                    </div>
                    <PrecioDual 
                      valorUSD={receta.precioVentaSugerido} 
                      tasaCambio={configuracion?.tasaCambioUSD || 50}
                      monedaPorDefecto={configuracion?.moneda || 'VES'}
                      className="text-lg font-black text-emerald-600"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notas */}
          {receta.notas && (
            <div className="bg-muted/30 rounded-xl p-4 border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notas
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{receta.notas}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p>Creada: {receta.fechaCreacion.toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p>Última actualización: {receta.fechaActualizacion.toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
