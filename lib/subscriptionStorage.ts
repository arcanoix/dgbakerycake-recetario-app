import { supabase } from './supabase';
import {
  SubscriptionPlan,
  UserSubscription,
  PaymentRequest,
  PaymentRequestFormData,
  UserSubscriptionInfo,
  PaymentStatus,
  Plan,
} from '@/types/subscription';
import { ActivityLog } from '@/types/user';

const registrarErrorSistemaInterno = async (description: string, entityId?: string, entityName?: string) => {
  try {
    await registrarActividad('error', 'system', description, entityId, entityName);
  } catch {
    // Never break the caller if logging fails.
  }
};

// ============================================
// PLANES DE SUSCRIPCIÓN (desde tabla plans)
// ============================================

export const obtenerPlanes = async (): Promise<Plan[]> => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    registrarErrorSistemaInterno(`Error al obtener planes: ${String(error)}`).catch(() => {});
    return [];
  }

  return data || [];
};

export const obtenerPlanPorId = async (id: string): Promise<Plan | null> => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener plan:', error);
    return null;
  }

  return data;
};

export const obtenerPlanPorNombre = async (name: string): Promise<Plan | null> => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('name', name)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error al obtener plan por nombre:', error);
    return null;
  }

  return data;
};

// Admin: Obtener todos los planes (incluidos inactivos)
export const obtenerTodosLosPlanes = async (): Promise<Plan[]> => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error al obtener todos los planes:', error);
    return [];
  }

  return data || [];
};

// Admin: Actualizar plan
export const actualizarPlan = async (id: string, updates: Partial<Plan>): Promise<{ exitoso: boolean; error?: string }> => {
  const { error } = await supabase
    .from('plans')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar plan:', error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true };
};

