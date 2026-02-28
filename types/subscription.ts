export type UserRole = 'admin' | 'cliente';

export type SubscriptionPlanName = 'free' | 'basico' | 'profesional' | 'empresarial';

export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'canceled';

export type PaymentMethod = 'pago_movil' | 'transferencia' | 'binance' | 'zelle' | 'paypal';

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export type Currency = 'BS' | 'USD' | 'USDT';

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
