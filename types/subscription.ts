export type UserRole = 'admin' | 'cliente';

export type SubscriptionPlanName = 'free' | 'basico' | 'profesional' | 'empresarial';

export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'canceled';

export type PaymentMethod = 'pago_movil' | 'transferencia' | 'binance' | 'zelle' | 'paypal';

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export type Currency = 'BS' | 'USD' | 'USDT';

export type PlanFeature = 
  | 'menu_dashboard'
  | 'menu_productos'
  | 'menu_recetas'
  | 'menu_precios'
  | 'menu_facturacion'
  | 'menu_perfil'
  | 'menu_configuracion'
  | 'menu_unidades'
  | 'menu_admin'
  | 'menu_clientes'
  | 'menu_ventas'
  | 'crear_productos'
  | 'crear_recetas'
  | 'crear_ordenes'
  | 'exportar_pdf'
  | 'exportar_cotizacion_pdf'
  | 'ver_analytics'
  | 'exportar_datos'
  | 'api_access'
  | 'soporte_prioritario';

export interface PlanFeatures {
  menu_dashboard: boolean;
  menu_productos: boolean;
  menu_recetas: boolean;
  menu_precios: boolean;
  menu_facturacion: boolean;
  menu_perfil: boolean;
  menu_configuracion: boolean;
  menu_unidades: boolean;
  menu_admin: boolean;
  menu_clientes: boolean;
  menu_ventas: boolean;
  crear_productos: boolean;
  crear_recetas: boolean;
  crear_ordenes: boolean;
  exportar_pdf: boolean;
  exportar_cotizacion_pdf: boolean;
  ver_analytics: boolean;
  exportar_datos: boolean;
  api_access: boolean;
  soporte_prioritario: boolean;
  max_productos: number;
  max_recetas: number;
}

