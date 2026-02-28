"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PricingCard } from "@/components/subscription/PricingCard";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionPlan } from "@/types/subscription";
import { Card, CardContent } from "@/components/ui/card";

export default function PricingPage() {
  const router = useRouter();
  const { planes, infoSuscripcion, cargando } = useSubscription();

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.name === 'free') {
      return; // No hacer nada para plan gratuito
    }

    // Redirigir a página de pago
    router.push(`/payment?plan=${plan.id}`);
  };

  if (cargando) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <p className="text-center">Cargando planes...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Planes y Precios</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige el plan perfecto para tu negocio de repostería
          </p>
          {infoSuscripcion && (
            <Card className="max-w-md mx-auto">
              <CardContent className="py-4">
                <p className="text-sm">
                  <span className="font-semibold">Plan actual:</span>{' '}
                  {infoSuscripcion.plan_display_name}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {planes.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={infoSuscripcion?.plan_name === plan.name}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        {/* Información adicional */}
        <div className="max-w-3xl mx-auto mt-12">
          <Card>
            <CardContent className="py-6 space-y-4">
              <h3 className="text-xl font-bold">💳 Métodos de Pago Aceptados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold mb-2">🇻🇪 Venezuela:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Pago Móvil</li>
                    <li>• Transferencia Bancaria</li>
                    <li>• Binance (USDT)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">🌎 Internacional:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Zelle</li>
                    <li>• PayPal</li>
                    <li>• Binance (USDT)</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Todos los pagos son verificados manualmente. Tu suscripción se activará dentro de 24 horas hábiles después de la aprobación.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
