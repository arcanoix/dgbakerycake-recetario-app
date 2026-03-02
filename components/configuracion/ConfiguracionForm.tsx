"use client";

import { useState, useEffect } from "react";
import { ConfiguracionGlobal, ConfiguracionFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OPCIONES_MONEDA } from "@/lib/constants";

interface ConfiguracionFormProps {
  configuracion: ConfiguracionGlobal;
  onSubmit: (datos: ConfiguracionFormData) => void;
}

export const ConfiguracionForm = ({ configuracion, onSubmit }: ConfiguracionFormProps) => {
  const [formData, setFormData] = useState<ConfiguracionFormData>({
    costoPorHoraDefecto: 0,
    moneda: "USD",
    margenGananciaDefecto: 0,
    tasaCambioUSD: 0,
  });

  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (configuracion) {
      setFormData({
        costoPorHoraDefecto: configuracion.costoPorHoraDefecto,
        moneda: configuracion.moneda,
        margenGananciaDefecto: configuracion.margenGananciaDefecto || 0,
        tasaCambioUSD: configuracion.tasaCambioUSD || 0,
      });
    }
  }, [configuracion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "costoPorHoraDefecto" || name === "margenGananciaDefecto" || name === "tasaCambioUSD"
        ? parseFloat(value) || 0
        : value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración Global</CardTitle>
        <CardDescription>
          Configura los valores por defecto para el cálculo de costos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección: Mano de Obra */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Mano de Obra</h3>
            
            <div className="space-y-2">
              <Label htmlFor="costoPorHoraDefecto">
                Costo por Hora (Defecto) *
              </Label>
              <Input
                id="costoPorHoraDefecto"
                name="costoPorHoraDefecto"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.costoPorHoraDefecto || ""}
                onChange={handleChange}
                placeholder="10.00"
                required
              />
              <p className="text-xs text-muted-foreground">
                Este valor se usará por defecto al crear nuevas recetas
              </p>
            </div>
          </div>

          {/* Sección: Moneda */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Moneda</h3>
            
            <div className="space-y-2">
              <Label htmlFor="moneda">Moneda *</Label>
              <Select
                id="moneda"
                name="moneda"
                value={formData.moneda}
                onChange={handleChange}
                required
              >
                {OPCIONES_MONEDA.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">
                Moneda utilizada para mostrar precios y costos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tasaCambioUSD">
                Tasa de Cambio USD (BCV)
              </Label>
              <Input
                id="tasaCambioUSD"
                name="tasaCambioUSD"
                type="number"
                step="0.01"
                min="0"
                value={formData.tasaCambioUSD || ""}
                onChange={handleChange}
                placeholder="50.00"
              />
              <p className="text-xs text-muted-foreground">
                Tasa de cambio oficial del Banco Central de Venezuela (VES por USD)
              </p>
            </div>
          </div>

          {/* Sección: Precios */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Precios de Venta</h3>
            
            <div className="space-y-2">
              <Label htmlFor="margenGananciaDefecto">
                Margen de Ganancia (%) - Defecto
              </Label>
              <Input
                id="margenGananciaDefecto"
                name="margenGananciaDefecto"
                type="number"
                step="0.01"
                min="0"
                max="1000"
                value={formData.margenGananciaDefecto || ""}
                onChange={handleChange}
                placeholder="30.00"
              />
              <p className="text-xs text-muted-foreground">
                Porcentaje de ganancia por defecto para calcular precio de venta
              </p>
            </div>
          </div>

          {/* Botón de Guardar */}
          <div className="flex gap-2 justify-end pt-4">
            <Button type="submit" size="lg">
              {guardado ? "✓ Guardado" : "Guardar Configuración"}
            </Button>
          </div>

          {guardado && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Configuración guardada exitosamente
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
