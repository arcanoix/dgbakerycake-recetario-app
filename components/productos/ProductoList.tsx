"use client";

import { useState } from "react";
import { Producto } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ProductoList = ({
  productos,
  onEdit,
  onDelete,
  emptyTitle = 'No hay productos registrados',
  emptyDescription = 'Crea tu primer producto para comenzar a gestionar tus costos de producción',
}: ProductoListProps) => {
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
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {emptyTitle}
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          {emptyDescription}
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
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="truncate">{producto.nombre}</span>
                    </CardTitle>
                  </div>
                  {producto.categoria && (
                    <Badge variant="secondary" className="flex-shrink-0">
                      {producto.categoria}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3 border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold flex items-center gap-1.5">
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
                  
                  <div className="h-px bg-border" />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 mx-auto mb-1">
                        <Scale className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">Presentación</p>
                      <p className="text-xs font-bold">
                        {formatearNumero(producto.tamañoPresentacion)}
                      </p>
                      <p className="text-[10px] text-slate-600">{producto.unidadMedidaSimbolo || 'u'}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 mx-auto mb-1">
                        <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">Cantidad</p>
                      <p className="text-xs font-bold">
                        {producto.cantidadPresentaciones}
                      </p>
                      <p className="text-[10px] text-slate-600">unds</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 mx-auto mb-1">
                        <Package className="w-4 h-4 text-violet-600" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">Total</p>
                      <p className="text-xs font-bold">
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
                  <div className="border-t pt-3 space-y-2">
                    {producto.proveedor && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate">{producto.proveedor}</span>
                      </div>
                    )}
                    {producto.notas && (
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
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
                    className="flex-1 gap-1.5"
                    onClick={() => onEdit(producto)}
                    disabled={eliminando === producto.id}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive hover:bg-destructive/10"
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
