"use client";

import { useState, useEffect } from "react";
import { CategoriaAdmin, CategoriaFormData, TipoCategoria } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoriaFormProps {
  categoria?: CategoriaAdmin;
  onSubmit: (datos: CategoriaFormData) => void;
  onCancel: () => void;
}

const COLORES_PREDEFINIDOS = [
  { nombre: "Azul", valor: "#60A5FA" },
  { nombre: "Verde", valor: "#10B981" },
  { nombre: "Amarillo", valor: "#F59E0B" },
  { nombre: "Rojo", valor: "#EF4444" },
  { nombre: "Morado", valor: "#8B5CF6" },
  { nombre: "Rosa", valor: "#EC4899" },
  { nombre: "Naranja", valor: "#F97316" },
  { nombre: "Gris", valor: "#6B7280" },
];

export const CategoriaForm = ({ categoria, onSubmit, onCancel }: CategoriaFormProps) => {
  const [formData, setFormData] = useState<CategoriaFormData>({
    nombre: "",
    tipo: "producto",
    descripcion: "",
    color: "#60A5FA",
  });

  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre,
        tipo: categoria.tipo,
        descripcion: categoria.descripcion,
        color: categoria.color || "#60A5FA",
      });
    }
  }, [categoria]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{categoria ? "Editar" : "Nueva"} Categoría</CardTitle>
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
                placeholder="Ej: Lácteos, Tortas, etc."
                required
              />
              <p className="text-xs text-gray-700">
                Nombre de la categoría
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                <option value="producto">Producto</option>
                <option value="receta">Receta</option>
              </Select>
              <p className="text-xs text-gray-700">
                ¿Es para productos o recetas?
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion || ""}
              onChange={handleChange}
              placeholder="Descripción opcional de la categoría"
              rows={3}
            />
            <p className="text-xs text-gray-700">
              Información adicional sobre esta categoría
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORES_PREDEFINIDOS.map((color) => (
                <button
                  key={color.valor}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color: color.valor }))}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    formData.color === color.valor
                      ? "border-gray-900 scale-110"
                      : "border-gray-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.valor }}
                  title={color.nombre}
                />
              ))}
            </div>
            <Input
              id="color"
              name="color"
              type="color"
              value={formData.color}
              onChange={handleChange}
              className="w-20 h-10"
            />
            <p className="text-xs text-gray-700">
              Color para identificar visualmente la categoría
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {categoria ? "Actualizar" : "Crear"} Categoría
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
