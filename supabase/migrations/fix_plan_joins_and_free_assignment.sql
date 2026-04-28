-- Actualiza get_all_users_subscription_info para usar la tabla `plans` correcta
CREATE OR REPLACE FUNCTION public.get_all_users_subscription_info()
 RETURNS TABLE(user_id uuid, email character varying, role character varying, plan_name character varying, plan_display_name character varying, max_productos integer, max_recetas integer, subscription_status character varying, start_date timestamp without time zone, end_date timestamp without time zone, is_active boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar si el usuario es admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acceso denegado: Solo admins pueden ver esta informaci贸n';
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
  LEFT JOIN plans sp ON us.plan_id = sp.id;
END;
$function$;

-- Actualiza assign_free_subscription para usar la tabla `plans` correcta
CREATE OR REPLACE FUNCTION public.assign_free_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Log de inicio
  INSERT INTO public.trigger_logs (trigger_name, user_id, error_message)
  VALUES ('assign_free_subscription_start', NEW.user_id, 'Iniciando asignaci贸n de plan gratuito');
  
  -- Buscar plan gratuito en la tabla correcta (plans)
  SELECT id INTO free_plan_id FROM public.plans WHERE name = 'free' LIMIT 1;
  
  IF free_plan_id IS NULL THEN
    INSERT INTO public.trigger_logs (trigger_name, user_id, error_message)
    VALUES ('assign_free_subscription_error', NEW.user_id, 'Plan gratuito no encontrado');
    RETURN NEW;
  END IF;
  
  -- Insertar suscripci贸n
  INSERT INTO public.user_subscriptions (user_id, plan_id, status)
  VALUES (NEW.user_id, free_plan_id, 'active');
  
  -- Log de 茅xito
  INSERT INTO public.trigger_logs (trigger_name, user_id, error_message)
  VALUES ('assign_free_subscription_success', NEW.user_id, 'Suscripci贸n creada exitosamente');
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.trigger_logs (trigger_name, user_id, error_message)
  VALUES ('assign_free_subscription_error', NEW.user_id, SQLERRM);
  -- No lanzar error para no bloquear el registro
  RETURN NEW;
END;
$function$;

-- A馻dir politicas para que los admins puedan leer los datos (conteos, etc) de todos los usuarios
CREATE POLICY "Admins pueden ver todos los productos" ON public.productos FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins pueden ver todas las recetas" ON public.recetas FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins pueden ver todos los clientes" ON public.clientes FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins pueden ver todas las ordenes" ON public.ordenes FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
