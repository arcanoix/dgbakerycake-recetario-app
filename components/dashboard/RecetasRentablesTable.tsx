"use client";

import { Receta } from '@/types';
import { formatearMoneda } from '@/lib/constants';

interface RecetasRentablesTableProps {
  recetas: Receta[];
  moneda: string;
}

export const RecetasRentablesTable = ({ recetas, moneda }: RecetasRentablesTableProps) => {
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
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-bold mb-4">Top 5 Recetas Más Rentables</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 text-sm font-semibold">Receta</th>
              <th className="text-right py-2 px-2 text-sm font-semibold">Costo</th>
              <th className="text-right py-2 px-2 text-sm font-semibold">Precio Venta</th>
              <th className="text-right py-2 px-2 text-sm font-semibold">Ganancia</th>
              <th className="text-right py-2 px-2 text-sm font-semibold">Margen</th>
            </tr>
          </thead>
          <tbody>
            {recetasConMargen.map((receta, index) => (
              <tr key={receta.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊'}
                    </span>
                    <span className="font-medium">{receta.nombre}</span>
                  </div>
                </td>
                <td className="text-right py-3 px-2 text-sm">
                  {formatearMoneda(receta.costoTotal, moneda)}
                </td>
                <td className="text-right py-3 px-2 text-sm font-semibold text-green-600">
                  {formatearMoneda(receta.precioVentaSugerido || 0, moneda)}
                </td>
                <td className="text-right py-3 px-2 text-sm font-bold text-blue-600">
                  {formatearMoneda(receta.ganancia, moneda)}
                </td>
                <td className="text-right py-3 px-2">
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                    {receta.margenReal.toFixed(0)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recetasConMargen.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay recetas con precio de venta configurado</p>
            <p className="text-sm mt-2">Agrega recetas con margen de ganancia para ver estadísticas</p>
          </div>
        )}
      </div>
    </div>
  );
};
