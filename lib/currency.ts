/**
 * Utilidades para manejo de conversión de monedas
 * Sistema: USD como moneda base, BS como moneda de visualización
 */

import { ConfiguracionGlobal } from "@/types";

/**
 * Convierte un valor de USD a BS usando la tasa de cambio
 */
export const convertirUSDaBS = (
  valorUSD: number,
  tasaCambio: number
): number => {
  return valorUSD * tasaCambio;
};

/**
 * Convierte un valor de BS a USD usando la tasa de cambio
 */
export const convertirBSaUSD = (
  valorBS: number,
  tasaCambio: number
): number => {
  return valorBS / tasaCambio;
};

/**
 * Formatea un valor en USD
 */
export const formatearUSD = (valor: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

/**
 * Formatea un valor en BS (Bolívares)
 */
export const formatearBS = (valor: number): string => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

/**
 * Formatea un número de forma compacta (K, M, B)
 */
const formatearCompacto = (valor: number, locale: string = 'en-US'): string => {
  if (Math.abs(valor) < 1000) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  }
  
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(valor);
};

/**
 * Formatea un valor mostrando ambas monedas
 * Ejemplo: "$10.00 USD (Bs. 500.00)"
 */
export const formatearDualMoneda = (
  valorUSD: number,
  tasaCambio: number,
  mostrarUSDPrimero: boolean = true
): string => {
  const valorBS = convertirUSDaBS(valorUSD, tasaCambio);
  const usdFormateado = formatearUSD(valorUSD);
  const bsFormateado = formatearBS(valorBS);

  if (mostrarUSDPrimero) {
    return `${usdFormateado} (${bsFormateado})`;
  } else {
    return `${bsFormateado} (${usdFormateado})`;
  }
};

/**
 * Formatea un valor mostrando ambas monedas de forma compacta para widgets
 * Ejemplo: "$2.00\n(Bs.$ 993.66)" o "$10K\n(Bs.$ 500K)"
 */
export const formatearDualMonedaCompacto = (
  valorUSD: number,
  tasaCambio: number,
  mostrarUSDPrimero: boolean = true
): string => {
  const valorBS = convertirUSDaBS(valorUSD, tasaCambio);
  
  // Determinar si usar formato compacto
  const usarCompacto = Math.abs(valorUSD) >= 1000 || Math.abs(valorBS) >= 1000;
  
  let usdFormateado: string;
  let bsFormateado: string;
  
  if (usarCompacto) {
    usdFormateado = `$${formatearCompacto(valorUSD)}`;
    bsFormateado = `Bs.$ ${formatearCompacto(valorBS, 'es-VE')}`;
  } else {
    usdFormateado = formatearUSD(valorUSD);
    bsFormateado = formatearBS(valorBS);
  }

  if (mostrarUSDPrimero) {
    return `${usdFormateado}\n(${bsFormateado})`;
  } else {
    return `${bsFormateado}\n(${usdFormateado})`;
  }
};

/**
 * Obtiene la tasa de cambio desde la configuración
 */
export const obtenerTasaCambio = (config?: ConfiguracionGlobal): number => {
  return config?.tasaCambioUSD || 50; // Valor por defecto si no hay configuración
};

/**
 * Componente de texto para mostrar precio en ambas monedas
 */
export interface PrecioConversion {
  usd: number;
  bs: number;
  usdFormateado: string;
  bsFormateado: string;
  dualFormateado: string;
}

/**
 * Calcula y formatea un precio en ambas monedas
 */
export const calcularPrecioConversion = (
  valorUSD: number,
  tasaCambio: number
): PrecioConversion => {
  const bs = convertirUSDaBS(valorUSD, tasaCambio);
  
  return {
    usd: valorUSD,
    bs: bs,
    usdFormateado: formatearUSD(valorUSD),
    bsFormateado: formatearBS(bs),
    dualFormateado: formatearDualMoneda(valorUSD, tasaCambio),
  };
};
