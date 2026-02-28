"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function BillingContent() {
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
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "⏳ Pendiente" },
      approved: { bg: "bg-green-100", text: "text-green-800", label: "✓ Aprobado" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "✗ Rechazado" },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
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
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <p className="text-center">Cargando...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Facturación y Suscripción</h1>
          <p className="text-muted-foreground">Gestiona tu plan y revisa tus pagos</p>
        </div>

        {/* Mensaje de éxito */}
        {success === "true" && (
          <Card className="border-green-500 bg-green-50">
            <CardContent className="py-4">
              <p className="text-green-800 font-semibold">
                ✓ Solicitud de pago enviada exitosamente
              </p>
              <p className="text-sm text-green-700 mt-1">
                Tu solicitud será revisada por un administrador. Te notificaremos cuando sea aprobada.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Plan Actual */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {infoSuscripcion ? (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold">{infoSuscripcion.plan_display_name}</h3>
                    <p className="text-muted-foreground">
                      Estado: {infoSuscripcion.is_active ? "✓ Activo" : "✗ Inactivo"}
                    </p>
                  </div>
                  <Link href="/pricing">
                    <Button>Cambiar Plan</Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Productos</p>
                    <p className="text-lg font-semibold">
                      {infoSuscripcion.max_productos === -1 ? "Ilimitados" : infoSuscripcion.max_productos}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recetas</p>
                    <p className="text-lg font-semibold">
                      {infoSuscripcion.max_recetas === -1 ? "Ilimitadas" : infoSuscripcion.max_recetas}
                    </p>
                  </div>
                </div>

                {infoSuscripcion.end_date && (
                  <p className="text-sm text-muted-foreground">
                    Válido hasta: {formatDate(infoSuscripcion.end_date)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No se pudo cargar información de suscripción</p>
            )}
          </CardContent>
        </Card>

        {/* Historial de Solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Solicitudes de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            {solicitudes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No tienes solicitudes de pago</p>
                <Link href="/pricing">
                  <Button>Ver Planes</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudes.map((solicitud) => (
                  <div
                    key={solicitud.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{solicitud.plan?.display_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(solicitud.created_at)}
                        </p>
                      </div>
                      {getStatusBadge(solicitud.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Método</p>
                        <p className="font-medium">{solicitud.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monto</p>
                        <p className="font-medium">
                          {solicitud.currency} {solicitud.amount.toLocaleString('es-VE')}
                        </p>
                      </div>
                    </div>

                    {solicitud.admin_notes && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-semibold text-blue-900">Notas del Administrador:</p>
                        <p className="text-sm text-blue-800">{solicitud.admin_notes}</p>
                      </div>
                    )}

                    {solicitud.status === "rejected" && (
                      <div className="mt-3">
                        <Link href="/pricing">
                          <Button size="sm" variant="outline">
                            Intentar Nuevamente
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
}

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="container mx-auto p-6">
          <p className="text-center">Cargando...</p>
        </div>
      }>
        <BillingContent />
      </Suspense>
    </ProtectedRoute>
  );
}
