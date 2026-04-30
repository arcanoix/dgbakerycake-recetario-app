import { supabase } from './supabase';
import { Cliente, ClienteFormData, Orden, OrdenFormData, OrdenItem } from '@/types';
import { registrarActividad, registrarErrorSistema } from './subscriptionStorage';
import { ClienteFormSchema, OrdenFormSchema } from './validators';
import { sanitizeStringFields } from './sanitize';

// ============================================
// CLIENTES
// ============================================

export const obtenerClientes = async (): Promise<Cliente[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('user_id', user.id)
    .order('nombre', { ascending: true });

  if (error) {
    registrarErrorSistema(`Error al obtener clientes: ${String(error)}`).catch(() => {});
    throw error;
  }

  return (data || []).map(mapClienteFromDB);
};

export const obtenerClientePorId = async (id: string): Promise<Cliente | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error al obtener cliente:', error);
    }
    return null;
  }

  return data ? mapClienteFromDB(data) : null;
};

export const guardarCliente = async (cliente: ClienteFormData & { id?: string }): Promise<{ exitoso: boolean; id?: string; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  // Validate and sanitize user-supplied fields before writing to Supabase
  const sanitized = sanitizeStringFields({
    nombre: cliente.nombre,
    email: cliente.email,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    notas: cliente.notas,
  });

  const parsed = ClienteFormSchema.safeParse(sanitized);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Datos de cliente inválidos';
    return { exitoso: false, error: msg };
  }

  const clienteValidado = { ...cliente, ...parsed.data };

  if (clienteValidado.id) {
    // Actualizar
    const { error } = await supabase
      .from('clientes')
      .update({
        nombre: clienteValidado.nombre,
        email: clienteValidado.email || null,
        telefono: clienteValidado.telefono || null,
        direccion: clienteValidado.direccion || null,
        notas: clienteValidado.notas || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clienteValidado.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error al actualizar cliente:', error);
      return { exitoso: false, error: error.message };
    }
    registrarActividad('update', 'clientes', `Cliente actualizado: ${clienteValidado.nombre}`, clienteValidado.id, clienteValidado.nombre);
    return { exitoso: true, id: clienteValidado.id };
  } else {
    // Insertar
    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        user_id: user.id,
        nombre: clienteValidado.nombre,
        email: clienteValidado.email || null,
        telefono: clienteValidado.telefono || null,
        direccion: clienteValidado.direccion || null,
        notas: clienteValidado.notas || null,
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Error al crear cliente:', error);
      return { exitoso: false, error: error.message };
    }
    registrarActividad('create', 'clientes', `Cliente creado: ${clienteValidado.nombre}`, data?.id, clienteValidado.nombre);
    return { exitoso: true, id: data?.id };
  }
};

export const eliminarCliente = async (id: string): Promise<{ exitoso: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error al eliminar cliente:', error);
    return { exitoso: false, error: error.message };
  }

  registrarActividad('delete', 'clientes', `Cliente eliminado: ${id}`, id);
  return { exitoso: true };
};

// ============================================
// ÓRDENES / COTIZACIONES
// ============================================

export const obtenerOrdenes = async (): Promise<Orden[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('ordenes')
    .select(`
      *,
      clientes!inner(nombre),
      orden_items(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    registrarErrorSistema(`Error al obtener órdenes: ${String(error)}`).catch(() => {});
    throw error;
  }

  return (data || []).map(mapOrdenFromDB);
};

export const obtenerOrdenPorId = async (id: string): Promise<Orden | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('ordenes')
    .select(`
      *,
      clientes!inner(nombre),
      orden_items(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error al obtener orden:', error);
    }
    return null;
  }

  return data ? mapOrdenFromDB(data) : null;
};

