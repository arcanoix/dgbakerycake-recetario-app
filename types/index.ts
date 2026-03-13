// ============================================
// ENUMS Y CONSTANTES
// ============================================

// Enum mantenido por compatibilidad pero deprecado
export enum UnidadMedida {
  GRAMOS = 'gramos',
  KILOGRAMOS = 'kilogramos',
  LITROS = 'litros',
  MILILITROS = 'mililitros',
  ONZAS = 'onzas',
  UNIDAD = 'unidad',
}

export const UNIDADES_PESO = [
  UnidadMedida.GRAMOS,
  UnidadMedida.KILOGRAMOS,
  UnidadMedida.ONZAS,
];

export const UNIDADES_VOLUMEN = [
  UnidadMedida.LITROS,
  UnidadMedida.MILILITROS,
];

export const UNIDADES_CANTIDAD = [UnidadMedida.UNIDAD];

// ============================================
// TIPOS DE UNIDADES ADMINISTRABLES
// ============================================

export type TipoUnidad = 'peso' | 'volumen' | 'cantidad' | 'otro';

export interface UnidadMedidaAdmin {
  id: string;
  nombre: string; // Ej: "gramos", "litros", "docenas"
  simbolo: string; // Ej: "g", "L", "dz"
  tipo: TipoUnidad;
  factorConversionBase?: number; // Factor de conversión a unidad base del tipo
  unidadBase?: string; // ID de la unidad base para conversión
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface UnidadMedidaFormData {
  nombre: string;
  simbolo: string;
  tipo: TipoUnidad;
  factorConversionBase?: number;
  unidadBase?: string;
}

// ============================================
// TIPOS DE PRODUCTOS/INSUMOS
// ============================================

export interface Producto {
  id: string;
  nombre: string;
  precioTotal: number;
  
  // Presentación individual del producto
  tamañoPresentacion: number; // Ej: 900 (para una bolsa de 900g)
  unidadMedida: string; // ID de la unidad de medida
  unidadMedidaNombre?: string; // Nombre de la unidad (para mostrar)
  unidadMedidaSimbolo?: string; // Símbolo de la unidad (para mostrar)
  cantidadPresentaciones: number; // Ej: 3 (tres bolsas)
  
  // Calculados automáticamente
  cantidadTotal: number; // Total = tamañoPresentacion * cantidadPresentaciones
  precioPorUnidad: number; // Precio por unidad base (ej: por gramo)
  precioPorPresentacion: number; // Precio por presentación individual
  
  categoria?: string;
  proveedor?: string;
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface ProductoFormData {
  nombre: string;
  precioTotal: number;
  tamañoPresentacion: number;
  unidadMedida: string; // ID de la unidad de medida
  cantidadPresentaciones: number;
  categoria?: string;
  proveedor?: string;
  notas?: string;
}

// ============================================
// TIPOS DE MATERIALES EN RECETAS
// ============================================

export interface MaterialReceta {
  id: string;
  productoId: string;
  nombreProducto: string;
  cantidadUtilizada: number;
  unidadMedida: string; // ID de la unidad de medida
  unidadMedidaNombre?: string; // Nombre de la unidad (para mostrar)
  unidadMedidaSimbolo?: string; // Símbolo de la unidad (para mostrar)
  costoUnitario: number; // Precio por unidad del producto
  costoMaterial: number; // Costo calculado para esta cantidad
}

export interface MaterialRecetaFormData {
  productoId: string;
  cantidadUtilizada: number;
}

// ============================================
// TIPOS DE RECETAS
// ============================================

export interface Receta {
  id: string;
  nombre: string;
  descripcion: string;
  materiales: MaterialReceta[];
  
  // Información de producción
  rendimiento?: number;
  unidadRendimiento?: string;
  
  // Mano de Obra (campos mantenidos por compatibilidad, siempre en 0)
  tiempoPreparacion: number; // Siempre 0 - no se usa
  costoPorHora: number; // Siempre 0 - no se usa
  costoManoObra: number; // Siempre 0 - no se calcula
  
  // Costos
  costoMateriales: number; // Calculado: suma de todos los costoMaterial
  costoTotal: number; // Igual a costoMateriales (no incluye mano de obra)
  
  // Precio de Venta
  margenGanancia?: number; // Porcentaje
  precioVentaSugerido?: number; // Calculado: costoTotal * (1 + margenGanancia/100)
  
  // Metadata
  categoria?: string;
  imagen?: string;
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface RecetaFormData {
  nombre: string;
  descripcion: string;
  rendimiento?: number;
  unidadRendimiento?: string;
  margenGanancia?: number;
  categoria?: string;
  imagen?: string;
  notas?: string;
}

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================

export interface ConfiguracionGlobal {
  id: string;
  costoPorHoraDefecto: number;
  moneda: string;
  margenGananciaDefecto?: number;
  tasaCambioUSD?: number;
  ultimaActualizacion: Date;
}

export interface ConfiguracionFormData {
  costoPorHoraDefecto: number;
  moneda: string;
  margenGananciaDefecto?: number;
  tasaCambioUSD?: number;
}

// ============================================
// TIPOS DE CÁLCULOS
// ============================================

export interface CalculoCostoMaterial {
  productoId: string;
  nombreProducto: string;
  precioProducto: number;
  cantidadTotalProducto: number;
  unidadMedidaProducto: string;
  cantidadUtilizada: number;
  costoCalculado: number;
}

export interface DesgloseCostos {
  costoMateriales: number;
  costoManoObra: number;
  costoTotal: number;
  margenGanancia?: number;
  precioVentaSugerido?: number;
  detallesMateriales: {
    nombreProducto: string;
    cantidad: number;
    unidad: string; // ID de la unidad
    unidadNombre?: string; // Nombre de la unidad
    unidadSimbolo?: string; // Símbolo de la unidad
    costo: number;
    porcentaje: number;
  }[];
}

// ============================================
// TIPOS DE CONVERSIÓN DE UNIDADES
// ============================================

export interface ConversionUnidad {
  de: UnidadMedida;
  a: UnidadMedida;
  factor: number;
}

export interface ResultadoConversion {
  exitoso: boolean;
  valorConvertido?: number;
  error?: string;
}

// ============================================
// TIPOS DE UTILIDAD
// ============================================

export interface OpcionSelect {
  value: string;
  label: string;
}

export interface FiltrosProductos {
  busqueda?: string;
  categoria?: string;
  unidadMedida?: string;
}

export interface FiltrosRecetas {
  busqueda?: string;
  categoria?: string;
  ordenarPor?: 'nombre' | 'costoTotal' | 'fechaCreacion' | 'fechaActualizacion';
  orden?: 'asc' | 'desc';
}

// ============================================
// TIPOS DE RESPUESTA
// ============================================

export interface RespuestaAPI<T> {
  exitoso: boolean;
  datos?: T;
  error?: string;
  mensaje?: string;
}
