"use client";

import { useState, useEffect } from "react";
import { GastoFijo, GastoFijoFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, Hash, Save, X } from "lucide-react";

interface GastoFijoFormProps {
  gastoFijo?: GastoFijo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (datos: GastoFijoFormData) => Promise<boolean>;
  moneda: string;
}

export const GastoFijoForm = ({
  gastoFijo,
  open,
  onOpenChange,
  onSubmit,
  moneda = "USD",
}: GastoFijoFormProps) => {
  const [formData, setFormData] = useState<GastoFijoFormData>({
    nombre: "",
    montoMensual: 5,
    unidadesEstimadas: 20,
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (gastoFijo) {
      setFormData({
        nombre: gastoFijo.nombre,
        montoMensual: gastoFijo.montoMensual,
        unidadesEstimadas: gastoFijo.unidadesEstimadas,
      });
    } else {
      setFormData({
        nombre: "",
        montoMensual: 5,
        unidadesEstimadas: 20,
      });
    }
    setError(null);
  }, [gastoFijo, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    if (formData.montoMensual <= 0) {
      setError("El monto mensual debe ser mayor a 0");
      return;
    }

    if (formData.unidadesEstimadas <= 0) {
      setError("Las unidades estimadas deben ser mayor a 0");
      return;
    }

    setGuardando(true);
    const exitoso = await onSubmit(formData);
    setGuardando(false);

    if (exitoso) {
      onOpenChange(false);
    }
  };

  const handleValueChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const costoAsignado = formData.unidadesEstimadas > 0 
    ? formData.montoMensual / formData.unidadesEstimadas 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {gastoFijo ? "Editar Gasto Fijo" : "Nuevo Gasto Fijo"}
          </DialogTitle>
          <DialogDescription>
            {gastoFijo
              ? "Modifica los datos del gasto fijo"
              : "Agrega un nuevo gasto fijo mensual para distribución de costos"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nombre del Gasto
              </Label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => handleValueChange("nombre", e.target.value)}
                placeholder="Ej: Electricidad, Gas, Agua"
                className="h-11"
                disabled={guardando}
              />
            </div>

            {/* Monto Mensual */}
            <div className="space-y-2">
              <Label htmlFor="montoMensual" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Monto Mensual ({moneda})
              </Label>
              <div className="relative">
                <Input
                  id="montoMensual"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.montoMensual}
                  onChange={(e) => handleValueChange("montoMensual", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="h-11 pl-10"
                  disabled={guardando}
                />
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Unidades Estimadas */}
            <div className="space-y-2">
              <Label htmlFor="unidadesEstimadas" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Unidades Estimadas Mensuales
              </Label>
              <div className="relative">
                <Input
                  id="unidadesEstimadas"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.unidadesEstimadas}
                  onChange={(e) => handleValueChange("unidadesEstimadas", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="h-11 pl-10"
                  disabled={guardando}
                />
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground px-1">
                Cantidad estimada de productos/recetas que produces al mes
              </p>
            </div>

            {/* Vista Previa del Costo Asignado */}
            <div className="p-4 bg-primary/5 rounded-xl border-2 border-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Costo Asignado por Unidad</span>
                <span className="text-lg font-black text-primary">
                  {moneda} {costoAsignado.toFixed(4)}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Este es el costo que se asignará a cada unidad producida
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={guardando}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando} className="gap-2">
              <Save className="w-4 h-4" />
              {guardando ? "Guardando..." : gastoFijo ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
