import { UnidadMedida, OpcionSelect } from "@/types";

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
  { value: 'USD', label: 'Dólar (USD)' },
  { value: 'MXN', label: 'Peso Mexicano (MXN)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'COP', label: 'Peso Colombiano (COP)' },
  { value: 'ARS', label: 'Peso Argentino (ARS)' },
  { value: 'CLP', label: 'Peso Chileno (CLP)' },
];

// ============================================
// VALORES POR DEFECTO
// ============================================

export const CONFIGURACION_DEFECTO = {
  costoPorHoraDefecto: 10,
  moneda: 'USD',
  margenGananciaDefecto: 30,
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

export const formatearMoneda = (valor: number, moneda: string = 'USD'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
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
