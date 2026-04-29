"use client";

import { Plan, SubscriptionPlan } from "@/types/subscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { formatearMoneda } from "@/lib/constants";

interface PricingCardProps {
  plan: Plan | SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelect: (plan: any) => void;
}

export const PricingCard = ({ plan, isCurrentPlan, onSelect }: PricingCardProps) => {
  const features = [
    `${plan.max_productos === -1 ? 'Productos ilimitados' : `Hasta ${plan.max_productos} productos`}`,
    `${plan.max_recetas === -1 ? 'Recetas ilimitadas' : `Hasta ${plan.max_recetas} recetas`}`,
    `Soporte ${plan.features?.soporte || 'básico'}`,
  ];

  if (plan.features?.analytics) {
    features.push('Dashboard con analytics');
  }

  if (plan.features?.exportar_datos) {
    features.push('Exportar datos');
  }

  if (plan.features?.api_access) {
    features.push('Acceso a API');
  }

  const isFreePlan = plan.name === 'free';
  const isPremium = plan.name === 'empresarial';

  return (
    <Card className={`relative ${isPremium ? 'border-primary border-2 shadow-lg' : ''} ${isCurrentPlan ? 'bg-muted/50' : ''} transition-all hover:shadow-md`}>
      {isPremium && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground shadow-md">
            Más Popular
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary" className="shadow-md">
            Plan Actual
          </Badge>
        </div>
      )}
      
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Precio */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {plan.price_usd === 0 ? 'Gratis' : `$${plan.price_usd}`}
            </span>
            {plan.price_usd > 0 && <span className="text-muted-foreground">/mes</span>}
          </div>
          {plan.price_bs > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Bs. {plan.price_bs.toLocaleString('es-VE')} /mes
            </p>
          )}
        </div>

        {/* Características */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Botón */}
        <Button
          onClick={() => onSelect(plan)}
          disabled={isCurrentPlan}
          variant={isPremium ? 'default' : 'outline'}
          className="w-full"
        >
          {isCurrentPlan ? 'Plan Actual' : isFreePlan ? 'Plan Gratuito' : 'Seleccionar Plan'}
        </Button>
      </CardContent>
    </Card>
  );
};
