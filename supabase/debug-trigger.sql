-- ============================================
-- SCRIPT DE DEBUG PARA IDENTIFICAR EL PROBLEMA
-- ============================================

-- Primero, vamos a crear una versión simplificada del trigger
-- que registre errores en una tabla de logs

-- Crear tabla de logs
CREATE TABLE IF NOT EXISTS trigger_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trigger_name VARCHAR(100),
  user_id UUID,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Función simplificada con manejo de errores
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'cliente');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO trigger_logs (trigger_name, user_id, error_message)
    VALUES ('assign_default_role', NEW.id, SQLERRM);
    RAISE;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función de suscripción gratuita con manejo de errores
CREATE OR REPLACE FUNCTION assign_free_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  BEGIN
    SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free' LIMIT 1;
    
    IF free_plan_id IS NULL THEN
      INSERT INTO trigger_logs (trigger_name, user_id, error_message)
      VALUES ('assign_free_subscription', NEW.user_id, 'Plan gratuito no encontrado');
      RETURN NEW;
    END IF;
    
    INSERT INTO user_subscriptions (user_id, plan_id, status)
    VALUES (NEW.user_id, free_plan_id, 'active');
    
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO trigger_logs (trigger_name, user_id, error_message)
    VALUES ('assign_free_subscription', NEW.user_id, SQLERRM);
    -- No lanzar error, solo registrar
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que los planes existen
SELECT COUNT(*) as total_planes FROM subscription_plans;
SELECT * FROM subscription_plans WHERE name = 'free';

-- Verificar triggers existentes
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname IN ('on_auth_user_created', 'on_user_role_created');
