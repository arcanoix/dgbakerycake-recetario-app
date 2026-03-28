-- ============================================
-- MIGRACIÓN DE SEGURIDAD: Reemplazar vista expuesta con funciones seguras
-- ============================================
-- Este script elimina la vista insegura user_subscription_info y crea
-- funciones PostgreSQL seguras usando SECURITY DEFINER
-- ============================================

-- ============================================
-- NOTA: La función is_admin ya existe y es utilizada por las políticas RLS
-- No es necesario recrearla. Las nuevas funciones la usarán directamente.
-- ============================================

-- ============================================
-- PASO 1: Crear función para usuarios - Solo devuelve su propia información
-- ============================================

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

-- ============================================
-- PASO 2: Crear función para admins - Devuelve información de todos los usuarios
-- ============================================

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

-- ============================================
-- PASO 4: Otorgar permisos a las funciones
-- ============================================

-- Revocar permisos públicos y otorgar solo a usuarios autenticados
REVOKE ALL ON FUNCTION get_my_subscription_info() FROM PUBLIC;
REVOKE ALL ON FUNCTION get_all_users_subscription_info() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION get_my_subscription_info() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users_subscription_info() TO authenticated;

-- ============================================
-- PASO 5: Eliminar la vista insegura (si existe)
-- ============================================

DROP VIEW IF EXISTS user_subscription_info;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Migración completada exitosamente' as status,
       'La vista user_subscription_info ha sido eliminada' as action_1,
       'Las funciones get_my_subscription_info() y get_all_users_subscription_info() han sido creadas' as action_2,
       'Los permisos han sido configurados correctamente' as action_3;
