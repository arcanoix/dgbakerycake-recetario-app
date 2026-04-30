"use client";

import { useState } from "react";
import { ConfigStockProducto, ConfigStockFormData, Producto } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

interface ConfigStockProps {
  productos: Producto[];
  configs: ConfigStockProducto[];
  onGuardar: (datos: ConfigStockFormData) => Promise<boolean>;
  onEliminar: (productoId: string) => Promise<boolean>;
}

export const ConfigStock = ({
  productos,
  configs,
  onGuardar,
  onEliminar,
}: ConfigStockProps) => {
  const [productoId, setProductoId] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoId) {
      setError("Selecciona un producto");
      return;
    }
    if (!stockMinimo || parseFloat(stockMinimo) < 0) {
      setError("Ingresa un stock mínimo válido");
      return;
    }
    setError("");
    setEnviando(true);
    await onGuardar({ productoId, stockMinimo: parseFloat(stockMinimo) });
    setProductoId("");
    setStockMinimo("");
    setEnviando(false);
  };

  return (
    <div className="space-y-4">
      {/* Formulario de nueva configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Establecer Stock Mínimo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAgregar} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="cfg-producto" className="sr-only">
                Producto
              </Label>
              <select
                id="cfg-producto"
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">-- Seleccionar producto --</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                    {p.unidadMedidaSimbolo ? ` (${p.unidadMedidaSimbolo})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-40">
              <Label htmlFor="cfg-minimo" className="sr-only">
                Stock Mínimo
              </Label>
              <Input
                id="cfg-minimo"
                type="number"
                step="0.0001"
                min="0"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
                placeholder="Stock mínimo"
              />
            </div>
            <Button
              type="submit"
              disabled={enviando}
              className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
            >
              {enviando ? "Guardando..." : "Guardar"}
            </Button>
          </form>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Lista de configuraciones existentes */}
      {configs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Niveles Mínimos Configurados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {configs.map((cfg) => {
                const prod = productos.find((p) => p.id === cfg.productoId);
                return (
                  <div
                    key={cfg.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {prod?.nombre ?? cfg.productoId}
                      </p>
                      <p className="text-sm text-gray-500">
                        Mínimo: {cfg.stockMinimo.toLocaleString("es", { maximumFractionDigits: 4 })}
                        {prod?.unidadMedidaSimbolo ? ` ${prod.unidadMedidaSimbolo}` : ""}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => onEliminar(cfg.productoId)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
