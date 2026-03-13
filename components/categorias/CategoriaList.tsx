"use client";

import { useState } from "react";
import { CategoriaAdmin } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CategoriaListProps {
  categorias: CategoriaAdmin[];
  onEdit: (categoria: CategoriaAdmin) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleEstado: (categoria: CategoriaAdmin) => Promise<void>;
}

export const CategoriaList = ({ categorias, onEdit, onDelete, onToggleEstado }: CategoriaListProps) => {
  const [eliminando, setEliminando] = useState<string | null>(null);

  const handleDelete = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar la categoría "${nombre}"? Esta acción no se puede deshacer.`)) {
      setEliminando(id);
      try {
        await onDelete(id);
      } finally {
        setEliminando(null);
      }
    }
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === 'producto' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  if (categorias.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No hay categorías que coincidan con los filtros seleccionados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categorias.map((categoria) => (
        <Card key={categoria.id} className={`${!categoria.activo ? 'opacity-60' : ''}`}>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header con color */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: categoria.color || '#6B7280' }}
                  />
                  <div>
                    <h3 className="font-bold text-lg">{categoria.nombre}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTipoBadge(categoria.tipo)}`}>
                      {categoria.tipo === 'producto' ? '📦 Producto' : '📝 Receta'}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  categoria.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {categoria.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Descripción */}
              {categoria.descripcion && (
                <p className="text-sm text-muted-foreground">
                  {categoria.descripcion}
                </p>
              )}

              {/* Acciones */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(categoria)}
                  className="flex-1"
                >
                  ✏️ Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleEstado(categoria)}
                  className="flex-1"
                >
                  {categoria.activo ? '🔴 Desactivar' : '🟢 Activar'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(categoria.id, categoria.nombre)}
                  disabled={eliminando === categoria.id}
                >
                  {eliminando === categoria.id ? '⏳' : '🗑️'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
