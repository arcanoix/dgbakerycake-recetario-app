"use client";

import { useState } from "react";
import { UnidadMedidaAdmin } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UnidadListProps {
  unidades: UnidadMedidaAdmin[];
  onEdit: (unidad: UnidadMedidaAdmin) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleEstado: (unidad: UnidadMedidaAdmin) => Promise<void>;
}

export const UnidadList = ({ unidades, onEdit, onDelete, onToggleEstado }: UnidadListProps) => {
  const [eliminando, setEliminando] = useState<string | null>(null);

  const handleDelete = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar la unidad "${nombre}"? Esta acción no se puede deshacer.`)) {
      setEliminando(id);
      try {
        await onDelete(id);
      } finally {
        setEliminando(null);
      }
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'peso': return 'bg-blue-100 text-blue-800';
      case 'volumen': return 'bg-green-100 text-green-800';
      case 'cantidad': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (unidades.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No hay unidades que coincidan con los filtros seleccionados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {unidades.map((unidad) => (
        <Card 
          key={unidad.id} 
          className={`hover:shadow-lg transition-shadow ${!unidad.activo ? 'opacity-60' : ''}`}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {unidad.nombre}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({unidad.simbolo})
                  </span>
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTipoBadgeColor(unidad.tipo)}`}>
                    {unidad.tipo.charAt(0).toUpperCase() + unidad.tipo.slice(1)}
                  </span>
                  {!unidad.activo && (
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                      Inactiva
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {unidad.factorConversionBase && unidad.unidadBase && (
              <div className="text-sm bg-muted p-3 rounded">
                <p className="font-semibold mb-1">Conversión:</p>
                <p className="text-muted-foreground">
                  1 {unidad.simbolo} = {unidad.factorConversionBase} {unidad.unidadBase}
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p>Creada: {new Date(unidad.fechaCreacion).toLocaleDateString()}</p>
              {unidad.fechaActualizacion && (
                <p>Actualizada: {new Date(unidad.fechaActualizacion).toLocaleDateString()}</p>
              )}
            </div>

            <div className="flex flex-row gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 min-w-0"
                onClick={() => onEdit(unidad)}
                disabled={eliminando === unidad.id}
              >
                Editar
              </Button>
              <Button
                variant={unidad.activo ? "outline" : "default"}
                size="sm"
                className="flex-1 min-w-0"
                onClick={() => onToggleEstado(unidad)}
                disabled={eliminando === unidad.id}
              >
                {unidad.activo ? "Desactivar" : "Activar"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0"
                onClick={() => handleDelete(unidad.id, unidad.nombre)}
                disabled={eliminando === unidad.id}
              >
                {eliminando === unidad.id ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  '×'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
