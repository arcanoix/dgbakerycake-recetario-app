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
  'Harinas y Granos': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Lácteos': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Azúcares': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Grasas': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Huevos': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Chocolate': { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' },
  'Frutas': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Especias': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  'Otros': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
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
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-violet-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No hay productos registrados
        </h3>
        <p className="text-gray-700 text-center max-w-md">
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
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm hover:-translate-y-1 bg-white overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500" />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold text-gray-900 truncate flex items-center gap-2">
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
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 space-y-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      Precio Total
                    </span>
                    <PrecioDual 
                      valorUSD={producto.precioTotal} 
                      tasaCambio={configuracion?.tasaCambioUSD || 50}
                      monedaPorDefecto={configuracion?.moneda || 'VES'}
                      className="text-sm font-bold text-slate-900"
                    />
                  </div>
                  
                  <div className="h-px bg-slate-300" />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 mx-auto mb-1">
                        <Scale className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xs font-medium text-slate-700">Presentación</p>
                      <p className="text-xs font-bold text-slate-900">
                        {formatearNumero(producto.tamañoPresentacion)}
                      </p>
                      <p className="text-[10px] text-slate-600">{producto.unidadMedidaSimbolo || 'u'}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 mx-auto mb-1">
                        <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-xs font-medium text-slate-700">Cantidad</p>
                      <p className="text-xs font-bold text-slate-900">
                        {producto.cantidadPresentaciones}
                      </p>
                      <p className="text-[10px] text-slate-600">unds</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 mx-auto mb-1">
                        <Package className="w-4 h-4 text-violet-600" />
                      </div>
                      <p className="text-xs font-medium text-slate-700">Total</p>
                      <p className="text-xs font-bold text-slate-900">
                        {formatearNumero(producto.cantidadTotal)}
                      </p>
                      <p className="text-[10px] text-slate-600">{producto.unidadMedidaSimbolo || 'u'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-[11px] uppercase tracking-wider text-blue-700 font-semibold mb-1">Por Presentación</p>
                    <PrecioDual 
                      valorUSD={producto.precioPorPresentacion} 
                      tasaCambio={configuracion?.tasaCambioUSD || 50}
                      monedaPorDefecto={configuracion?.moneda || 'VES'}
                      className="text-sm font-bold text-blue-800"
                    />
                  </div>
                  <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                    <p className="text-[11px] uppercase tracking-wider text-violet-700 font-semibold mb-1">Por Unidad</p>
                    <PrecioDual 
                      valorUSD={producto.precioPorUnidad} 
                      tasaCambio={configuracion?.tasaCambioUSD || 50}
                      monedaPorDefecto={configuracion?.moneda || 'VES'}
                      className="text-sm font-bold text-violet-800"
                    />
                  </div>
                </div>

                {(producto.proveedor || producto.notas) && (
                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    {producto.proveedor && (
                      <div className="flex items-center gap-2 text-xs text-gray-700">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate">{producto.proveedor}</span>
                      </div>
                    )}
                    {producto.notas && (
                      <div className="flex items-start gap-2 text-xs text-gray-700">
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
                    className="flex-1 gap-1.5 hover:bg-violet-50 border-gray-200"
                    onClick={() => onEdit(producto)}
                    disabled={eliminando === producto.id}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700"
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
