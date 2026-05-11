import {
  Producto,
  MaterialReceta,
  Receta,
  DesgloseCostos,
  CalculoCostoMaterial,
  UnidadMedidaAdmin,
} from "@/types";
import { convertirUnidad } from "./conversiones";

// ============================================
// CÁLCULOS DE PRODUCTOS
// ============================================

/**
 * Calcula el precio por unidad de un producto
 */
export const calcularPrecioPorUnidad = (
  precioTotal: number,
  cantidadTotal: number
): number => {
  if (cantidadTotal <= 0) return 0;
  return precioTotal / cantidadTotal;
};

// ============================================
// CÁLCULOS DE MATERIALES
// ============================================

/**
 * Calcula el costo de un material en una receta
 */
export const calcularCostoMaterial = (
  producto: Producto,
  cantidadUtilizada: number
): CalculoCostoMaterial => {
  const precioPorUnidad = calcularPrecioPorUnidad(
    producto.precioTotal,
    producto.cantidadTotal
  );

  // El costo es: (precio del producto / cantidad total) * cantidad utilizada
  const costoCalculado = precioPorUnidad * cantidadUtilizada;

  return {
    productoId: producto.id,
    nombreProducto: producto.nombre,
    precioProducto: producto.precioTotal,
    cantidadTotalProducto: producto.cantidadTotal,
    unidadMedidaProducto: producto.unidadMedida,
    cantidadUtilizada,
    costoCalculado,
  };
};

/**
 * Calcula el costo de un material con conversión de unidades.
 * Si el usuario elige una unidad diferente a la del producto (ej: usa 200g 
 * pero el producto está registrado en kg), convierte automáticamente.
 *
 * Lógica de conversión:
 * - Cada unidad tiene `factorConversionBase` (cuántas unidades base equivalen a 1 de esta unidad)
 *   Ej: kg tiene factor 1000 (1 kg = 1000 g base)
 *       g tiene factor 1 (1 g = 1 g base)
 *       L tiene factor 1000 (1 L = 1000 ml base)
 *       ml tiene factor 1 (1 ml = 1 ml base)
 * - Para convertir: cantidad_en_base = cantidad * factorConversionBase_seleccionada
 * - Luego comparar con la unidad del producto: dividir por factorConversionBase_producto
 * - Si las unidades son del mismo tipo, la conversión se hace en unidad base común
 */
export const calcularCostoMaterialConConversion = (
  producto: Producto,
  cantidadUtilizada: number,
  unidadSeleccionada: UnidadMedidaAdmin | null,
  unidadProducto: UnidadMedidaAdmin | null
): CalculoCostoMaterial => {
  const precioPorUnidad = calcularPrecioPorUnidad(
    producto.precioTotal,
    producto.cantidadTotal
  );

  let cantidadEnUnidadProducto = cantidadUtilizada;

  // Si se especificaron ambas unidades y son del mismo tipo, convertir
  if (
    unidadSeleccionada &&
    unidadProducto &&
    unidadSeleccionada.tipo === unidadProducto.tipo &&
    unidadSeleccionada.id !== unidadProducto.id
  ) {
    const factorSeleccionada = unidadSeleccionada.factorConversionBase ?? 1;
    const factorProducto = unidadProducto.factorConversionBase ?? 1;
    // Convertir a unidad base, luego a la unidad del producto
    const cantidadEnBase = cantidadUtilizada * factorSeleccionada;
    cantidadEnUnidadProducto = cantidadEnBase / factorProducto;
  }

  const costoCalculado = precioPorUnidad * cantidadEnUnidadProducto;

  return {
    productoId: producto.id,
    nombreProducto: producto.nombre,
    precioProducto: producto.precioTotal,
    cantidadTotalProducto: producto.cantidadTotal,
    unidadMedidaProducto: producto.unidadMedida,
    cantidadUtilizada,
    costoCalculado,
  };
};

/**
 * Calcula el costo total de todos los materiales
 */
export const calcularCostoTotalMateriales = (
  materiales: MaterialReceta[]
): number => {
  return materiales.reduce((total, material) => {
    return total + material.costoMaterial;
  }, 0);
};

// ============================================
// CÁLCULOS DE MANO DE OBRA
// ============================================

/**
 * Calcula el costo de mano de obra basado en horas y tarifa por hora
 */
export const calcularCostoManoObra = (
  cantidadHoras: number,
  costoPorHora: number
): number => {
  if (cantidadHoras <= 0 || costoPorHora <= 0) return 0;
  
  // Multiplicar horas por costo por hora
  return cantidadHoras * costoPorHora;
};

// ============================================
// CÁLCULOS DE RECETA
// ============================================

/**
 * Calcula el costo de gastos fijos basado en el total de gastos mensuales y el porcentaje
 */
