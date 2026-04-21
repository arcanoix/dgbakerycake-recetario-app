"use client";

import { useState, useEffect } from "react";
import { ConfiguracionGlobal, ConfiguracionFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OPCIONES_MONEDA } from "@/lib/constants";
import { motion, AnimatePresence } from "motion/react";
import { Globe, TrendingUp, Percent, Save, Check, DollarSign, Calculator } from "lucide-react";

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
  const [guardando, setGuardando] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    onSubmit(formData);
    setGuardado(true);
    setGuardando(false);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500" />
        
        <CardHeader className="pb-6 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            Configuración Global
          </CardTitle>
          <CardDescription className="text-gray-700 mt-1">
            Configura los valores por defecto para el cálculo de costos en tu negocio
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección: Moneda */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Moneda y Tasa de Cambio</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="moneda" className="text-sm font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    Moneda *
                  </Label>
                  <Select
                    id="moneda"
                    name="moneda"
                    value={formData.moneda}
                    onChange={handleChange}
                    required
                    className="h-11"
                  >
                    {OPCIONES_MONEDA.map((opcion) => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-700">
                    Moneda utilizada para mostrar precios y costos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tasaCambioUSD" className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    Tasa de Cambio USD (BCV)
                  </Label>
                  <div className="relative">
                    <Input
                      id="tasaCambioUSD"
                      name="tasaCambioUSD"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.tasaCambioUSD || ""}
                      onChange={handleChange}
                      placeholder="50.00"
                      className="h-11 pl-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">VES</span>
                  </div>
                  <p className="text-xs text-gray-700">
                    Tipo de cambio oficial del Banco Central de Venezuela
                  </p>
                </div>
              </div>
            </div>

            {/* Sección: Precios */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Precios de Venta</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="margenGananciaDefecto" className="text-sm font-medium flex items-center gap-2">
                    <Percent className="w-4 h-4 text-violet-500" />
                    Margen de Ganancia (%) - Defecto
                  </Label>
                  <div className="relative">
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
                      className="h-11 pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">%</span>
                  </div>
                  <p className="text-xs text-gray-700">
                    Porcentaje de ganancia por defecto para calcular precio de venta
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-500" />
                    Ejemplo de Precio de Venta
                  </Label>
                  <div className="h-11 bg-gradient-to-r from-blue-50 to-violet-50 rounded-lg border border-blue-200 flex items-center px-4">
                    <span className="text-sm text-gray-800">
                      Costo: <span className="font-semibold text-gray-900">100 {formData.moneda}</span>
                    </span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="text-sm text-gray-800">
                      Venta: <span className="font-bold text-violet-600">
                        {(100 * (1 + (formData.margenGananciaDefecto || 0) / 100)).toFixed(2)} {formData.moneda}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">
                    Preview automático basado en el margen configurado
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de Guardar */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <AnimatePresence mode="wait">
                {guardado && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-2 text-green-600"
                  >
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Configuración guardada exitosamente</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!guardado && <div />}

              <Button 
                type="submit" 
                size="lg"
                disabled={guardando}
                className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 border-0 min-w-[200px]"
              >
                {guardando ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Guardando...
                  </span>
                ) : guardado ? (
                  <>
                    <Check className="w-4 h-4" />
                    Guardado
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Configuración
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
