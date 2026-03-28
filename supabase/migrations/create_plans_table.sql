-- ============================================
-- TABLA DE PLANES DE SUSCRIPCIÓN
-- ============================================
-- Tabla para gestionar los planes de suscripción
-- Los planes pueden ser modificados desde el panel de admin

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_bs DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_period VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly, one-time
  max_productos INTEGER NOT NULL DEFAULT -1, -- -1 = ilimitado
  max_recetas INTEGER NOT NULL DEFAULT -1, -- -1 = ilimitado
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_plans_name ON plans(name);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_sort ON plans(sort_order);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_plans_updated_at();

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver los planes activos
CREATE POLICY "Anyone can view active plans"
  ON plans
  FOR SELECT
  USING (is_active = true);

-- Solo admins pueden hacer CRUD
CREATE POLICY "Admins can manage plans"
  ON plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================
-- DATOS INICIALES (SEED)
-- ============================================

INSERT INTO plans (name, display_name, description, price_usd, price_bs, price_period, max_productos, max_recetas, features, is_active, sort_order) VALUES
(
  'free',
  'Plan Gratuito',
  'Perfecto para empezar. Incluye funcionalidades básicas para gestionar tus productos y recetas.',
  0,
  0,
  'monthly',
  50,
  20,
  '{
    "soporte": "básico",
    "crear_productos": true,
    "crear_recetas": true,
    "exportar_pdf": false,
    "ver_analytics": false,
    "exportar_datos": false,
    "api_access": false,
    "soporte_prioritario": false
  }'::jsonb,
  true,
  1
),
(
  'basico',
  'Plan Básico',
  'Ideal para negocios pequeños. Más productos y recetas con funcionalidades avanzadas.',
  5,
  200,
  'monthly',
  200,
  100,
  '{
    "soporte": "email",
    "crear_productos": true,
    "crear_recetas": true,
    "exportar_pdf": true,
    "ver_analytics": true,
    "exportar_datos": false,
    "api_access": false,
    "soporte_prioritario": false
  }'::jsonb,
  true,
  2
),
(
  'profesional',
  'Plan Profesional',
  'Para profesionales y negocios en crecimiento. Analytics avanzado y más capacidad.',
  15,
  600,
  'monthly',
  1000,
  500,
  '{
    "soporte": "prioritario",
    "crear_productos": true,
    "crear_recetas": true,
    "exportar_pdf": true,
    "ver_analytics": true,
    "exportar_datos": true,
    "api_access": false,
    "soporte_prioritario": true
  }'::jsonb,
  true,
  3
),
(
  'empresarial',
  'Plan Empresarial',
  'Solución completa para empresas. Acceso API, soporte dedicado y capacidades ilimitadas.',
  50,
  2000,
  'monthly',
  -1,
  -1,
  '{
    "soporte": "dedicado",
    "crear_productos": true,
    "crear_recetas": true,
    "exportar_pdf": true,
    "ver_analytics": true,
    "exportar_datos": true,
    "api_access": true,
    "soporte_prioritario": true
  }'::jsonb,
  true,
  4
)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE plans IS 'Tabla de planes de suscripción';
COMMENT ON COLUMN plans.name IS 'Nombre único del plan (free, basico, profesional, empresarial)';
COMMENT ON COLUMN plans.display_name IS 'Nombre para mostrar al usuario';
COMMENT ON COLUMN plans.description IS 'Descripción del plan';
COMMENT ON COLUMN plans.price_usd IS 'Precio en dólares';
COMMENT ON COLUMN plans.price_bs IS 'Precio en bolívares';
COMMENT ON COLUMN plans.price_period IS 'Período de facturación (monthly, yearly, one-time)';
COMMENT ON COLUMN plans.max_productos IS 'Límite de productos (-1 = ilimitado)';
COMMENT ON COLUMN plans.max_recetas IS 'Límite de recetas (-1 = ilimitado)';
COMMENT ON COLUMN plans.features IS 'Características adicionales en JSON';
