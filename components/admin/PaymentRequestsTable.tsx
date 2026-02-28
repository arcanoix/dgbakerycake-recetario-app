"use client";

import { useState } from "react";
import { PaymentRequest, PaymentStatus } from "@/types/subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { actualizarEstadoPago } from "@/lib/subscriptionStorage";

interface PaymentRequestsTableProps {
  solicitudes: PaymentRequest[];
  onUpdate: () => void;
}

export const PaymentRequestsTable = ({ solicitudes, onUpdate }: PaymentRequestsTableProps) => {
  const [procesando, setProcesando] = useState<string | null>(null);
  const [notasAdmin, setNotasAdmin] = useState<{ [key: string]: string }>({});

  const handleUpdateStatus = async (paymentId: string, status: PaymentStatus) => {
    setProcesando(paymentId);
    
    const resultado = await actualizarEstadoPago(
      paymentId,
      status,
      notasAdmin[paymentId]
    );

    if (resultado.exitoso) {
      setNotasAdmin({ ...notasAdmin, [paymentId]: "" });
      onUpdate();
    } else {
      alert(`Error: ${resultado.error}`);
    }

    setProcesando(null);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    
    const labels = {
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazado",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      pago_movil: "Pago Móvil 🇻🇪",
      transferencia: "Transferencia 🇻🇪",
      binance: "Binance 💰",
      zelle: "Zelle 🇺🇸",
      paypal: "PayPal 🌎",
    };
    return labels[method] || method;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (solicitudes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No hay solicitudes de pago</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {solicitudes.map((solicitud) => (
        <Card key={solicitud.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {solicitud.user_email || "Usuario"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Plan: {solicitud.plan?.display_name}
                </p>
              </div>
              {getStatusBadge(solicitud.status)}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Información del Pago */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Método</p>
                <p className="font-semibold">{getPaymentMethodLabel(solicitud.payment_method)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monto</p>
                <p className="font-semibold">
                  {solicitud.currency} {solicitud.amount.toLocaleString('es-VE')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha Solicitud</p>
                <p className="font-semibold text-sm">{formatDate(solicitud.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="font-mono text-xs">{solicitud.id.slice(0, 8)}...</p>
              </div>
            </div>

            {/* Detalles del Pago */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-semibold mb-2">Detalles del Pago:</p>
              <pre className="text-xs bg-background p-2 rounded overflow-auto">
                {JSON.stringify(solicitud.payment_details, null, 2)}
              </pre>
            </div>

            {/* Comprobante */}
            {solicitud.proof_url && (
              <div>
                <p className="text-sm font-semibold mb-2">Comprobante:</p>
                <a
                  href={solicitud.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Ver comprobante →
                </a>
              </div>
            )}

            {/* Notas del Admin (si ya fue revisado) */}
            {solicitud.admin_notes && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold mb-1">Notas del Administrador:</p>
                <p className="text-sm">{solicitud.admin_notes}</p>
                {solicitud.reviewed_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Revisado: {formatDate(solicitud.reviewed_at)}
                  </p>
                )}
              </div>
            )}

            {/* Acciones (solo para pendientes) */}
            {solicitud.status === "pending" && (
              <div className="space-y-3 pt-4 border-t">
                <Textarea
                  placeholder="Notas del administrador (opcional)"
                  value={notasAdmin[solicitud.id] || ""}
                  onChange={(e) => setNotasAdmin({ ...notasAdmin, [solicitud.id]: e.target.value })}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdateStatus(solicitud.id, "approved")}
                    disabled={procesando === solicitud.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {procesando === solicitud.id ? "Procesando..." : "✓ Aprobar"}
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(solicitud.id, "rejected")}
                    disabled={procesando === solicitud.id}
                    variant="destructive"
                    className="flex-1"
                  >
                    {procesando === solicitud.id ? "Procesando..." : "✗ Rechazar"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
