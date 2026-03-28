-- ============================================
-- CORREGIR WARNING: Function Search Path Mutable
-- ============================================
-- Este script corrige la función update_updated_at_column
-- agregando SET search_path para evitar el warning de seguridad
-- ============================================

-- ============================================
-- PASO 1: Actualizar la función update_updated_at_column
-- ============================================

-- Función para actualizar fecha_actualizacion automáticamente (productos y recetas)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- PASO 2: Actualizar la función update_configuracion_updated_at
-- ============================================

-- Función para actualizar updated_at en configuración
CREATE OR REPLACE FUNCTION update_configuracion_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- PASO 3: Actualizar la función set_user_id
-- ============================================

-- Función para establecer user_id automáticamente en nuevos registros
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$;

-- ============================================
-- PASO 4: Actualizar la función activate_subscription_on_payment_approval
-- ============================================

-- Función para activar suscripción cuando se aprueba un pago
CREATE OR REPLACE FUNCTION activate_subscription_on_payment_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que las funciones tienen search_path configurado
SELECT 
    proname AS function_name,
    CASE 
        WHEN proconfig IS NOT NULL AND proconfig::text LIKE '%search_path%' 
        THEN 'Configurado'
        ELSE 'NO configurado'
    END AS search_path_status
FROM pg_proc
WHERE proname IN ('update_updated_at_column', 'update_configuracion_updated_at', 'set_user_id', 'activate_subscription_on_payment_approval');

SELECT 'Funciones actualizadas correctamente con SET search_path' as status;
