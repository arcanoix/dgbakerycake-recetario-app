"use client";

import { Plan, SubscriptionPlan } from "@/types/subscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, ShieldCheck, Crown } from "lucide-react";
import { motion } from "motion/react";

interface PricingCardProps {
  plan: Plan | SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelect: (plan: any) => void;
}

export const PricingCard = ({ plan, isCurrentPlan, onSelect }: PricingCardProps) => {
  const features = [
    { text: `${plan.max_productos === -1 ? 'Productos ilimitados' : `Hasta ${plan.max_productos} productos`}`, icon: Check },
    { text: `${plan.max_recetas === -1 ? 'Recetas ilimitadas' : `Hasta ${plan.max_recetas} recetas`}`, icon: Check },
    { text: `Soporte ${plan.features?.soporte || 'básico'}`, icon: ShieldCheck },
  ];

  if (plan.features?.analytics) {
    features.push({ text: 'Dashboard con analytics', icon: Zap });
  }

  if (plan.features?.exportar_datos) {
    features.push({ text: 'Exportar datos en PDF', icon: Sparkles });
  }

  const isFreePlan = plan.name === 'free';
  const isBasico = plan.name === 'basico';
  const isPremium = plan.name === 'empresarial';
  const isPopular = isBasico; // Marcamos el básico como popular

  return (
    <Card className={`relative flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden border-0 shadow-lg bg-card ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
      {isPopular && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest py-1.5 px-10 transform rotate-45 translate-x-8 translate-y-3 shadow-sm">
            Popular
          </div>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute top-3 left-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold text-[10px] tracking-wider uppercase">
            Plan Actual
          </Badge>
        </div>
      )}
      
      <CardHeader className={`pt-12 pb-8 text-center ${isPopular ? 'bg-primary/5' : ''}`}>
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-2xl shadow-inner ${isPremium ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
             {isPremium ? <Crown className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
          </div>
        </div>
        <CardTitle className="text-2xl font-black tracking-tight">{plan.display_name}</CardTitle>
        <CardDescription className="font-medium text-xs h-8 line-clamp-2 px-4">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-8 space-y-8">
        {/* Precio */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-5xl font-black tracking-tighter">
              {plan.price_usd === 0 ? 'Free' : `$${plan.price_usd}`}
            </span>
            {plan.price_usd > 0 && <span className="text-muted-foreground font-bold">/mes</span>}
          </div>
          {plan.price_bs > 0 && (
            <Badge variant="outline" className="mt-2 font-bold text-[10px] bg-muted/30">
              ~{plan.price_bs.toLocaleString('es-VE')} Bs.
            </Badge>
          )}
        </div>

        <Separator className="opacity-50" />

        {/* Características */}
        <ul className="flex-1 space-y-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-0.5 p-0.5 rounded-full bg-primary/10 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium text-muted-foreground leading-tight">{feature.text}</span>
              </li>
            );
          })}
        </ul>

        {/* Botón */}
        <Button
          onClick={() => onSelect(plan)}
          disabled={isCurrentPlan}
          variant={isPopular ? 'default' : 'outline'}
          className={`w-full h-12 font-black tracking-widest uppercase text-xs shadow-md transition-all ${isPopular ? 'bg-primary hover:shadow-xl' : 'hover:bg-primary/5'}`}
        >
          {isCurrentPlan ? 'Plan Actual' : isFreePlan ? 'Explorar Gratis' : 'Seleccionar Plan'}
        </Button>
      </CardContent>
    </Card>
  );
};
