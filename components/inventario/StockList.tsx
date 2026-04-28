"use client";

import { StockProducto } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Package } from "lucide-react";

interface StockListProps {
  stocks: StockProducto[];
  soloConMovimientos?: boolean;
  onSeleccionar?: (productoId: string) => void;
}

// Progress bar shows full at 2× the minimum stock level
const STOCK_PROGRESS_MULTIPLIER = 2;

export const StockList = ({
  stocks,
  soloConMovimientos = false,
  onSeleccionar,
}: StockListProps) => {
  const stocksMostrados = soloConMovimientos
    ? stocks.filter((s) => s.ultimaActualizacion.getTime() > 0)
    : stocks;

  if (stocksMostrados.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-500">
          No hay productos con información de stock.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stocksMostrados.map((s) => {
        const tieneAlerta = s.stockMinimo > 0 && s.stockActual <= s.stockMinimo;
        return (
          <Card
            key={s.productoId}
            className={`cursor-pointer transition-all hover:shadow-md ${
              tieneAlerta ? "border-red-300 bg-red-50/30" : "border-gray-200"
            }`}
            onClick={() => onSeleccionar?.(s.productoId)}
          >
            <CardContent className="py-4 px-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <p className="font-medium text-gray-900 leading-tight">{s.productoNombre}</p>
                </div>
                {tieneAlerta ? (
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stock actual</span>
                  <span className={`font-semibold ${tieneAlerta ? "text-red-700" : "text-gray-900"}`}>
                    {s.stockActual.toLocaleString("es", { maximumFractionDigits: 4 })}
                    {s.unidadMedidaSimbolo ? ` ${s.unidadMedidaSimbolo}` : ""}
                  </span>
                </div>
                {s.stockMinimo > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mínimo</span>
                    <span className="text-gray-700">
                      {s.stockMinimo.toLocaleString("es", { maximumFractionDigits: 4 })}
                      {s.unidadMedidaSimbolo ? ` ${s.unidadMedidaSimbolo}` : ""}
                    </span>
                  </div>
                )}
                {tieneAlerta && (
                  <p className="text-xs font-medium text-red-600 mt-1">
                    ⚠ Stock crítico
                  </p>
                )}
              </div>

              {/* Barra de progreso */}
              {s.stockMinimo > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        tieneAlerta ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (s.stockActual / (s.stockMinimo * STOCK_PROGRESS_MULTIPLIER)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
