"use client";


import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PricingCard } from "@/components/subscription/PricingCard";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionPlan } from "@/types/subscription";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { motion } from "motion/react";
import { Crown, CreditCard, Wallet, Globe, Check, Sparkles } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const { planes, infoSuscripcion, cargando } = useSubscription();
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.name === 'free') {
      return;
    }
    router.push(`/payment?plan=${plan.id}`);
  };

  if (cargando) {
    return (
      <ProtectedRoute>
        <Loading text="Cargando planes..." fullScreen />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100/30 rounded-full">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">Planes y Precios</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
            Elige tu Plan Perfecto
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Potencia tu negocio de repostería con las herramientas que necesitas
          </p>
          
          {infoSuscripcion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 rounded-xl border border-violet-200"
            >
              <Crown className="w-5 h-5 text-violet-500" />
              <span className="text-sm font-medium">Plan actual:</span>
              <span className="font-bold text-violet-700">{infoSuscripcion.plan_display_name}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Planes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          {planes.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <PricingCard
                plan={plan}
                isCurrentPlan={infoSuscripcion?.plan_name === plan.name}
                onSelect={handleSelectPlan}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="max-w-3xl mx-auto border-0 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500" />
            <CardContent className="py-8">
              <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                Métodos de Pago Aceptados
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-emerald-50/30 rounded-xl p-5 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold text-emerald-900">🇻🇪 Venezuela</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-emerald-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> Pago Móvil
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> Binance (USDT)
                    </li>
                  </ul>
                </div>
                
                <div className="bg-blue-50/30 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">🌎 Internacional</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> PayPal
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> Binance (USDT)
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-amber-50/30 rounded-xl p-4 border border-amber-100">
                <div className="flex items-start gap-3">
                  <Wallet className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Verificación manual
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Todos los pagos son verificados manualmente. Tu suscripción se activará dentro de 24 horas hábiles después de la aprobación.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
