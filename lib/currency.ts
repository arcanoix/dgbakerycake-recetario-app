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
