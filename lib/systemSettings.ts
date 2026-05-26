import { supabase } from './supabase';
import { SystemSettings } from '@/types/subscription';

const DEFAULT_SETTINGS: SystemSettings = {
  max_users: -1,        // Ilimitado por defecto
  maintenance_mode: false,
  maintenance_message: 'El sistema está en mantenimiento. Volveremos pronto.',
};

/**
 * Obtiene la configuración global del sistema.
 * Si la tabla no existe o hay error, retorna valores por defecto.
 */
export const obtenerConfiguracionSistema = async (): Promise<SystemSettings> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Si la tabla no existe, retornar defaults sin romper
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('Tabla system_settings no existe, usando defaults');
        return DEFAULT_SETTINGS;
      }
      console.error('Error al obtener configuración del sistema:', error);
      return DEFAULT_SETTINGS;
    }

    if (!data) return DEFAULT_SETTINGS;

    return {
      id: data.id,
      max_users: data.max_users ?? DEFAULT_SETTINGS.max_users,
      maintenance_mode: data.maintenance_mode ?? DEFAULT_SETTINGS.maintenance_mode,
      maintenance_message: data.maintenance_message || DEFAULT_SETTINGS.maintenance_message,
      updated_at: data.updated_at,
      updated_by: data.updated_by,
    };
  } catch (err) {
    console.error('Error inesperado al obtener configuración del sistema:', err);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Actualiza la configuración global del sistema (solo admin).
 */
export const actualizarConfiguracionSistema = async (
  settings: Partial<SystemSettings>
): Promise<{ exitoso: boolean; error?: string; settings?: SystemSettings }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { exitoso: false, error: 'No autenticado' };
    }

    // Verificar que es admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      return { exitoso: false, error: 'Acceso denegado: se requiere rol de administrador' };
    }

    // Preparar datos
    const updateData: any = {
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    if (settings.max_users !== undefined) updateData.max_users = settings.max_users;
    if (settings.maintenance_mode !== undefined) updateData.maintenance_mode = settings.maintenance_mode;
    if (settings.maintenance_message !== undefined) updateData.maintenance_message = settings.maintenance_message;

    // Buscar si existe un registro
    const { data: existing } = await supabase
      .from('system_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabase
        .from('system_settings')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('system_settings')
        .insert({ ...DEFAULT_SETTINGS, ...updateData })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error al guardar configuración del sistema:', result.error);
      return { exitoso: false, error: result.error.message };
    }

    return {
      exitoso: true,
      settings: {
        id: result.data.id,
        max_users: result.data.max_users,
        maintenance_mode: result.data.maintenance_mode,
        maintenance_message: result.data.maintenance_message,
        updated_at: result.data.updated_at,
        updated_by: result.data.updated_by,
      },
    };
  } catch (err) {
    console.error('Error inesperado al actualizar configuración del sistema:', err);
    return { exitoso: false, error: 'Error inesperado al guardar configuración' };
  }
};

/**
 * Verifica si se puede registrar un nuevo usuario respetando el límite global.
 */
export const verificarLimiteRegistro = async (): Promise<{
  permitido: boolean;
  totalUsuarios: number;
  maxUsers: number;
  mensaje?: string;
}> => {
  try {
    const settings = await obtenerConfiguracionSistema();

    // -1 o 0 en max_users significa ilimitado
    if (settings.max_users <= 0) {
      return { permitido: true, totalUsuarios: 0, maxUsers: settings.max_users };
    }

    // Contar usuarios actuales (solo clientes, no admins)
    const { count, error } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'cliente');

    if (error) {
      console.error('Error al contar usuarios:', error);
      // En caso de error, permitir registro para no bloquear
      return { permitido: true, totalUsuarios: 0, maxUsers: settings.max_users };
    }

    const totalUsuarios = count || 0;
    const permitido = totalUsuarios < settings.max_users;

    return {
      permitido,
      totalUsuarios,
      maxUsers: settings.max_users,
      mensaje: permitido
        ? undefined
        : `Se ha alcanzado el límite máximo de ${settings.max_users} usuarios. Contacta al administrador.`,
    };
  } catch (err) {
    console.error('Error al verificar límite de registro:', err);
    // En caso de error, permitir para no bloquear inesperadamente
    return { permitido: true, totalUsuarios: 0, maxUsers: -1 };
  }
};

/**
 * Verifica si el sistema está en modo mantenimiento.
 * Los admins siempre pueden acceder.
 */
export const verificarModoMantenimiento = async (
  userRole?: string
): Promise<{
  enMantenimiento: boolean;
  mensaje?: string;
  adminPuedeAcceder: boolean;
}> => {
  try {
    const settings = await obtenerConfiguracionSistema();

    if (!settings.maintenance_mode) {
      return { enMantenimiento: false, adminPuedeAcceder: true };
    }

    // Los administradores pueden acceder incluso en mantenimiento
    const adminPuedeAcceder = userRole === 'admin';

    return {
      enMantenimiento: true,
      mensaje: settings.maintenance_message || DEFAULT_SETTINGS.maintenance_message,
      adminPuedeAcceder,
    };
  } catch (err) {
    console.error('Error al verificar modo mantenimiento:', err);
    return { enMantenimiento: false, adminPuedeAcceder: true };
  }
};
