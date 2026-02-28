"use client";

import { ConfiguracionFormData } from "@/types";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { ConfiguracionForm } from "@/components/configuracion/ConfiguracionForm";
import { Card, CardContent } from "@/components/ui/card";

export default function ConfiguracionPage() {
  const { configuracion, cargando, error, actualizar } = useConfiguracion();

  const handleSubmit = (datos: ConfiguracionFormData) => {
    actualizar(datos);
  };

  if (cargando) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">Cargando configuración...</p>
      </div>
    );
  }

  if (!configuracion) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-destructive">Error al cargar la configuración</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Configura los valores globales del sistema
        </p>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Formulario */}
      <ConfiguracionForm configuracion={configuracion} onSubmit={handleSubmit} />

      {/* Información Adicional */}
      <Card>
        <CardContent className="py-6 space-y-4">
          <h3 className="font-semibold">ℹ️ Información</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • El <strong>costo por hora</strong> se utiliza para calcular el costo de mano de obra en las recetas
            </li>
            <li>
              • La <strong>moneda</strong> afecta cómo se muestran los precios en todo el sistema
            </li>
            <li>
              • El <strong>margen de ganancia</strong> se usa para calcular el precio de venta sugerido
            </li>
            <li>
              • Estos valores son por defecto, puedes modificarlos individualmente en cada receta
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
