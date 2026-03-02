// ============================================
// ENUMS Y CONSTANTES
// ============================================

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
// TIPOS DE PRODUCTOS/INSUMOS
// ============================================

export interface Producto {
  id: string;
  nombre: string;
  precioTotal: number;
  cantidadTotal: number;
  unidadMedida: UnidadMedida;
  precioPorUnidad: number; // Calculado automáticamente
  categoria?: string;
  proveedor?: string;
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface ProductoFormData {
  nombre: string;
  precioTotal: number;
  cantidadTotal: number;
  unidadMedida: UnidadMedida;
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
  unidadMedida: UnidadMedida;
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
  
  // Mano de Obra
  tiempoPreparacion: number; // en minutos
  costoPorHora: number;
  costoManoObra: number; // Calculado: (tiempoPreparacion / 60) * costoPorHora
  
  // Costos
  costoMateriales: number; // Calculado: suma de todos los costoMaterial
  costoTotal: number; // Calculado: costoMateriales + costoManoObra
  
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
  tiempoPreparacion: number;
  costoPorHora?: number; // Si no se proporciona, usa el valor global
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
  unidadMedidaProducto: UnidadMedida;
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
    unidad: UnidadMedida;
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
  unidadMedida?: UnidadMedida;
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
