"use client";

import { useState } from "react";
import { Receta } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { PrecioDual } from "@/components/ui/precio-dual";
import { Download, Edit2, Trash2, ChefHat, Package, DollarSign, TrendingUp, Eye, FileText } from "lucide-react";
import { motion } from "motion/react";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  'Panadería': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🍞' },
  'Pasteles': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: '🎂' },
  'Galletas': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '🍪' },
  'Postres': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', icon: '🍮' },
  'Bizcochos': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: '🧁' },
  'Otros': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: '🥐' },
};

const getCategoryStyle = (categoria?: string) => {
  const key = categoria || 'Otros';
  return CATEGORY_COLORS[key] || CATEGORY_COLORS['Otros'];
};

interface RecetaListProps {
  recetas: Receta[];
  onEdit: (receta: Receta) => void;
  onDelete: (id: string) => Promise<void>;
  onView?: (receta: Receta) => void;
}

export const RecetaList = ({ recetas, onEdit, onDelete, onView }: RecetaListProps) => {
  const { configuracion } = useConfiguracion();
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [exportandoPDF, setExportandoPDF] = useState<string | null>(null);

  // Lazy import de jsPDF — no entra en el bundle inicial (~300 KB)
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

  if (recetas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4">
          <ChefHat className="w-10 h-10 text-amber-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No hay recetas registradas
        </h3>
        <p className="text-gray-700 text-center max-w-md">
          Crea tu primera receta para calcular costos y establecer precios de venta
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recetas.map((receta, index) => {
        const categoryStyle = getCategoryStyle(receta.categoria);
        const hasMargen = receta.margenGanancia && receta.margenGanancia > 0;
        
        return (
          <motion.div
            key={receta.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm hover:-translate-y-1 bg-white overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold text-gray-900 truncate flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <span className="truncate">{receta.nombre}</span>
                    </CardTitle>
                  </div>
                  {receta.categoria && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border} flex-shrink-0`}>
                      <span>{categoryStyle.icon}</span>
                      {receta.categoria}
                    </span>
                  )}
                </div>
                {receta.descripcion && (
                  <CardDescription className="line-clamp-2 mt-2">
                    {receta.descripcion}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 space-y-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Package className="w-4 h-4" />
                      Materiales
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {receta.materiales.length} {receta.materiales.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  
                  <div className="h-px bg-slate-300" />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-[11px] uppercase tracking-wider text-blue-700 font-semibold mb-1 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        Costo Materiales
                      </p>
                      <PrecioDual 
                        valorUSD={receta.costoMateriales} 
                        tasaCambio={configuracion?.tasaCambioUSD || 50}
                        monedaPorDefecto={configuracion?.moneda || 'VES'}
                        className="text-sm font-bold text-blue-800"
                      />
                    </div>
                    <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                      <p className="text-[11px] uppercase tracking-wider text-violet-700 font-semibold mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Costo Total
                      </p>
                      <PrecioDual 
                        valorUSD={receta.costoTotal} 
                        tasaCambio={configuracion?.tasaCambioUSD || 50}
                        monedaPorDefecto={configuracion?.moneda || 'VES'}
                        className="text-sm font-bold text-violet-800"
                      />
                    </div>
                  </div>
                </div>
                
                {receta.precioVentaSugerido && (
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold mb-1">
                          Precio de Venta Sugerido
                        </p>
                        <PrecioDual 
                          valorUSD={receta.precioVentaSugerido} 
                          tasaCambio={configuracion?.tasaCambioUSD || 50}
                          monedaPorDefecto={configuracion?.moneda || 'VES'}
                          className="text-xl font-bold text-emerald-800"
                        />
                      </div>
                      {hasMargen && (
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold mb-1">
                            Margen
                          </p>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-bold border border-emerald-300">
                            +{receta.margenGanancia}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {onView && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 hover:bg-amber-50 border-gray-200"
                      onClick={() => onView(receta)}
                      disabled={eliminando === receta.id}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 hover:bg-blue-50 border-gray-200"
                    onClick={() => handleExportPDF(receta)}
                    disabled={exportandoPDF === receta.id}
                    title="Exportar a PDF"
                  >
                    {exportandoPDF === receta.id ? (
                      <span className="animate-spin text-xs">⏳</span>
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 hover:bg-violet-50 border-gray-200"
                    onClick={() => onEdit(receta)}
                    disabled={eliminando === receta.id}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm(`¿Estás seguro de eliminar "${receta.nombre}"?`)) {
                        handleDelete(receta.id);
                      }
                    }}
                    disabled={eliminando === receta.id}
                  >
                    {eliminando === receta.id ? (
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
