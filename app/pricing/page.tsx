"use client";


import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PricingCard } from "@/components/subscription/PricingCard";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionPlan } from "@/types/subscription";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { Crown, CreditCard, Wallet, Globe, Check, Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const { planes, infoSuscripcion, cargando } = useSubscription();
  
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.name === 'free') {
      router.push('/dashboard');
      return;
    }
    router.push(`/payment?plan=${plan.id}`);
  };

  if (cargando) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Preparando planes...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-12">
        {/* Header con estética shadcn-admin */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Planes & Beneficios</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Escala tu Repostería al Siguiente Nivel
          </h2>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
            Elige el plan que mejor se adapte a tu volumen de producción. 
            Cero comisiones por venta, solo herramientas para crecer.
          </p>
          
          {infoSuscripcion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 rounded-2xl bg-muted/50 border flex items-center gap-3 shadow-sm"
            >
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <Crown className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Tu suscripción actual</p>
                <p className="font-bold text-sm text-primary uppercase">{infoSuscripcion.plan_display_name}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Planes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4">
          {planes.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PricingCard
                plan={plan}
                isCurrentPlan={infoSuscripcion?.plan_name === plan.name}
                onSelect={handleSelectPlan}
              />
            </motion.div>
          ))}
        </div>

        {/* FAQ / Info adicional */}
        <div className="max-w-4xl mx-auto space-y-8 pt-8">
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-3 p-6 rounded-3xl bg-muted/30 border">
              <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-600">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="font-black text-sm uppercase tracking-wider">Pagos en Venezuela</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Aceptamos <strong>Pago Móvil</strong> a tasa BCV. También puedes pagar vía 
                Binance (USDT) para mayor comodidad. Los planes se activan tras validación manual.
              </p>
            </div>
            
            <div className="space-y-3 p-6 rounded-3xl bg-muted/30 border">
              <div className="p-2 w-fit rounded-lg bg-blue-500/10 text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-black text-sm uppercase tracking-wider">Seguridad y Soporte</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tus datos de recetas y costos están protegidos. Ofrecemos soporte prioritario 
                vía WhatsApp para planes Básico y superiores para ayudarte en tu gestión.
              </p>
            </div>
          </div>

          <div className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">
              DGcost • Soluciones Tecnológicas para Repostería
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
