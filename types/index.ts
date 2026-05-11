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

// ============================================
// TIPOS DE CATEGORÍAS ADMINISTRABLES
// ============================================

export type TipoCategoria = 'producto' | 'receta';

export interface CategoriaAdmin {
  id: string;
  nombre: string;
  tipo: TipoCategoria; // Para productos o recetas
  descripcion?: string;
  color?: string; // Color hex para visualización
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface CategoriaFormData {
  nombre: string;
  tipo: TipoCategoria;
  descripcion?: string;
  color?: string;
}

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
  
  // Mano de Obra
  cantidadHoras: number; // Horas de trabajo para la receta
  costoPorHora: number; // Costo por hora desde configuración
  costoManoObra: number; // Calculado: cantidadHoras * costoPorHora
  
  // Gastos Fijos
  costoGastosFijos: number; // Calculado: suma(montosMensualesGastosFijos) * porcentajeGastosFijos
  
  // Costos
  costoMateriales: number; // Calculado: suma de todos los costoMaterial
  costoTotal: number; // Calculado: costoMateriales + costoManoObra + costoGastosFijos
  
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
  cantidadHoras?: number;
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
  porcentajeGastosFijos?: number;
  ultimaActualizacion: Date;
}

export interface ConfiguracionFormData {
  costoPorHoraDefecto: number;
  moneda: string;
  margenGananciaDefecto?: number;
  tasaCambioUSD?: number;
  porcentajeGastosFijos?: number;
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
  costoGastosFijos: number;
  costoTotal: number;
  cantidadHoras?: number;
  costoPorHora?: number;
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

// ============================================
// TIPOS DE CLIENTES
// ============================================

export interface Cliente {
  id: string;
  userId: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface ClienteFormData {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
}

// ============================================
// TIPOS DE ÓRDENES / COTIZACIONES
// ============================================

export type EstadoOrden = 'cotizacion' | 'confirmada' | 'entregada' | 'cancelada';

export interface OrdenItem {
  id: string;
  ordenId: string;
  recetaId?: string;
  nombreItem: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
}

export interface OrdenItemFormData {
  recetaId?: string;
  nombreItem: string;
  cantidad: number;
  precioUnitario: number;
  notas?: string;
}

export interface Orden {
  id: string;
  userId: string;
  clienteId: string;
  clienteNombre?: string;
  numeroOrden: string;
  estado: EstadoOrden;
  items: OrdenItem[];
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  total: number;
  pagoAdelantado: number;
  saldoPendiente: number;
  notas?: string;
  fechaEntrega?: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface OrdenFormData {
  clienteId: string;
  estado: EstadoOrden;
  items: OrdenItemFormData[];
  descuentoPorcentaje: number;
  pagoAdelantado: number;
  notas?: string;
  fechaEntrega?: Date;
}

// ============================================
// TIPOS DE INVENTARIO / KARDEX
// ============================================

export type TipoMovimiento =
  | 'compra'
  | 'uso'
  | 'merma'
  | 'ajuste_entrada'
  | 'ajuste_salida';

export interface MovimientoInventario {
  id: string;
  userId: string;
  productoId: string;
  productoNombre?: string;
  tipo: TipoMovimiento;
  cantidad: number;
  unidadMedida: string;
  unidadMedidaNombre?: string;
  unidadMedidaSimbolo?: string;
  costoUnitario?: number;
  costoTotal?: number;
  stockAnterior: number;
  stockNuevo: number;
  notas?: string;
  referenciaId?: string;
  referenciaTipo?: string;
  fecha: Date;
  fechaCreacion: Date;
}

export interface MovimientoFormData {
  productoId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  costoUnitario?: number;
  notas?: string;
  referenciaId?: string;
  referenciaTipo?: string;
  fecha?: Date;
}

export interface StockProducto {
  productoId: string;
  productoNombre: string;
  unidadMedida: string;
  unidadMedidaNombre?: string;
  unidadMedidaSimbolo?: string;
  stockActual: number;
  stockMinimo: number;
  esStockCritico: boolean;
  ultimaActualizacion: Date;
}

export interface ConfigStockProducto {
  id: string;
  userId: string;
  productoId: string;
  stockMinimo: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface ConfigStockFormData {
  productoId: string;
  stockMinimo: number;
}

// ============================================
// TIPOS DE GASTOS FIJOS
// ============================================

export interface GastoFijo {
  id: string;
  userId: string;
  nombre: string;
  montoMensual: number;
  unidadesEstimadas: number;
  costoAsignado: number; // Calculado: montoMensual / unidadesEstimadas
  porcentajeDistribucion: number; // Calculado: costoAsignado / totalCostoAsignado
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface GastoFijoFormData {
  nombre: string;
  montoMensual: number;
  unidadesEstimadas: number;
}

export interface TotalesGastosFijos {
  totalMontoMensual: number;
  totalCostoAsignado: number;
}
