"use client";

import { useState } from "react";
import { UnidadMedidaAdmin } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Scale, Droplets, Hash, Box, Edit2, Trash2, ToggleLeft, ArrowRightLeft, Calendar } from "lucide-react";

const TYPE_CONFIG: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; gradient: string }> = {
  peso: { 
    bg: 'bg-blue-50 dark:bg-blue-500/10', 
    text: 'text-blue-700 dark:text-blue-400', 
    border: 'border-blue-200 dark:border-blue-500/20',
    icon: <Scale className="w-4 h-4" />,
    gradient: 'from-blue-500 to-cyan-500'
  },
  volumen: { 
    bg: 'bg-emerald-50 dark:bg-emerald-500/10', 
    text: 'text-emerald-700 dark:text-emerald-400', 
    border: 'border-emerald-200 dark:border-emerald-500/20',
    icon: <Droplets className="w-4 h-4" />,
    gradient: 'from-emerald-500 to-teal-500'
  },
  cantidad: { 
    bg: 'bg-violet-50 dark:bg-violet-500/10', 
    text: 'text-violet-700 dark:text-violet-400', 
    border: 'border-violet-200 dark:border-violet-500/20',
    icon: <Hash className="w-4 h-4" />,
    gradient: 'from-violet-500 to-purple-500'
  },
  otro: { 
    bg: 'bg-gray-50 dark:bg-gray-500/10', 
    text: 'text-gray-700 dark:text-gray-400', 
    border: 'border-gray-200 dark:border-gray-500/20',
    icon: <Box className="w-4 h-4" />,
    gradient: 'from-gray-500 to-slate-500'
  },
};

const getTipoConfig = (tipo: string) => {
  return TYPE_CONFIG[tipo] || TYPE_CONFIG['otro'];
};

interface UnidadListProps {
  unidades: UnidadMedidaAdmin[];
  onEdit: (unidad: UnidadMedidaAdmin) => void;
  onDelete: (id: string) => Promise<boolean>;
  onToggleEstado: (unidad: UnidadMedidaAdmin) => Promise<boolean>;
}

export const UnidadList = ({ unidades, onEdit, onDelete, onToggleEstado }: UnidadListProps) => {
  const [accionEnCursoId, setAccionEnCursoId] = useState<string | null>(null);

  const handleDelete = async (id: string, nombre: string) => {
    if (accionEnCursoId === id) {
      return;
    }

    if (confirm(`¿Estás seguro de eliminar la unidad "${nombre}"? Esta acción no se puede deshacer.`)) {
      setAccionEnCursoId(id);
      try {
        await onDelete(id);
      } finally {
        setAccionEnCursoId(null);
      }
    }
  };

  const handleToggleEstado = async (unidad: UnidadMedidaAdmin) => {
    if (accionEnCursoId === unidad.id) {
      return;
    }

    setAccionEnCursoId(unidad.id);
    try {
      await onToggleEstado(unidad);
    } finally {
      setAccionEnCursoId(null);
    }
  };

  if (unidades.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 flex items-center justify-center mb-4">
          <Scale className="w-10 h-10 text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No hay unidades de medida
        </h3>
        <p className="text-gray-700 dark:text-gray-400 text-center max-w-md">
          Crea tu primera unidad de medida para comenzar a gestionar tus productos
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {unidades.map((unidad, index) => {
        const tipoConfig = getTipoConfig(unidad.tipo);
        
        return (
          <motion.div
            key={unidad.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card className={`group hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-800 shadow-sm hover:-translate-y-1 bg-white dark:bg-slate-900 overflow-hidden ${!unidad.activo ? 'opacity-60' : ''}`}>
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tipoConfig.gradient}`} />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${tipoConfig.bg} ${tipoConfig.text} flex items-center justify-center flex-shrink-0`}>
                        {tipoConfig.icon}
                      </div>
                      <span className="truncate">{unidad.nombre}</span>
                    </CardTitle>
                    <p className="text-sm text-gray-700 dark:text-gray-400 mt-1 font-mono">
                      {unidad.simbolo}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tipoConfig.bg} ${tipoConfig.text} border ${tipoConfig.border} flex-shrink-0`}>
                    {unidad.tipo.charAt(0).toUpperCase() + unidad.tipo.slice(1)}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {unidad.factorConversionBase && unidad.unidadBase && (
                  <div className={`bg-gradient-to-br ${tipoConfig.bg} to-transparent rounded-xl p-4 border ${tipoConfig.border}`}>
                    <div className={`flex items-center gap-2 text-xs font-medium ${tipoConfig.text} mb-2`}>
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Conversión
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      1 {unidad.simbolo} = {unidad.factorConversionBase} {unidad.unidadBase}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Creada: {new Date(unidad.fechaCreacion).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 border-gray-200 dark:border-slate-800 dark:bg-slate-900 dark:text-gray-300 dark:hover:text-blue-400"
                    onClick={() => onEdit(unidad)}
                    disabled={accionEnCursoId === unidad.id}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`gap-1.5 border-gray-200 dark:border-slate-800 dark:bg-slate-900 ${
                      unidad.activo 
                        ? 'hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-600 dark:text-amber-500' 
                        : 'hover:bg-green-50 dark:hover:bg-green-500/10 text-green-600 dark:text-green-500'
                    }`}
                    onClick={() => handleToggleEstado(unidad)}
                    disabled={accionEnCursoId === unidad.id}
                  >
                    {accionEnCursoId === unidad.id ? (
                      <span className="animate-spin text-xs">⏳</span>
                    ) : (
                      <ToggleLeft className="w-3.5 h-3.5" />
                    )}
                    {unidad.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 dark:border-slate-800 dark:bg-slate-900 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    onClick={() => handleDelete(unidad.id, unidad.nombre)}
                    disabled={accionEnCursoId === unidad.id}
                  >
                    {accionEnCursoId === unidad.id ? (
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
