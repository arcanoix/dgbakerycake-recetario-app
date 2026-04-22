import { UnidadMedida, OpcionSelect, UnidadMedidaAdmin } from "@/types";

// ============================================
// FACTORES DE CONVERSIÓN
// ============================================

export const FACTORES_CONVERSION: Record<string, number> = {
  // Conversiones de peso
  'gramos-kilogramos': 0.001,
  'kilogramos-gramos': 1000,
  'gramos-onzas': 0.035274,
  'onzas-gramos': 28.3495,
  'kilogramos-onzas': 35.274,
  'onzas-kilogramos': 0.0283495,
  
  // Conversiones de volumen
  'mililitros-litros': 0.001,
  'litros-mililitros': 1000,
};

// ============================================
// OPCIONES PARA SELECTS
// ============================================

export const OPCIONES_UNIDADES: OpcionSelect[] = [
  { value: UnidadMedida.GRAMOS, label: 'Gramos (g)' },
  { value: UnidadMedida.KILOGRAMOS, label: 'Kilogramos (kg)' },
  { value: UnidadMedida.ONZAS, label: 'Onzas (oz)' },
  { value: UnidadMedida.LITROS, label: 'Litros (l)' },
  { value: UnidadMedida.MILILITROS, label: 'Mililitros (ml)' },
  { value: UnidadMedida.UNIDAD, label: 'Unidad (u)' },
];

export const OPCIONES_MONEDA: OpcionSelect[] = [
  { value: 'VES', label: 'Bolívar (Bs)' },
  { value: 'USD', label: 'Dólar (USD)' },
];

// ============================================
// VALORES POR DEFECTO
// ============================================

export const CONFIGURACION_DEFECTO = {
  costoPorHoraDefecto: 10,
  moneda: 'USD',
  margenGananciaDefecto: 35,
};

export const TIEMPO_PREPARACION_DEFECTO = 60; // 60 minutos

// ============================================
// CATEGORÍAS PREDEFINIDAS
// ============================================

export const CATEGORIAS_PRODUCTOS = [
  'Harinas',
  'Azúcares',
  'Lácteos',
  'Huevos',
  'Grasas',
  'Chocolates',
  'Frutas',
  'Frutos Secos',
  'Especias',
  'Levaduras',
  'Colorantes',
  'Esencias',
  'Decoración',
  'Otros',
];

export const CATEGORIAS_RECETAS = [
  'Pasteles',
  'Cupcakes',
  'Galletas',
  'Panes',
  'Tartas',
  'Postres',
  'Rellenos',
  'Coberturas',
  'Otros',
];

// ============================================
// VALIDACIONES
// ============================================

export const VALIDACION = {
  NOMBRE_MIN_LENGTH: 3,
  NOMBRE_MAX_LENGTH: 100,
  DESCRIPCION_MAX_LENGTH: 500,
  PRECIO_MIN: 0.01,
  CANTIDAD_MIN: 0.01,
  TIEMPO_MIN: 1,
  MARGEN_MIN: 0,
  MARGEN_MAX: 1000,
};

// ============================================
// FORMATOS
// ============================================

/**
 * Formatea un valor monetario. 
 * IMPORTANTE: Los valores en la BD están en USD.
 * Si la moneda es VES, se debe convertir usando la tasa de cambio.
 * 
 * @param valorUSD - Valor en USD (como se almacena en la BD)
 * @param moneda - Moneda de visualización ('USD' o 'VES')
 * @param tasaCambio - Tasa de cambio USD a VES (opcional, por defecto 50)
 */
export const formatearMoneda = (
  valorUSD: number, 
  moneda: string = 'VES',
  tasaCambio: number = 50
): string => {
  // Si la moneda es VES, convertir de USD a VES
  const valorFinal = moneda === 'VES' ? valorUSD * tasaCambio : valorUSD;
  
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valorFinal);
};

export const formatearNumero = (valor: number, decimales: number = 2): string => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor);
};

export const formatearTiempo = (minutos: number): string => {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
};

// ============================================
// UNIDADES DE MEDIDA POR DEFECTO
// ============================================