export const calcularCostoGastosFijos = (
  totalGastosMensuales: number,
  porcentajeGastosFijos: number
): number => {
  if (totalGastosMensuales <= 0 || porcentajeGastosFijos <= 0) return 0;
  
  // Costo gastos fijos = Total gastos mensuales * (Porcentaje / 100)
  return totalGastosMensuales * (porcentajeGastosFijos / 100);
};

/**
 * Calcula el costo total de una receta (materiales + mano de obra + gastos fijos)
 */
export const calcularCostoTotalReceta = (
  costoMateriales: number,
  costoManoObra: number,
  costoGastosFijos: number = 0
): number => {
  return costoMateriales + costoManoObra + costoGastosFijos;
};

/**
 * Calcula el precio de venta sugerido basado en el costo y margen de ganancia
 */
export const calcularPrecioVentaSugerido = (
  costoTotal: number,
  margenGananciaPorcentaje: number
): number => {
  if (margenGananciaPorcentaje <= 0) return costoTotal;
  
  // Precio = Costo * (1 + Margen/100)
  return costoTotal * (1 + margenGananciaPorcentaje / 100);
};

/**
 * Calcula el costo por porción/unidad
 */
export const calcularCostoPorPorcion = (
  costoTotal: number,
  rendimiento: number
): number => {
  if (rendimiento <= 0) return costoTotal;
  return costoTotal / rendimiento;
};

/**
 * Calcula el precio de venta por porción
 */
export const calcularPrecioVentaPorPorcion = (
  precioVentaTotal: number,
  rendimiento: number
): number => {
  if (rendimiento <= 0) return precioVentaTotal;
  return precioVentaTotal / rendimiento;
};

// ============================================
// DESGLOSE DE COSTOS
// ============================================

/**
 * Genera un desglose completo de costos de una receta
 */
export const generarDesgloseCostos = (receta: Receta): DesgloseCostos => {
  const costoMateriales = calcularCostoTotalMateriales(receta.materiales);
  const costoManoObra = calcularCostoManoObra(receta.cantidadHoras || 0, receta.costoPorHora || 0);
  const costoGastosFijos = receta.costoGastosFijos || 0;
  const costoTotal = calcularCostoTotalReceta(costoMateriales, costoManoObra, costoGastosFijos);
  
  const precioVentaSugerido = receta.margenGanancia
    ? calcularPrecioVentaSugerido(costoTotal, receta.margenGanancia)
    : undefined;

  // Calcular porcentaje de cada material
  const detallesMateriales = receta.materiales.map((material) => ({
    nombreProducto: material.nombreProducto,
    cantidad: material.cantidadUtilizada,
    unidad: material.unidadMedida,
    costo: material.costoMaterial,
    porcentaje: costoMateriales > 0 
      ? (material.costoMaterial / costoMateriales) * 100 
      : 0,
  }));

  return {
    costoMateriales,
    costoManoObra,
    costoGastosFijos,
    costoTotal,
    cantidadHoras: receta.cantidadHoras,
    costoPorHora: receta.costoPorHora,
    margenGanancia: receta.margenGanancia,
    precioVentaSugerido,
    detallesMateriales,
  };
};

// ============================================
// VALIDACIONES
// ============================================

/**
 * Valida que los valores numéricos sean válidos
 */
export const validarValorNumerico = (
  valor: number,
  nombreCampo: string,
  minimo: number = 0
): { valido: boolean; error?: string } => {
  if (isNaN(valor)) {
    return {
      valido: false,
      error: `${nombreCampo} debe ser un número válido`,
    };
  }

  if (valor < minimo) {
    return {
      valido: false,
      error: `${nombreCampo} debe ser mayor o igual a ${minimo}`,
    };
  }

  return { valido: true };
};

/**
 * Valida los datos de un producto
 */
export const validarProducto = (
  precioTotal: number,
  cantidadTotal: number
): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];

  const validacionPrecio = validarValorNumerico(
    precioTotal,
    "Precio total",
    0.01
  );
  if (!validacionPrecio.valido && validacionPrecio.error) {
    errores.push(validacionPrecio.error);
  }

  const validacionCantidad = validarValorNumerico(
    cantidadTotal,
    "Cantidad total",
    0.01
  );
  if (!validacionCantidad.valido && validacionCantidad.error) {
    errores.push(validacionCantidad.error);
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

// ============================================
// UTILIDADES DE CÁLCULO
// ============================================

/**
 * Redondea un número a N decimales
 */
export const redondear = (valor: number, decimales: number = 2): number => {
  const factor = Math.pow(10, decimales);
  return Math.round(valor * factor) / factor;
};

/**
 * Calcula el porcentaje que representa un valor del total
 */
export const calcularPorcentaje = (valor: number, total: number): number => {
  if (total === 0) return 0;
  return (valor / total) * 100;
};

/**
 * Calcula el margen de ganancia en porcentaje
 */
export const calcularMargenGanancia = (
  precioVenta: number,
  costo: number
): number => {
  if (costo === 0) return 0;
  return ((precioVenta - costo) / costo) * 100;
};
