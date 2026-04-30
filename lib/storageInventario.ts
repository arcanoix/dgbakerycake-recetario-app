import { supabase } from './supabase';
import {
  MovimientoInventario,
  MovimientoFormData,
  StockProducto,
  ConfigStockProducto,
  ConfigStockFormData,
} from '@/types';
import { MovimientoFormSchema } from './validators';
import { sanitizeStringFields } from './sanitize';

// ============================================
// MOVIMIENTOS (KARDEX)
// ============================================

export const obtenerMovimientos = async (
  productoId?: string,
  limite: number = 200
): Promise<MovimientoInventario[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('inventario_movimientos')
    .select('*')
    .eq('user_id', user.id)
    .order('fecha', { ascending: false })
    .limit(limite);

  if (productoId) {
    query = query.eq('producto_id', productoId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al obtener movimientos:', error);
    return [];
  }

  return (data || []).map(mapMovimientoFromDB);
};

export const registrarMovimientoConUnidad = async (
  datos: MovimientoFormData,
  unidadMedida: string
): Promise<{ exitoso: boolean; id?: string; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  // Validate and sanitize user-supplied fields before writing to Supabase
  const sanitized = sanitizeStringFields({
    productoId: datos.productoId,
    tipo: datos.tipo,
    cantidad: datos.cantidad,
    costoUnitario: datos.costoUnitario,
    notas: datos.notas,
    referenciaId: datos.referenciaId,
    referenciaTipo: datos.referenciaTipo,
    fecha: datos.fecha,
  });

  const parsed = MovimientoFormSchema.safeParse(sanitized);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Datos de movimiento inválidos';
    return { exitoso: false, error: msg };
  }

  const datosValidados = parsed.data;
  const stockActual = await calcularStockActual(user.id, datosValidados.productoId);

  const esEntrada = datosValidados.tipo === 'compra' || datosValidados.tipo === 'ajuste_entrada';
  const stockNuevo = esEntrada
    ? stockActual + datosValidados.cantidad
    : Math.max(0, stockActual - datosValidados.cantidad);

  const costoTotal =
    datosValidados.costoUnitario != null ? datosValidados.costoUnitario * datosValidados.cantidad : null;

  const { data, error } = await supabase
    .from('inventario_movimientos')
    .insert([
      {
        user_id: user.id,
        producto_id: datosValidados.productoId,
        tipo: datosValidados.tipo,
        cantidad: datosValidados.cantidad,
        unidad_medida: unidadMedida,
        costo_unitario: datosValidados.costoUnitario ?? null,
        costo_total: costoTotal,
        stock_anterior: stockActual,
        stock_nuevo: stockNuevo,
        notas: datosValidados.notas ?? null,
        referencia_id: datosValidados.referenciaId ?? null,
        referencia_tipo: datosValidados.referenciaTipo ?? null,
        fecha: datosValidados.fecha ? datosValidados.fecha.toISOString() : new Date().toISOString(),
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Error al registrar movimiento:', error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true, id: data?.id };
};

export const eliminarMovimiento = async (
  id: string
): Promise<{ exitoso: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  const { error } = await supabase
    .from('inventario_movimientos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error al eliminar movimiento:', error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true };
};

// ============================================
// STOCK ACTUAL (derivado de los movimientos)
// ============================================

export const calcularStockActual = async (
  userId: string,
  productoId: string
): Promise<number> => {
  // Sumar entradas (compra, ajuste_entrada)
  const { data: entradas } = await supabase
    .from('inventario_movimientos')
    .select('cantidad')
    .eq('user_id', userId)
    .eq('producto_id', productoId)
    .in('tipo', ['compra', 'ajuste_entrada']);

  // Sumar salidas (uso, merma, ajuste_salida)
  const { data: salidas } = await supabase
    .from('inventario_movimientos')
    .select('cantidad')
    .eq('user_id', userId)
    .eq('producto_id', productoId)
    .in('tipo', ['uso', 'merma', 'ajuste_salida']);

  const totalEntradas = (entradas || []).reduce(
    (sum, r) => sum + parseFloat(r.cantidad),
    0
  );
  const totalSalidas = (salidas || []).reduce(
    (sum, r) => sum + parseFloat(r.cantidad),
    0
  );

  return Math.max(0, totalEntradas - totalSalidas);
};

export const obtenerStockProductos = async (): Promise<StockProducto[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch all data in parallel to avoid N+1 queries
  const [productosResult, configsResult, movimientosResult] = await Promise.all([
    supabase.from('productos').select('id, nombre, unidad_medida'),
    supabase.from('inventario_config_stock').select('*').eq('user_id', user.id),
    supabase
      .from('inventario_movimientos')
      .select('producto_id, tipo, cantidad, fecha')
      .eq('user_id', user.id),
  ]);

  const productos = productosResult.data;
  if (!productos || productos.length === 0) return [];

  const configMap = new Map<string, number>();
  (configsResult.data || []).forEach((c: any) => {
    configMap.set(c.producto_id, parseFloat(c.stock_minimo));
  });

  // Aggregate movements per product in memory
  const movimientos = movimientosResult.data || [];
  const entradaTipos = new Set(['compra', 'ajuste_entrada']);

  type MovAgg = { stock: number; ultimaFecha: Date | null };
  const aggMap = new Map<string, MovAgg>();

  for (const mov of movimientos) {
    const agg = aggMap.get(mov.producto_id) ?? { stock: 0, ultimaFecha: null };
    const cantidad = parseFloat(mov.cantidad);
    agg.stock = entradaTipos.has(mov.tipo)
      ? agg.stock + cantidad
      : Math.max(0, agg.stock - cantidad);
    const fecha = new Date(mov.fecha);
    if (!agg.ultimaFecha || fecha > agg.ultimaFecha) agg.ultimaFecha = fecha;
    aggMap.set(mov.producto_id, agg);
  }

  return productos.map((prod: any) => {
    const agg = aggMap.get(prod.id);
    const stockActual = agg ? Math.max(0, agg.stock) : 0;
    const stockMinimo = configMap.get(prod.id) ?? 0;
    return {
      productoId: prod.id,
      productoNombre: prod.nombre,
      unidadMedida: prod.unidad_medida,
      stockActual,
      stockMinimo,
      esStockCritico: stockMinimo > 0 && stockActual <= stockMinimo,
      ultimaActualizacion: agg?.ultimaFecha ?? new Date(0),
    };
  });
};

// ============================================
// CONFIGURACIÓN DE STOCK MÍNIMO
// ============================================

export const obtenerConfigsStock = async (): Promise<ConfigStockProducto[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('inventario_config_stock')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error al obtener configuraciones de stock:', error);
    return [];
  }

  return (data || []).map(mapConfigStockFromDB);
};

export const guardarConfigStock = async (
  datos: ConfigStockFormData
): Promise<{ exitoso: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  const { error } = await supabase
    .from('inventario_config_stock')
    .upsert(
      {
        user_id: user.id,
        producto_id: datos.productoId,
        stock_minimo: datos.stockMinimo,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,producto_id' }
    );

  if (error) {
    console.error('Error al guardar configuración de stock:', error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true };
};

export const eliminarConfigStock = async (
  productoId: string
): Promise<{ exitoso: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  const { error } = await supabase
    .from('inventario_config_stock')
    .delete()
    .eq('producto_id', productoId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error al eliminar configuración de stock:', error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true };
};

// ============================================
// MAPPERS (DB <-> App)
// ============================================

function mapMovimientoFromDB(data: any): MovimientoInventario {
  return {
    id: data.id,
    userId: data.user_id,
    productoId: data.producto_id,
    tipo: data.tipo,
    cantidad: parseFloat(data.cantidad),
    unidadMedida: data.unidad_medida,
    costoUnitario: data.costo_unitario != null ? parseFloat(data.costo_unitario) : undefined,
    costoTotal: data.costo_total != null ? parseFloat(data.costo_total) : undefined,
    stockAnterior: parseFloat(data.stock_anterior),
    stockNuevo: parseFloat(data.stock_nuevo),
    notas: data.notas ?? undefined,
    referenciaId: data.referencia_id ?? undefined,
    referenciaTipo: data.referencia_tipo ?? undefined,
    fecha: new Date(data.fecha),
    fechaCreacion: new Date(data.created_at),
  };
}

function mapConfigStockFromDB(data: any): ConfigStockProducto {
  return {
    id: data.id,
    userId: data.user_id,
    productoId: data.producto_id,
    stockMinimo: parseFloat(data.stock_minimo),
    fechaCreacion: new Date(data.created_at),
    fechaActualizacion: new Date(data.updated_at),
  };
}
