"use client";

import { useState } from "react";
import { Receta } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { useGastosFijos } from "@/hooks/useGastosFijos";
import { PrecioDual } from "@/components/ui/precio-dual";
import { formatearMoneda } from "@/lib/constants";
import { calcularCostoGastosFijos } from "@/lib/calculations";
import { 
  Download, 
  Edit2, 
  Trash2, 
  ChefHat, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  FileText, 
  Copy,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DataTable } from "@/components/ui/data-table";
import { getRecetaColumns } from "./receta-columns";

interface RecetaListProps {
  recetas: Receta[];
  onEdit: (receta: Receta) => void;
  onDelete: (id: string) => Promise<void>;
  onView?: (receta: Receta) => void;
  onDuplicate?: (receta: Receta) => void;
}

export const RecetaList = ({ recetas, onEdit, onDelete, onView, onDuplicate }: RecetaListProps) => {
  const { configuracion } = useConfiguracion();
  const { totales } = useGastosFijos();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [exportandoPDF, setExportandoPDF] = useState<string | null>(null);

  // Recalcular gastos fijos para todas las recetas en tiempo real
  const recalcularGastosFijos = (receta: Receta): number => {
    const totalGastosMensuales = totales.totalMontoMensual;
    const porcentajeGastosFijos = configuracion?.porcentajeGastosFijos || 0;
    return calcularCostoGastosFijos(totalGastosMensuales, porcentajeGastosFijos);
  };

  const handleExportPDF = async (receta: Receta) => {
    setExportandoPDF(receta.id);
    try {
      const { exportarRecetaPDF } = await import("@/lib/pdfExport");
      await exportarRecetaPDF(receta, configuracion);
    } finally {
      setExportandoPDF(null);
    }
  };

  const handleDelete = async (id: string) => {
    setEliminando(id);
    try {
      await onDelete(id);
    } finally {
      setEliminando(null);
    }
  };

  const columns = getRecetaColumns({
    onEdit,
    onView,
    onDelete: handleDelete,
    onDuplicate: onDuplicate || (() => {}),
    onExportPDF: handleExportPDF,
    tasaCambio: configuracion?.tasaCambioUSD || 50,
    moneda: configuracion?.moneda || 'VES',
  });

  if (recetas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 shadow-sm">
          <ChefHat className="w-10 h-10 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold mb-2">
          No hay recetas registradas
        </h3>
        <p className="text-muted-foreground max-w-md leading-relaxed">
          Crea tu primera receta para calcular costos y establecer precios de venta competitivos.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">
          <span className="text-foreground font-bold">{recetas.length}</span> recetas encontradas
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
              data={recetas} 
              searchKey="nombre"
              placeholder="Filtrar recetas..."
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
            {recetas.map((receta, index) => {
              const hasMargen = receta.margenGanancia && receta.margenGanancia > 0;
              
              return (
                <Card key={receta.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-md bg-card">
                  <CardHeader className="pb-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-bold truncate flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                          <ChefHat className="w-4 h-4" />
                        </div>
                        <span className="truncate group-hover:text-amber-600 transition-colors">{receta.nombre}</span>
                      </CardTitle>
                      {receta.categoria && (
                        <Badge variant="outline" className="font-bold uppercase tracking-wider text-[10px]">
                          {receta.categoria}
                        </Badge>
                      )}
                    </div>
                    {receta.descripcion && (
                      <CardDescription className="line-clamp-2 text-xs">
                        {receta.descripcion}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="bg-muted/30 rounded-xl p-4 space-y-3 border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5" />
                          Materiales
                        </span>
                        <span className="text-sm font-black">
                          {receta.materiales.length} ítems
                        </span>
                      </div>
                      
                      <div className="h-px bg-border/50" />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Insumos</span>
                          <PrecioDual 
                            valorUSD={receta.costoMateriales} 
                            tasaCambio={configuracion?.tasaCambioUSD || 50}
                            monedaPorDefecto={configuracion?.moneda || 'VES'}
                            className="text-xs font-bold"
                          />
                        </div>
                        {receta.costoManoObra > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Mano Obra</span>
                            <span className="text-xs font-bold text-muted-foreground">
                              {receta.cantidadHoras}h × {formatearMoneda(receta.costoPorHora, configuracion?.moneda, configuracion?.tasaCambioUSD || 50)}/h
                            </span>
                            <PrecioDual 
                              valorUSD={receta.costoManoObra} 
                              tasaCambio={configuracion?.tasaCambioUSD || 50}
                              monedaPorDefecto={configuracion?.moneda || 'VES'}
                              className="text-xs font-bold"
                            />
                          </div>
                        )}
                        {(() => {
                          const gastosFijosRecalculados = recalcularGastosFijos(receta);
                          return gastosFijosRecalculados > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Gastos Fijos</span>
                              <PrecioDual 
                                valorUSD={gastosFijosRecalculados} 
                                tasaCambio={configuracion?.tasaCambioUSD || 50}
                                monedaPorDefecto={configuracion?.moneda || 'VES'}
                                className="text-xs font-bold"
                              />
                            </div>
                          );
                        })()}
                        <div className="h-px bg-border/50" />
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-primary uppercase">Costo Total</span>
                          <PrecioDual 
                            valorUSD={receta.costoMateriales + receta.costoManoObra + recalcularGastosFijos(receta)} 
                            tasaCambio={configuracion?.tasaCambioUSD || 50}
                            monedaPorDefecto={configuracion?.moneda || 'VES'}
                            className="text-sm font-black text-primary"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {receta.precioVentaSugerido && (
                      <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">
                              P. VENTA SUGERIDO
                            </p>
                            <PrecioDual 
                              valorUSD={receta.precioVentaSugerido} 
                              tasaCambio={configuracion?.tasaCambioUSD || 50}
                              monedaPorDefecto={configuracion?.moneda || 'VES'}
                              className="text-xl font-black text-emerald-700"
                            />
                          </div>
                          {hasMargen && (
                            <Badge className="bg-emerald-600 text-white font-black border-none shadow-sm">
                              +{receta.margenGanancia}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 font-bold text-[10px] h-9"
                        onClick={() => onEdit(receta)}
                        disabled={eliminando === receta.id}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        EDITAR
                      </Button>
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-2 hover:bg-primary/10 hover:text-primary"
                          onClick={() => onView(receta)}
                          disabled={eliminando === receta.id}
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 hover:bg-muted"
                        onClick={() => handleExportPDF(receta)}
                        disabled={exportandoPDF === receta.id}
                      >
                        {exportandoPDF === receta.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 hover:bg-muted"
                        onClick={() => onDuplicate?.(receta)}
                        disabled={eliminando === receta.id}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`¿Estás seguro de eliminar "${receta.nombre}"?`)) {
                            handleDelete(receta.id);
                          }
                        }}
                        disabled={eliminando === receta.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
