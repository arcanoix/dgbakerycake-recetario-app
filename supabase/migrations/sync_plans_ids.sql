-- ============================================
-- SINCRONIZAR PLANES DESDE subscription_plans A plans
-- ============================================

-- 1. Primero, verificar si subscription_plans tiene datos
SELECT 'subscription_plans' as table_name, COUNT(*) as count FROM subscription_plans
UNION ALL
SELECT 'plans' as table_name, COUNT(*) as count FROM plans;

-- 2. Ver los IDs de subscription_plans
SELECT id, name, display_name FROM subscription_plans ORDER BY sort_order;

-- 3. Ver los IDs actuales de plans (si hay)
SELECT id, name, display_name FROM plans ORDER BY sort_order;

-- 4. Si plans está vacía, insertar los planes desde subscription_plans con los mismos IDs
INSERT INTO plans (id, name, display_name, description, price_usd, price_bs, price_period, max_productos, max_recetas, features, is_active, sort_order)
SELECT sp.id, sp.name, sp.display_name, sp.description, sp.price_usd, sp.price_bs, 
       COALESCE(sp.price_period, 'monthly'), 
       COALESCE(sp.max_productos, -1), 
       COALESCE(sp.max_recetas, -1), 
       sp.features, 
       COALESCE(sp.is_active, true), 
       COALESCE(sp.sort_order, 1)
FROM subscription_plans sp
ON CONFLICT (name) DO UPDATE 
SET display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_usd = EXCLUDED.price_usd,
    price_bs = EXCLUDED.price_bs,
    price_period = EXCLUDED.price_period,
    max_productos = EXCLUDED.max_productos,
    max_recetas = EXCLUDED.max_recetas,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;

-- 5. Verificar que los planes ahora existen
SELECT id, name, display_name FROM plans ORDER BY sort_order;

-- 6. Ahora sí, actualizar las foreign keys

-- Actualizar payment_requests
ALTER TABLE payment_requests 
DROP CONSTRAINT IF EXISTS payment_requests_plan_id_fkey;

ALTER TABLE payment_requests 
ADD CONSTRAINT payment_requests_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE;

-- Actualizar user_subscriptions  
ALTER TABLE user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT;

-- 7. Actualizar funciones RPC

-- get_my_subscription_info
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

-- get_all_users_subscription_info
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

-- 8. Verificar que todo está correcto
SELECT 
  us.user_id,
  us.plan_id,
  p.name as plan_name,
  p.display_name as plan_display_name
FROM user_subscriptions us
JOIN plans p ON us.plan_id = p.id
LIMIT 10;
