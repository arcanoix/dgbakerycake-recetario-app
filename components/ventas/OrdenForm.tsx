"use client";

import { useState, useEffect } from "react";
import { Orden, OrdenFormData, OrdenItemFormData, EstadoOrden, Cliente, Receta } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const formatDateTimeLocal = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const OrdenForm = ({ orden, clientes, recetas, onGuardar, onCancelar }: OrdenFormProps) => {
  const [clienteId, setClienteId] = useState(orden?.clienteId || "");
  const [estado, setEstado] = useState<EstadoOrden>(orden?.estado || "cotizacion");
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(orden?.descuentoPorcentaje || 0);
  const [pagoAdelantado, setPagoAdelantado] = useState(orden?.pagoAdelantado || 0);
  const [notas, setNotas] = useState(orden?.notas || "");
  const [fechaEntrega, setFechaEntrega] = useState(
    orden?.fechaEntrega ? formatDateTimeLocal(orden.fechaEntrega) : ""
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
    
    // Validar que la fecha de entrega no sea en el pasado
    if (fechaEntrega) {
      const fechaSeleccionada = new Date(fechaEntrega);
      const ahora = new Date();
      if (fechaSeleccionada < ahora) {
        nuevosErrores.fechaEntrega = "La fecha de entrega no puede ser en el pasado";
      }
    }
    
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
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cliente + Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="clienteId">Cliente *</Label>
              <Select
                value={clienteId}
                onValueChange={(value) => setClienteId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errores.clienteId && <p className="text-sm text-red-500">{errores.clienteId}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={estado}
                onValueChange={(value) => setEstado(value as EstadoOrden)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fecha de entrega */}
          <div className="space-y-1">
            <Label htmlFor="fechaEntrega">Fecha y Hora de Entrega</Label>
            <Input
              id="fechaEntrega"
              type="datetime-local"
              value={fechaEntrega}
              onChange={e => setFechaEntrega(e.target.value)}
              min={formatDateTimeLocal(new Date())}
            />
            {errores.fechaEntrega && <p className="text-sm text-destructive">{errores.fechaEntrega}</p>}
            <p className="text-xs text-muted-foreground">La fecha debe ser hoy o posterior</p>
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
              <p className="text-sm text-gray-700 text-center py-4 border border-dashed rounded-lg">
                Sin artículos. Haz clic en "Agregar" para comenzar.
              </p>
            )}

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50/50 space-y-2">
                  {/* Receta selector */}
                  <div className="space-y-1">
                    <Label className="text-xs">Receta (opcional)</Label>
                    <Select
                      value={item.recetaId || ""}
                      onValueChange={(value) => actualizarItem(index, "recetaId", value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Artículo personalizado..." />
                      </SelectTrigger>
                      <SelectContent>
                        {recetas.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>
                        ))}
                      </SelectContent>
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
                    <span className="text-xs text-gray-700">
                      Subtotal: <strong>{formatearUSD(item.cantidad * item.precioUnitario)}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => eliminarItem(index)}
                      className="p-1 rounded hover:bg-red-50 text-gray-700 hover:text-red-500 transition-colors"
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
            <div className="bg-violet-50/20 rounded-lg p-4 space-y-1.5 text-sm">
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
              <div className="flex justify-between font-bold border-t border-violet-100 pt-1.5">
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
