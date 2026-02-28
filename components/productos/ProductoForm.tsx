"use client";

import { useState, useEffect } from "react";
import { Producto, ProductoFormData, UnidadMedida } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OPCIONES_UNIDADES, CATEGORIAS_PRODUCTOS } from "@/lib/constants";
import { calcularPrecioPorUnidad } from "@/lib/calculations";
import { formatearMoneda } from "@/lib/constants";
import { useConfiguracion } from "@/hooks/useConfiguracion";

interface ProductoFormProps {
  producto?: Producto;
  onSubmit: (datos: ProductoFormData) => void;
  onCancel?: () => void;
}

export const ProductoForm = ({ producto, onSubmit, onCancel }: ProductoFormProps) => {
  const { configuracion } = useConfiguracion();
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: "",
    precioTotal: 0,
    cantidadTotal: 0,
    unidadMedida: UnidadMedida.GRAMOS,
    categoria: "",
    proveedor: "",
    notas: "",
  });

  const [precioPorUnidad, setPrecioPorUnidad] = useState(0);

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        precioTotal: producto.precioTotal,
        cantidadTotal: producto.cantidadTotal,
        unidadMedida: producto.unidadMedida,
        categoria: producto.categoria,
        proveedor: producto.proveedor,
        notas: producto.notas,
      });
    }
  }, [producto]);

  useEffect(() => {
    if (formData.precioTotal > 0 && formData.cantidadTotal > 0) {
      const precio = calcularPrecioPorUnidad(formData.precioTotal, formData.cantidadTotal);
      setPrecioPorUnidad(precio);
    } else {
      setPrecioPorUnidad(0);
    }
  }, [formData.precioTotal, formData.cantidadTotal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "precioTotal" || name === "cantidadTotal" 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{producto ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Producto *</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Harina de trigo"
                required
              />
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
              >
                <option value="">Seleccionar categoría</option>
                {CATEGORIAS_PRODUCTOS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            {/* Precio Total */}
            <div className="space-y-2">
              <Label htmlFor="precioTotal">Precio Total *</Label>
              <Input
                id="precioTotal"
                name="precioTotal"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.precioTotal || ""}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            {/* Cantidad Total */}
            <div className="space-y-2">
              <Label htmlFor="cantidadTotal">Cantidad Total *</Label>
              <Input
                id="cantidadTotal"
                name="cantidadTotal"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.cantidadTotal || ""}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            {/* Unidad de Medida */}
            <div className="space-y-2">
              <Label htmlFor="unidadMedida">Unidad de Medida *</Label>
              <Select
                id="unidadMedida"
                name="unidadMedida"
                value={formData.unidadMedida}
                onChange={handleChange}
                required
              >
                {OPCIONES_UNIDADES.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Proveedor */}
            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                placeholder="Nombre del proveedor"
              />
            </div>
          </div>

          {/* Precio por Unidad (Calculado) */}
          {precioPorUnidad > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Precio por Unidad (Calculado)</p>
              <p className="text-2xl font-bold text-primary">
                {formatearMoneda(precioPorUnidad, configuracion?.moneda)}
              </p>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              placeholder="Notas adicionales sobre el producto"
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit">
              {producto ? "Actualizar" : "Crear"} Producto
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
