"use client";

import { useState, useEffect } from "react";
import { UnidadMedidaAdmin, UnidadMedidaFormData, TipoUnidad } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Scale, Hash, Droplets, Box, ArrowRight, ArrowRightLeft, Calculator, Info } from "lucide-react";

const TIPO_ICONS = {
  peso: <Scale className="w-5 h-5" />,
  volumen: <Droplets className="w-5 h-5" />,
  cantidad: <Hash className="w-5 h-5" />,
  otro: <Box className="w-5 h-5" />,
};

const TIPO_COLORS = {
  peso: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'focus:ring-blue-500' },
  volumen: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'focus:ring-emerald-500' },
  cantidad: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'focus:ring-violet-500' },
  otro: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'focus:ring-gray-500' },
};

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

  const [guardando, setGuardando] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await onSubmit(formData);
    } finally {
      setGuardando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "factorConversionBase" ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const unidadesDelMismoTipo = unidades.filter(u => u.tipo === formData.tipo && u.activo);
  const tipoColor = TIPO_COLORS[formData.tipo as keyof typeof TIPO_COLORS] || TIPO_COLORS.otro;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />
        
        <CardHeader className="pb-6 border-b border-gray-200">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${tipoColor.bg} ${tipoColor.text} flex items-center justify-center`}>
              {TIPO_ICONS[formData.tipo as keyof typeof TIPO_ICONS] || TIPO_ICONS.otro}
            </div>
            {unidad ? "Editar Unidad de Medida" : "Nueva Unidad de Medida"}
          </CardTitle>
          <p className="text-gray-700 mt-1">
            {unidad ? "Actualiza los detalles de la unidad" : "Registra una nueva unidad de medida"}
          </p>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-500" />
                  Nombre *
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: gramos, litros, docenas"
                  required
                  className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-700">
                  Nombre completo de la unidad
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="simbolo" className="text-sm font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4 text-violet-500" />
                  Símbolo *
                </Label>
                <Input
                  id="simbolo"
                  name="simbolo"
                  value={formData.simbolo}
                  onChange={handleChange}
                  placeholder="Ej: g, L, dz"
                  required
                  className="h-11 border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-mono"
                />
                <p className="text-xs text-gray-700">
                  Abreviatura o símbolo
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-sm font-medium flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-500" />
                Tipo de Unidad *
              </Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value as TipoUnidad })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peso">⚖️ Peso (g, kg, lb, oz)</SelectItem>
                  <SelectItem value="volumen">💧 Volumen (mL, L, gal)</SelectItem>
                  <SelectItem value="cantidad">🔢 Cantidad (pza, dz, cent)</SelectItem>
                  <SelectItem value="otro">📦 Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Conversión (Opcional)</h3>
                  <p className="text-xs text-gray-700">Define cómo convertir a una unidad base</p>
                </div>
              </div>
              
              <div className="bg-amber-50/30 rounded-xl p-4 mb-4 border border-amber-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    Ejemplo: 1 kilogramo = 1000 gramos (factor: 1000, base: gramos)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="factorConversionBase" className="text-sm font-medium flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-amber-500" />
                    Factor de Conversión
                  </Label>
                  <Input
                    id="factorConversionBase"
                    name="factorConversionBase"
                    type="number"
                    step="0.0001"
                    value={formData.factorConversionBase || ""}
                    onChange={handleChange}
                    placeholder="Ej: 1000"
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidadBase" className="text-sm font-medium flex items-center gap-2">
                    <Scale className="w-4 h-4 text-cyan-500" />
                    Unidad Base
                  </Label>
                  <Select
                    value={formData.unidadBase || ""}
                    onValueChange={(value) => setFormData({ ...formData, unidadBase: value })}
                    disabled={unidadesDelMismoTipo.length === 0}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unidadesDelMismoTipo.map((u) => (
                        <SelectItem key={u.id} value={u.nombre}>
                          {u.nombre} ({u.simbolo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {unidadesDelMismoTipo.length === 0 && (
                    <p className="text-xs text-amber-600">
                      No hay unidades del mismo tipo
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={guardando}
                className="h-11 px-6"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={guardando}
                className="h-11 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 gap-2"
              >
                {guardando ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {unidad ? "Actualizando..." : "Creando..."}
                  </span>
                ) : (
                  <>
                    {unidad ? "Actualizar" : "Crear"} Unidad
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
