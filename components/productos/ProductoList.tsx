"use client";

import { useState } from "react";
import { Producto } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatearNumero } from "@/lib/constants";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { PrecioDual } from "@/components/ui/precio-dual";
import { motion } from "motion/react";
import { Package, Scale, ShoppingCart, DollarSign, Edit2, Trash2, Building2, FileText, ChevronRight } from "lucide-react";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Harinas y Granos': { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  'Lácteos': { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  'Azúcares': { bg: 'bg-rose-50 dark:bg-rose-950', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  'Grasas': { bg: 'bg-yellow-50 dark:bg-yellow-950', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
  'Huevos': { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  'Chocolate': { bg: 'bg-stone-50 dark:bg-stone-950', text: 'text-stone-700 dark:text-stone-300', border: 'border-stone-200 dark:border-stone-800' },
  'Frutas': { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  'Especias': { bg: 'bg-violet-50 dark:bg-violet-950', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  'Otros': { bg: 'bg-gray-50 dark:bg-gray-950', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-800' },
};

const getCategoryStyle = (categoria?: string) => {
  const key = categoria || 'Otros';
  return CATEGORY_COLORS[key] || CATEGORY_COLORS['Otros'];
};

interface ProductoListProps {
  productos: Producto[];
  onEdit: (producto: Producto) => void;
  onDelete: (id: string) => Promise<void>;
}

export const ProductoList = ({ productos, onEdit, onDelete }: ProductoListProps) => {
  const { configuracion } = useConfiguracion();
  const [eliminando, setEliminando] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setEliminando(id);
    try {
      await onDelete(id);
    } finally {
      setEliminando(null);
    }
  };

  if (productos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900 dark:to-fuchsia-900 flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-violet-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No hay productos registrados
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          Crea tu primer producto para comenzar a gestionar tus costos de producción
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productos.map((producto, index) => {
        const categoryStyle = getCategoryStyle(producto.categoria);
        
        return (
          <motion.div
            key={producto.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm hover:-translate-y-1 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500" />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
                      <Package className="w-5 h-5 text-violet-500 flex-shrink-0" />
                      <span className="truncate">{producto.nombre}</span>
                    </CardTitle>
                  </div>
                  {producto.categoria && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border} flex-shrink-0`}>
                      {producto.categoria}
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      Precio Total
                    </span>
                    <PrecioDual 
                      valorUSD={producto.precioTotal} 
                      tasaCambio={configuracion?.tasaCambioUSD || 50}
                      monedaPorDefecto={configuracion?.moneda || 'VES'}
                      className="text-sm font-semibold text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  <div className="h-px bg-gray-200 dark:bg-gray-700" />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 mx-auto mb-1">
                        <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Presentación</p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {formatearNumero(producto.tamañoPresentacion)}
                      </p>
                      <p className="text-[10px] text-gray-400">{producto.unidadMedidaSimbolo || 'u'}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 mx-auto mb-1">
                        <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad</p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {producto.cantidadPresentaciones}
                      </p>
                      <p className="text-[10px] text-gray-400">unds</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900 mx-auto mb-1">
                        <Package className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                        {formatearNumero(producto.cantidadTotal)}
                      </p>
                      <p className="text-[10px] text-gray-400">{producto.unidadMedidaSimbolo || 'u'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-medium mb-1">Por Presentación</p>
                    <PrecioDual 
                      valorUSD={producto.precioPorPresentacion} 
                      tasaCambio={configuracion?.tasaCambioUSD || 50}
                      monedaPorDefecto={configuracion?.moneda || 'VES'}
                      className="text-sm font-bold text-blue-700 dark:text-blue-300"
                    />
                  </div>
                  <div className="bg-violet-50 dark:bg-violet-950/50 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-wider text-violet-600 dark:text-violet-400 font-medium mb-1">Por Unidad</p>
                    <PrecioDual 
                      valorUSD={producto.precioPorUnidad} 
                      tasaCambio={configuracion?.tasaCambioUSD || 50}
                      monedaPorDefecto={configuracion?.moneda || 'VES'}
                      className="text-sm font-bold text-violet-700 dark:text-violet-300"
                    />
                  </div>
                </div>

                {(producto.proveedor || producto.notas) && (
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                    {producto.proveedor && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate">{producto.proveedor}</span>
                      </div>
                    )}
                    {producto.notas && (
                      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{producto.notas}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 hover:bg-violet-50 dark:hover:bg-violet-950 border-gray-200 dark:border-gray-700"
                    onClick={() => onEdit(producto)}
                    disabled={eliminando === producto.id}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    onClick={() => {
                      if (confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
                        handleDelete(producto.id);
                      }
                    }}
                    disabled={eliminando === producto.id}
                  >
                    {eliminando === producto.id ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
