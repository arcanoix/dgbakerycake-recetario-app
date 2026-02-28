import { UnidadMedida, ResultadoConversion } from "@/types";
import { FACTORES_CONVERSION } from "./constants";

// ============================================
// FUNCIONES DE CONVERSIÓN DE UNIDADES
// ============================================

/**
 * Verifica si dos unidades son del mismo tipo (peso, volumen, cantidad)
 */
export const sonUnidadesCompatibles = (
  unidad1: UnidadMedida,
  unidad2: UnidadMedida
): boolean => {
  const unidadesPeso = [
    UnidadMedida.GRAMOS,
    UnidadMedida.KILOGRAMOS,
    UnidadMedida.ONZAS,
  ];
  const unidadesVolumen = [UnidadMedida.LITROS, UnidadMedida.MILILITROS];
  const unidadesCantidad = [UnidadMedida.UNIDAD];

  const esPeso1 = unidadesPeso.includes(unidad1);
  const esPeso2 = unidadesPeso.includes(unidad2);
  const esVolumen1 = unidadesVolumen.includes(unidad1);
  const esVolumen2 = unidadesVolumen.includes(unidad2);
  const esCantidad1 = unidadesCantidad.includes(unidad1);
  const esCantidad2 = unidadesCantidad.includes(unidad2);

  return (
    (esPeso1 && esPeso2) ||
    (esVolumen1 && esVolumen2) ||
    (esCantidad1 && esCantidad2)
  );
};

/**
 * Convierte una cantidad de una unidad a otra
 */
export const convertirUnidad = (
  cantidad: number,
  de: UnidadMedida,
  a: UnidadMedida
): ResultadoConversion => {
  // Si las unidades son iguales, no hay conversión
  if (de === a) {
    return {
      exitoso: true,
      valorConvertido: cantidad,
    };
  }

  // Verificar compatibilidad
  if (!sonUnidadesCompatibles(de, a)) {
    return {
      exitoso: false,
      error: `No se puede convertir de ${de} a ${a}. Las unidades no son compatibles.`,
    };
  }

  // Buscar factor de conversión
  const claveConversion = `${de}-${a}`;
  const factor = FACTORES_CONVERSION[claveConversion];

  if (!factor) {
    return {
      exitoso: false,
      error: `No se encontró factor de conversión de ${de} a ${a}.`,
    };
  }

  return {
    exitoso: true,
    valorConvertido: cantidad * factor,
  };
};

/**
 * Normaliza una cantidad a la unidad base (gramos para peso, litros para volumen)
 */
export const normalizarUnidad = (
  cantidad: number,
  unidad: UnidadMedida
): number => {
  const unidadesPeso = [
    UnidadMedida.GRAMOS,
    UnidadMedida.KILOGRAMOS,
    UnidadMedida.ONZAS,
  ];
  const unidadesVolumen = [UnidadMedida.LITROS, UnidadMedida.MILILITROS];

  if (unidadesPeso.includes(unidad)) {
    // Normalizar a gramos
    const resultado = convertirUnidad(cantidad, unidad, UnidadMedida.GRAMOS);
    return resultado.valorConvertido || cantidad;
  }

  if (unidadesVolumen.includes(unidad)) {
    // Normalizar a litros
    const resultado = convertirUnidad(cantidad, unidad, UnidadMedida.LITROS);
    return resultado.valorConvertido || cantidad;
  }

  // Para unidades, no hay normalización
  return cantidad;
};

/**
 * Obtiene el símbolo de la unidad
 */
export const obtenerSimboloUnidad = (unidad: UnidadMedida): string => {
  const simbolos: Record<UnidadMedida, string> = {
    [UnidadMedida.GRAMOS]: 'g',
    [UnidadMedida.KILOGRAMOS]: 'kg',
    [UnidadMedida.ONZAS]: 'oz',
    [UnidadMedida.LITROS]: 'l',
    [UnidadMedida.MILILITROS]: 'ml',
    [UnidadMedida.UNIDAD]: 'u',
  };

  return simbolos[unidad] || unidad;
};

/**
 * Formatea una cantidad con su unidad
 */
export const formatearCantidadConUnidad = (
  cantidad: number,
  unidad: UnidadMedida,
  decimales: number = 2
): string => {
  const simbolo = obtenerSimboloUnidad(unidad);
  return `${cantidad.toFixed(decimales)} ${simbolo}`;
};
