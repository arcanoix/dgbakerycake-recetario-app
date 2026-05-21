---
name: rn-supabase-schema
description: >
  Referencia del esquema de base de datos Supabase para la app móvil DG Bakery Cake.
  Contiene todos los tipos TypeScript, estructura de tablas, migraciones SQL,
  políticas RLS y ejemplos de queries. Usar cuando se necesita conocer la estructura
  de datos exacta, escribir queries Supabase, o crear nuevas migraciones.
triggers:
  - esquema supabase
  - tipos typescript bakery
  - schema database dgbakery
  - tablas supabase recetario
  - queries supabase bakery
---

# Skill: Supabase Schema — DG Bakery Cake Mobile

## Proyecto Supabase
- **URL**: `https://riucijrbufaucwpokgyl.supabase.co`
- **Proyecto**: dgbakerycake
- **Auth**: Email + Password con RLS habilitado en todas las tablas

---

## Tipos TypeScript Completos

```typescript
// types/index.ts — Copia exacta del proyecto web

export enum UnidadMedida {
  GRAMOS = 'gramos',
  KILOGRAMOS = 'kilogramos',
  LITROS = 'litros',
  MILILITROS = 'mililitros',
  ONZAS = 'onzas',
  UNIDAD = 'unidad',
}

export type TipoUnidad = 'peso' | 'volumen' | 'cantidad' | 'otro';
export type TipoCategoria = 'producto' | 'receta';
export type EstadoOrden = 'cotizacion' | 'confirmada' | 'en_proceso' | 'entregada' | 'cancelada';
export type TipoMovimiento = 'compra' | 'uso' | 'merma' | 'ajuste_entrada' | 'ajuste_salida';

export interface Producto {
  id: string;
  nombre: string;
  precioTotal: number;
  tamañoPresentacion: number;
  unidadMedida: string;
  unidadMedidaNombre?: string;
  unidadMedidaSimbolo?: string;
  cantidadPresentaciones: number;
  cantidadTotal: number;
  precioPorUnidad: number;
  precioPorPresentacion: number;
  categoria?: string;
  proveedor?: string;
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface MaterialReceta {
  id: string;
  productoId: string;
  nombreProducto: string;
  cantidadUtilizada: number;
  unidadMedida: string;
  costoUnitario: number;
  costoMaterial: number;
}

export interface Receta {
  id: string;
  nombre: string;
  descripcion: string;
  materiales: MaterialReceta[];
  rendimiento?: number;
  unidadRendimiento?: string;
  cantidadHoras: number;
  costoPorHora: number;
  costoManoObra: number;
  costoGastosFijos: number;
  costoMateriales: number;
  costoTotal: number;
  margenGanancia?: number;
  precioVentaSugerido?: number;
  categoria?: string;
  imagen?: string;
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface ConfiguracionGlobal {
  id: string;
  costoPorHoraDefecto: number;
  moneda: string;
  margenGananciaDefecto?: number;
  tasaCambioUSD?: number;
  porcentajeGastosFijos?: number;
  ultimaActualizacion: Date;
}

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

export interface MovimientoInventario {
  id: string;
  userId: string;
  productoId: string;
  productoNombre?: string;
  tipo: TipoMovimiento;
  cantidad: number;
  unidadMedida: string;
  costoUnitario?: number;
  costoTotal?: number;
  stockAnterior: number;
  stockNuevo: number;
  notas?: string;
  fecha: Date;
}

export interface GastoFijo {
  id: string;
  userId: string;
  nombre: string;
  montoMensual: number;
  unidadesEstimadas: number;
  costoAsignado: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
```

---

## Estructura de Tablas Supabase