export const UNIDADES_DEFECTO: Omit<UnidadMedidaAdmin, 'id' | 'fechaCreacion' | 'fechaActualizacion'>[] = [
  // Peso
  { nombre: 'gramos', simbolo: 'g', tipo: 'peso', factorConversionBase: 1, unidadBase: 'gramos', activo: true },
  { nombre: 'kilogramos', simbolo: 'kg', tipo: 'peso', factorConversionBase: 1000, unidadBase: 'gramos', activo: true },
  { nombre: 'onzas', simbolo: 'oz', tipo: 'peso', factorConversionBase: 28.3495, unidadBase: 'gramos', activo: true },
  { nombre: 'libras', simbolo: 'lb', tipo: 'peso', factorConversionBase: 453.592, unidadBase: 'gramos', activo: true },
  
  // Volumen
  { nombre: 'mililitros', simbolo: 'ml', tipo: 'volumen', factorConversionBase: 1, unidadBase: 'mililitros', activo: true },
  { nombre: 'litros', simbolo: 'L', tipo: 'volumen', factorConversionBase: 1000, unidadBase: 'mililitros', activo: true },
  { nombre: 'tazas', simbolo: 'tza', tipo: 'volumen', factorConversionBase: 240, unidadBase: 'mililitros', activo: true },
  { nombre: 'cucharadas', simbolo: 'cdas', tipo: 'volumen', factorConversionBase: 15, unidadBase: 'mililitros', activo: true },
  { nombre: 'cucharaditas', simbolo: 'cdtas', tipo: 'volumen', factorConversionBase: 5, unidadBase: 'mililitros', activo: true },
  
  // Cantidad
  { nombre: 'unidad', simbolo: 'u', tipo: 'cantidad', activo: true },
  { nombre: 'docena', simbolo: 'dz', tipo: 'cantidad', factorConversionBase: 12, unidadBase: 'unidad', activo: true },
  { nombre: 'paquete', simbolo: 'paq', tipo: 'cantidad', activo: true },
  { nombre: 'caja', simbolo: 'cj', tipo: 'cantidad', activo: true },
];

// ============================================
// CATEGORÍAS POR DEFECTO
// ============================================

export const CATEGORIAS_DEFECTO = [
  // Categorías de Productos
  { nombre: 'Lácteos', tipo: 'producto', descripcion: 'Leche, mantequilla, queso, crema', color: '#60A5FA', activo: true },
  { nombre: 'Harinas', tipo: 'producto', descripcion: 'Harina de trigo, maíz, almendra', color: '#F59E0B', activo: true },
  { nombre: 'Azúcares', tipo: 'producto', descripcion: 'Azúcar blanca, morena, glas', color: '#EC4899', activo: true },
  { nombre: 'Grasas', tipo: 'producto', descripcion: 'Aceites, manteca, margarina', color: '#FBBF24', activo: true },
  { nombre: 'Huevos', tipo: 'producto', descripcion: 'Huevos frescos y derivados', color: '#FCD34D', activo: true },
  { nombre: 'Saborizantes', tipo: 'producto', descripcion: 'Vainilla, esencias, extractos', color: '#A78BFA', activo: true },
  { nombre: 'Decoración', tipo: 'producto', descripcion: 'Sprinkles, fondant, colorantes', color: '#F472B6', activo: true },
  { nombre: 'Otros', tipo: 'producto', descripcion: 'Ingredientes varios', color: '#9CA3AF', activo: true },
  
  // Categorías de Recetas
  { nombre: 'Tortas', tipo: 'receta', descripcion: 'Tortas y pasteles', color: '#EF4444', activo: true },
  { nombre: 'Cupcakes', tipo: 'receta', descripcion: 'Cupcakes y muffins', color: '#10B981', activo: true },
  { nombre: 'Galletas', tipo: 'receta', descripcion: 'Galletas y cookies', color: '#F59E0B', activo: true },
  { nombre: 'Postres', tipo: 'receta', descripcion: 'Postres y dulces', color: '#8B5CF6', activo: true },
  { nombre: 'Panes', tipo: 'receta', descripcion: 'Panes dulces y salados', color: '#D97706', activo: true },
  { nombre: 'Otros', tipo: 'receta', descripcion: 'Otras recetas', color: '#6B7280', activo: true },
];
