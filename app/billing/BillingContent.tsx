"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

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

  /* ─── Status badge ───────────────────────────────────────────── */
  const getStatusBadge = (status: string) => {
    const map = {
      pending: {
        wrapper:
          "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
        icon: <Clock className="w-3.5 h-3.5" />,
        label: "Pendiente",
      },
      approved: {
        wrapper:
          "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        label: "Aprobado",
      },
      rejected: {
        wrapper:
          "bg-red-100 text-red-800 border border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
        icon: <XCircle className="w-3.5 h-3.5" />,
        label: "Rechazado",
      },
    };

    const badge = map[status as keyof typeof map] ?? map.pending;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.wrapper}`}
      >
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  /* ─── Date format ────────────────────────────────────────────── */
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  /* ─── Loading ────────────────────────────────────────────────── */
  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-full border-4 border-muted animate-spin border-t-violet-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-violet-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Cargando información de facturación…
          </p>
        </motion.div>
      </div>
    );
  }

  /* ─── Page ───────────────────────────────────────────────────── */
  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Facturación &amp; Suscripción
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gestiona tu plan y revisa tus solicitudes de pago
            </p>
          </div>
        </div>

        <Link href="/pricing">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/50"
          >
            <TrendingUp className="w-4 h-4 text-violet-500" />
            Ver Planes
          </Button>
        </Link>
      </motion.div>

      {/* ── Banner de éxito ── */}
      <AnimatePresence>
        {success === "true" && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Solicitud enviada exitosamente
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Un administrador revisará tu solicitud y recibirás una
                  notificación al aprobarse.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Plan Actual ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <Card className="relative overflow-hidden border-0 shadow-xl">
          {/* Barra de color superior */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500" />

          <CardHeader className="pb-3 pt-6">
            <CardTitle className="text-base flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-sm shadow-violet-500/40">
                <Crown className="w-4 h-4 text-white" />
              </div>
              Plan Actual
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {infoSuscripcion ? (
              <>
                {/* Plan name + status + CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl font-bold">
                      {infoSuscripcion.plan_display_name}
                    </h3>
                    {infoSuscripcion.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        Inactivo
                      </span>
                    )}
                  </div>

                  <Link href="/pricing">
                    <Button className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 border-0 shadow-md shadow-violet-500/25">
                      <Sparkles className="w-4 h-4" />
                      Cambiar Plan
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {/* Stats tiles */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Productos */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/60">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Productos
                      </p>
                      <p className="text-lg font-bold leading-tight">
                        {infoSuscripcion.max_productos === -1
                          ? "∞ Ilimitados"
                          : infoSuscripcion.max_productos}
                      </p>
                    </div>
                  </div>

                  {/* Recetas */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/60">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Recetas
                      </p>
                      <p className="text-lg font-bold leading-tight">
                        {infoSuscripcion.max_recetas === -1
                          ? "∞ Ilimitadas"
                          : infoSuscripcion.max_recetas}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vencimiento */}
                {infoSuscripcion.end_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border/60 pt-4">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Válido hasta:{" "}
                      <span className="font-medium text-foreground">
                        {formatDate(infoSuscripcion.end_date)}
                      </span>
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 py-4 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">
                  No se pudo cargar la información de suscripción.{" "}
                  <button
                    onClick={() => recargarSolicitudes()}
                    className="underline underline-offset-2 hover:no-underline font-medium"
                  >
                    Reintentar
                  </button>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Historial de Solicitudes ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card className="relative overflow-hidden border-0 shadow-lg">
          {/* Barra de color superior */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />

          <CardHeader className="pb-3 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm shadow-blue-500/40">
                  <Receipt className="w-4 h-4 text-white" />
                </div>
                Historial de Solicitudes
              </CardTitle>

              {solicitudes.length > 0 && (
                <button
                  onClick={recargarSolicitudes}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Recargar solicitudes"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {solicitudes.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-14 gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <CreditCard className="w-9 h-9 text-muted-foreground/50" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">0</span>
                  </div>
                </div>
                <div className="text-center max-w-xs">
                  <p className="font-semibold text-foreground mb-1">
                    Sin solicitudes de pago
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cuando realices una solicitud de pago para un plan, aparecerá
                    aquí junto con su estado.
                  </p>
                </div>
                <Link href="/pricing">
                  <Button className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 border-0 shadow-md shadow-violet-500/25 mt-2">
                    Explorar Planes
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {solicitudes.map((solicitud, index) => (
                  <motion.div
                    key={solicitud.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.06, duration: 0.35 }}
                    className="group relative overflow-hidden rounded-xl border border-border/80 bg-card hover:shadow-md transition-all duration-200 hover:border-violet-200 dark:hover:border-violet-800/60"
                  >
                    {/* Accent stripe by status */}
                    <div
                      className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${
                        solicitud.status === "approved"
                          ? "bg-emerald-500"
                          : solicitud.status === "rejected"
                          ? "bg-red-500"
                          : "bg-amber-400"
                      }`}
                    />

                    <div className="pl-5 pr-4 py-4 space-y-3">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-base leading-tight">
                            {solicitud.plan?.display_name}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(solicitud.created_at)}
                          </p>
                        </div>
                        {getStatusBadge(solicitud.status)}
                      </div>

                      {/* Info row */}
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Método
                          </p>
                          <p className="font-medium capitalize">
                            {solicitud.payment_method}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Monto
                          </p>
                          <p className="font-bold text-violet-600 dark:text-violet-400">
                            {solicitud.currency}{" "}
                            {solicitud.amount.toLocaleString("es-VE")}
                          </p>
                        </div>
                      </div>

                      {/* Admin notes */}
                      {solicitud.admin_notes && (
                        <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-800/40">
                          <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 mb-1 uppercase tracking-wide">
                            Notas del Administrador
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            {solicitud.admin_notes}
                          </p>
                        </div>
                      )}

                      {/* Retry CTA */}
                      {solicitud.status === "rejected" && (
                        <div className="pt-1">
                          <Link href="/pricing">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 text-xs h-8 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                            >
                              Intentar Nuevamente
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
