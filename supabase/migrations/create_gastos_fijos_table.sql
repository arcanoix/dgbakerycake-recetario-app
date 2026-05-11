-- ============================================
-- TABLA: gastos_fijos
-- Descripción: Gestión de gastos fijos mensuales para cálculo de costos en recetas
-- ============================================

CREATE TABLE IF NOT EXISTS public.gastos_fijos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  monto_mensual DECIMAL(14, 4) NOT NULL DEFAULT 5.00,
  unidades_estimadas DECIMAL(14, 4) NOT NULL DEFAULT 20.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, nombre)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_gastos_fijos_user_id ON public.gastos_fijos(user_id);
CREATE INDEX IF NOT EXISTS idx_gastos_fijos_nombre ON public.gastos_fijos(nombre);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_gastos_fijos_updated_at ON public.gastos_fijos;
CREATE TRIGGER update_gastos_fijos_updated_at
  BEFORE UPDATE ON public.gastos_fijos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.gastos_fijos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own gastos_fijos" ON public.gastos_fijos;
CREATE POLICY "Users can view their own gastos_fijos"
  ON public.gastos_fijos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own gastos_fijos" ON public.gastos_fijos;
CREATE POLICY "Users can insert their own gastos_fijos"
  ON public.gastos_fijos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own gastos_fijos" ON public.gastos_fijos;
CREATE POLICY "Users can update their own gastos_fijos"
  ON public.gastos_fijos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own gastos_fijos" ON public.gastos_fijos;
CREATE POLICY "Users can delete their own gastos_fijos"
  ON public.gastos_fijos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCIÓN: Inicializar gastos fijos por defecto para un usuario
-- ============================================

CREATE OR REPLACE FUNCTION inicializar_gastos_fijos_defecto()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar gastos fijos por defecto para el nuevo usuario
  INSERT INTO public.gastos_fijos (user_id, nombre, monto_mensual, unidades_estimadas)
  VALUES
    (NEW.id, 'Aseo', 5.00, 20.00),
    (NEW.id, 'Electricidad', 5.00, 20.00),
    (NEW.id, 'Depreciación', 5.00, 20.00),
    (NEW.id, 'Mantenimiento', 5.00, 20.00),
    (NEW.id, 'Gas', 5.00, 20.00),
    (NEW.id, 'Internet', 5.00, 20.00)
  ON CONFLICT (user_id, nombre) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para inicializar gastos fijos cuando se crea un usuario
DROP TRIGGER IF EXISTS trigger_inicializar_gastos_fijos ON auth.users;
CREATE TRIGGER trigger_inicializar_gastos_fijos
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION inicializar_gastos_fijos_defecto();

-- ============================================
-- INICIALIZAR GASTOS FIJOS PARA USUARIOS EXISTENTES
-- ============================================

-- Insertar gastos fijos por defecto para todos los usuarios existentes
INSERT INTO public.gastos_fijos (user_id, nombre, monto_mensual, unidades_estimadas)
SELECT 
  u.id,
  gf.nombre,
  5.00,
  20.00
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('Aseo'),
    ('Electricidad'),
    ('Depreciación'),
    ('Mantenimiento'),
    ('Gas'),
    ('Internet')
) AS gf(nombre)
ON CONFLICT (user_id, nombre) DO NOTHING;

-- Comentarios
COMMENT ON TABLE public.gastos_fijos IS 'Gastos fijos mensuales para distribución de costos en recetas';
COMMENT ON COLUMN public.gastos_fijos.nombre IS 'Nombre del gasto fijo (Aseo, Electricidad, etc.)';
COMMENT ON COLUMN public.gastos_fijos.monto_mensual IS 'Monto mensual del gasto en USD';
COMMENT ON COLUMN public.gastos_fijos.unidades_estimadas IS 'Unidades estimadas de producción mensual';
