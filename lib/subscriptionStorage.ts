import { supabase } from './supabase';
import {
  SubscriptionPlan,
  UserSubscription,
  PaymentRequest,
  PaymentRequestFormData,
  UserSubscriptionInfo,
  PaymentStatus,
} from '@/types/subscription';

// ============================================
// PLANES DE SUSCRIPCIÓN
// ============================================

export const obtenerPlanes = async (): Promise<SubscriptionPlan[]> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price_usd', { ascending: true });

  if (error) {
    console.error('Error al obtener planes:', error);
    return [];
  }

  return data || [];
};

export const obtenerPlanPorId = async (id: string): Promise<SubscriptionPlan | null> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener plan:', error);
    return null;
  }

  return data;
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
      plan:subscription_plans(*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error al obtener suscripción:', error);
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
    console.error('Error al obtener info de suscripción:', error);
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
    console.error('Error al crear solicitud de pago:', error);
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
      plan:subscription_plans(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener solicitudes:', error);
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
      plan:subscription_plans(*)
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
    .neq('plan_id', (await supabase.from('subscription_plans').select('id').eq('name', 'free').single()).data?.id);

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
    .from('subscription_plans')
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
  planId: string
): Promise<{ exitoso: boolean; error?: string }> => {
  try {
    // Reactivar la suscripción del usuario
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('plan_id', planId);

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
    // Nota: Esto requiere privilegios de admin en Supabase
    const { error: errorAuth } = await supabase.auth.admin.deleteUser(userId);

    if (errorAuth) {
      console.error('Error al eliminar usuario de auth:', errorAuth);
      return { exitoso: false, error: `Error al eliminar usuario: ${errorAuth.message}` };
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