### `productos`
```sql
id UUID PK
user_id UUID FK → auth.users
nombre TEXT NOT NULL
precio_total DECIMAL(14,4)
tamaño_presentacion DECIMAL(14,4)
unidad_medida UUID FK → unidades_medida
cantidad_presentaciones DECIMAL(14,4)
cantidad_total DECIMAL(14,4) -- calculado
precio_por_unidad DECIMAL(14,4) -- calculado
precio_por_presentacion DECIMAL(14,4) -- calculado
categoria UUID FK → categorias (nullable)
proveedor TEXT
notas TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### `recetas`
```sql
id UUID PK
user_id UUID FK → auth.users
nombre TEXT NOT NULL
descripcion TEXT
materiales JSONB -- array de MaterialReceta
rendimiento DECIMAL
unidad_rendimiento TEXT
cantidad_horas DECIMAL(10,4)
costo_por_hora DECIMAL(14,4)
costo_mano_obra DECIMAL(14,4)
costo_gastos_fijos DECIMAL(14,4)
costo_materiales DECIMAL(14,4)
costo_total DECIMAL(14,4)
margen_ganancia DECIMAL(5,2)
precio_venta_sugerido DECIMAL(14,4)
categoria UUID FK → categorias (nullable)
imagen TEXT
notas TEXT
fecha_creacion TIMESTAMPTZ
fecha_actualizacion TIMESTAMPTZ
```

### `configuracion`
```sql
id UUID PK
user_id UUID FK → auth.users (UNIQUE)
costo_por_hora_defecto DECIMAL(14,4) DEFAULT 10
moneda TEXT DEFAULT 'VES'
margen_ganancia_defecto DECIMAL(5,2) DEFAULT 30
tasa_cambio_usd DECIMAL(14,4)
porcentaje_gastos_fijos DECIMAL(5,2)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### `clientes`
```sql
id UUID PK
user_id UUID FK → auth.users
nombre TEXT NOT NULL
email TEXT
telefono TEXT
direccion TEXT
notas TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### `ordenes`
```sql
id UUID PK
user_id UUID FK → auth.users
cliente_id UUID FK → clientes
numero_orden TEXT NOT NULL
estado TEXT CHECK ('cotizacion','confirmada','en_proceso','entregada','cancelada')
fecha_entrega DATE
subtotal DECIMAL(10,2)
descuento_porcentaje DECIMAL(5,2)
descuento_monto DECIMAL(10,2)
total DECIMAL(10,2)
pago_adelantado DECIMAL(10,2)
saldo_pendiente DECIMAL(10,2)
notas TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### `orden_items`
```sql
id UUID PK
orden_id UUID FK → ordenes (CASCADE)
receta_id UUID FK → recetas (nullable)
nombre_item TEXT NOT NULL
cantidad INT NOT NULL
precio_unitario DECIMAL(10,2)
subtotal DECIMAL(10,2)
notas TEXT
created_at TIMESTAMPTZ
```

### `gastos_fijos`
```sql
id UUID PK
user_id UUID FK → auth.users
nombre TEXT NOT NULL
monto_mensual DECIMAL(14,4) DEFAULT 5.00
unidades_estimadas DECIMAL(14,4) DEFAULT 20.00
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
UNIQUE(user_id, nombre)
```

### `inventario_movimientos`
```sql
id UUID PK
user_id UUID FK → auth.users
producto_id UUID FK → productos
tipo TEXT CHECK ('compra','uso','merma','ajuste_entrada','ajuste_salida')
cantidad DECIMAL(14,4)
unidad_medida UUID FK → unidades_medida
costo_unitario DECIMAL(14,4)
costo_total DECIMAL(14,4)
stock_anterior DECIMAL(14,4)
stock_nuevo DECIMAL(14,4)
notas TEXT
referencia_id UUID
referencia_tipo TEXT
fecha TIMESTAMPTZ
created_at TIMESTAMPTZ
```

---

## Queries Supabase — Ejemplos React Native

### Obtener Productos
```typescript
const { data, error } = await supabase
  .from('productos')
  .select(`
    *,
    unidad:unidades_medida(id, nombre, simbolo),
    cat:categorias(id, nombre, color)
  `)
  .order('nombre');
```

### Obtener Recetas con materiales
```typescript
const { data, error } = await supabase
  .from('recetas')
  .select('*')
  .order('fecha_actualizacion', { ascending: false });
// Los materiales están en el campo JSONB 'materiales'
```

### Crear Receta
```typescript
const { data, error } = await supabase
  .from('recetas')
  .insert({
    user_id: session.user.id,
    nombre: formData.nombre,
    descripcion: formData.descripcion,
    materiales: JSON.stringify(materiales),
    cantidad_horas: formData.cantidadHoras,
    costo_por_hora: config.costoPorHoraDefecto,
    costo_mano_obra: costoManoObra,
    costo_gastos_fijos: costoGastosFijos,
    costo_materiales: costoMateriales,
    costo_total: costoTotal,
    margen_ganancia: formData.margenGanancia,
    precio_venta_sugerido: precioVenta,
  })
  .select()
  .single();
```

### Obtener Configuración del Usuario
```typescript
const { data, error } = await supabase
  .from('configuracion')
  .select('*')
  .single(); // RLS asegura que solo trae la del usuario actual
```

### Upsert Configuración
```typescript
const { error } = await supabase
  .from('configuracion')
  .upsert({
    user_id: session.user.id,
    costo_por_hora_defecto: formData.costoPorHora,
    moneda: formData.moneda,
    margen_ganancia_defecto: formData.margenGanancia,
    tasa_cambio_usd: formData.tasaCambioUSD,
    porcentaje_gastos_fijos: formData.porcentajeGastosFijos,
  }, { onConflict: 'user_id' });
```

