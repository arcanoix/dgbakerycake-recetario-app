-- ============================================
-- VERIFICAR Y CORREGIR TRIGGERS
-- ============================================

-- 1. Verificar que los triggers existen en auth.users
SELECT 
    t.tgname AS trigger_name,
    c.relname AS table_name,
    n.nspname AS schema_name,
    t.tgenabled AS enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'users' AND n.nspname = 'auth';

-- 2. Verificar que las funciones existen
SELECT 
    p.proname AS function_name,
    n.nspname AS schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('assign_default_role', 'assign_free_subscription', 'activate_subscription_on_payment_approval');

-- 3. Eliminar triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_role_created ON user_roles;
DROP TRIGGER IF EXISTS on_payment_approved ON payment_requests;

-- 4. Recrear función de asignación de rol con logs mejorados
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insertar log de inicio
  INSERT INTO public.trigger_logs (trigger_name, user_id, error_message)
  VALUES ('assign_default_role_start', NEW.id, 'Iniciando creación de rol');
  
  -- Insertar rol
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente');
  
  -- Log de éxito
  INSERT INTO public.trigger_logs (trigger_name, user_id, error_message)
  VALUES ('assign_default_role_success', NEW.id, 'Rol creado exitosamente');
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log de error
  INSERT INTO public.trigger_logs (trigger_name, user_id, error_message)
  VALUES ('assign_default_role_error', NEW.id, SQLERRM);
  RAISE;
END;
$$;

-- 5. Recrear función de suscripción gratuita
CREATE OR REPLACE FUNCTION public.assign_free_subscription()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Log de inicio
  INSERT INTO public.trigger_logs (trigger_name, user_id, error_message)
  VALUES ('assign_free_subscription_start', NEW.user_id, 'Iniciando asignación de plan gratuito');
  
  -- Buscar plan gratuito
  SELECT id INTO free_plan_id FROM public.subscription_plans WHERE name = 'free' LIMIT 1;
  
  IF free_plan_id IS NULL THEN
    INSERT INTO public.trigger_logs (trigger_name, user_id, error_message)
    VALUES ('assign_free_subscription_error', NEW.user_id, 'Plan gratuito no encontrado');
    RETURN NEW;
  END IF;
  
  -- Insertar suscripción
  INSERT INTO public.user_subscriptions (user_id, plan_id, status)
  VALUES (NEW.user_id, free_plan_id, 'active');
  
  -- Log de éxito
  INSERT INTO public.trigger_logs (trigger_name, user_id, error_message)
  VALUES ('assign_free_subscription_success', NEW.user_id, 'Suscripción creada exitosamente');
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.trigger_logs (trigger_name, user_id, error_message)
  VALUES ('assign_free_subscription_error', NEW.user_id, SQLERRM);
  -- No lanzar error para no bloquear el registro
  RETURN NEW;
END;
$$;

-- 6. Recrear triggers con permisos correctos
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();

CREATE TRIGGER on_user_role_created
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_free_subscription();

-- 7. Verificar que se crearon correctamente
SELECT 
    t.tgname AS trigger_name,
    c.relname AS table_name,
    n.nspname AS schema_name,
    p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname IN ('on_auth_user_created', 'on_user_role_created');

-- 8. Limpiar logs anteriores
TRUNCATE TABLE public.trigger_logs;

SELECT 'Triggers recreados. Intenta registrar un usuario ahora.' AS mensaje;
