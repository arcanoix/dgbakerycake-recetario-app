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
    .from('user_subscription_info')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error al obtener info de suscripción:', error);
    return null;
  }

  return data;
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
      plan:subscription_plans(*),
      user:auth.users(email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener todas las solicitudes:', error);
    return [];
  }

  // Mapear para incluir el email del usuario
  return (data || []).map((item: any) => ({
    ...item,
    user_email: item.user?.email,
  }));
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
  const { data: solicitudesPendientes } = await supabase
    .from('payment_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { data: solicitudesAprobadas } = await supabase
    .from('payment_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { data: totalUsuarios } = await supabase
    .from('user_roles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'cliente');

  const { data: suscripcionesActivas } = await supabase
    .from('user_subscriptions')
    .select('id', { count: 'exact', head: true })
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
