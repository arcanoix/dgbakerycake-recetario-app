"use client";

import { DesgloseCostos as DesgloseCostosType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda, formatearNumero } from "@/lib/constants";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { useUnidades } from "@/hooks/useUnidades";

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
    <Card>
      <CardHeader>
        <CardTitle>💰 Desglose de Costos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen de Costos */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Costo de Materiales:</span>
            <span className="font-semibold">
              {formatearMoneda(desglose.costoMateriales, configuracion?.moneda, tasaCambio)}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 bg-muted rounded-lg px-4">
            <span className="font-bold text-lg">Costo Total:</span>
            <span className="font-bold text-2xl text-primary">
              {formatearMoneda(desglose.costoTotal, configuracion?.moneda, tasaCambio)}
            </span>
          </div>
        </div>

        {/* Precio de Venta */}
        {desglose.precioVentaSugerido && desglose.margenGanancia && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">
                Margen de Ganancia ({desglose.margenGanancia}%):
              </span>
              <span className="font-semibold text-green-600">
                {formatearMoneda(
                  desglose.precioVentaSugerido - desglose.costoTotal,
                  configuracion?.moneda,
                  tasaCambio
                )}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-green-50 border border-green-200 rounded-lg px-4">
              <span className="font-bold text-lg text-green-800">
                Precio de Venta Sugerido:
              </span>
              <span className="font-bold text-2xl text-green-600">
                {formatearMoneda(desglose.precioVentaSugerido, configuracion?.moneda, tasaCambio)}
              </span>
            </div>
          </div>
        )}

        {/* Detalle de Materiales */}
        {desglose.detallesMateriales.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Detalle de Materiales</h4>
            <div className="space-y-2">
              {desglose.detallesMateriales.map((detalle, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{detalle.nombreProducto}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatearNumero(detalle.cantidad)}{" "}
                      {obtenerSimboloUnidad(detalle.unidad)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatearMoneda(detalle.costo, configuracion?.moneda, tasaCambio)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatearNumero(detalle.porcentaje, 1)}%
                    </p>
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
