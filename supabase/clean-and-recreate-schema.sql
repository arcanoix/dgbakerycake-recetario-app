-- ============================================
-- LIMPIAR Y RECREAR SISTEMA DE SUSCRIPCIONES
-- ============================================

-- Eliminar triggers
DROP TRIGGER IF EXISTS on_payment_approved ON payment_requests;
DROP TRIGGER IF EXISTS on_user_role_created ON user_roles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminar funciones de suscripción
DROP FUNCTION IF EXISTS activate_subscription_on_payment_approval();
DROP FUNCTION IF EXISTS assign_free_subscription();
DROP FUNCTION IF EXISTS assign_default_role();

-- Eliminar funciones de seguridad (si existen de ejecuciones anteriores)
DROP FUNCTION IF EXISTS get_my_subscription_info();
DROP FUNCTION IF EXISTS get_all_users_subscription_info();

-- Eliminar tablas (en orden inverso por dependencias)
DROP TABLE IF EXISTS payment_requests CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- ============================================
-- RECREAR TODO
-- ============================================

-- Tabla de roles de usuario
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver su propio rol" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Solo admins pueden modificar roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Tabla de planes
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_bs DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  max_productos INTEGER NOT NULL DEFAULT 50,
  max_recetas INTEGER NOT NULL DEFAULT 20,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO subscription_plans (name, display_name, description, price_bs, price_usd, max_productos, max_recetas, features) VALUES
  ('free', 'Plan Gratuito', 'Perfecto para empezar', 0, 0, 50, 20, '{"soporte": "comunidad", "analytics": false}'),
  ('basico', 'Plan Básico', 'Para pequeños negocios', 150, 5, 200, 100, '{"soporte": "email", "analytics": true}'),
  ('profesional', 'Plan Profesional', 'Para negocios en crecimiento', 300, 10, 1000, 500, '{"soporte": "prioritario", "analytics": true, "exportar_datos": true}'),
  ('empresarial', 'Plan Empresarial', 'Sin límites para tu negocio', 600, 20, -1, -1, '{"soporte": "24/7", "analytics": true, "exportar_datos": true, "api_access": true}');

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

-- Tabla de suscripciones
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);

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

-- Tabla de solicitudes de pago
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  payment_details JSONB NOT NULL,
  proof_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_payment_requests_created_at ON payment_requests(created_at DESC);

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

-- Funciones y Triggers
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'cliente');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();

CREATE OR REPLACE FUNCTION assign_free_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free' LIMIT 1;
  
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (user_id, plan_id, status)
    VALUES (NEW.user_id, free_plan_id, 'active');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_role_created
  AFTER INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION assign_free_subscription();

CREATE OR REPLACE FUNCTION activate_subscription_on_payment_approval()
RETURNS TRIGGER AS $$
DECLARE
  subscription_months INTEGER := 1;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
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

CREATE TRIGGER on_payment_approved
  AFTER UPDATE ON payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION activate_subscription_on_payment_approval();

-- Funciones seguras para acceder a información de usuarios

-- Función para obtener información del usuario autenticado
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

-- Función para admins
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

GRANT EXECUTE ON FUNCTION get_my_subscription_info() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users_subscription_info() TO authenticated;
