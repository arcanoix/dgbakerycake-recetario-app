"use client";

import { MovimientoInventario, TipoMovimiento } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface KardexTableProps {
  movimientos: MovimientoInventario[];
  onEliminar?: (id: string) => Promise<void>;
}

const TIPO_CONFIG: Record<TipoMovimiento, { label: string; color: string; signo: string }> = {
  compra: { label: "Compra", color: "text-green-700 bg-green-100", signo: "+" },
  uso: { label: "Uso", color: "text-blue-700 bg-blue-100", signo: "-" },
  merma: { label: "Merma", color: "text-red-700 bg-red-100", signo: "-" },
  ajuste_entrada: { label: "Ajuste +", color: "text-emerald-700 bg-emerald-100", signo: "+" },
  ajuste_salida: { label: "Ajuste -", color: "text-orange-700 bg-orange-100", signo: "-" },
};

export const KardexTable = ({ movimientos, onEliminar }: KardexTableProps) => {
  if (movimientos.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-500">
          No hay movimientos registrados aún.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Historial de Movimientos (Kardex)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Fecha</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Cantidad</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Stock Ant.</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Stock Nuevo</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Costo Unit.</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Notas</th>
                {onEliminar && (
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Acción</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movimientos.map((mov) => {
                const config = TIPO_CONFIG[mov.tipo];
                return (
                  <tr key={mov.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {mov.fecha.toLocaleDateString("es", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      <span
                        className={
                          config.signo === "+"
                            ? "text-green-700"
                            : "text-red-700"
                        }
                      >
                        {config.signo}
                        {mov.cantidad.toLocaleString("es", { maximumFractionDigits: 4 })}
                        {mov.unidadMedida ? ` ${mov.unidadMedida}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {mov.stockAnterior.toLocaleString("es", { maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {mov.stockNuevo.toLocaleString("es", { maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {mov.costoUnitario != null
                        ? mov.costoUnitario.toLocaleString("es", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {mov.notas ?? "—"}
                    </td>
                    {onEliminar && (
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => onEliminar(mov.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
