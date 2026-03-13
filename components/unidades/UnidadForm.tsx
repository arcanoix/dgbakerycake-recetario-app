"use client";

import { useState, useEffect } from "react";
import { UnidadMedidaAdmin, UnidadMedidaFormData, TipoUnidad } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UnidadFormProps {
  unidad?: UnidadMedidaAdmin;
  unidades: UnidadMedidaAdmin[];
  onSubmit: (datos: UnidadMedidaFormData) => void;
  onCancel: () => void;
}

export const UnidadForm = ({ unidad, unidades, onSubmit, onCancel }: UnidadFormProps) => {
  const [formData, setFormData] = useState<UnidadMedidaFormData>({
    nombre: "",
    simbolo: "",
    tipo: "otro",
    factorConversionBase: undefined,
    unidadBase: undefined,
  });

  useEffect(() => {
    if (unidad) {
      setFormData({
        nombre: unidad.nombre,
        simbolo: unidad.simbolo,
        tipo: unidad.tipo,
        factorConversionBase: unidad.factorConversionBase,
        unidadBase: unidad.unidadBase,
      });
    }
  }, [unidad]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "factorConversionBase" ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const unidadesDelMismoTipo = unidades.filter(u => u.tipo === formData.tipo && u.activo);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{unidad ? "Editar" : "Nueva"} Unidad de Medida</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: gramos, litros, docenas"
                required
              />
              <p className="text-xs text-muted-foreground">
                Nombre completo de la unidad
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="simbolo">Símbolo *</Label>
              <Input
                id="simbolo"
                name="simbolo"
                value={formData.simbolo}
                onChange={handleChange}
                placeholder="Ej: g, L, dz"
                required
              />
              <p className="text-xs text-muted-foreground">
                Abreviatura o símbolo de la unidad
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Unidad *</Label>
            <Select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="peso">Peso</option>
              <option value="volumen">Volumen</option>
              <option value="cantidad">Cantidad</option>
              <option value="otro">Otro</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Categoría de la unidad de medida
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Conversión (Opcional)</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Define cómo convertir esta unidad a una unidad base del mismo tipo.
              Por ejemplo: 1 kilogramo = 1000 gramos (factor: 1000, base: gramos)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="factorConversionBase">Factor de Conversión</Label>
                <Input
                  id="factorConversionBase"
                  name="factorConversionBase"
                  type="number"
                  step="0.0001"
                  value={formData.factorConversionBase || ""}
                  onChange={handleChange}
                  placeholder="Ej: 1000"
                />
                <p className="text-xs text-muted-foreground">
                  Multiplicador para convertir a la unidad base
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidadBase">Unidad Base</Label>
                <Select
                  id="unidadBase"
                  name="unidadBase"
                  value={formData.unidadBase || ""}
                  onChange={handleChange}
                  disabled={unidadesDelMismoTipo.length === 0}
                >
                  <option value="">Seleccionar...</option>
                  {unidadesDelMismoTipo.map((u) => (
                    <option key={u.id} value={u.nombre}>
                      {u.nombre} ({u.simbolo})
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-muted-foreground">
                  {unidadesDelMismoTipo.length === 0
                    ? "No hay unidades del mismo tipo disponibles"
                    : "Unidad de referencia para la conversión"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {unidad ? "Actualizar" : "Crear"} Unidad
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
