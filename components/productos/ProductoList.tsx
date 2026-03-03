"use client";

import { Producto } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatearNumero } from "@/lib/constants";
import { obtenerSimboloUnidad } from "@/lib/conversiones";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { PrecioDual } from "@/components/ui/precio-dual";

interface ProductoListProps {
  productos: Producto[];
  onEdit: (producto: Producto) => void;
  onDelete: (id: string) => void;
}

export const ProductoList = ({ productos, onEdit, onDelete }: ProductoListProps) => {
  const { configuracion } = useConfiguracion();
  if (productos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No hay productos registrados. Crea tu primer producto para comenzar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {productos.map((producto) => (
        <Card key={producto.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{producto.nombre}</CardTitle>
            {producto.categoria && (
              <CardDescription>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-secondary">
                  {producto.categoria}
                </span>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio Total:</span>
                <PrecioDual 
                  valorUSD={producto.precioTotal} 
                  tasaCambio={configuracion?.tasaCambioUSD || 50}
                  className="text-sm"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cantidad:</span>
                <span className="font-semibold">
                  {formatearNumero(producto.cantidadTotal)} {obtenerSimboloUnidad(producto.unidadMedida)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-muted-foreground">Precio por Unidad:</span>
                <PrecioDual 
                  valorUSD={producto.precioPorUnidad} 
                  tasaCambio={configuracion?.tasaCambioUSD || 50}
                  className="text-sm font-bold"
                />
              </div>
            </div>

            {producto.proveedor && (
              <div className="text-xs text-muted-foreground">
                Proveedor: {producto.proveedor}
              </div>
            )}

            {producto.notas && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                {producto.notas}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(producto)}
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
                    onDelete(producto.id);
                  }
                }}
              >
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
