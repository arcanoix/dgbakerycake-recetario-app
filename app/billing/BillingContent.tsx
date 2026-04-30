"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Package,
  BookOpen,
  Calendar,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Receipt,
  TrendingUp,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function BillingContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const { infoSuscripcion, solicitudes, cargando, recargarSolicitudes } =
    useSubscription();

  useEffect(() => {
    if (success === "true") {
      recargarSolicitudes();
    }
  }, [success]);

  const getStatusBadge = (status: string) => {
    const map = {
      pending: {
        class: "bg-amber-100 text-amber-700 border-none",
        icon: Clock,
        label: "Pendiente",
      },
      approved: {
        class: "bg-emerald-100 text-emerald-700 border-none",
        icon: CheckCircle,
        label: "Aprobado",
      },
      rejected: {
        class: "bg-red-100 text-red-700 border-none",
        icon: XCircle,
        label: "Rechazado",
      },
    };

    const config = map[status as keyof typeof map] ?? map.pending;
    const Icon = config.icon;

    return (
      <Badge className={`h-6 gap-1.5 px-2 font-bold ${config.class}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (cargando) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Cargando facturación...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Facturación y Planes
          </h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tu suscripción activa y revisa el historial de pagos
          </p>
        </div>
        <Link href="/pricing">
          <Button variant="outline" size="sm" className="h-10 px-4 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
            <TrendingUp className="w-4 h-4" />
            Mejorar Plan
          </Button>
        </Link>
      </div>

      <AnimatePresence>
        {success === "true" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <Card className="border-emerald-200 bg-emerald-50/50 shadow-none">
              <CardContent className="py-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-emerald-900 text-sm">¡Solicitud Enviada!</p>
                  <p className="text-xs text-emerald-700">Validaremos tu pago en las próximas 24 horas hábiles.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plan Actual */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-xl bg-card overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Crown className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-bold">Suscripción</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {infoSuscripcion ? (
                <>
                  <div className="text-center p-6 rounded-2xl bg-muted/30 border border-dashed space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Plan Activo</p>
                    <h3 className="text-2xl font-black text-primary uppercase">{infoSuscripcion.plan_display_name}</h3>
                    <Badge variant={infoSuscripcion.is_active ? "default" : "destructive"} className="font-black text-[10px]">
                      {infoSuscripcion.is_active ? "VERIFICADO" : "EXPIRADO"}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium flex items-center gap-2">
                           <Package className="w-4 h-4" /> Productos
                        </span>
                        <span className="font-bold">{infoSuscripcion.max_productos === -1 ? "Ilimitados" : infoSuscripcion.max_productos}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium flex items-center gap-2">
                           <BookOpen className="w-4 h-4" /> Recetas
                        </span>
                        <span className="font-bold">{infoSuscripcion.max_recetas === -1 ? "Ilimitadas" : infoSuscripcion.max_recetas}</span>
                     </div>
                  </div>

                  {infoSuscripcion.end_date && (
                    <div className="pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground font-medium">
                       <Calendar className="w-4 h-4" />
                       Vence: {formatDate(infoSuscripcion.end_date)}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-10 text-center space-y-4">
                   <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto opacity-20" />
                   <p className="text-sm text-muted-foreground font-medium">No se detectó una suscripción activa.</p>
                   <Button size="sm" onClick={() => recargarSolicitudes()} variant="ghost">Reintentar</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-muted/30">
            <CardContent className="p-6 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-tight">Soporte Premium</h4>
               </div>
               <p className="text-xs text-muted-foreground leading-relaxed">
                  ¿Tienes problemas con tu pago o necesitas ayuda con tu plan? Contáctanos directamente vía WhatsApp para una solución rápida.
               </p>
               <Button variant="outline" className="w-full h-10 font-bold text-xs uppercase tracking-widest gap-2">
                  <MessageCircle className="w-4 h-4" /> Contactar Soporte
               </Button>
            </CardContent>
          </Card>
        </div>

        {/* Historial */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-0 shadow-xl bg-card">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Historial de Solicitudes</CardTitle>
                    <CardDescription className="text-xs font-medium">Registro de tus solicitudes de actualización de plan.</CardDescription>
                  </div>
                </div>
                {solicitudes.length > 0 && (
                  <Button variant="ghost" size="icon" onClick={recargarSolicitudes} className="h-8 w-8 text-muted-foreground">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {solicitudes.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed rounded-3xl bg-muted/10">
                     <div className="p-4 rounded-full bg-muted/50 text-muted-foreground/30">
                        <Wallet className="w-12 h-12" />
                     </div>
                     <div className="space-y-1">
                        <p className="font-black text-sm uppercase tracking-wider">Sin movimientos registrados</p>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                          Aquí aparecerán tus solicitudes de pago una vez que elijas un plan premium.
                        </p>
                     </div>
                     <Link href="/pricing">
                        <Button className="h-10 px-6 font-black text-xs tracking-widest uppercase shadow-md bg-primary">
                          Explorar Planes
                        </Button>
                     </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                     {solicitudes.map((solicitud, index) => (
                       <motion.div
                        key={solicitud.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group p-5 rounded-2xl border bg-card hover:bg-muted/30 transition-all duration-200"
                       >
                         <div className="flex items-start justify-between gap-4">
                           <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-base uppercase tracking-tight">{solicitud.plan?.display_name}</h4>
                                {getStatusBadge(solicitud.status)}
                              </div>
                              <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                 <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(solicitud.created_at)}</span>
                                 <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> {solicitud.payment_method}</span>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-lg font-black text-primary">
                                 {solicitud.currency} {solicitud.amount.toLocaleString("es-VE")}
                              </p>
                              {solicitud.status === "rejected" && (
                                <Link href="/pricing">
                                  <button className="text-[10px] font-black text-destructive uppercase hover:underline">Reintentar Pago</button>
                                </Link>
                              )}
                           </div>
                         </div>

                         {solicitud.admin_notes && (
                           <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3 items-start">
                              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                              <div className="space-y-0.5">
                                 <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Respuesta Admin</p>
                                 <p className="text-xs font-medium text-blue-900/70">{solicitud.admin_notes}</p>
                              </div>
                           </div>
                         )}
                       </motion.div>
                     ))}
                  </div>
                )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
