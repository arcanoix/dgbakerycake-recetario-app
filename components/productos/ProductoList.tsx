"use client";

import { useState } from "react";
import { Producto } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatearNumero } from "@/lib/constants";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { PrecioDual } from "@/components/ui/precio-dual";
import { motion, AnimatePresence } from "motion/react";
import { 
  Package, 
  Scale, 
  ShoppingCart, 
  DollarSign, 
  Edit2, 
  Trash2, 
  Building2, 
  FileText, 
  LayoutGrid, 
  Table as TableIcon 
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { getProductoColumns } from "./producto-columns";

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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [eliminando, setEliminando] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setEliminando(id);
    try {
      await onDelete(id);
    } finally {
      setEliminando(null);
    }
  };

  const columns = getProductoColumns({
    onEdit,
    onDelete: handleDelete,
    tasaCambio: configuracion?.tasaCambioUSD || 50,
    moneda: configuracion?.moneda || 'VES',
  });

  if (productos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
          <Package className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">
          {emptyTitle}
        </h3>
        <p className="text-muted-foreground max-w-md leading-relaxed">
          {emptyDescription}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-bold text-foreground">{productos.length}</span> productos
        </p>
        <div className="flex bg-muted p-1 rounded-lg border">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'shadow-sm' : ''}
          >
            <TableIcon className="w-4 h-4 mr-2" />
            Tabla
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'shadow-sm' : ''}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Cuadrícula
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <DataTable 
              columns={columns} 
              data={productos} 
              searchKey="nombre"
              placeholder="Filtrar por nombre..."
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {productos.map((producto, index) => (
              <Card key={producto.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-md">
                <CardHeader className="pb-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-bold truncate flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="truncate">{producto.nombre}</span>
                    </CardTitle>
                    {producto.categoria && (
                      <Badge variant="outline" className="font-semibold uppercase tracking-wider text-[10px]">
                        {producto.categoria}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 rounded-xl p-4 space-y-3 border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        Precio Total
                      </span>
                      <PrecioDual 
                        valorUSD={producto.precioTotal} 
                        tasaCambio={configuracion?.tasaCambioUSD || 50}
                        monedaPorDefecto={configuracion?.moneda || 'VES'}
                        className="text-sm font-black"
                      />
                    </div>
                    
                    <div className="h-px bg-border/50" />
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Present.</p>
                        <p className="text-xs font-bold">
                          {formatearNumero(producto.tamañoPresentacion)} {producto.unidadMedidaSimbolo}
                        </p>
                      </div>
                      <div className="text-center border-x">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Cant.</p>
                        <p className="text-xs font-bold">
                          {producto.cantidadPresentaciones}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total</p>
                        <p className="text-xs font-bold">
                          {formatearNumero(producto.cantidadTotal)} {producto.unidadMedidaSimbolo}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                      <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">Costo Unit.</p>
                      <PrecioDual 
                        valorUSD={producto.precioPorUnidad} 
                        tasaCambio={configuracion?.tasaCambioUSD || 50}
                        monedaPorDefecto={configuracion?.moneda || 'VES'}
                        className="text-sm font-bold text-primary"
                      />
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 border">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Proveedor</p>
                      <p className="text-xs font-semibold truncate">
                        {producto.proveedor || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 font-bold text-xs"
                      onClick={() => onEdit(producto)}
                      disabled={eliminando === producto.id}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      EDITAR
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-destructive hover:bg-destructive/10 font-bold text-xs"
                      onClick={() => {
                        if (confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
                          handleDelete(producto.id);
                        }
                      }}
                      disabled={eliminando === producto.id}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