// Plan desde la base de datos
export interface Plan {
  id: string;
  name: SubscriptionPlanName;
  display_name: string;
  description?: string;
  price_usd: number;
  price_bs: number;
  price_period: string;
  max_productos: number;
  max_recetas: number;
  features: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Convertir Plan de BD a PlanFeatures
export const planToFeatures = (plan: Plan): PlanFeatures => {
  const features = plan.features || {};
  const isPaid = plan.name !== 'free';
  return {
    menu_dashboard: features.menu_dashboard ?? true,
    menu_productos: features.menu_productos ?? true,
    menu_recetas: features.menu_recetas ?? true,
    menu_precios: features.menu_precios ?? true,
    menu_facturacion: features.menu_facturacion ?? true,
    menu_perfil: features.menu_perfil ?? true,
    menu_configuracion: features.menu_configuracion ?? true,
    menu_unidades: features.menu_unidades ?? true,
    menu_admin: features.menu_admin ?? plan.name === 'empresarial',
    menu_clientes: features.menu_clientes ?? isPaid,
    menu_ventas: features.menu_ventas ?? isPaid,
    crear_productos: features.crear_productos ?? true,
    crear_recetas: features.crear_recetas ?? true,
    crear_ordenes: features.crear_ordenes ?? isPaid,
    exportar_pdf: features.exportar_pdf ?? false,
    exportar_cotizacion_pdf: features.exportar_cotizacion_pdf ?? isPaid,
    ver_analytics: features.ver_analytics ?? false,
    exportar_datos: features.exportar_datos ?? false,
    api_access: features.api_access ?? false,
    soporte_prioritario: features.soporte_prioritario ?? false,
    max_productos: plan.max_productos,
    max_recetas: plan.max_recetas,
  };
};

export interface SubscriptionPlan {
  id: string;
  name: SubscriptionPlanName;
  display_name: string;
  description: string;
  price_bs: number;
  price_usd: number;
  max_productos: number; // -1 = ilimitado
  max_recetas: number;   // -1 = ilimitado
  features: {
    soporte?: string;
    analytics?: boolean;
    exportar_datos?: boolean;
    api_access?: boolean;
    [key: string]: any;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan; // Relación con el plan
}

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Detalles específicos por método de pago
export interface PagoMovilDetails {
  banco: string;
  telefono: string;
  referencia: string;
  fecha: string;
  titular?: string;
}

export interface TransferenciaDetails {
  banco_origen: string;
  banco_destino: string;
  referencia: string;
  fecha: string;
  titular?: string;
}

export interface BinanceDetails {
  wallet: string;
  txid: string;
  red: string; // 'BSC', 'ETH', 'TRC20', etc.
  moneda?: string; // 'USDT', 'BUSD', etc.
}

export interface ZelleDetails {
  email: string;
  referencia: string;
  fecha: string;
  nombre?: string;
}

export interface PayPalDetails {
  email: string;
  transaction_id: string;
  fecha: string;
}

export type PaymentDetails = 
  | PagoMovilDetails 
  | TransferenciaDetails 
  | BinanceDetails 
  | ZelleDetails 
  | PayPalDetails;

export interface PaymentRequest {
  id: string;
  user_id: string;
  plan_id: string;
  payment_method: PaymentMethod;
  amount: number;
  currency: Currency;
  payment_details: PaymentDetails;
  proof_url?: string;
  status: PaymentStatus;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  plan?: SubscriptionPlan;
  user_email?: string;
}

export interface PaymentRequestFormData {
  plan_id: string;
  payment_method: PaymentMethod;
  amount: number;
  currency: Currency;
  payment_details: PaymentDetails;
  proof_url?: string;
}

export interface UserSubscriptionInfo {
  user_id: string;
  email: string;
  role: UserRole;
  plan_name: SubscriptionPlanName;
  plan_display_name: string;
  max_productos: number;
  max_recetas: number;
  subscription_status: SubscriptionStatus;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

// ============================================
// CONFIGURACIÓN GLOBAL DEL SISTEMA
// ============================================

export interface SystemSettings {
  id?: string;
  max_users: number;           // -1 = ilimitado, 0 = sin registros permitidos
  maintenance_mode: boolean;     // true = sistema en mantenimiento
  maintenance_message?: string;  // Mensaje personalizado de mantenimiento
  updated_at?: string;
  updated_by?: string;
}

// Constantes de límites
export const PLAN_LIMITS: Record<SubscriptionPlanName, { maxProductos: number; maxRecetas: number }> = {
  free: {
    maxProductos: 50,
    maxRecetas: 20,
  },
  basico: {
    maxProductos: 200,
    maxRecetas: 100,
  },
  profesional: {
    maxProductos: 1000,
    maxRecetas: 500,
  },
  empresarial: {
    maxProductos: -1, // Ilimitado
    maxRecetas: -1,   // Ilimitado
  },
};

// Legacy PLAN_FEATURES - still used as fallback when DB is not available
export const PLAN_FEATURES: Record<SubscriptionPlanName, PlanFeatures> = {
  free: {
    menu_dashboard: true,
    menu_productos: true,
    menu_recetas: true,
    menu_precios: true,
    menu_facturacion: true,
    menu_perfil: true,
    menu_configuracion: true,
    menu_unidades: true,
    menu_admin: false,
    menu_clientes: false,
    menu_ventas: false,
    crear_productos: true,
    crear_recetas: true,
    crear_ordenes: false,
    exportar_pdf: false,
    exportar_cotizacion_pdf: false,
    ver_analytics: false,
    exportar_datos: false,
    api_access: false,
    soporte_prioritario: false,
    max_productos: 50,
    max_recetas: 20,
  },
  basico: {
    menu_dashboard: true,
    menu_productos: true,
    menu_recetas: true,
    menu_precios: true,
    menu_facturacion: true,
    menu_perfil: true,
    menu_configuracion: true,
    menu_unidades: true,
    menu_admin: false,
    menu_clientes: true,
    menu_ventas: true,
    crear_productos: true,
    crear_recetas: true,
    crear_ordenes: true,
    exportar_pdf: true,
    exportar_cotizacion_pdf: true,
    ver_analytics: true,
    exportar_datos: false,
    api_access: false,
    soporte_prioritario: false,
    max_productos: 200,
    max_recetas: 100,
  },
  profesional: {
    menu_dashboard: true,
    menu_productos: true,
    menu_recetas: true,
    menu_precios: true,
    menu_facturacion: true,
    menu_perfil: true,
    menu_configuracion: true,
    menu_unidades: true,
    menu_admin: false,
    menu_clientes: true,
    menu_ventas: true,
    crear_productos: true,
    crear_recetas: true,
    crear_ordenes: true,
    exportar_pdf: true,
    exportar_cotizacion_pdf: true,
    ver_analytics: true,
    exportar_datos: true,
    api_access: false,
    soporte_prioritario: true,
    max_productos: 1000,
    max_recetas: 500,
  },
  empresarial: {
    menu_dashboard: true,
    menu_productos: true,
    menu_recetas: true,
    menu_precios: true,
    menu_facturacion: true,
    menu_perfil: true,
    menu_configuracion: true,
    menu_unidades: true,
    menu_admin: true,
    menu_clientes: true,
    menu_ventas: true,
    crear_productos: true,
    crear_recetas: true,
    crear_ordenes: true,
    exportar_pdf: true,
    exportar_cotizacion_pdf: true,
    ver_analytics: true,
    exportar_datos: true,
    api_access: true,
    soporte_prioritario: true,
    max_productos: -1,
    max_recetas: -1,
  },
};
