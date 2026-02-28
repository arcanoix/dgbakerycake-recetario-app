"use client";

import { useState } from "react";
import { MaterialReceta, Producto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMoneda, formatearNumero } from "@/lib/constants";
import { obtenerSimboloUnidad } from "@/lib/conversiones";

interface MaterialSelectorProps {
  productos: Producto[];
  materiales: MaterialReceta[];
  onAgregarMaterial: (productoId: string, cantidad: number) => void;
  onEliminarMaterial: (materialId: string) => void;
}

export const MaterialSelector = ({
  productos,
  materiales,
  onAgregarMaterial,
  onEliminarMaterial,
}: MaterialSelectorProps) => {
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState<number>(0);

  const handleAgregar = () => {
    if (productoSeleccionado && cantidad > 0) {
      onAgregarMaterial(productoSeleccionado, cantidad);
      setProductoSeleccionado("");
      setCantidad(0);
    }
  };

  const productoSeleccionadoData = productos.find(
    (p) => p.id === productoSeleccionado
  );

  const costoEstimado =
    productoSeleccionadoData && cantidad > 0
      ? productoSeleccionadoData.precioPorUnidad * cantidad
      : 0;

  return (
    <div className="space-y-4">
      {/* Selector de Material */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agregar Material/Insumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="producto">Producto *</Label>
              <Select
                id="producto"
                value={productoSeleccionado}
                onChange={(e) => setProductoSeleccionado(e.target.value)}
              >
                <option value="">Seleccionar producto</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} ({obtenerSimboloUnidad(producto.unidadMedida)})
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">
                Cantidad *
                {productoSeleccionadoData && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({obtenerSimboloUnidad(productoSeleccionadoData.unidadMedida)})
                  </span>
                )}
              </Label>
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
          </div>

          {costoEstimado > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Costo estimado:</p>
              <p className="text-lg font-bold text-primary">
                {formatearMoneda(costoEstimado, "USD")}
              </p>
            </div>
          )}

          <Button
            onClick={handleAgregar}
            disabled={!productoSeleccionado || cantidad <= 0}
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
                      {obtenerSimboloUnidad(material.unidadMedida)} •{" "}
                      {formatearMoneda(material.costoMaterial, "USD")}
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
                    "USD"
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