export const crearOrden = async (datos: OrdenFormData): Promise<{ exitoso: boolean; id?: string; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  // Validate and sanitize order data before writing to Supabase
  const sanitized = {
    ...datos,
    notas: datos.notas ? datos.notas.replace(/<[^>]*>/g, '').trim() : datos.notas,
    items: datos.items.map(item => ({
      ...item,
      nombreItem: item.nombreItem.replace(/<[^>]*>/g, '').trim(),
      notas: item.notas ? item.notas.replace(/<[^>]*>/g, '').trim() : item.notas,
    })),
  };

  const parsed = OrdenFormSchema.safeParse(sanitized);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Datos de orden inválidos';
    return { exitoso: false, error: msg };
  }

  const datosValidados = parsed.data;

  // Calcular totales
  const subtotal = datosValidados.items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
  const descuentoMonto = subtotal * (datosValidados.descuentoPorcentaje / 100);
  const total = subtotal - descuentoMonto;
  const saldoPendiente = total - datosValidados.pagoAdelantado;

  // Generar número de orden
  const { count } = await supabase
    .from('ordenes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const numeroOrden = `ORD-${new Date().getFullYear()}-${String((count ?? 0) + 1).padStart(4, '0')}`;

  // Insertar orden
  const { data: orden, error: ordenError } = await supabase
    .from('ordenes')
    .insert([{
      user_id: user.id,
      cliente_id: datosValidados.clienteId,
      numero_orden: numeroOrden,
      estado: datosValidados.estado,
      subtotal,
      descuento_porcentaje: datosValidados.descuentoPorcentaje,
      descuento_monto: descuentoMonto,
      total,
      pago_adelantado: datosValidados.pagoAdelantado,
      saldo_pendiente: saldoPendiente,
      notas: datosValidados.notas || null,
      fecha_entrega: datosValidados.fechaEntrega ? datosValidados.fechaEntrega.toISOString() : null,
    }])
    .select('id')
    .single();

  if (ordenError) {
    console.error('Error al crear orden:', ordenError);
    return { exitoso: false, error: ordenError.message };
  }

  const ordenId = orden.id;

  // Insertar ítems de orden
  if (datosValidados.items.length > 0) {
    const itemsData = datosValidados.items.map(item => ({
      orden_id: ordenId,
      receta_id: item.recetaId || null,
      nombre_item: item.nombreItem,
      cantidad: item.cantidad,
      precio_unitario: item.precioUnitario,
      subtotal: item.cantidad * item.precioUnitario,
      notas: item.notas || null,
    }));

    const { error: itemsError } = await supabase
      .from('orden_items')
      .insert(itemsData);

    if (itemsError) {
      console.error('Error al crear ítems de orden:', itemsError);
      // Rollback: eliminar la orden
      await supabase.from('ordenes').delete().eq('id', ordenId);
      return { exitoso: false, error: itemsError.message };
    }
  }

  registrarActividad('create', 'ordenes', `Orden creada: ${numeroOrden}`, ordenId, numeroOrden);
  return { exitoso: true, id: ordenId };
};

export const actualizarOrden = async (id: string, datos: OrdenFormData): Promise<{ exitoso: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  // Validate and sanitize order data before writing to Supabase
  const sanitized = {
    ...datos,
    notas: datos.notas ? datos.notas.replace(/<[^>]*>/g, '').trim() : datos.notas,
    items: datos.items.map(item => ({
      ...item,
      nombreItem: item.nombreItem.replace(/<[^>]*>/g, '').trim(),
      notas: item.notas ? item.notas.replace(/<[^>]*>/g, '').trim() : item.notas,
    })),
  };

  const parsed = OrdenFormSchema.safeParse(sanitized);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Datos de orden inválidos';
    return { exitoso: false, error: msg };
  }

  const datosValidados = parsed.data;

  // Calcular totales
  const subtotal = datosValidados.items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
  const descuentoMonto = subtotal * (datosValidados.descuentoPorcentaje / 100);
  const total = subtotal - descuentoMonto;
  const saldoPendiente = total - datosValidados.pagoAdelantado;

  // Actualizar orden
  const { error: ordenError } = await supabase
    .from('ordenes')
    .update({
      cliente_id: datosValidados.clienteId,
      estado: datosValidados.estado,
      subtotal,
      descuento_porcentaje: datosValidados.descuentoPorcentaje,
      descuento_monto: descuentoMonto,
      total,
      pago_adelantado: datosValidados.pagoAdelantado,
      saldo_pendiente: saldoPendiente,
      notas: datosValidados.notas || null,
      fecha_entrega: datosValidados.fechaEntrega ? datosValidados.fechaEntrega.toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (ordenError) {
    console.error('Error al actualizar orden:', ordenError);
    return { exitoso: false, error: ordenError.message };
  }

  // Reemplazar ítems: eliminar los existentes e insertar los nuevos
  const { error: deleteItemsError } = await supabase.from('orden_items').delete().eq('orden_id', id);
  if (deleteItemsError) {
    console.error('Error al eliminar ítems existentes:', deleteItemsError);
    return { exitoso: false, error: deleteItemsError.message };
  }

  if (datosValidados.items.length > 0) {
    const itemsData = datosValidados.items.map(item => ({
      orden_id: id,
      receta_id: item.recetaId || null,
      nombre_item: item.nombreItem,
      cantidad: item.cantidad,
      precio_unitario: item.precioUnitario,
      subtotal: item.cantidad * item.precioUnitario,
      notas: item.notas || null,
    }));

    const { error: itemsError } = await supabase
      .from('orden_items')
      .insert(itemsData);

    if (itemsError) {
      console.error('Error al actualizar ítems de orden:', itemsError);
      return { exitoso: false, error: itemsError.message };
    }
  }

  registrarActividad('update', 'ordenes', `Orden actualizada: ${id}`, id);
  return { exitoso: true };
};

export const actualizarEstadoOrden = async (id: string, estado: string): Promise<{ exitoso: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  const { error } = await supabase
    .from('ordenes')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error al actualizar estado de orden:', error);
    return { exitoso: false, error: error.message };
  }

  registrarActividad('update', 'ordenes', `Estado de orden actualizado a ${estado}`, id);
  return { exitoso: true };
};

