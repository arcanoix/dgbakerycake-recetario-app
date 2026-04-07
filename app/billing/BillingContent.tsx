"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, CheckCircle, XCircle, Clock, Crown, Package, BookOpen, Calendar, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

export default function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  
  const { infoSuscripcion, solicitudes, cargando, recargarSolicitudes } = useSubscription();

  useEffect(() => {
    if (success === "true") {
      recargarSolicitudes();
    }
  }, [success]);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: "bg-yellow-100 dark:bg-yellow-900/50", text: "text-yellow-700 dark:text-yellow-300", label: "Pendiente", icon: <Clock className="w-4 h-4" /> },
      approved: { bg: "bg-green-100 dark:bg-green-900/50", text: "text-green-700 dark:text-green-300", label: "Aprobado", icon: <CheckCircle className="w-4 h-4" /> },
      rejected: { bg: "bg-red-100 dark:bg-red-900/50", text: "text-red-700 dark:text-red-300", label: "Rechazado", icon: <XCircle className="w-4 h-4" /> },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.pending;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-t-transparent border-violet-500 animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          Facturación y Suscripción
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gestiona tu plan y revisa tus pagos
        </p>
      </motion.div>

      {/* Mensaje de éxito */}
      <AnimatePresence>
        {success === "true" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
              <CardContent className="py-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    Solicitud de pago enviada exitosamente
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Tu solicitud será revisada por un administrador. Te notificaremos cuando sea aprobada.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Actual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500" />
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              Plan Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {infoSuscripcion ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      {infoSuscripcion.plan_display_name}
                      {infoSuscripcion.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                          <CheckCircle className="w-3 h-3" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                          <XCircle className="w-3 h-3" /> Inactivo
                        </span>
                      )}
                    </h3>
                  </div>
                  <Link href="/pricing">
                    <Button className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 border-0">
                      Cambiar Plan
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Productos</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {infoSuscripcion.max_productos === -1 ? "Ilimitados" : infoSuscripcion.max_productos}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Recetas</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {infoSuscripcion.max_recetas === -1 ? "Ilimitadas" : infoSuscripcion.max_recetas}
                      </p>
                    </div>
                  </div>
                </div>

                {infoSuscripcion.end_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Válido hasta: {formatDate(infoSuscripcion.end_date)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="w-5 h-5" />
                <span>No se pudo cargar información de suscripción</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Historial de Solicitudes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              Historial de Solicitudes de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            {solicitudes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">No tienes solicitudes de pago</p>
                <Link href="/pricing">
                  <Button className="gap-2">
                    Ver Planes
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudes.map((solicitud, index) => (
                  <motion.div
                    key={solicitud.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{solicitud.plan?.display_name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(solicitud.created_at)}
                        </p>
                      </div>
                      {getStatusBadge(solicitud.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Método</p>
                        <p className="font-medium">{solicitud.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Monto</p>
                        <p className="font-bold text-violet-600 dark:text-violet-400">
                          {solicitud.currency} {solicitud.amount.toLocaleString('es-VE')}
                        </p>
                      </div>
                    </div>

                    {solicitud.admin_notes && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">Notas del Administrador:</p>
                        <p className="text-sm text-blue-800 dark:text-blue-300">{solicitud.admin_notes}</p>
                      </div>
                    )}

                    {solicitud.status === "rejected" && (
                      <div className="mt-3">
                        <Link href="/pricing">
                          <Button size="sm" variant="outline" className="gap-2">
                            Intentar Nuevamente
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    )}
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
