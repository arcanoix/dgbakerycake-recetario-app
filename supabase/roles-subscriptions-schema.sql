-- ============================================
-- SISTEMA DE ROLES Y SUSCRIPCIONES
-- ============================================

-- Tabla de roles de usuario
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'cliente', -- 'admin' o 'cliente'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- RLS para user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver su propio rol
CREATE POLICY "Usuarios pueden ver su propio rol" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Solo admins pueden modificar roles
CREATE POLICY "Solo admins pueden modificar roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PLANES DE SUSCRIPCIÓN
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL, -- 'free', 'basico', 'profesional', 'empresarial'
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_bs DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Precio en Bolívares
  price_usd DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Precio en USD
  max_productos INTEGER NOT NULL DEFAULT 50,
  max_recetas INTEGER NOT NULL DEFAULT 20,
  features JSONB, -- Características adicionales en JSON
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar planes por defecto
INSERT INTO subscription_plans (name, display_name, description, price_bs, price_usd, max_productos, max_recetas, features) VALUES
  ('free', 'Plan Gratuito', 'Perfecto para empezar', 0, 0, 50, 20, '{"soporte": "comunidad", "analytics": false}'),
  ('basico', 'Plan Básico', 'Para pequeños negocios', 150, 5, 200, 100, '{"soporte": "email", "analytics": true}'),
  ('profesional', 'Plan Profesional', 'Para negocios en crecimiento', 300, 10, 1000, 500, '{"soporte": "prioritario", "analytics": true, "exportar_datos": true}'),
  ('empresarial', 'Plan Empresarial', 'Sin límites para tu negocio', 600, 20, -1, -1, '{"soporte": "24/7", "analytics": true, "exportar_datos": true, "api_access": true}')
ON CONFLICT (name) DO NOTHING;

-- RLS para planes (todos pueden leer)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver planes" ON subscription_plans
  FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden modificar planes" ON subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SUSCRIPCIONES DE USUARIOS
-- ============================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'pending', 'expired', 'canceled'
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- RLS para suscripciones
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver su propia suscripción" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins pueden ver todas las suscripciones" ON user_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden modificar suscripciones" ON user_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SOLICITUDES DE PAGO
-- ============================================

CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  
  -- Información del pago
  payment_method VARCHAR(50) NOT NULL, -- 'pago_movil', 'transferencia', 'binance', 'zelle', 'paypal'
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL, -- 'BS', 'USD', 'USDT'
  
  -- Detalles del pago
  payment_details JSONB NOT NULL, -- Datos específicos según método de pago
  -- Ejemplo Pago Móvil: {"banco": "Banesco", "telefono": "0414-1234567", "referencia": "123456", "fecha": "2024-01-15"}
  -- Ejemplo Binance: {"wallet": "0x123...", "txid": "abc123", "red": "BSC"}
  
  -- Comprobante
  proof_url TEXT, -- URL del comprobante de pago subido
  
  -- Estado
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT, -- Notas del administrador
  reviewed_by UUID REFERENCES auth.users(id), -- Admin que revisó
  reviewed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON payment_requests(created_at DESC);

-- RLS para solicitudes de pago
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias solicitudes" ON payment_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear solicitudes de pago" ON payment_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins pueden ver todas las solicitudes" ON payment_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins pueden actualizar solicitudes" ON payment_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para asignar rol 'cliente' por defecto a nuevos usuarios
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'cliente');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para asignar rol automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();

-- Función para crear suscripción gratuita por defecto
CREATE OR REPLACE FUNCTION assign_free_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Obtener el ID del plan gratuito
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free' LIMIT 1;
  
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (user_id, plan_id, status)
    VALUES (NEW.user_id, free_plan_id, 'active');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para asignar suscripción gratuita cuando se crea el rol
DROP TRIGGER IF EXISTS on_user_role_created ON user_roles;
CREATE TRIGGER on_user_role_created
  AFTER INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION assign_free_subscription();

-- Función para activar suscripción cuando se aprueba un pago
CREATE OR REPLACE FUNCTION activate_subscription_on_payment_approval()
RETURNS TRIGGER AS $$
DECLARE
  subscription_months INTEGER := 1; -- Duración en meses
BEGIN
  -- Solo ejecutar si el estado cambió a 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Actualizar o crear suscripción
    INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date)
    VALUES (
      NEW.user_id,
      NEW.plan_id,
      'active',
      NOW(),
      NOW() + INTERVAL '1 month' * subscription_months
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      plan_id = NEW.plan_id,
      status = 'active',
      start_date = NOW(),
      end_date = NOW() + INTERVAL '1 month' * subscription_months,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para activar suscripción
DROP TRIGGER IF EXISTS on_payment_approved ON payment_requests;
CREATE TRIGGER on_payment_approved
  AFTER UPDATE ON payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION activate_subscription_on_payment_approval();

-- ============================================
-- FUNCIONES SEGURAS PARA INFORMACIÓN DE USUARIO
-- ============================================

-- Función para obtener información del usuario autenticado (solo su propia info)
CREATE OR REPLACE FUNCTION get_my_subscription_info()
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  role VARCHAR,
  plan_name VARCHAR,
  plan_display_name VARCHAR,
  max_productos INTEGER,
  max_recetas INTEGER,
  subscription_status VARCHAR,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email::VARCHAR,
    ur.role::VARCHAR,
    sp.name::VARCHAR,
    sp.display_name::VARCHAR,
    sp.max_productos,
    sp.max_recetas,
    us.status::VARCHAR,
    us.start_date,
    us.end_date,
    CASE 
      WHEN us.end_date IS NULL THEN true
      WHEN us.end_date > NOW() THEN true
      ELSE false
    END as is_active
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
  LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE u.id = auth.uid();
END;
$$;

-- Función para admins - Devuelve información de todos los usuarios
CREATE OR REPLACE FUNCTION get_all_users_subscription_info()
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  role VARCHAR,
  plan_name VARCHAR,
  plan_display_name VARCHAR,
  max_productos INTEGER,
  max_recetas INTEGER,
  subscription_status VARCHAR,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar si el usuario es admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acceso denegado: Solo admins pueden ver esta información';
  END IF;
  
  RETURN QUERY
  SELECT 
    u.id,
    u.email::VARCHAR,
    ur.role::VARCHAR,
    sp.name::VARCHAR,
    sp.display_name::VARCHAR,
    sp.max_productos,
    sp.max_recetas,
    us.status::VARCHAR,
    us.start_date,
    us.end_date,
    CASE 
      WHEN us.end_date IS NULL THEN true
      WHEN us.end_date > NOW() THEN true
      ELSE false
    END as is_active
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
  LEFT JOIN subscription_plans sp ON us.plan_id = sp.id;
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION get_my_subscription_info() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users_subscription_info() TO authenticated;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Nota: Para crear el primer admin, ejecuta manualmente:
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('tu-user-id-aqui', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
