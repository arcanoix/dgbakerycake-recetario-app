-- ============================================
-- CORREGIR POLÍTICAS RLS RECURSIVAS
-- ============================================

-- El problema es que las políticas de admin verifican el rol consultando user_roles,
-- pero eso crea recursión infinita. Necesitamos usar una función SECURITY DEFINER.

-- 1. Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Solo admins pueden modificar roles" ON user_roles;
DROP POLICY IF EXISTS "Solo admins pueden modificar planes" ON subscription_plans;
DROP POLICY IF EXISTS "Admins pueden ver todas las suscripciones" ON user_subscriptions;
DROP POLICY IF EXISTS "Solo admins pueden modificar suscripciones" ON user_subscriptions;
DROP POLICY IF EXISTS "Admins pueden ver todas las solicitudes" ON payment_requests;
DROP POLICY IF EXISTS "Admins pueden actualizar solicitudes" ON payment_requests;

-- 2. Crear función para verificar si el usuario es admin (sin recursión)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role VARCHAR(50);
BEGIN
  SELECT role INTO user_role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
  RETURN user_role = 'admin';
END;
$$;

-- 3. Recrear políticas usando la función
-- user_roles
CREATE POLICY "Solo admins pueden modificar roles" ON user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- subscription_plans
CREATE POLICY "Solo admins pueden modificar planes" ON subscription_plans
  FOR ALL USING (public.is_admin(auth.uid()));

-- user_subscriptions
CREATE POLICY "Admins pueden ver todas las suscripciones" ON user_subscriptions
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Solo admins pueden modificar suscripciones" ON user_subscriptions
  FOR ALL USING (public.is_admin(auth.uid()));

-- payment_requests
CREATE POLICY "Admins pueden ver todas las solicitudes" ON payment_requests
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins pueden actualizar solicitudes" ON payment_requests
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- 4. Verificar políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('user_roles', 'subscription_plans', 'user_subscriptions', 'payment_requests')
ORDER BY tablename, policyname;

SELECT 'Políticas RLS corregidas. Recarga la página.' AS mensaje;
