-- ============================================
-- ACTUALIZAR payment_requests PARA USAR LA NUEVA TABLA plans
-- ============================================

-- 1. Primero, verificar si existe la restricción de foreign key
-- Eliminar la restricción foreign key existente hacia subscription_plans
ALTER TABLE payment_requests 
DROP CONSTRAINT IF EXISTS payment_requests_plan_id_fkey;

-- 2. Agregar la nueva foreign key hacia la tabla plans
ALTER TABLE payment_requests 
ADD CONSTRAINT payment_requests_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE;

-- ============================================
-- ACTUALIZAR user_subscriptions PARA USAR LA NUEVA TABLA plans
-- ============================================

-- 3. Actualizar la foreign key de user_subscriptions hacia plans
ALTER TABLE user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT;

-- ============================================
-- ACTUALIZAR FUNCIÓN RPC get_my_subscription_info
-- ============================================

-- 4. Actualizar la función RPC para usar la nueva tabla plans
DROP FUNCTION IF EXISTS get_my_subscription_info();

CREATE OR REPLACE FUNCTION get_my_subscription_info()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role TEXT,
  plan_name TEXT,
  plan_display_name TEXT,
  max_productos INTEGER,
  max_recetas INTEGER,
  subscription_status TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id,
    u.email,
    COALESCE(ur.role::TEXT, 'cliente') AS role,
    p.name AS plan_name,
    p.display_name AS plan_display_name,
    p.max_productos,
    p.max_recetas,
    us.status::TEXT AS subscription_status,
    us.start_date,
    us.end_date,
    CASE 
      WHEN us.status = 'active' AND (us.end_date IS NULL OR us.end_date > NOW()) 
      THEN true 
      ELSE false 
    END AS is_active
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
  LEFT JOIN plans p ON us.plan_id = p.id
  WHERE u.id = auth.uid();
END;
$$;

-- ============================================
-- ACTUALIZAR FUNCIÓN RPC get_all_users_subscription_info
-- ============================================

-- 5. Actualizar la función RPC para usar la nueva tabla plans
DROP FUNCTION IF EXISTS get_all_users_subscription_info();

CREATE OR REPLACE FUNCTION get_all_users_subscription_info()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role TEXT,
  plan_name TEXT,
  plan_display_name TEXT,
  subscription_status TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id,
    u.email,
    COALESCE(ur.role::TEXT, 'cliente') AS role,
    COALESCE(p.name::TEXT, 'free') AS plan_name,
    COALESCE(p.display_name::TEXT, 'Plan Gratuito') AS plan_display_name,
    COALESCE(us.status::TEXT, 'active') AS subscription_status,
    us.start_date,
    us.end_date,
    u.last_sign_in_at,
    u.created_at,
    CASE 
      WHEN us.status = 'active' AND (us.end_date IS NULL OR us.end_date > NOW()) 
      THEN true 
      ELSE false 
    END AS is_active
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
  LEFT JOIN plans p ON us.plan_id = p.id
  ORDER BY u.created_at DESC;
END;
$$;