export const actualizarFechaEntregaOrden = async (
  id: string,
  fechaEntrega?: Date
): Promise<{ exitoso: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  const { error } = await supabase
    .from('ordenes')
    .update({
      fecha_entrega: fechaEntrega ? fechaEntrega.toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error al actualizar fecha de entrega:', error);
    return { exitoso: false, error: error.message };
  }

  const fechaLabel = fechaEntrega ? fechaEntrega.toISOString() : 'sin fecha';
  registrarActividad('update', 'ordenes', `Fecha de entrega actualizada: ${fechaLabel}`, id);
  return { exitoso: true };
};

export const eliminarOrden = async (id: string): Promise<{ exitoso: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  const { error } = await supabase
    .from('ordenes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error al eliminar orden:', error);
    return { exitoso: false, error: error.message };
  }

  registrarActividad('delete', 'ordenes', `Orden eliminada: ${id}`, id);
  return { exitoso: true };
};

// ============================================
// MAPPERS (DB <-> App)
// ============================================

function mapClienteFromDB(data: any): Cliente {
  return {
    id: data.id,
    userId: data.user_id,
    nombre: data.nombre,
    email: data.email || undefined,
    telefono: data.telefono || undefined,
    direccion: data.direccion || undefined,
    notas: data.notas || undefined,
    fechaCreacion: new Date(data.created_at),
    fechaActualizacion: new Date(data.updated_at),
  };
}

function mapOrdenFromDB(data: any): Orden {
  const items: OrdenItem[] = (data.orden_items || []).map((item: any) => ({
    id: item.id,
    ordenId: item.orden_id,
    recetaId: item.receta_id || undefined,
    nombreItem: item.nombre_item,
    cantidad: parseFloat(item.cantidad),
    precioUnitario: parseFloat(item.precio_unitario),
    subtotal: parseFloat(item.subtotal),
    notas: item.notas || undefined,
  }));

  return {
    id: data.id,
    userId: data.user_id,
    clienteId: data.cliente_id,
    clienteNombre: data.clientes?.nombre || undefined,
    numeroOrden: data.numero_orden,
    estado: data.estado,
    items,
    subtotal: parseFloat(data.subtotal),
    descuentoPorcentaje: parseFloat(data.descuento_porcentaje),
    descuentoMonto: parseFloat(data.descuento_monto),
    total: parseFloat(data.total),
    pagoAdelantado: parseFloat(data.pago_adelantado),
    saldoPendiente: parseFloat(data.saldo_pendiente),
    notas: data.notas || undefined,
    fechaEntrega: parseFechaEntrega(data.fecha_entrega),
    fechaCreacion: new Date(data.created_at),
    fechaActualizacion: new Date(data.updated_at),
  };
}

function parseFechaEntrega(value: any): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (dateOnlyMatch) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
}
