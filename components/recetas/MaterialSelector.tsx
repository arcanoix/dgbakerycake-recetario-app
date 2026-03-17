"use client";

import { useState, useEffect } from "react";
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

interface MaterialSelectorProps {
  productos: Producto[];
  materiales: MaterialReceta[];
  onAgregarMaterial: (productoId: string, cantidad: number, unidadId: string) => void;
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
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState<number>(0);
  const [unidadSeleccionadaId, setUnidadSeleccionadaId] = useState("");

  // Datos del producto seleccionado
  const productoSeleccionadoData = productos.find(
    (p) => p.id === productoSeleccionado
  );

  /**
   * Busca la unidad en la lista local por ID o por nombre/símbolo.
   * Necesario porque productos viejos guardan el nombre ('unidad', 'gramos')
   * mientras que los nuevos guardan el UUID.
   */
  const buscarUnidad = (valor: string): UnidadMedidaAdmin | undefined => {
    if (!valor) return undefined;
    return (
      unidades.find((u) => u.id === valor) ||
      unidades.find((u) => u.nombre.toLowerCase() === valor.toLowerCase()) ||
      unidades.find((u) => u.simbolo.toLowerCase() === valor.toLowerCase())
    );
  };

  // Unidad base del producto seleccionado
  const unidadProducto = productoSeleccionadoData
    ? buscarUnidad(productoSeleccionadoData.unidadMedida)
    : undefined;

  // Unidades compatibles: mismo tipo que la unidad del producto
  const unidadesCompatibles: UnidadMedidaAdmin[] = unidadProducto
    ? unidades.filter((u) => u.activo && u.tipo === unidadProducto.tipo)
    : [];

  // Cuando cambia el producto, setear la unidad por defecto a la del producto
  useEffect(() => {
    if (unidadProducto) {
      setUnidadSeleccionadaId(unidadProducto.id);
    } else {
      setUnidadSeleccionadaId("");
    }
    setCantidad(0);
  }, [productoSeleccionado, unidadProducto?.id]);

  const obtenerSimboloUnidad = (unidadId: string): string => {
    const unidad = buscarUnidad(unidadId);
    return unidad?.simbolo || unidadId;
  };

  const unidadSeleccionadaData = unidades.find(
    (u) => u.id === unidadSeleccionadaId
  );

  // Costo estimado con conversión
  const costoEstimado = (() => {
    if (!productoSeleccionadoData || cantidad <= 0) return 0;
    const calculo = calcularCostoMaterialConConversion(
      productoSeleccionadoData,
      cantidad,
      unidadSeleccionadaData ?? null,
      unidadProducto ?? null
    );
    return calculo.costoCalculado;
  })();

  const handleAgregar = () => {
    if (productoSeleccionado && cantidad > 0 && unidadSeleccionadaId) {
      onAgregarMaterial(productoSeleccionado, cantidad, unidadSeleccionadaId);
      setProductoSeleccionado("");
      setCantidad(0);
      setUnidadSeleccionadaId("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de Material */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agregar Material/Insumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fila 1: Producto */}
          <div className="space-y-2">
            <Label htmlFor="producto">Producto *</Label>
            <Select
              id="producto"
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
            >
              <option value="">Seleccionar producto</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre}{" "}
                  ({obtenerSimboloUnidad(producto.unidadMedida)})
                </option>
              ))}
            </Select>
          </div>

          {/* Fila 2: Cantidad + Unidad (en la misma fila) */}
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
                disabled={!productoSeleccionado}
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
                disabled={!productoSeleccionado || unidadesCompatibles.length === 0}
              >
                {!productoSeleccionado && (
                  <option value="">— Seleccionar primero un producto —</option>
                )}
                {productoSeleccionado && unidadesCompatibles.length === 0 && (
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

          {/* Indicador de conversión si aplica */}
          {productoSeleccionadoData &&
            unidadSeleccionadaData &&
            unidadProducto &&
            unidadSeleccionadaData.id !== unidadProducto.id &&
            cantidad > 0 && (
              <div className="p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Conversión automática:</span>{" "}
                {formatearNumero(cantidad, 2)} {unidadSeleccionadaData.simbolo} →{" "}
                {formatearNumero(
                  (() => {
                    const f1 = unidadSeleccionadaData.factorConversionBase ?? 1;
                    const f2 = unidadProducto.factorConversionBase ?? 1;
                    return (cantidad * f1) / f2;
                  })(),
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
            disabled={!productoSeleccionado || cantidad <= 0 || !unidadSeleccionadaId}
            className="w-full"
          >
            + Agregar Material
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Materiales */}
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
                    <p className="font-medium">{material.nombreProducto}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatearNumero(material.cantidadUtilizada)}{" "}
                      {material.unidadMedidaSimbolo ?? obtenerSimboloUnidad(material.unidadMedida)} •{" "}
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
