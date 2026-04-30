"use client";

import { useState, useEffect } from "react";
import { ConfiguracionGlobal, ConfiguracionFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OPCIONES_MONEDA } from "@/lib/constants";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, 
  TrendingUp, 
  Percent, 
  Save, 
  Check, 
  DollarSign, 
  Calculator,
  Coins,
  Scale,
  RefreshCw,
  Info
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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
    await onSubmit(formData);
    setGuardado(true);
    setGuardando(false);
    setTimeout(() => setGuardado(false), 3000);
  };

  const handleValueChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="moneda" className="w-full">
        <TabsList className="bg-muted/50 p-1 border h-11 mb-6">
          <TabsTrigger value="moneda" className="gap-2 h-9 px-4 font-bold data-[state=active]:shadow-sm">
            <Coins className="w-4 h-4" />
            Moneda y Tasa
          </TabsTrigger>
          <TabsTrigger value="precios" className="gap-2 h-9 px-4 font-bold data-[state=active]:shadow-sm">
            <TrendingUp className="w-4 h-4" />
            Precios y Ganancia
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="moneda" className="m-0 space-y-6">
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Moneda del Sistema</CardTitle>
                    <CardDescription>Define la moneda principal y las tasas de conversión.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="moneda" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Moneda Principal</Label>
                    <Select 
                      value={formData.moneda} 
                      onValueChange={(val) => handleValueChange("moneda", val)}
                    >
                      <SelectTrigger className="h-12 bg-white">
                        <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPCIONES_MONEDA.map((opcion) => (
                          <SelectItem key={opcion.value} value={opcion.value}>
                            {opcion.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground font-medium px-1">
                      Afecta la visualización de costos en productos, recetas y ventas.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="tasa" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tasa de Cambio (VES/USD)</Label>
                    <div className="relative">
                      <Input
                        id="tasa"
                        type="number"
                        step="0.01"
                        value={formData.tasaCambioUSD || ""}
                        onChange={(e) => handleValueChange("tasaCambioUSD", parseFloat(e.target.value) || 0)}
                        placeholder="Ej: 50.00"
                        className="h-12 pl-12 bg-white"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">Bs.</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium px-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Valor oficial del BCV para cálculos de precio dual.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-2xl border border-dashed flex items-start gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10 text-blue-600">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">¿Cómo funciona la tasa?</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      El sistema utiliza esta tasa para mostrarte precios equivalentes en dólares y bolívares. 
                      Mantenerla actualizada te garantiza cálculos de costos precisos frente a la inflación.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="precios" className="m-0 space-y-6">
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Márgenes y Ganancias</CardTitle>
                    <CardDescription>Valores sugeridos para el cálculo de tus precios de venta.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="margen" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Margen de Ganancia General (%)</Label>
                    <div className="relative">
                      <Input
                        id="margen"
                        type="number"
                        step="0.01"
                        value={formData.margenGananciaDefecto || ""}
                        onChange={(e) => handleValueChange("margenGananciaDefecto", parseFloat(e.target.value) || 0)}
                        placeholder="Ej: 30"
                        className="h-12 pr-12 bg-white"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium px-1">
                      Este porcentaje se aplicará automáticamente a tus nuevas recetas.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vista Previa de Cálculo</Label>
                    <div className="h-12 bg-gradient-to-r from-violet-500/5 to-primary/5 rounded-xl border-2 border-primary/10 flex items-center justify-between px-6 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Si el Costo es</span>
                        <span className="font-bold text-sm">100 {formData.moneda}</span>
                      </div>
                      <div className="h-4 w-px bg-primary/20" />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary uppercase">P. Venta será</span>
                        <span className="font-black text-primary text-base">
                          {(100 * (1 + (formData.margenGananciaDefecto || 0) / 100)).toFixed(2)} {formData.moneda}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-4 border-t">
                  <div className="space-y-3">
                    <Label htmlFor="costoHora" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Costo de Mano de Obra por Hora (Defecto)</Label>
                    <div className="relative">
                      <Input
                        id="costoHora"
                        type="number"
                        step="0.01"
                        value={formData.costoPorHoraDefecto || ""}
                        onChange={(e) => handleValueChange("costoPorHoraDefecto", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="h-12 pl-12 bg-white"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">{formData.moneda}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium px-1 italic">
                      Nota: Actualmente este valor no se utiliza en los cálculos automáticos de recetas (solo insumos).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Footer Acciones */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
        <AnimatePresence>
          {guardado && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100"
            >
              <Check className="w-4 h-4" />
              ¡Configuración actualizada con éxito!
            </motion.div>
          )}
        </AnimatePresence>
        
        {!guardado && <div className="hidden sm:block" />}

        <Button 
          type="submit" 
          size="lg"
          disabled={guardando}
          className="w-full sm:w-auto gap-2 h-12 px-8 font-black shadow-lg bg-primary hover:shadow-xl transition-all"
        >
          {guardando ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              GUARDANDO...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              GUARDAR CAMBIOS
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
