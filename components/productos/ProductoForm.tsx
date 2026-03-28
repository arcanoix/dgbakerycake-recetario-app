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
import { formatearMoneda } from "@/lib/constants";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { useUnidades } from "@/hooks/useUnidades";
import { motion } from "motion/react";
import { Package, Scale, ShoppingCart, DollarSign, Building2, FileText, Calculator, ArrowRight, Check } from "lucide-react";

interface ProductoFormProps {
  producto?: Producto;
  onSubmit: (datos: ProductoFormData) => Promise<void>;
  onCancel?: () => void;
}

export const ProductoForm = ({ producto, onSubmit, onCancel }: ProductoFormProps) => {
  const { configuracion } = useConfiguracion();
  const { unidades, obtenerUnidadesActivas } = useUnidades();
  const unidadesActivas = obtenerUnidadesActivas();
  const tasaCambio = configuracion?.tasaCambioUSD || 50;
  
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
    } else {
      // Resetear formulario cuando no hay producto (modo creación)
      const primeraUnidad = unidadesActivas.length > 0 ? unidadesActivas[0].id : "";
      setFormData({
        nombre: "",
        precioTotal: 0,
        tamañoPresentacion: 0,
        cantidadPresentaciones: 0,
        unidadMedida: primeraUnidad,
        categoria: "",
        proveedor: "",
        notas: "",
      });
      setUnidadSeleccionada(primeraUnidad);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto]);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500" />
        
        <CardHeader className="pb-6 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            {producto ? "Editar Producto" : "Nuevo Producto"}
          </CardTitle>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {producto ? "Actualiza los detalles del producto" : "Registra un nuevo producto para gestionar tus costos"}
          </p>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium flex items-center gap-2">
                  <Package className="w-4 h-4 text-violet-500" />
                  Nombre del Producto *
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Harina de trigo"
                  required
                  className="h-11 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-sm font-medium flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-500" />
                  Categoría
                </Label>
                <Select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="h-11"
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
                <Label htmlFor="precioTotal" className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Precio Total *
                </Label>
                <div className="relative">
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
                    className="h-11 pl-10 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                </div>
              </div>

              {/* Proveedor */}
              <div className="space-y-2">
                <Label htmlFor="proveedor" className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Proveedor
                </Label>
                <Input
                  id="proveedor"
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                  placeholder="Nombre del proveedor"
                  className="h-11 border-gray-200 dark:border-gray-700"
                />
              </div>

              {/* Tamaño de Presentación */}
              <div className="space-y-2">
                <Label htmlFor="tamañoPresentacion" className="text-sm font-medium flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-500" />
                  Tamaño de Presentación *
                </Label>
                <Input
                  id="tamañoPresentacion"
                  name="tamañoPresentacion"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.tamañoPresentacion || ""}
                  onChange={handleChange}
                  placeholder="Ej: 900"
                  required
                  className="h-11 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tamaño de una unidad/paquete individual
                </p>
              </div>

              {/* Cantidad de Presentaciones */}
              <div className="space-y-2">
                <Label htmlFor="cantidadPresentaciones" className="text-sm font-medium flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-500" />
                  Cantidad de Presentaciones *
                </Label>
                <Input
                  id="cantidadPresentaciones"
                  name="cantidadPresentaciones"
                  type="number"
                  step="1"
                  min="1"
                  value={formData.cantidadPresentaciones || ""}
                  onChange={handleChange}
                  placeholder="Ej: 3"
                  required
                  className="h-11 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Número de unidades/paquetes comprados
                </p>
              </div>

              {/* Unidad de Medida */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="unidadMedida" className="text-sm font-medium flex items-center gap-2">
                  <Scale className="w-4 h-4 text-violet-500" />
                  Unidad de Medida *
                </Label>
                <Select
                  id="unidadMedida"
                  name="unidadMedida"
                  value={formData.unidadMedida}
                  onChange={(e) => {
                    handleChange(e);
                    setUnidadSeleccionada(e.target.value);
                  }}
                  required
                  className="h-11"
                >
                  <option value="">Seleccionar unidad...</option>
                  {unidadesActivas.map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.nombre} ({unidad.simbolo})
                    </option>
                  ))}
                </Select>
                {unidadesActivas.length === 0 && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    No hay unidades disponibles. Por favor, crea al menos una unidad primero.
                  </p>
                )}
              </div>
            </div>

            {/* Valores Calculados */}
            {cantidadTotal > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calculator className="w-4 h-4 text-violet-500" />
                  Valores Calculados
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                      <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Cantidad Total</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {cantidadTotal.toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      {formData.tamañoPresentacion} × {formData.cantidadPresentaciones} {unidadesActivas.find(u => u.id === unidadSeleccionada)?.simbolo || 'u'}
                    </p>
                  </div>
                  
                  <div className="relative p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-2xl border border-green-200 dark:border-green-800">
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-green-200 dark:bg-green-800 flex items-center justify-center">
                      <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Precio por Presentación</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {formatearMoneda(precioPorPresentacion, configuracion?.moneda, tasaCambio)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Por unidad/paquete
                    </p>
                  </div>
                  
                  <div className="relative p-5 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 rounded-2xl border border-violet-200 dark:border-violet-800">
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-violet-200 dark:bg-violet-800 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <p className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">Precio por Unidad</p>
                    <p className="text-2xl font-bold text-violet-900 dark:text-violet-100">
                      {formatearMoneda(precioPorUnidad, configuracion?.moneda, tasaCambio)}
                    </p>
                    <p className="text-xs text-violet-600 dark:text-violet-400 mt-2">
                      Por {unidadesActivas.find(u => u.id === unidadSeleccionada)?.simbolo || 'unidad'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notas" className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Notas
              </Label>
              <Textarea
                id="notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                placeholder="Notas adicionales sobre el producto..."
                rows={3}
                className="border-gray-200 dark:border-gray-700 resize-none"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel} 
                  disabled={guardando}
                  className="h-11 px-6"
                >
                  Cancelar
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={guardando}
                className="h-11 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 gap-2"
              >
                {guardando ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {producto ? "Actualizando..." : "Creando..."}
                  </span>
                ) : (
                  <>
                    {producto ? "Actualizar Producto" : "Crear Producto"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
