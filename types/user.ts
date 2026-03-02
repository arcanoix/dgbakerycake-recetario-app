export interface UserData {
  id: string;
  email: string;
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
  is_active?: boolean;
}

export interface UserStats {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosConPlanPago: number;
  usuariosNuevosEsteMes: number;
}