// Admin: Crear plan
export const crearPlan = async (plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<{ exitoso: boolean; error?: string; plan?: Plan }> => {
  const { data, error } = await supabase
    .from('plans')
    .insert(plan)
    .select()
    .single();

  if (error) {
    console.error('Error al crear plan:', error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true, plan: data };
};

// Admin: Eliminar plan
export const eliminarPlan = async (id: string): Promise<{ exitoso: boolean; error?: string }> => {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar plan:', error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true };
};

// ============================================
// SUSCRIPCIONES DE USUARIO
// ============================================

export const obtenerSuscripcionActual = async (): Promise<UserSubscription | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:plans(*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (error) {
    registrarErrorSistemaInterno(`Error al obtener suscripción: ${String(error)}`).catch(() => {});
    return null;
  }

  return data;
};

export const obtenerInfoSuscripcion = async (): Promise<UserSubscriptionInfo | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .rpc('get_my_subscription_info')
    .single();

  if (error) {
    registrarErrorSistemaInterno(`Error al obtener info de suscripción: ${String(error)}`).catch(() => {});
    return null;
  }

  return data as UserSubscriptionInfo | null;
};

// ============================================
// SOLICITUDES DE PAGO
// ============================================

export const crearSolicitudPago = async (
  solicitud: PaymentRequestFormData
): Promise<{ exitoso: boolean; error?: string; id?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { exitoso: false, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from('payment_requests')
    .insert([{
      user_id: user.id,
      ...solicitud,
    }])
    .select()
    .single();

  if (error) {
    registrarErrorSistemaInterno(`Error al crear solicitud de pago: ${String(error)}`).catch(() => {});
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true, id: data.id };
};

export const obtenerMisSolicitudes = async (): Promise<PaymentRequest[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('payment_requests')
    .select(`
      *,
      plan:plans(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    registrarErrorSistemaInterno(`Error al obtener solicitudes: ${String(error)}`).catch(() => {});
    return [];
  }

  return data || [];
};

// ============================================
// FUNCIONES DE ADMIN
// ============================================

export const obtenerTodasLasSolicitudes = async (): Promise<PaymentRequest[]> => {
  const { data, error } = await supabase
    .from('payment_requests')
    .select(`
      *,
      plan:plans(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener todas las solicitudes:', error);
    return [];
  }

  return data || [];
};

export const actualizarEstadoPago = async (
  paymentId: string,
  status: PaymentStatus,
  adminNotes?: string
): Promise<{ exitoso: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { exitoso: false, error: 'Usuario no autenticado' };
  }

  const updateData: any = {
    status,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (adminNotes) {
    updateData.admin_notes = adminNotes;
  }

  const { error } = await supabase
    .from('payment_requests')
    .update(updateData)
    .eq('id', paymentId);

  if (error) {
    console.error('Error al actualizar estado de pago:', error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true };
};

export const obtenerEstadisticasAdmin = async () => {
  const { count: solicitudesPendientes } = await supabase
    .from('payment_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: solicitudesAprobadas } = await supabase
    .from('payment_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: totalUsuarios } = await supabase
    .from('user_roles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'cliente');

  const { count: suscripcionesActivas } = await supabase
    .from('user_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .neq('plan_id', (await supabase.from('plans').select('id').eq('name', 'free').single()).data?.id);

  return {
    solicitudesPendientes: solicitudesPendientes || 0,
    solicitudesAprobadas: solicitudesAprobadas || 0,
    totalUsuarios: totalUsuarios || 0,
    suscripcionesActivas: suscripcionesActivas || 0,
  };
};

// ============================================
// GESTIÓN DE USUARIOS (ADMIN)
// ============================================

export const obtenerTodosLosUsuarios = async () => {
  // Obtener información de usuarios usando la función segura para admins
  const { data: usuarios, error } = await supabase
    .rpc('get_all_users_subscription_info');

  if (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }

  // Obtener conteos de productos y recetas por usuario
  const usuariosConConteos = await Promise.all(
    (usuarios || []).map(async (usuario: any) => {
      const [{ count: productosCount }, { count: recetasCount }] = await Promise.all([
        supabase
          .from('productos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', usuario.user_id),
        supabase
          .from('recetas')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', usuario.user_id),
      ]);

      return {
        id: usuario.user_id,
        email: usuario.email,
        role: usuario.role,
        plan_name: usuario.plan_name,
        plan_display_name: usuario.plan_display_name,
        subscription_status: usuario.subscription_status,
        start_date: usuario.start_date,
        end_date: usuario.end_date,
        last_sign_in_at: usuario.last_sign_in_at,
        created_at: usuario.created_at,
        productos_count: productosCount || 0,
        recetas_count: recetasCount || 0,
        is_active: usuario.is_active,
      };
    })
  );

  return usuariosConConteos;
};

export const obtenerEstadisticasUsuarios = async () => {
  // Total de usuarios (todos los roles excepto admins para estadísticas de clientes)
  const { count: totalUsuarios } = await supabase
    .from('user_roles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'cliente');

  // Usuarios con suscripción activa
  const { count: usuariosActivos } = await supabase
    .from('user_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Obtener ID del plan gratuito
  const { data: freePlan } = await supabase
    .from('plans')
    .select('id')
    .eq('name', 'free')
    .single();

  // Usuarios con plan de pago (activos y no free)
  let usuariosConPlanPago = 0;
  if (freePlan) {
    const { count } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .neq('plan_id', freePlan.id);
    usuariosConPlanPago = count || 0;
  }

  // Usuarios nuevos este mes
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const { count: usuariosNuevosEsteMes } = await supabase
    .from('user_roles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', inicioMes.toISOString());

  return {
    totalUsuarios: totalUsuarios || 0,
    usuariosActivos: usuariosActivos || 0,
    usuariosConPlanPago: usuariosConPlanPago || 0,
    usuariosNuevosEsteMes: usuariosNuevosEsteMes || 0,
  };
};

// ============================================
// ADMINISTRACIÓN DE USUARIOS
// ============================================

export const cambiarEstadoUsuario = async (
  userId: string,
  nuevoEstado: 'active' | 'canceled'
): Promise<{ exitoso: boolean; error?: string }> => {
  try {
    // Actualizar el estado de la suscripción del usuario
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: nuevoEstado,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error al cambiar estado del usuario:', error);
      return { exitoso: false, error: error.message };
    }

    return { exitoso: true };
  } catch (err) {
    console.error('Error al cambiar estado del usuario:', err);
    return { exitoso: false, error: 'Error inesperado al cambiar estado' };
  }
};

export const cambiarRolUsuario = async (
  userId: string,
  nuevoRol: 'admin' | 'cliente'
): Promise<{ exitoso: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .update({ 
        role: nuevoRol,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error al cambiar rol del usuario:', error);
      return { exitoso: false, error: error.message };
    }

    return { exitoso: true };
  } catch (err) {
    console.error('Error al cambiar rol del usuario:', err);
    return { exitoso: false, error: 'Error inesperado al cambiar rol' };
  }
};

export const suspenderUsuario = async (
  userId: string,
  motivo?: string
): Promise<{ exitoso: boolean; error?: string }> => {
  try {
    // Cancelar todas las suscripciones activas del usuario
    const { error: errorSuscripcion } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (errorSuscripcion) {
      console.error('Error al suspender usuario:', errorSuscripcion);
      return { exitoso: false, error: errorSuscripcion.message };
    }

    // Opcional: Registrar el motivo de la suspensión
    if (motivo) {
      console.log(`Usuario ${userId} suspendido. Motivo: ${motivo}`);
    }

    return { exitoso: true };
  } catch (err) {
    console.error('Error al suspender usuario:', err);
    return { exitoso: false, error: 'Error inesperado al suspender usuario' };
  }
};

export const reactivarUsuario = async (
  userId: string,
  planId?: string
): Promise<{ exitoso: boolean; error?: string }> => {
  try {
    const updateData: any = { 
      status: 'active',
      updated_at: new Date().toISOString()
    };
    
    if (planId) {
      updateData.plan_id = planId;
    }

    // Reactivar la suscripción del usuario
    const { error } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('user_id', userId);

    if (error) {
      console.error('Error al reactivar usuario:', error);
      return { exitoso: false, error: error.message };
    }

    return { exitoso: true };
  } catch (err) {
    console.error('Error al reactivar usuario:', err);
    return { exitoso: false, error: 'Error inesperado al reactivar usuario' };
  }
};

export const eliminarUsuario = async (
  userId: string
): Promise<{ exitoso: boolean; error?: string }> => {
  try {
    // IMPORTANTE: Esta operación eliminará todos los datos del usuario
    // Orden de eliminación para respetar las foreign keys:
    
    // 1. Eliminar recetas del usuario
    const { error: errorRecetas } = await supabase
      .from('recetas')
      .delete()
      .eq('user_id', userId);

    if (errorRecetas) {
      console.error('Error al eliminar recetas:', errorRecetas);
      return { exitoso: false, error: `Error al eliminar recetas: ${errorRecetas.message}` };
    }

    // 2. Eliminar productos del usuario
    const { error: errorProductos } = await supabase
      .from('productos')
      .delete()
      .eq('user_id', userId);

    if (errorProductos) {
      console.error('Error al eliminar productos:', errorProductos);
      return { exitoso: false, error: `Error al eliminar productos: ${errorProductos.message}` };
    }

    // 3. Eliminar configuración del usuario
    const { error: errorConfig } = await supabase
      .from('configuracion')
      .delete()
      .eq('user_id', userId);

    if (errorConfig) {
      console.error('Error al eliminar configuración:', errorConfig);
      return { exitoso: false, error: `Error al eliminar configuración: ${errorConfig.message}` };
    }

    // 4. Eliminar solicitudes de pago del usuario
    const { error: errorSolicitudes } = await supabase
      .from('payment_requests')
      .delete()
      .eq('user_id', userId);

    if (errorSolicitudes) {
      console.error('Error al eliminar solicitudes de pago:', errorSolicitudes);
      return { exitoso: false, error: `Error al eliminar solicitudes: ${errorSolicitudes.message}` };
    }

    // 5. Eliminar suscripciones del usuario
    const { error: errorSuscripciones } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (errorSuscripciones) {
      console.error('Error al eliminar suscripciones:', errorSuscripciones);
      return { exitoso: false, error: `Error al eliminar suscripciones: ${errorSuscripciones.message}` };
    }

    // 6. Eliminar rol del usuario
    const { error: errorRol } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (errorRol) {
      console.error('Error al eliminar rol:', errorRol);
      return { exitoso: false, error: `Error al eliminar rol: ${errorRol.message}` };
    }

    // 7. Finalmente, eliminar el usuario de auth.users
    // Nota: Esto llama a un endpoint protegido que usa SUPABASE_SERVICE_ROLE_KEY
    const resAuth = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!resAuth.ok) {
      const errorData = await resAuth.json().catch(() => ({}));
      console.error('Error al eliminar usuario de auth:', errorData);
      return { exitoso: false, error: `Error al eliminar usuario: ${errorData.error || resAuth.statusText}` };
    }

    return { exitoso: true };
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    return { exitoso: false, error: 'Error inesperado al eliminar usuario' };
  }
};

// ============================================
// VERIFICACIÓN DE LÍMITES
// ============================================

export const verificarLimite = async (
  tipo: 'productos' | 'recetas',
  cantidadActual: number
): Promise<{ permitido: boolean; limite: number; mensaje?: string }> => {
  const info = await obtenerInfoSuscripcion();
  
  if (!info) {
    return { 
      permitido: false, 
      limite: 0, 
      mensaje: 'No se pudo obtener información de suscripción' 
    };
  }

  const limite = tipo === 'productos' ? info.max_productos : info.max_recetas;
  
  // -1 significa ilimitado
  if (limite === -1) {
    return { permitido: true, limite: -1 };
  }

  if (cantidadActual >= limite) {
    return {
      permitido: false,
      limite,
      mensaje: `Has alcanzado el límite de ${limite} ${tipo} de tu plan ${info.plan_display_name}. Actualiza tu plan para continuar.`,
    };
  }

  return { permitido: true, limite };
};

// ============================================
// REGISTRO DE ACTIVIDADES (AUDIT LOG)
// ============================================

/**
 * Log a user activity. Calls the API route so that the server can
 * capture the real IP address from the request headers.
 * Non-blocking – errors are silently swallowed so that they never
 * disrupt the user-facing operation.
 */
export const registrarActividad = async (
  action: string,
  module: string,
  description: string,
  entityId?: string,
  entityName?: string
): Promise<void> => {
  try {
    await fetch('/api/admin/activity-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        module,
        description,
        entity_id: entityId,
        entity_name: entityName,
      }),
    });
  } catch {
    // Do not throw – logging failures must never break user operations
  }
};

/**
 * Register a system error in the audit log for admin inspection.
 */
export const registrarErrorSistema = async (
  description: string,
  entityId?: string,
  entityName?: string
): Promise<void> => {
  try {
    await registrarActividad('error', 'system', description, entityId, entityName);
  } catch {
    // Keep error logging non-blocking.
  }
};

/**
 * Retrieve activity logs for the admin panel.
 */
export const obtenerActividadesAdmin = async (
  limit = 200,
  offset = 0,
  filters?: { userId?: string; module?: string; action?: string }
): Promise<ActivityLog[]> => {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (filters?.userId) params.set('user_id', filters.userId);
  if (filters?.module) params.set('module', filters.module);
  if (filters?.action) params.set('action', filters.action);

  try {
    const res = await fetch(`/api/admin/activity-logs?${params.toString()}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
};
