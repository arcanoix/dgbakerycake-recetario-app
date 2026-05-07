"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserData } from "@/types/user";
import { Plan, SubscriptionPlanName } from "@/types/subscription";
import { obtenerTodosLosPlanes } from "@/lib/subscriptionStorage";
import { cambiarPlanUsuario } from "@/lib/subscriptionStorage";
import { Star, Zap, Crown, Building2, Loader2 } from "lucide-react";

interface ChangePlanDialogProps {
  usuario: UserData | null;
  onClose: () => void;
  onUpdate: () => void;
}

const PLAN_ICONS: Record<SubscriptionPlanName, React.ReactNode> = {
  free: <Star className="w-4 h-4" />,
  basico: <Zap className="w-4 h-4" />,
  profesional: <Crown className="w-4 h-4" />,
  empresarial: <Building2 className="w-4 h-4" />,
};

const PLAN_COLORS: Record<SubscriptionPlanName, string> = {
  free: "text-gray-600",
  basico: "text-blue-600",
  profesional: "text-purple-600",
  empresarial: "text-orange-600",
};

export const ChangePlanDialog = ({
  usuario,
  onClose,
  onUpdate,
}: ChangePlanDialogProps) => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [planSeleccionado, setPlanSeleccionado] = useState<string>("");
  const [cargando, setCargando] = useState(false);
  const [cargandoPlanes, setCargandoPlanes] = useState(true);

  useEffect(() => {
    if (usuario) {
      cargarPlanes();
    }
  }, [usuario]);

  const cargarPlanes = async () => {
    setCargandoPlanes(true);
    const planesData = await obtenerTodosLosPlanes();
    setPlanes(planesData);
    setCargandoPlanes(false);
  };

  const handleCambiarPlan = async () => {
    if (!usuario || !planSeleccionado) return;

    const planElegido = planes.find((p) => p.id === planSeleccionado);
    if (!planElegido) return;

    const confirmacion = confirm(
      `¿Cambiar el plan de ${usuario.email} a "${planElegido.display_name}"?\n\n` +
      `Plan actual: ${usuario.plan_display_name}\n` +
      `Nuevo plan: ${planElegido.display_name}\n\n` +
      `Esto actualizará inmediatamente los límites y características del usuario.`
    );

    if (!confirmacion) return;

    setCargando(true);

    const resultado = await cambiarPlanUsuario(usuario.id, planSeleccionado);

    if (resultado.exitoso) {
      alert(`Plan cambiado exitosamente a ${planElegido.display_name}`);
      onUpdate();
      onClose();
    } else {
      alert(`Error al cambiar plan: ${resultado.error}`);
    }

    setCargando(false);
  };

  if (!usuario) return null;

  return (
    <Dialog open={!!usuario} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cambiar Plan de Suscripción</DialogTitle>
          <DialogDescription>
            Cambiar el plan de suscripción para <strong>{usuario.email}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Actual */}
          <div className="space-y-2">
            <Label>Plan Actual</Label>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
              {usuario.plan_name && (
                <div className={PLAN_COLORS[usuario.plan_name as SubscriptionPlanName]}>
                  {PLAN_ICONS[usuario.plan_name as SubscriptionPlanName]}
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold">{usuario.plan_display_name || 'Sin plan'}</div>
                <div className="text-xs text-muted-foreground">
                  {usuario.plan_name || 'N/A'}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {usuario.max_productos || 0} productos / {usuario.max_recetas || 0} recetas
              </div>
            </div>
          </div>

          {/* Selector de Nuevo Plan */}
          <div className="space-y-2">
            <Label htmlFor="plan">Nuevo Plan</Label>
            {cargandoPlanes ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <Select
                value={planSeleccionado}
                onValueChange={setPlanSeleccionado}
              >
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  {planes.map((plan) => (
                    <SelectItem
                      key={plan.id}
                      value={plan.id}
                      disabled={plan.name === usuario.plan_name}
                    >
                      <div className="flex items-center gap-2">
                        <span className={PLAN_COLORS[plan.name]}>
                          {PLAN_ICONS[plan.name]}
                        </span>
                        <span className="font-medium">{plan.display_name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({plan.max_productos} prod / {plan.max_recetas} rec)
                        </span>
                        {plan.name === usuario.plan_name && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            (Actual)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Información del Plan Seleccionado */}
          {planSeleccionado && (
            <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
              <div className="text-sm space-y-2">
                {(() => {
                  const plan = planes.find((p) => p.id === planSeleccionado);
                  if (!plan) return null;
                  return (
                    <>
                      <div className="font-semibold text-primary">
                        Características del plan {plan.display_name}:
                      </div>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Hasta {plan.max_productos} productos</li>
                        <li>• Hasta {plan.max_recetas} recetas</li>
                        <li>• Precio: ${plan.price_usd} USD / mes</li>
                        {plan.description && (
                          <li className="mt-2 text-xs italic">{plan.description}</li>
                        )}
                      </ul>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={cargando}>
            Cancelar
          </Button>
          <Button
            onClick={handleCambiarPlan}
            disabled={!planSeleccionado || cargando}
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cambiando...
              </>
            ) : (
              "Cambiar Plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
