"use client";

import { Plan, SubscriptionPlan } from "@/types/subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card className={`relative ${isPremium ? 'border-primary border-2' : ''} ${isCurrentPlan ? 'bg-muted' : ''}`}>
      {isPremium && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
            Más Popular
          </span>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
        <p className="text-muted-foreground text-sm">{plan.description}</p>
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
              <span className="text-primary mt-1">✓</span>
              <span className="text-sm">{feature}</span>
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
