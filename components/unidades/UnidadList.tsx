"use client";

import { useState } from "react";
import { UnidadMedidaAdmin } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Scale, Droplets, Hash, Box, Edit2, Trash2, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string }> = {
  peso: { 
    icon: <Scale className="w-5 h-5" />,
    label: 'Peso'
  },
  volumen: { 
    icon: <Droplets className="w-5 h-5" />,
    label: 'Volumen'
  },
  cantidad: { 
    icon: <Hash className="w-5 h-5" />,
    label: 'Cantidad'
  },
  otro: { 
    icon: <Box className="w-5 h-5" />,
    label: 'Otro'
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
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-4">
          <Scale className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          No hay unidades de medida
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
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
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate flex items-center gap-2">
                      <div className="text-primary flex-shrink-0">
                        {tipoConfig.icon}
                      </div>
                      <span className="truncate">{unidad.nombre}</span>
                    </CardTitle>
                  </div>
                  <Badge variant={unidad.activo ? "default" : "secondary"} className="flex-shrink-0">
                    {unidad.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2 font-mono">
                  {unidad.simbolo} • {tipoConfig.label}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {unidad.factorConversionBase && unidad.unidadBase && (
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Conversión
                    </div>
                    <p className="text-sm font-medium">
                      1 {unidad.simbolo} = {unidad.factorConversionBase} {unidad.unidadBase}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => onEdit(unidad)}
                    disabled={accionEnCursoId === unidad.id}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive hover:bg-destructive/10"
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
