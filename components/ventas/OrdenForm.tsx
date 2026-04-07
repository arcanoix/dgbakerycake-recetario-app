"use client";

import { useState, useEffect } from "react";
import { Orden, OrdenFormData, OrdenItemFormData, EstadoOrden, Cliente, Receta } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2 } from "lucide-react";
import { formatearUSD } from "@/lib/currency";

interface OrdenFormProps {
  orden?: Orden;
  clientes: Cliente[];
  recetas: Receta[];
  onGuardar: (datos: OrdenFormData) => Promise<boolean>;
  onCancelar: () => void;
}

const ESTADOS: { value: EstadoOrden; label: string }[] = [
  { value: "cotizacion", label: "Cotización" },
  { value: "confirmada", label: "Confirmada" },
  { value: "entregada", label: "Entregada" },
  { value: "cancelada", label: "Cancelada" },
];

export const OrdenForm = ({ orden, clientes, recetas, onGuardar, onCancelar }: OrdenFormProps) => {
  const [clienteId, setClienteId] = useState(orden?.clienteId || "");
  const [estado, setEstado] = useState<EstadoOrden>(orden?.estado || "cotizacion");
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(orden?.descuentoPorcentaje || 0);
  const [pagoAdelantado, setPagoAdelantado] = useState(orden?.pagoAdelantado || 0);
  const [notas, setNotas] = useState(orden?.notas || "");
  const [fechaEntrega, setFechaEntrega] = useState(
    orden?.fechaEntrega ? orden.fechaEntrega.toISOString().split("T")[0] : ""
  );
  const [items, setItems] = useState<OrdenItemFormData[]>(
    orden?.items.map(i => ({
      recetaId: i.recetaId,
      nombreItem: i.nombreItem,
      cantidad: i.cantidad,
      precioUnitario: i.precioUnitario,
      notas: i.notas,
    })) || []
  );

  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Calculated totals
  const subtotal = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
  const descuentoMonto = subtotal * (descuentoPorcentaje / 100);
  const total = subtotal - descuentoMonto;
  const saldoPendiente = total - pagoAdelantado;

  const agregarItem = () => {
    setItems([...items, { nombreItem: "", cantidad: 1, precioUnitario: 0 }]);
  };

  const actualizarItem = (index: number, campo: keyof OrdenItemFormData, valor: any) => {
    const nuevosItems = [...items];
    if (campo === "recetaId" && valor) {
      const receta = recetas.find(r => r.id === valor);
      if (receta) {
        nuevosItems[index] = {
          ...nuevosItems[index],
          recetaId: valor,
          nombreItem: receta.nombre,
          precioUnitario: receta.precioVentaSugerido || receta.costoTotal || 0,
        };
        setItems(nuevosItems);
        return;
      }
    }
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    setItems(nuevosItems);
  };

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    if (!clienteId) nuevosErrores.clienteId = "Selecciona un cliente";
    if (items.length === 0) nuevosErrores.items = "Agrega al menos un artículo";
    items.forEach((item, i) => {
      if (!item.nombreItem.trim()) nuevosErrores[`item_${i}_nombre`] = "Nombre requerido";
      if (item.cantidad <= 0) nuevosErrores[`item_${i}_cantidad`] = "Cantidad inválida";
      if (item.precioUnitario < 0) nuevosErrores[`item_${i}_precio`] = "Precio inválido";
    });
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    setGuardando(true);
    const datos: OrdenFormData = {
      clienteId,
      estado,
      items,
      descuentoPorcentaje,
      pagoAdelantado,
      notas: notas.trim() || undefined,
      fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : undefined,
    };

    const exito = await onGuardar(datos);
    setGuardando(false);
    if (exito) onCancelar();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">
          {orden ? `Editar ${orden.numeroOrden}` : "Nueva Orden / Cotización"}
        </CardTitle>
        <button onClick={onCancelar} className="p-1 rounded hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cliente + Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="clienteId">Cliente *</Label>
              <Select
                id="clienteId"
                value={clienteId}
                onChange={e => setClienteId(e.target.value)}
              >
                <option value="">Selecciona un cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </Select>
              {errores.clienteId && <p className="text-sm text-red-500">{errores.clienteId}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="estado">Estado</Label>
              <Select
                id="estado"
                value={estado}
                onChange={e => setEstado(e.target.value as EstadoOrden)}
              >
                {ESTADOS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Fecha de entrega */}
          <div className="space-y-1">
            <Label htmlFor="fechaEntrega">Fecha de Entrega</Label>
            <Input
              id="fechaEntrega"
              type="date"
              value={fechaEntrega}
              onChange={e => setFechaEntrega(e.target.value)}
            />
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Artículos *</Label>
              <Button type="button" size="sm" variant="outline" onClick={agregarItem}>
                <Plus className="w-4 h-4 mr-1" /> Agregar
              </Button>
            </div>

            {errores.items && <p className="text-sm text-red-500">{errores.items}</p>}

            {items.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4 border border-dashed rounded-lg">
                Sin artículos. Haz clic en "Agregar" para comenzar.
              </p>
            )}

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-2">
                  {/* Receta selector */}
                  <div className="space-y-1">
                    <Label className="text-xs">Receta (opcional)</Label>
                    <Select
                      value={item.recetaId || ""}
                      onChange={e => actualizarItem(index, "recetaId", e.target.value || undefined)}
                    >
                      <option value="">Artículo personalizado...</option>
                      {recetas.map(r => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Nombre *</Label>
                      <Input
                        value={item.nombreItem}
                        onChange={e => actualizarItem(index, "nombreItem", e.target.value)}
                        placeholder="Nombre del artículo"
                        className="text-sm"
                      />
                      {errores[`item_${index}_nombre`] && (
                        <p className="text-xs text-red-500">{errores[`item_${index}_nombre`]}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cantidad *</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.cantidad}
                        onChange={e => actualizarItem(index, "cantidad", parseFloat(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Precio Unit. (USD)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.precioUnitario}
                        onChange={e => actualizarItem(index, "precioUnitario", parseFloat(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Subtotal: <strong>{formatearUSD(item.cantidad * item.precioUnitario)}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => eliminarItem(index)}
                      className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount + Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="descuento">Descuento (%)</Label>
              <Input
                id="descuento"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={descuentoPorcentaje}
                onChange={e => setDescuentoPorcentaje(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pagoAdelantado">Pago Adelantado (USD)</Label>
              <Input
                id="pagoAdelantado"
                type="number"
                min="0"
                step="0.01"
                value={pagoAdelantado}
                onChange={e => setPagoAdelantado(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Summary box */}
          {items.length > 0 && (
            <div className="bg-violet-50 dark:bg-violet-950/20 rounded-lg p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatearUSD(subtotal)}</span>
              </div>
              {descuentoPorcentaje > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento ({descuentoPorcentaje}%)</span>
                  <span>-{formatearUSD(descuentoMonto)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-violet-100 dark:border-violet-900 pt-1.5">
                <span>Total</span>
                <span>{formatearUSD(total)}</span>
              </div>
              {pagoAdelantado > 0 && (
                <>
                  <div className="flex justify-between text-blue-600">
                    <span>Pago Adelantado</span>
                    <span>-{formatearUSD(pagoAdelantado)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-orange-600">
                    <span>Saldo Pendiente</span>
                    <span>{formatearUSD(Math.max(0, saldoPendiente))}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notas */}
          <div className="space-y-1">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Instrucciones especiales, detalles de entrega..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
            >
              {guardando ? "Guardando..." : orden ? "Actualizar Orden" : "Crear Orden"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancelar} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
