import { supabase } from './supabase';
import { Cliente, ClienteFormData, Orden, OrdenFormData, OrdenItem } from '@/types';
import { registrarActividad } from './subscriptionStorage';

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
    console.error('Error al obtener clientes:', error);
    return [];
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

  if (cliente.id) {
    // Actualizar
    const { error } = await supabase
      .from('clientes')
      .update({
        nombre: cliente.nombre,
        email: cliente.email || null,
        telefono: cliente.telefono || null,
        direccion: cliente.direccion || null,
        notas: cliente.notas || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cliente.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error al actualizar cliente:', error);
      return { exitoso: false, error: error.message };
    }
    registrarActividad('update', 'clientes', `Cliente actualizado: ${cliente.nombre}`, cliente.id, cliente.nombre);
    return { exitoso: true, id: cliente.id };
  } else {
    // Insertar
    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        user_id: user.id,
        nombre: cliente.nombre,
        email: cliente.email || null,
        telefono: cliente.telefono || null,
        direccion: cliente.direccion || null,
        notas: cliente.notas || null,
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Error al crear cliente:', error);
      return { exitoso: false, error: error.message };
    }
    registrarActividad('create', 'clientes', `Cliente creado: ${cliente.nombre}`, data?.id, cliente.nombre);
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
    console.error('Error al obtener órdenes:', error);
    return [];
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

  // Calcular totales
  const subtotal = datos.items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
  const descuentoMonto = subtotal * (datos.descuentoPorcentaje / 100);
  const total = subtotal - descuentoMonto;
  const saldoPendiente = total - datos.pagoAdelantado;

  // Generar número de orden
  const { data: ordenCount } = await supabase
    .from('ordenes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const count = (ordenCount as any) || 0;
  const numeroOrden = `ORD-${new Date().getFullYear()}-${String(typeof count === 'number' ? count + 1 : 1).padStart(4, '0')}`;

  // Insertar orden
  const { data: orden, error: ordenError } = await supabase
    .from('ordenes')
    .insert([{
      user_id: user.id,
      cliente_id: datos.clienteId,
      numero_orden: numeroOrden,
      estado: datos.estado,
      subtotal,
      descuento_porcentaje: datos.descuentoPorcentaje,
      descuento_monto: descuentoMonto,
      total,
      pago_adelantado: datos.pagoAdelantado,
      saldo_pendiente: saldoPendiente,
      notas: datos.notas || null,
      fecha_entrega: datos.fechaEntrega ? datos.fechaEntrega.toISOString().split('T')[0] : null,
    }])
    .select('id')
    .single();

  if (ordenError) {
    console.error('Error al crear orden:', ordenError);
    return { exitoso: false, error: ordenError.message };
  }

  const ordenId = orden.id;

  // Insertar ítems de orden
  if (datos.items.length > 0) {
    const itemsData = datos.items.map(item => ({
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

  // Calcular totales
  const subtotal = datos.items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
  const descuentoMonto = subtotal * (datos.descuentoPorcentaje / 100);
  const total = subtotal - descuentoMonto;
  const saldoPendiente = total - datos.pagoAdelantado;

  // Actualizar orden
  const { error: ordenError } = await supabase
    .from('ordenes')
    .update({
      cliente_id: datos.clienteId,
      estado: datos.estado,
      subtotal,
      descuento_porcentaje: datos.descuentoPorcentaje,
      descuento_monto: descuentoMonto,
      total,
      pago_adelantado: datos.pagoAdelantado,
      saldo_pendiente: saldoPendiente,
      notas: datos.notas || null,
      fecha_entrega: datos.fechaEntrega ? datos.fechaEntrega.toISOString().split('T')[0] : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (ordenError) {
    console.error('Error al actualizar orden:', ordenError);
    return { exitoso: false, error: ordenError.message };
  }

  // Reemplazar ítems: eliminar los existentes e insertar los nuevos
  await supabase.from('orden_items').delete().eq('orden_id', id);

  if (datos.items.length > 0) {
    const itemsData = datos.items.map(item => ({
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
    numerOrden: data.numero_orden,
    estado: data.estado,
    items,
    subtotal: parseFloat(data.subtotal),
    descuentoPorcentaje: parseFloat(data.descuento_porcentaje),
    descuentoMonto: parseFloat(data.descuento_monto),
    total: parseFloat(data.total),
    pagoAdelantado: parseFloat(data.pago_adelantado),
    saldoPendiente: parseFloat(data.saldo_pendiente),
    notas: data.notas || undefined,
    fechaEntrega: data.fecha_entrega ? new Date(data.fecha_entrega) : undefined,
    fechaCreacion: new Date(data.created_at),
    fechaActualizacion: new Date(data.updated_at),
  };
}
