"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  SubscriptionPlan,
  PaymentMethod,
  Currency,
  PaymentRequestFormData,
  PagoMovilDetails,
  TransferenciaDetails,
  BinanceDetails,
  ZelleDetails,
  PayPalDetails,
} from "@/types/subscription";
import { crearSolicitudPago } from "@/lib/subscriptionStorage";

interface PaymentRequestFormProps {
  plan: SubscriptionPlan;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PaymentRequestForm = ({ plan, onSuccess, onCancel }: PaymentRequestFormProps) => {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pago_movil");
  const [currency, setCurrency] = useState<Currency>("BS");
  const [amount, setAmount] = useState<number>(plan.price_bs);
  const [proofUrl, setProofUrl] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos específicos por método de pago
  const [pagoMovil, setPagoMovil] = useState<PagoMovilDetails>({
    banco: "",
    telefono: "",
    referencia: "",
    fecha: new Date().toISOString().split('T')[0],
  });

  const [transferencia, setTransferencia] = useState<TransferenciaDetails>({
    banco_origen: "",
    banco_destino: "",
    referencia: "",
    fecha: new Date().toISOString().split('T')[0],
  });

  const [binance, setBinance] = useState<BinanceDetails>({
    wallet: "",
    txid: "",
    red: "BSC",
  });

  const [zelle, setZelle] = useState<ZelleDetails>({
    email: "",
    referencia: "",
    fecha: new Date().toISOString().split('T')[0],
  });

  const [paypal, setPaypal] = useState<PayPalDetails>({
    email: "",
    transaction_id: "",
    fecha: new Date().toISOString().split('T')[0],
  });

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    
    // Ajustar moneda y monto según método
    if (method === "pago_movil" || method === "transferencia") {
      setCurrency("BS");
      setAmount(plan.price_bs);
    } else if (method === "binance") {
      setCurrency("USDT");
      setAmount(plan.price_usd);
    } else {
      setCurrency("USD");
      setAmount(plan.price_usd);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    let paymentDetails: any;

    switch (paymentMethod) {
      case "pago_movil":
        paymentDetails = pagoMovil;
        break;
      case "transferencia":
        paymentDetails = transferencia;
        break;
      case "binance":
        paymentDetails = binance;
        break;
      case "zelle":
        paymentDetails = zelle;
        break;
      case "paypal":
        paymentDetails = paypal;
        break;
    }

    const solicitud: PaymentRequestFormData = {
      plan_id: plan.id,
      payment_method: paymentMethod,
      amount,
      currency,
      payment_details: paymentDetails,
      proof_url: proofUrl || undefined,
    };

    const resultado = await crearSolicitudPago(solicitud);

    if (resultado.exitoso) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/billing?success=true");
      }
    } else {
      setError(resultado.error || "Error al enviar solicitud");
    }

    setEnviando(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar Pago - {plan.display_name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Completa los datos de tu pago y adjunta el comprobante
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Método de Pago */}
          <div className="space-y-2">
            <Label htmlFor="payment_method">Método de Pago *</Label>
            <Select
              id="payment_method"
              value={paymentMethod}
              onChange={(e) => handlePaymentMethodChange(e.target.value as PaymentMethod)}
              required
            >
              <option value="pago_movil">Pago Móvil 🇻🇪</option>
              <option value="transferencia">Transferencia Bancaria 🇻🇪</option>
              <option value="binance">Binance (USDT) 💰</option>
              <option value="zelle">Zelle 🇺🇸</option>
              <option value="paypal">PayPal 🌎</option>
            </Select>
          </div>

          {/* Monto */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda *</Label>
              <Select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                required
              >
                <option value="BS">Bolívares (Bs)</option>
                <option value="USD">Dólares (USD)</option>
                <option value="USDT">USDT</option>
              </Select>
            </div>
          </div>

          {/* Campos específicos por método de pago */}
          {paymentMethod === "pago_movil" && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold">Datos del Pago Móvil</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Banco *</Label>
                  <Input
                    value={pagoMovil.banco}
                    onChange={(e) => setPagoMovil({ ...pagoMovil, banco: e.target.value })}
                    placeholder="Ej: Banesco"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono *</Label>
                  <Input
                    value={pagoMovil.telefono}
                    onChange={(e) => setPagoMovil({ ...pagoMovil, telefono: e.target.value })}
                    placeholder="0414-1234567"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referencia *</Label>
                  <Input
                    value={pagoMovil.referencia}
                    onChange={(e) => setPagoMovil({ ...pagoMovil, referencia: e.target.value })}
                    placeholder="123456"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha *</Label>
                  <Input
                    type="date"
                    value={pagoMovil.fecha}
                    onChange={(e) => setPagoMovil({ ...pagoMovil, fecha: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "transferencia" && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold">Datos de la Transferencia</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Banco Origen *</Label>
                  <Input
                    value={transferencia.banco_origen}
                    onChange={(e) => setTransferencia({ ...transferencia, banco_origen: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Banco Destino *</Label>
                  <Input
                    value={transferencia.banco_destino}
                    onChange={(e) => setTransferencia({ ...transferencia, banco_destino: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referencia *</Label>
                  <Input
                    value={transferencia.referencia}
                    onChange={(e) => setTransferencia({ ...transferencia, referencia: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha *</Label>
                  <Input
                    type="date"
                    value={transferencia.fecha}
                    onChange={(e) => setTransferencia({ ...transferencia, fecha: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "binance" && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold">Datos de Binance</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Wallet Address *</Label>
                  <Input
                    value={binance.wallet}
                    onChange={(e) => setBinance({ ...binance, wallet: e.target.value })}
                    placeholder="0x..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transaction ID (TxID) *</Label>
                  <Input
                    value={binance.txid}
                    onChange={(e) => setBinance({ ...binance, txid: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Red *</Label>
                  <Select
                    value={binance.red}
                    onChange={(e) => setBinance({ ...binance, red: e.target.value })}
                    required
                  >
                    <option value="BSC">BSC (Binance Smart Chain)</option>
                    <option value="ETH">Ethereum (ERC20)</option>
                    <option value="TRC20">Tron (TRC20)</option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "zelle" && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold">Datos de Zelle</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={zelle.email}
                    onChange={(e) => setZelle({ ...zelle, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referencia *</Label>
                  <Input
                    value={zelle.referencia}
                    onChange={(e) => setZelle({ ...zelle, referencia: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Fecha *</Label>
                  <Input
                    type="date"
                    value={zelle.fecha}
                    onChange={(e) => setZelle({ ...zelle, fecha: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold">Datos de PayPal</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={paypal.email}
                    onChange={(e) => setPaypal({ ...paypal, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transaction ID *</Label>
                  <Input
                    value={paypal.transaction_id}
                    onChange={(e) => setPaypal({ ...paypal, transaction_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Fecha *</Label>
                  <Input
                    type="date"
                    value={paypal.fecha}
                    onChange={(e) => setPaypal({ ...paypal, fecha: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Comprobante */}
          <div className="space-y-2">
            <Label htmlFor="proof_url">URL del Comprobante (opcional)</Label>
            <Input
              id="proof_url"
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Puedes subir tu comprobante a un servicio como Imgur o Google Drive y pegar el enlace aquí
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4">
            <Button type="submit" disabled={enviando} className="flex-1">
              {enviando ? "Enviando..." : "Enviar Solicitud"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
