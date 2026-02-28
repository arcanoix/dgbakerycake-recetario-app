-- ============================================
-- CORREGIR CONSTRAINT EN USER_SUBSCRIPTIONS
-- ============================================

-- El problema es que user_subscriptions permite múltiples suscripciones por usuario
-- pero el trigger usa ON CONFLICT (user_id) que requiere un constraint único

-- Primero, eliminar la tabla y recrearla con el constraint correcto
DROP TABLE IF EXISTS user_subscriptions CASCADE;

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL, -- AGREGADO UNIQUE
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

-- Recrear el trigger de suscripción gratuita
CREATE OR REPLACE FUNCTION assign_free_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free' LIMIT 1;
  
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (user_id, plan_id, status)
    VALUES (NEW.user_id, free_plan_id, 'active')
    ON CONFLICT (user_id) DO NOTHING; -- Si ya existe, no hacer nada
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_role_created ON user_roles;
CREATE TRIGGER on_user_role_created
  AFTER INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION assign_free_subscription();

-- Recrear trigger de activación de pago
CREATE OR REPLACE FUNCTION activate_subscription_on_payment_approval()
RETURNS TRIGGER AS $$
DECLARE
  subscription_months INTEGER := 1;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
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
      plan_id = EXCLUDED.plan_id,
      status = 'active',
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_payment_approved ON payment_requests;
CREATE TRIGGER on_payment_approved
  AFTER UPDATE ON payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION activate_subscription_on_payment_approval();
