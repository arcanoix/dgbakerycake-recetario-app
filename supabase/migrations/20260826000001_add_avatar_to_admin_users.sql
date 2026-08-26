-- Incluye la foto de perfil en el RPC del panel administrativo.
-- La función conserva su control de acceso: solo un admin puede listar estos datos.
DROP FUNCTION IF EXISTS public.get_all_users_subscription_info();

CREATE FUNCTION public.get_all_users_subscription_info()
RETURNS TABLE(
  user_id uuid,
  email character varying,
  role character varying,
  plan_name character varying,
  plan_display_name character varying,
  max_productos integer,
  max_recetas integer,
  subscription_status character varying,
  start_date timestamp without time zone,
  end_date timestamp without time zone,
  is_active boolean,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acceso denegado: Solo admins pueden ver esta información';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::character varying,
    ur.role::character varying,
    plan.name::character varying,
    plan.display_name::character varying,
    plan.max_productos,
    plan.max_recetas,
    subscription.status::character varying,
    subscription.start_date,
    subscription.end_date,
    CASE
      WHEN subscription.end_date IS NULL THEN true
      WHEN subscription.end_date > NOW() THEN true
      ELSE false
    END,
    u.last_sign_in_at,
    u.created_at,
    NULLIF(u.raw_user_meta_data ->> 'avatar_url', '')
  FROM auth.users AS u
  LEFT JOIN public.user_roles AS ur ON u.id = ur.user_id
  LEFT JOIN public.user_subscriptions AS subscription
    ON u.id = subscription.user_id AND subscription.status = 'active'
  LEFT JOIN public.plans AS plan ON subscription.plan_id = plan.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_users_subscription_info() TO authenticated;
