"use client";

import { Receta } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatearTiempo } from "@/lib/constants";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { PrecioDual } from "@/components/ui/precio-dual";

interface RecetaListProps {
  recetas: Receta[];
  onEdit: (receta: Receta) => void;
  onDelete: (id: string) => void;
  onView?: (receta: Receta) => void;
}

export const RecetaList = ({ recetas, onEdit, onDelete, onView }: RecetaListProps) => {
  const { configuracion } = useConfiguracion();
  if (recetas.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No hay recetas registradas. Crea tu primera receta para comenzar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recetas.map((receta) => (
        <Card key={receta.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{receta.nombre}</CardTitle>
            {receta.categoria && (
              <CardDescription>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-secondary">
                  {receta.categoria}
                </span>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {receta.descripcion}
            </p>

            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Materiales:</span>
                <span className="font-semibold">{receta.materiales.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tiempo:</span>
                <span className="font-semibold">
                  {formatearTiempo(receta.tiempoPreparacion)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Costo Materiales:</span>
                <PrecioDual 
                  valorUSD={receta.costoMateriales} 
                  tasaCambio={configuracion?.tasaCambioUSD || 50}
                  className="text-sm"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Costo Mano Obra:</span>
                <PrecioDual 
                  valorUSD={receta.costoManoObra} 
                  tasaCambio={configuracion?.tasaCambioUSD || 50}
                  className="text-sm"
                />
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="font-bold">Costo Total:</span>
                <PrecioDual 
                  valorUSD={receta.costoTotal} 
                  tasaCambio={configuracion?.tasaCambioUSD || 50}
                  className="text-sm font-bold"
                />
              </div>
              {receta.precioVentaSugerido && (
                <div className="flex justify-between text-sm bg-green-50 p-2 rounded">
                  <span className="text-green-800 font-semibold">Precio Venta:</span>
                  <PrecioDual 
                    valorUSD={receta.precioVentaSugerido} 
                    tasaCambio={configuracion?.tasaCambioUSD || 50}
                    className="text-sm font-bold text-green-600"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onView(receta)}
                >
                  Ver
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(receta)}
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`¿Estás seguro de eliminar "${receta.nombre}"?`)) {
                    onDelete(receta.id);
                  }
                }}
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
