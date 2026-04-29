"use client";

import { Receta } from '@/types';
import { formatearMoneda } from '@/lib/constants';
import { useConfiguracion } from '@/hooks/useConfiguracion';

interface RecetasRentablesTableProps {
  recetas: Receta[];
  moneda: string;
}

export const RecetasRentablesTable = ({ recetas, moneda }: RecetasRentablesTableProps) => {
  const { configuracion } = useConfiguracion();
  const tasaCambio = configuracion?.tasaCambioUSD || 50;
  const recetasConMargen = recetas
    .filter(r => r.precioVentaSugerido && r.margenGanancia)
    .map(receta => ({
      ...receta,
      ganancia: (receta.precioVentaSugerido || 0) - receta.costoTotal,
      margenReal: receta.margenGanancia || 0,
    }))
    .sort((a, b) => b.ganancia - a.ganancia)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {recetasConMargen.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay recetas con precio de venta configurado</p>
          <p className="text-sm mt-2">Agrega recetas con margen de ganancia para ver estadísticas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recetasConMargen.map((receta, index) => (
            <div key={receta.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{receta.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    Costo: {formatearMoneda(receta.costoTotal, moneda, tasaCambio)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {formatearMoneda(receta.ganancia, moneda, tasaCambio)}
                  </p>
                  <p className="text-xs text-muted-foreground">ganancia</p>
                </div>
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                  {receta.margenReal.toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
