/**
 * Zod schemas for all user-submitted form data.
 * These are applied in the storage layer before any Supabase operation
 * to enforce strict input validation and prevent data corruption.
 */

import { z } from 'zod';

// ============================================
// PRODUCTOS
// ============================================

export const ProductoFormSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede superar 200 caracteres'),
  precioTotal: z
    .number()
    .positive('El precio debe ser mayor a 0'),
  tamañoPresentacion: z
    .number()
    .positive('El tamaño de presentación debe ser mayor a 0'),
  unidadMedida: z.string().min(1, 'La unidad de medida es requerida'),
  cantidadPresentaciones: z
    .number()
    .positive('La cantidad de presentaciones debe ser mayor a 0'),
  categoria: z.string().max(100, 'La categoría no puede superar 100 caracteres').optional(),
  proveedor: z.string().max(200, 'El proveedor no puede superar 200 caracteres').optional(),
  notas: z.string().max(2000, 'Las notas no pueden superar 2000 caracteres').optional(),
});

export type ProductoFormSchemaType = z.infer<typeof ProductoFormSchema>;

// ============================================
// RECETAS
// ============================================

export const RecetaFormSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede superar 200 caracteres'),
  descripcion: z
    .string()
    .max(5000, 'La descripción no puede superar 5000 caracteres'),
  rendimiento: z
    .number()
    .positive('El rendimiento debe ser mayor a 0')
    .optional(),
  unidadRendimiento: z
    .string()
    .max(100, 'La unidad de rendimiento no puede superar 100 caracteres')
    .optional(),
  margenGanancia: z
    .number()
    .min(0, 'El margen de ganancia no puede ser negativo')
    .max(10000, 'El margen de ganancia no puede superar 10000%')
    .optional(),
  categoria: z.string().max(100, 'La categoría no puede superar 100 caracteres').optional(),
  imagen: z
    .string()
    .max(500, 'La URL de imagen no puede superar 500 caracteres')
    .optional(),
  notas: z.string().max(2000, 'Las notas no pueden superar 2000 caracteres').optional(),
});

export type RecetaFormSchemaType = z.infer<typeof RecetaFormSchema>;

// ============================================
// CLIENTES
// ============================================

export const ClienteFormSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede superar 200 caracteres'),
  email: z
    .union([
      z.string().email('El email no es válido').max(200, 'El email no puede superar 200 caracteres'),
      z.literal(''),
    ])
    .optional(),
  telefono: z
    .string()
    .max(50, 'El teléfono no puede superar 50 caracteres')
    .optional(),
  direccion: z
    .string()
    .max(500, 'La dirección no puede superar 500 caracteres')
    .optional(),
  notas: z.string().max(2000, 'Las notas no pueden superar 2000 caracteres').optional(),
});

export type ClienteFormSchemaType = z.infer<typeof ClienteFormSchema>;

// ============================================
// ÍTEMS DE ORDEN
// ============================================

export const OrdenItemFormSchema = z.object({
  recetaId: z.string().optional(),
  nombreItem: z
    .string()
    .min(1, 'El nombre del ítem es requerido')
    .max(200, 'El nombre del ítem no puede superar 200 caracteres'),
  cantidad: z
    .number()
    .positive('La cantidad debe ser mayor a 0'),
  precioUnitario: z
    .number()
    .min(0, 'El precio unitario no puede ser negativo'),
  notas: z.string().max(1000, 'Las notas del ítem no pueden superar 1000 caracteres').optional(),
});

export type OrdenItemFormSchemaType = z.infer<typeof OrdenItemFormSchema>;

// ============================================
// ÓRDENES / COTIZACIONES
// ============================================

export const OrdenFormSchema = z.object({
  clienteId: z.string().min(1, 'El cliente es requerido'),
  estado: z.enum(['cotizacion', 'confirmada', 'entregada', 'cancelada'] as const, {
    error: 'Estado de orden inválido',
  }),
  items: z
    .array(OrdenItemFormSchema)
    .min(1, 'La orden debe tener al menos un ítem'),
  descuentoPorcentaje: z
    .number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede superar el 100%'),
  pagoAdelantado: z
    .number()
    .min(0, 'El pago adelantado no puede ser negativo'),
  notas: z.string().max(2000, 'Las notas no pueden superar 2000 caracteres').optional(),
  fechaEntrega: z.date().optional(),
});

export type OrdenFormSchemaType = z.infer<typeof OrdenFormSchema>;

// ============================================
// MOVIMIENTOS DE INVENTARIO
// ============================================

export const MovimientoFormSchema = z.object({
  productoId: z.string().min(1, 'El producto es requerido'),
  tipo: z.enum(['compra', 'uso', 'merma', 'ajuste_entrada', 'ajuste_salida'] as const, {
    error: 'Tipo de movimiento inválido',
  }),
  cantidad: z
    .number()
    .positive('La cantidad debe ser mayor a 0'),
  costoUnitario: z
    .number()
    .min(0, 'El costo unitario no puede ser negativo')
    .optional(),
  notas: z.string().max(1000, 'Las notas no pueden superar 1000 caracteres').optional(),
  referenciaId: z.string().optional(),
  referenciaTipo: z.string().max(100).optional(),
  fecha: z.date().optional(),
});

export type MovimientoFormSchemaType = z.infer<typeof MovimientoFormSchema>;

// ============================================
// UNIDADES DE MEDIDA
// ============================================

export const UnidadMedidaFormSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  simbolo: z
    .string()
    .min(1, 'El símbolo es requerido')
    .max(20, 'El símbolo no puede superar 20 caracteres'),
  tipo: z.enum(['peso', 'volumen', 'cantidad', 'otro'] as const, {
    error: 'Tipo de unidad inválido',
  }),
  factorConversionBase: z
    .number()
    .positive('El factor de conversión debe ser mayor a 0')
    .optional(),
  unidadBase: z.string().optional(),
});

export type UnidadMedidaFormSchemaType = z.infer<typeof UnidadMedidaFormSchema>;

// ============================================
// CATEGORÍAS
// ============================================

export const CategoriaFormSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  tipo: z.enum(['producto', 'receta'] as const, {
    error: 'Tipo de categoría inválido',
  }),
  descripcion: z
    .string()
    .max(500, 'La descripción no puede superar 500 caracteres')
    .optional(),
  color: z
    .union([
      z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un valor hexadecimal válido (ej: #FF5733)'),
      z.literal(''),
    ])
    .optional(),
});

export type CategoriaFormSchemaType = z.infer<typeof CategoriaFormSchema>;

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================

export const ConfiguracionFormSchema = z.object({
  costoPorHoraDefecto: z
    .number()
    .min(0, 'El costo por hora no puede ser negativo'),
  moneda: z
    .string()
    .min(1, 'La moneda es requerida')
    .max(10, 'El código de moneda no puede superar 10 caracteres'),
  margenGananciaDefecto: z
    .number()
    .min(0, 'El margen de ganancia no puede ser negativo')
    .max(10000, 'El margen de ganancia no puede superar 10000%')
    .optional(),
  tasaCambioUSD: z
    .number()
    .positive('La tasa de cambio debe ser mayor a 0')
    .optional(),
});

export type ConfiguracionFormSchemaType = z.infer<typeof ConfiguracionFormSchema>;

