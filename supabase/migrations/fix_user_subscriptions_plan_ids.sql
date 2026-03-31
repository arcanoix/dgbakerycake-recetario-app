-- ============================================
-- CORREGIR IDs DE PLANES EN user_subscriptions
-- ============================================

-- 1. Ver los IDs actuales en ambas tablas
SELECT 'subscription_plans' as source, id, name FROM subscription_plans
UNION ALL
SELECT 'plans', id, name FROM plans;

-- 2. Ver las suscripciones actuales
SELECT us.id, us.user_id, us.plan_id, sp.name as old_plan_name
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id;

-- 3. Actualizar los plan_id en user_subscriptions para que apunten a la tabla plans
UPDATE user_subscriptions us
SET plan_id = p.id
FROM plans p
WHERE EXISTS (
  SELECT 1 FROM subscription_plans sp
  WHERE sp.id = us.plan_id
  AND sp.name = p.name
);

-- 4. Verificar la actualización
SELECT us.id, us.user_id, us.plan_id, p.name as new_plan_name
FROM user_subscriptions us
JOIN plans p ON us.plan_id = p.id;

-- 5. Si hay suscripciones sin actualizar (porque no hay match), asignar al plan free
UPDATE user_subscriptions us
SET plan_id = (
  SELECT id FROM plans WHERE name = 'free' LIMIT 1
)
WHERE NOT EXISTS (
  SELECT 1 FROM plans p 
  WHERE p.id = us.plan_id
);

-- 6. Verificar que todo está correcto
SELECT 
  us.id,
  us.user_id, 
  us.plan_id,
  p.name as plan_name,
  p.display_name as plan_display_name
FROM user_subscriptions us
JOIN plans p ON us.plan_id = p.id;

-- 7. Ahora sí, actualizar las foreign keys (si falló antes)
ALTER TABLE payment_requests DROP CONSTRAINT IF EXISTS payment_requests_plan_id_fkey;
ALTER TABLE payment_requests ADD CONSTRAINT payment_requests_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE;

ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;
ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT;

-- 8. Verificar que no hay suscripciones huérfanas
SELECT * FROM user_subscriptions WHERE plan_id NOT IN (SELECT id FROM plans);
