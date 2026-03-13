-- ============================================
-- TABLA: unidades_medida
-- Descripción: Almacena las unidades de medida administrables del sistema
-- ============================================

-- Crear tabla unidades_medida
CREATE TABLE IF NOT EXISTS unidades_medida (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  simbolo VARCHAR(20) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('peso', 'volumen', 'cantidad', 'otro')),
  factor_conversion_base DECIMAL(10,4),
  unidad_base VARCHAR(100),
  activo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT unidades_medida_nombre_unique UNIQUE (nombre),
  CONSTRAINT unidades_medida_simbolo_unique UNIQUE (simbolo)
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Índice para búsquedas por tipo
CREATE INDEX IF NOT EXISTS idx_unidades_medida_tipo ON unidades_medida(tipo);

-- Índice para búsquedas por estado activo
CREATE INDEX IF NOT EXISTS idx_unidades_medida_activo ON unidades_medida(activo);

-- Índice compuesto para búsquedas por tipo y estado
CREATE INDEX IF NOT EXISTS idx_unidades_medida_tipo_activo ON unidades_medida(tipo, activo);

-- ============================================
-- TRIGGER PARA ACTUALIZAR updated_at
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para unidades_medida
DROP TRIGGER IF EXISTS update_unidades_medida_updated_at ON unidades_medida;
CREATE TRIGGER update_unidades_medida_updated_at
  BEFORE UPDATE ON unidades_medida
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar Row Level Security
ALTER TABLE unidades_medida ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura a todos los usuarios autenticados
CREATE POLICY "Permitir lectura de unidades a usuarios autenticados"
  ON unidades_medida
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Permitir inserción a usuarios autenticados
CREATE POLICY "Permitir inserción de unidades a usuarios autenticados"
  ON unidades_medida
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Permitir actualización a usuarios autenticados
CREATE POLICY "Permitir actualización de unidades a usuarios autenticados"
  ON unidades_medida
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política: Permitir eliminación a usuarios autenticados
CREATE POLICY "Permitir eliminación de unidades a usuarios autenticados"
  ON unidades_medida
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- DATOS INICIALES - UNIDADES POR DEFECTO
-- ============================================

-- Insertar unidades de peso
INSERT INTO unidades_medida (id, nombre, simbolo, tipo, factor_conversion_base, unidad_base, activo) VALUES
  (gen_random_uuid(), 'gramos', 'g', 'peso', 1, 'gramos', true),
  (gen_random_uuid(), 'kilogramos', 'kg', 'peso', 1000, 'gramos', true),
  (gen_random_uuid(), 'onzas', 'oz', 'peso', 28.3495, 'gramos', true),
  (gen_random_uuid(), 'libras', 'lb', 'peso', 453.592, 'gramos', true)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar unidades de volumen
INSERT INTO unidades_medida (id, nombre, simbolo, tipo, factor_conversion_base, unidad_base, activo) VALUES
  (gen_random_uuid(), 'mililitros', 'ml', 'volumen', 1, 'mililitros', true),
  (gen_random_uuid(), 'litros', 'L', 'volumen', 1000, 'mililitros', true),
  (gen_random_uuid(), 'tazas', 'tza', 'volumen', 240, 'mililitros', true),
  (gen_random_uuid(), 'cucharadas', 'cdas', 'volumen', 15, 'mililitros', true),
  (gen_random_uuid(), 'cucharaditas', 'cdtas', 'volumen', 5, 'mililitros', true)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar unidades de cantidad
INSERT INTO unidades_medida (id, nombre, simbolo, tipo, activo) VALUES
  (gen_random_uuid(), 'unidad', 'u', 'cantidad', true),
  (gen_random_uuid(), 'paquete', 'paq', 'cantidad', true),
  (gen_random_uuid(), 'caja', 'cj', 'cantidad', true)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar unidad de docena con conversión
INSERT INTO unidades_medida (id, nombre, simbolo, tipo, factor_conversion_base, unidad_base, activo) VALUES
  (gen_random_uuid(), 'docena', 'dz', 'cantidad', 12, 'unidad', true)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- COMENTARIOS EN LA TABLA
-- ============================================

COMMENT ON TABLE unidades_medida IS 'Almacena las unidades de medida administrables del sistema';
COMMENT ON COLUMN unidades_medida.id IS 'Identificador único de la unidad';
COMMENT ON COLUMN unidades_medida.nombre IS 'Nombre de la unidad (ej: gramos, litros)';
COMMENT ON COLUMN unidades_medida.simbolo IS 'Símbolo o abreviatura de la unidad (ej: g, L)';
COMMENT ON COLUMN unidades_medida.tipo IS 'Tipo de unidad: peso, volumen, cantidad, otro';
COMMENT ON COLUMN unidades_medida.factor_conversion_base IS 'Factor de conversión a la unidad base del mismo tipo';
COMMENT ON COLUMN unidades_medida.unidad_base IS 'Nombre de la unidad base para conversión';
COMMENT ON COLUMN unidades_medida.activo IS 'Indica si la unidad está activa y disponible para uso';
COMMENT ON COLUMN unidades_medida.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN unidades_medida.updated_at IS 'Fecha y hora de última actualización del registro';
