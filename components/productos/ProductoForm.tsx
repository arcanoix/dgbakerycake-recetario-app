"use client";

import { useState, useEffect } from "react";
import { Producto, ProductoFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIAS_PRODUCTOS } from "@/lib/constants";
import { calcularPrecioPorUnidad } from "@/lib/calculations";
import { formatearMoneda } from "@/lib/constants";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { useUnidades } from "@/hooks/useUnidades";

interface ProductoFormProps {
  producto?: Producto;
  onSubmit: (datos: ProductoFormData) => Promise<void>;
  onCancel?: () => void;
}

export const ProductoForm = ({ producto, onSubmit, onCancel }: ProductoFormProps) => {
  const { configuracion } = useConfiguracion();
  const { unidades, obtenerUnidadesActivas } = useUnidades();
  const unidadesActivas = obtenerUnidadesActivas();
  
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: "",
    precioTotal: 0,
    tamañoPresentacion: 0,
    cantidadPresentaciones: 0,
    unidadMedida: "",
    categoria: "",
    proveedor: "",
    notas: "",
  });
  
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<string>("");

  const [precioPorUnidad, setPrecioPorUnidad] = useState(0);
  const [precioPorPresentacion, setPrecioPorPresentacion] = useState(0);
  const [cantidadTotal, setCantidadTotal] = useState(0);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        precioTotal: producto.precioTotal,
        tamañoPresentacion: producto.tamañoPresentacion,
        cantidadPresentaciones: producto.cantidadPresentaciones,
        unidadMedida: producto.unidadMedida,
        categoria: producto.categoria,
        proveedor: producto.proveedor,
        notas: producto.notas,
      });
      setUnidadSeleccionada(producto.unidadMedida);
    } else if (unidadesActivas.length > 0 && !formData.unidadMedida) {
      // Establecer primera unidad activa como predeterminada
      const primeraUnidad = unidadesActivas[0];
      setFormData(prev => ({ ...prev, unidadMedida: primeraUnidad.id }));
      setUnidadSeleccionada(primeraUnidad.id);
    }
  }, [producto, unidadesActivas]);

  // Calcular valores automáticamente
  useEffect(() => {
    const { tamañoPresentacion, cantidadPresentaciones, precioTotal } = formData;
    
    if (tamañoPresentacion > 0 && cantidadPresentaciones > 0) {
      // Calcular cantidad total
      const total = tamañoPresentacion * cantidadPresentaciones;
      setCantidadTotal(total);
      
      if (precioTotal > 0) {
        // Calcular precio por unidad base
        const precioUnidad = precioTotal / total;
        setPrecioPorUnidad(precioUnidad);
        
        // Calcular precio por presentación
        const precioPresentacion = precioTotal / cantidadPresentaciones;
        setPrecioPorPresentacion(precioPresentacion);
      } else {
        setPrecioPorUnidad(0);
        setPrecioPorPresentacion(0);
      }
    } else {
      setCantidadTotal(0);
      setPrecioPorUnidad(0);
      setPrecioPorPresentacion(0);
    }
  }, [formData.tamañoPresentacion, formData.cantidadPresentaciones, formData.precioTotal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await onSubmit(formData);
    } finally {
      setGuardando(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "precioTotal" || name === "tamañoPresentacion" || name === "cantidadPresentaciones"
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

            {/* Tamaño de Presentación */}
            <div className="space-y-2">
              <Label htmlFor="tamañoPresentacion">Tamaño de Presentación *</Label>
              <Input
                id="tamañoPresentacion"
                name="tamañoPresentacion"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.tamañoPresentacion || ""}
                onChange={handleChange}
                placeholder="Ej: 900 (para 900g)"
                required
              />
              <p className="text-xs text-muted-foreground">
                Tamaño de una unidad/paquete individual
              </p>
            </div>

            {/* Cantidad de Presentaciones */}
            <div className="space-y-2">
              <Label htmlFor="cantidadPresentaciones">Cantidad de Presentaciones *</Label>
              <Input
                id="cantidadPresentaciones"
                name="cantidadPresentaciones"
                type="number"
                step="1"
                min="1"
                value={formData.cantidadPresentaciones || ""}
                onChange={handleChange}
                placeholder="Ej: 3 (tres bolsas)"
                required
              />
              <p className="text-xs text-muted-foreground">
                Número de unidades/paquetes comprados
              </p>
            </div>

            {/* Unidad de Medida */}
            <div className="space-y-2">
              <Label htmlFor="unidadMedida">Unidad de Medida *</Label>
              <Select
                id="unidadMedida"
                name="unidadMedida"
                value={formData.unidadMedida}
                onChange={(e) => {
                  handleChange(e);
                  setUnidadSeleccionada(e.target.value);
                }}
                required
              >
                <option value="">Seleccionar unidad...</option>
                {unidadesActivas.map((unidad) => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.nombre} ({unidad.simbolo})
                  </option>
                ))}
              </Select>
              {unidadesActivas.length === 0 && (
                <p className="text-xs text-destructive">
                  No hay unidades disponibles. Por favor, crea al menos una unidad primero.
                </p>
              )}
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

          {/* Valores Calculados */}
          {cantidadTotal > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">Cantidad Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {cantidadTotal.toFixed(2)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {formData.tamañoPresentacion} × {formData.cantidadPresentaciones}
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Precio por Presentación</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatearMoneda(precioPorPresentacion, configuracion?.moneda)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Por unidad/paquete
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-800">Precio por Unidad Base</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatearMoneda(precioPorUnidad, configuracion?.moneda)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Por {unidadesActivas.find(u => u.id === unidadSeleccionada)?.simbolo || 'unidad'}
                </p>
              </div>
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
              <Button type="button" variant="outline" onClick={onCancel} disabled={guardando}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={guardando}>
              {guardando ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {producto ? "Actualizando..." : "Creando..."}
                </span>
              ) : (
                `${producto ? "Actualizar" : "Crear"} Producto`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
