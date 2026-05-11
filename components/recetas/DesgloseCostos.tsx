"use client";

import { DesgloseCostos as DesgloseCostosType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatearMoneda, formatearNumero } from "@/lib/constants";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { useUnidades } from "@/hooks/useUnidades";
import { 
  DollarSign, 
  TrendingUp, 
  UtensilsCrossed, 
  PieChart, 
  Calculator,
  ArrowUpRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DesgloseCostosProps {
  desglose: DesgloseCostosType;
}

export const DesgloseCostos = ({ desglose }: DesgloseCostosProps) => {
  const { configuracion } = useConfiguracion();
  const { unidades } = useUnidades();
  const tasaCambio = configuracion?.tasaCambioUSD || 50;
  
  const obtenerSimboloUnidad = (unidadId: string): string => {
    const unidad = unidades.find(u => u.id === unidadId);
    return unidad?.simbolo || unidadId;
  };

  return (
    <Card className="border-0 shadow-lg bg-card overflow-hidden">
      <CardHeader className="bg-muted/30 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Análisis de Costos</CardTitle>
            <CardDescription className="text-xs">Cálculo en tiempo real según insumos.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Resumen Principal */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-xl border bg-muted/20">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Costo Insumos</span>
            </div>
            <span className="font-bold text-lg">
              {formatearMoneda(desglose.costoMateriales, configuracion?.moneda, tasaCambio)}
            </span>
          </div>

          {desglose.costoManoObra > 0 && (
            <div className="flex justify-between items-center p-3 rounded-xl border bg-muted/20">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mano de Obra</span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    ({formatearNumero(desglose.cantidadHoras || 0)}h × {formatearMoneda(desglose.costoPorHora || 0, configuracion?.moneda, tasaCambio)}/h)
                  </span>
                </div>
              </div>
              <span className="font-bold text-lg">
                {formatearMoneda(desglose.costoManoObra, configuracion?.moneda, tasaCambio)}
              </span>
            </div>
          )}

          {desglose.costoGastosFijos > 0 && (
            <div className="flex justify-between items-center p-3 rounded-xl border bg-muted/20">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gastos Fijos</span>
              </div>
              <span className="font-bold text-lg">
                {formatearMoneda(desglose.costoGastosFijos, configuracion?.moneda, tasaCambio)}
              </span>
            </div>
          )}

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex justify-between items-center p-5 bg-card rounded-2xl border-2 border-primary/20 shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Costo Total</span>
                <p className="text-3xl font-black tracking-tight">
                  {formatearMoneda(desglose.costoTotal, configuracion?.moneda, tasaCambio)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-inner">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Precio de Venta y Margen */}
        {desglose.precioVentaSugerido && desglose.margenGanancia && (
          <div className="space-y-4 pt-4 border-t border-dashed">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-muted-foreground uppercase">Utilidad Estimada</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-black text-xs">
                +{desglose.margenGanancia}% MARGEN
              </Badge>
            </div>
            
            <div className="p-5 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-2xl space-y-1">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-[0.2em]">P. Venta Sugerido</span>
                  <p className="text-3xl font-black text-emerald-600 tracking-tight">
                    {formatearMoneda(desglose.precioVentaSugerido, configuracion?.moneda, tasaCambio)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Ganancia Bruta</p>
                  <p className="text-sm font-black text-emerald-700">
                    +{formatearMoneda(desglose.precioVentaSugerido - desglose.costoTotal, configuracion?.moneda, tasaCambio)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detalle de Materiales */}
        {desglose.detallesMateriales.length > 0 && (
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Desglose de Insumos</h4>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {desglose.detallesMateriales.map((detalle, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 transition-all duration-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{detalle.nombreProducto}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">
                      {formatearNumero(detalle.cantidad)}{" "}
                      {obtenerSimboloUnidad(detalle.unidad)}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-black">
                      {formatearMoneda(detalle.costo, configuracion?.moneda, tasaCambio)}
                    </p>
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-bold border-muted-foreground/20">
                      {formatearNumero(detalle.porcentaje, 1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
