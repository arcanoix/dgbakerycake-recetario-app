import { Orden, ConfiguracionGlobal } from "@/types";
import { convertirUSDaBS, formatearUSD, formatearBS } from "./currency";

export const generarMensajeWhatsApp = (
  orden: Orden,
  configuracion: ConfiguracionGlobal | null
): string => {
  const moneda = configuracion?.moneda || "VES";
  const tasaCambio = configuracion?.tasaCambioUSD || 1;

  const formatVal = (val: number) => {
    const bs = convertirUSDaBS(val, tasaCambio);
    return moneda === "USD"
      ? `${formatearUSD(val)} (${formatearBS(bs)})`
      : `${formatearBS(bs)} (${formatearUSD(val)})`;
  };

  const lines: string[] = [];

  lines.push(`🧁 *PRESUPUESTO / COTIZACIÓN*`);
  lines.push(`N° ${orden.numeroOrden}`);
  lines.push(`──────────────────`);

  if (orden.clienteNombre) {
    lines.push(`👤 Cliente: ${orden.clienteNombre}`);
  }

  const fechaCreacion = orden.fechaCreacion.toLocaleDateString("es-VE");
  lines.push(`📅 Fecha: ${fechaCreacion}`);

  if (orden.fechaEntrega) {
    const fechaEntrega = orden.fechaEntrega.toLocaleString("es-VE", {
      dateStyle: "short",
      timeStyle: "short",
    });
    lines.push(`🚚 Entrega: ${fechaEntrega}`);
  }

  lines.push(``);
  lines.push(`*ARTÍCULOS:*`);

  for (const item of orden.items) {
    lines.push(`• ${item.cantidad} × ${item.nombreItem} — ${formatVal(item.subtotal)}`);
  }

  lines.push(``);
  lines.push(`──────────────────`);
  lines.push(`Subtotal: ${formatVal(orden.subtotal)}`);

  if (orden.descuentoPorcentaje > 0) {
    lines.push(`Descuento (${orden.descuentoPorcentaje}%): -${formatVal(orden.descuentoMonto)}`);
  }

  lines.push(`*TOTAL: ${formatVal(orden.total)}*`);

  if (orden.pagoAdelantado > 0) {
    lines.push(`Pago adelantado: ${formatVal(orden.pagoAdelantado)}`);
    lines.push(`Saldo pendiente: ${formatVal(orden.saldoPendiente)}`);
  }

  if (orden.notas) {
    lines.push(``);
    lines.push(`📝 ${orden.notas}`);
  }

  return lines.join("\n");
};

export const generarEnlaceWhatsApp = (
  orden: Orden,
  configuracion: ConfiguracionGlobal | null,
  telefono?: string
): string => {
  const mensaje = generarMensajeWhatsApp(orden, configuracion);
  const mensajeCodificado = encodeURIComponent(mensaje);

  const telefonoLimpio = telefono?.replace(/\D/g, "") ?? "";

  return telefonoLimpio
    ? `https://wa.me/${telefonoLimpio}?text=${mensajeCodificado}`
    : `https://wa.me/?text=${mensajeCodificado}`;
};
