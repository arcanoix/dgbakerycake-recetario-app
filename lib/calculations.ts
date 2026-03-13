import {
  Producto,
  MaterialReceta,
  Receta,
  DesgloseCostos,
  CalculoCostoMaterial,
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
 * Calcula el costo de mano de obra basado en tiempo y tarifa por hora
 */
export const calcularCostoManoObra = (
  tiempoPreparacionMinutos: number,
  costoPorHora: number
): number => {
  if (tiempoPreparacionMinutos <= 0 || costoPorHora <= 0) return 0;
  
  // Convertir minutos a horas y multiplicar por costo por hora
  const horas = tiempoPreparacionMinutos / 60;
  return horas * costoPorHora;
};

// ============================================
// CÁLCULOS DE RECETA
// ============================================

/**
 * Calcula el costo total de una receta (materiales + mano de obra)
 */
export const calcularCostoTotalReceta = (
  costoMateriales: number,
  costoManoObra: number
): number => {
  return costoMateriales + costoManoObra;
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
  const costoManoObra = 0;
  const costoTotal = costoMateriales;
  
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
    costoTotal,
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