### Crear Orden con Items
```typescript
// 1. Crear la orden
const { data: orden, error: ordenError } = await supabase
  .from('ordenes')
  .insert({
    user_id: session.user.id,
    cliente_id: formData.clienteId,
    numero_orden: generarNumeroOrden(),
    estado: 'cotizacion',
    subtotal: formData.subtotal,
    descuento_porcentaje: formData.descuentoPorcentaje,
    descuento_monto: formData.descuentoMonto,
    total: formData.total,
    pago_adelantado: formData.pagoAdelantado,
    saldo_pendiente: formData.total - formData.pagoAdelantado,
    fecha_entrega: formData.fechaEntrega?.toISOString(),
    notas: formData.notas,
  })
  .select()
  .single();

// 2. Crear los items
if (orden && !ordenError) {
  const items = formData.items.map(item => ({
    orden_id: orden.id,
    receta_id: item.recetaId,
    nombre_item: item.nombreItem,
    cantidad: item.cantidad,
    precio_unitario: item.precioUnitario,
    subtotal: item.cantidad * item.precioUnitario,
    notas: item.notas,
  }));
  await supabase.from('orden_items').insert(items);
}
```

### Suscripción en Tiempo Real
```typescript
useEffect(() => {
  const channel = supabase
    .channel('productos-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'productos' },
      (payload) => {
        if (payload.eventType === 'INSERT') setProductos(prev => [...prev, mapProducto(payload.new)]);
        if (payload.eventType === 'UPDATE') setProductos(prev => prev.map(p => p.id === payload.new.id ? mapProducto(payload.new) : p));
        if (payload.eventType === 'DELETE') setProductos(prev => prev.filter(p => p.id !== payload.old.id));
      }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, []);
```

---

## Mappers — DB a TypeScript

```typescript
// utils/mappers.ts
export function mapProducto(row: any): Producto {
  return {
    id: row.id,
    nombre: row.nombre,
    precioTotal: row.precio_total,
    tamañoPresentacion: row.tamaño_presentacion,
    unidadMedida: row.unidad_medida,
    unidadMedidaNombre: row.unidad?.nombre,
    unidadMedidaSimbolo: row.unidad?.simbolo,
    cantidadPresentaciones: row.cantidad_presentaciones,
    cantidadTotal: row.cantidad_total,
    precioPorUnidad: row.precio_por_unidad,
    precioPorPresentacion: row.precio_por_presentacion,
    categoria: row.categoria,
    proveedor: row.proveedor,
    notas: row.notas,
    fechaCreacion: new Date(row.created_at),
    fechaActualizacion: new Date(row.updated_at),
  };
}

export function mapReceta(row: any): Receta {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    materiales: typeof row.materiales === 'string' ? JSON.parse(row.materiales) : (row.materiales ?? []),
    rendimiento: row.rendimiento,
    unidadRendimiento: row.unidad_rendimiento,
    cantidadHoras: row.cantidad_horas,
    costoPorHora: row.costo_por_hora,
    costoManoObra: row.costo_mano_obra,
    costoGastosFijos: row.costo_gastos_fijos ?? 0,
    costoMateriales: row.costo_materiales,
    costoTotal: row.costo_total,
    margenGanancia: row.margen_ganancia,
    precioVentaSugerido: row.precio_venta_sugerido,
    categoria: row.categoria,
    imagen: row.imagen,
    notas: row.notas,
    fechaCreacion: new Date(row.fecha_creacion),
    fechaActualizacion: new Date(row.fecha_actualizacion),
  };
}
```

---

## Validaciones Zod

```typescript
// utils/validators.ts
import { z } from 'zod';

export const productoSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  precioTotal: z.number().positive('Debe ser mayor a 0'),
  tamañoPresentacion: z.number().positive('Debe ser mayor a 0'),
  unidadMedida: z.string().min(1, 'Selecciona una unidad'),
  cantidadPresentaciones: z.number().positive().default(1),
  categoria: z.string().optional(),
  proveedor: z.string().optional(),
  notas: z.string().optional(),
});

export const recetaSchema = z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().min(5).max(500),
  rendimiento: z.number().positive().optional(),
  unidadRendimiento: z.string().optional(),
  cantidadHoras: z.number().min(0),
  margenGanancia: z.number().min(0).max(500).optional(),
  categoria: z.string().optional(),
  notas: z.string().optional(),
});

export const clienteSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = loginSchema.extend({
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
```

---

## Políticas RLS (todas las tablas)

Patrón estándar en todas las tablas:
```sql
-- SELECT
CREATE POLICY "Users can view their own {tabla}"
  ON public.{tabla} FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can insert their own {tabla}"
  ON public.{tabla} FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update their own {tabla}"
  ON public.{tabla} FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete their own {tabla}"
  ON public.{tabla} FOR DELETE
  USING (auth.uid() = user_id);
```

La app móvil no necesita hacer nada especial — RLS filtra automáticamente por el usuario autenticado.
