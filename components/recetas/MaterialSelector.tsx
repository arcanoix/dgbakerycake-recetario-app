"use client";

import { useState, useEffect, useRef } from "react";
import { MaterialReceta, Producto, UnidadMedidaAdmin } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda, formatearNumero } from "@/lib/constants";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { useUnidades } from "@/hooks/useUnidades";
import { calcularCostoMaterialConConversion } from "@/lib/calculations";

// ID especial que indica "producto personalizado"
const PRODUCTO_OTRO_ID = "__OTRO__";

interface MaterialSelectorProps {
  productos: Producto[];
  materiales: MaterialReceta[];
  onAgregarMaterial: (
    productoId: string,
    cantidad: number,
    unidadId: string,
    otroNombre?: string,
    otroPrecio?: number
  ) => void;
  onEliminarMaterial: (materialId: string) => void;
}

export const MaterialSelector = ({
  productos,
  materiales,
  onAgregarMaterial,
  onEliminarMaterial,
}: MaterialSelectorProps) => {
  const { configuracion } = useConfiguracion();
  const { unidades } = useUnidades();

  // ── Estado del Combobox buscable ──────────────────────────────────────
  const [busqueda, setBusqueda] = useState("");
  const [comboAbierto, setComboAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const comboRef = useRef<HTMLDivElement>(null);

  // ── Estado campos principales ─────────────────────────────────────────
  const [cantidad, setCantidad] = useState<number>(0);
  const [unidadSeleccionadaId, setUnidadSeleccionadaId] = useState("");

  // ── Estado para "Otro" (producto personalizado) ───────────────────────
  const [otroNombre, setOtroNombre] = useState("");
  const [otroPrecio, setOtroPrecio] = useState<number>(0);

  // ── Cerrar combo al hacer clic fuera ─────────────────────────────────
  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setComboAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  // ── Productos filtrados por búsqueda ──────────────────────────────────
  const productosFiltrados = busqueda.trim()
    ? productos.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase().trim())
      )
    : productos;

  const esOtro = productoSeleccionado === PRODUCTO_OTRO_ID;

  /**
   * Busca la unidad en la lista local por ID, nombre o símbolo.
   * Compatible con productos viejos (nombre de texto) y nuevos (UUID).
   */
  const buscarUnidad = (valor: string): UnidadMedidaAdmin | undefined => {
    if (!valor) return undefined;
    return (
      unidades.find((u) => u.id === valor) ||
      unidades.find((u) => u.nombre.toLowerCase() === valor.toLowerCase()) ||
      unidades.find((u) => u.simbolo.toLowerCase() === valor.toLowerCase())
    );
  };

  // ── Datos derivados del producto seleccionado ─────────────────────────
  const productoSeleccionadoData = productos.find(
    (p) => p.id === productoSeleccionado
  );
  const unidadProducto = productoSeleccionadoData
    ? buscarUnidad(productoSeleccionadoData.unidadMedida)
    : undefined;

  const unidadesCompatibles: UnidadMedidaAdmin[] = unidadProducto
    ? unidades.filter((u) => u.activo && u.tipo === unidadProducto.tipo)
    : [];

  const unidadSeleccionadaData = unidades.find(
    (u) => u.id === unidadSeleccionadaId
  );

  // ── Resetear campos al cambiar de producto ────────────────────────────
  useEffect(() => {
    setCantidad(0);
    setUnidadSeleccionadaId(unidadProducto?.id ?? "");
    setOtroNombre("");
    setOtroPrecio(0);
  }, [productoSeleccionado, unidadProducto?.id]);

  // ── Costo estimado ────────────────────────────────────────────────────
  const costoEstimado = (() => {
    if (cantidad <= 0) return 0;

    if (esOtro) {
      // Para "Otro": precio ingresado × cantidad
      return otroPrecio * cantidad;
    }

    if (!productoSeleccionadoData) return 0;
    const calculo = calcularCostoMaterialConConversion(
      productoSeleccionadoData,
      cantidad,
      unidadSeleccionadaData ?? null,
      unidadProducto ?? null
    );
    return calculo.costoCalculado;
  })();

  // ── Seleccionar producto desde el combo ───────────────────────────────
  const seleccionarProducto = (id: string, nombre: string) => {
    setProductoSeleccionado(id);
    setBusqueda(id === PRODUCTO_OTRO_ID ? "Otro (personalizado)" : nombre);
    setComboAbierto(false);
  };

  // ── Obtener símbolo de unidad ─────────────────────────────────────────
  const obtenerSimboloUnidad = (unidadId: string): string => {
    const unidad = buscarUnidad(unidadId);
    return unidad?.simbolo || unidadId;
  };

  // ── Validación para habilitar el botón ───────────────────────────────
  const puedeAgregar = (() => {
    if (cantidad <= 0) return false;
    if (esOtro) return otroNombre.trim().length > 0 && otroPrecio > 0;
    return productoSeleccionado !== "" && unidadSeleccionadaId !== "";
  })();

  // ── Agregar material ──────────────────────────────────────────────────
  const handleAgregar = () => {
    if (!puedeAgregar) return;
    onAgregarMaterial(
      esOtro ? PRODUCTO_OTRO_ID : productoSeleccionado,
      cantidad,
      esOtro ? "" : unidadSeleccionadaId,
      esOtro ? otroNombre : undefined,
      esOtro ? otroPrecio : undefined
    );
    // Reset
    setProductoSeleccionado("");
    setBusqueda("");
    setCantidad(0);
    setUnidadSeleccionadaId("");
    setOtroNombre("");
    setOtroPrecio(0);
  };

  return (
    <div className="space-y-4">
      {/* ── Formulario ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agregar Material/Insumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Combobox buscable de producto */}
          <div className="space-y-2">
            <Label htmlFor="busqueda-producto">Producto *</Label>
            <div className="relative" ref={comboRef}>
              <Input
                id="busqueda-producto"
                placeholder="Buscar producto..."
                value={busqueda}
                autoComplete="off"
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setProductoSeleccionado("");
                  setComboAbierto(true);
                }}
                onFocus={() => setComboAbierto(true)}
              />

              {/* Dropdown de opciones */}
              {comboAbierto && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-background shadow-lg max-h-60 overflow-y-auto">
                  {/* Opción: Otro */}
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 border-b border-dashed border-muted-foreground/30"
                    onClick={() => seleccionarProducto(PRODUCTO_OTRO_ID, "Otro")}
                  >
                    <span className="text-base">✏️</span>
                    <span className="font-medium">Otro (ingrediente personalizado)</span>
                  </button>

                  {/* Lista de productos filtrados */}
                  {productosFiltrados.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No se encontraron productos
                    </div>
                  ) : (
                    productosFiltrados.map((producto) => (
                      <button
                        key={producto.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => seleccionarProducto(producto.id, producto.nombre)}
                      >
                        <span className="font-medium">{producto.nombre}</span>
                        <span className="ml-2 text-muted-foreground text-xs">
                          ({obtenerSimboloUnidad(producto.unidadMedida)})
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Campos para "Otro" ──────────────────────────────────── */}
          {esOtro && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="otro-nombre">
                  ¿Qué ingrediente es? *
                </Label>
                <Input
                  id="otro-nombre"
                  placeholder="Ej: Fondant importado, Flores comestibles..."
                  value={otroNombre}
                  onChange={(e) => setOtroNombre(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otro-precio">Precio *</Label>
                <Input
                  id="otro-precio"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={otroPrecio || ""}
                  onChange={(e) => setOtroPrecio(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otro-cantidad">Cantidad *</Label>
                <Input
                  id="otro-cantidad"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1"
                  value={cantidad || ""}
                  onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {/* ── Campos para producto de BD ──────────────────────────── */}
          {productoSeleccionado && !esOtro && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={cantidad || ""}
                  onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidad">
                  Unidad *
                  {unidadProducto && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (base: {unidadProducto.simbolo})
                    </span>
                  )}
                </Label>
                <Select
                  id="unidad"
                  value={unidadSeleccionadaId}
                  onChange={(e) => setUnidadSeleccionadaId(e.target.value)}
                  disabled={unidadesCompatibles.length === 0}
                >
                  {unidadesCompatibles.length === 0 && (
                    <option value="">— Sin unidades compatibles —</option>
                  )}
                  {unidadesCompatibles.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.simbolo})
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {/* Banner de conversión automática */}
          {productoSeleccionadoData &&
            !esOtro &&
            unidadSeleccionadaData &&
            unidadProducto &&
            unidadSeleccionadaData.id !== unidadProducto.id &&
            cantidad > 0 && (
              <div className="p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Conversión automática:</span>{" "}
                {formatearNumero(cantidad, 2)} {unidadSeleccionadaData.simbolo} →{" "}
                {formatearNumero(
                  (cantidad * (unidadSeleccionadaData.factorConversionBase ?? 1)) /
                    (unidadProducto.factorConversionBase ?? 1),
                  4
                )}{" "}
                {unidadProducto.simbolo}
              </div>
            )}

          {/* Costo estimado */}
          {costoEstimado > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Costo estimado:</p>
              <p className="text-lg font-bold text-primary">
                {formatearMoneda(costoEstimado, configuracion?.moneda)}
              </p>
            </div>
          )}

          <Button
            onClick={handleAgregar}
            disabled={!puedeAgregar}
            className="w-full"
          >
            + Agregar Material
          </Button>
        </CardContent>
      </Card>

      {/* ── Lista de materiales agregados ────────────────────────────────── */}
      {materiales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Materiales de la Receta ({materiales.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {materiales.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{material.nombreProducto}</p>
                      {material.productoId === PRODUCTO_OTRO_ID && (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium">
                          personalizado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatearNumero(material.cantidadUtilizada)}{" "}
                      {material.unidadMedidaSimbolo
                        ? material.unidadMedidaSimbolo
                        : material.productoId !== PRODUCTO_OTRO_ID
                        ? obtenerSimboloUnidad(material.unidadMedida)
                        : "u"}{" "}
                      •{" "}
                      {formatearMoneda(material.costoMaterial, configuracion?.moneda)}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onEliminarMaterial(material.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Materiales:</span>
                <span className="text-lg font-bold text-primary">
                  {formatearMoneda(
                    materiales.reduce((sum, m) => sum + m.costoMaterial, 0),
                    configuracion?.moneda
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
