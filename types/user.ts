export interface UserData {
  id: string;
  email: string;
  nombre?: string;
  /** URL pública de la foto de perfil almacenada en los metadatos de Supabase Auth. */
  avatar_url?: string;
  created_at?: string;
  last_sign_in_at?: string;
  role?: string;
  plan_name?: string;
  plan_display_name?: string;
  subscription_status?: string;
  start_date?: string;
  end_date?: string;
  productos_count?: number;
  recetas_count?: number;
  max_productos?: number;
  max_recetas?: number;
  is_active?: boolean;
  /** Last known IP address captured from activity logs */
  last_ip?: string;
  /** Country derived from IP geolocation metadata */
  country?: string;
}

export interface UserStats {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosConPlanPago: number;
  usuariosNuevosEsteMes: number;
}

/** A single entry in the audit / activity log. */
export interface ActivityLog {
  id: string;
  user_id: string;
  email?: string;
  action: string;
  module: string;
  description?: string;
  entity_id?: string;
  entity_name?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
