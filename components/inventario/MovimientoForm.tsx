"use client";

import { useState } from "react";
import { MovimientoFormData, TipoMovimiento, Producto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MovimientoFormProps {
  productos: Producto[];
  productoIdInicial?: string;
  onSubmit: (datos: MovimientoFormData) => Promise<boolean>;
  onCancel: () => void;
}

const TIPOS_MOVIMIENTO: { value: TipoMovimiento; label: string; descripcion: string }[] = [
  { value: "compra", label: "Compra", descripcion: "Entrada de stock por compra de insumos" },
  { value: "uso", label: "Uso en Receta", descripcion: "Salida de stock al usar en producción" },
  { value: "merma", label: "Merma / Desperdicio", descripcion: "Pérdida o desperdicio de insumo" },
  { value: "ajuste_entrada", label: "Ajuste (Entrada)", descripcion: "Corrección manual al aumentar stock" },
  { value: "ajuste_salida", label: "Ajuste (Salida)", descripcion: "Corrección manual al disminuir stock" },
];

export const MovimientoForm = ({
  productos,
  productoIdInicial,
  onSubmit,
  onCancel,
}: MovimientoFormProps) => {
  const [productoId, setProductoId] = useState(productoIdInicial ?? "");
  const [tipo, setTipo] = useState<TipoMovimiento>("compra");
  const [cantidad, setCantidad] = useState("");
  const [costoUnitario, setCostoUnitario] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const tipoInfo = TIPOS_MOVIMIENTO.find((t) => t.value === tipo);
  const esEntrada = tipo === "compra" || tipo === "ajuste_entrada";

  const validar = () => {
    const nuevosErrores: Record<string, string> = {};
    if (!productoId) nuevosErrores.productoId = "Selecciona un producto";
    if (!cantidad || parseFloat(cantidad) <= 0)
      nuevosErrores.cantidad = "La cantidad debe ser mayor a 0";
    return nuevosErrores;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nuevosErrores = validar();
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    setErrores({});
    setEnviando(true);

    const datos: MovimientoFormData = {
      productoId,
      tipo,
      cantidad: parseFloat(cantidad),
      costoUnitario: costoUnitario ? parseFloat(costoUnitario) : undefined,
      notas: notas || undefined,
      fecha: fecha ? new Date(fecha) : undefined,
    };

    const exito = await onSubmit(datos);
    if (exito) {
      setProductoId(productoIdInicial ?? "");
      setTipo("compra");
      setCantidad("");
      setCostoUnitario("");
      setFecha(new Date().toISOString().split("T")[0]);
      setNotas("");
    }
    setEnviando(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Registrar Movimiento de Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Producto */}
          <div>
            <Label htmlFor="productoId">Insumo / Producto *</Label>
            <select
              id="productoId"
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              className="w-full mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">-- Seleccionar producto --</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                  {p.unidadMedidaSimbolo ? ` (${p.unidadMedidaSimbolo})` : ""}
                </option>
              ))}
            </select>
            {errores.productoId && (
              <p className="text-red-500 text-xs mt-1">{errores.productoId}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <Label htmlFor="tipo">Tipo de Movimiento *</Label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoMovimiento)}
              className="w-full mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {TIPOS_MOVIMIENTO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {tipoInfo && (
              <p className="text-xs text-gray-500 mt-1">{tipoInfo.descripcion}</p>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <Label htmlFor="cantidad">Cantidad *</Label>
            <Input
              id="cantidad"
              type="number"
              step="0.0001"
              min="0.0001"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="mt-1"
              placeholder="0"
            />
            {errores.cantidad && (
              <p className="text-red-500 text-xs mt-1">{errores.cantidad}</p>
            )}
          </div>

          {/* Costo unitario (solo para compras y ajustes de entrada) */}
          {esEntrada && (
            <div>
              <Label htmlFor="costoUnitario">Costo Unitario (opcional)</Label>
              <Input
                id="costoUnitario"
                type="number"
                step="0.0001"
                min="0"
                value={costoUnitario}
                onChange={(e) => setCostoUnitario(e.target.value)}
                className="mt-1"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Costo por unidad de medida del producto
              </p>
            </div>
          )}

          {/* Fecha */}
          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Input
              id="notas"
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="mt-1"
              placeholder="Ej: Compra en supermercado, lote #123..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={enviando}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {enviando ? "Registrando..." : "Registrar Movimiento"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
