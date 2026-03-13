-- ============================================
-- TABLA DE CATEGORÍAS
-- ============================================
-- Tabla para almacenar categorías administrables de productos y recetas
-- Autor: Sistema de Gestión DG Bakery Cake
-- Fecha: 2024

-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('producto', 'receta')),
  descripcion TEXT,
  color VARCHAR(7), -- Color en formato hex (#RRGGBB)
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT categorias_nombre_tipo_user_unique UNIQUE (user_id, nombre, tipo)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_categorias_user_id ON categorias(user_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_activo ON categorias(activo);
CREATE INDEX IF NOT EXISTS idx_categorias_user_tipo ON categorias(user_id, tipo);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_categorias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_categorias_updated_at
  BEFORE UPDATE ON categorias
  FOR EACH ROW
  EXECUTE FUNCTION update_categorias_updated_at();

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar Row Level Security
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias categorías
CREATE POLICY "Users can view own categorias"
  ON categorias
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias categorías
CREATE POLICY "Users can insert own categorias"
  ON categorias
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias categorías
CREATE POLICY "Users can update own categorias"
  ON categorias
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias categorías
CREATE POLICY "Users can delete own categorias"
  ON categorias
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- DATOS INICIALES (OPCIONAL)
-- ============================================
-- Nota: Estos datos se insertarán automáticamente para cada nuevo usuario
-- a través de la aplicación, no directamente en la base de datos.

-- Categorías de Productos por defecto:
-- Lácteos, Harinas, Azúcares, Grasas, Huevos, Saborizantes, Decoración, Otros

-- Categorías de Recetas por defecto:
-- Tortas, Cupcakes, Galletas, Postres, Panes, Otros

-- ============================================
-- COMENTARIOS DE LA TABLA
-- ============================================

COMMENT ON TABLE categorias IS 'Tabla de categorías administrables para productos y recetas';
COMMENT ON COLUMN categorias.id IS 'Identificador único de la categoría (UUID)';
COMMENT ON COLUMN categorias.user_id IS 'ID del usuario propietario de la categoría';
COMMENT ON COLUMN categorias.nombre IS 'Nombre de la categoría';
COMMENT ON COLUMN categorias.tipo IS 'Tipo de categoría: producto o receta';
COMMENT ON COLUMN categorias.descripcion IS 'Descripción opcional de la categoría';
COMMENT ON COLUMN categorias.color IS 'Color en formato hexadecimal para visualización';
COMMENT ON COLUMN categorias.activo IS 'Indica si la categoría está activa';
COMMENT ON COLUMN categorias.created_at IS 'Fecha y hora de creación';
COMMENT ON COLUMN categorias.updated_at IS 'Fecha y hora de última actualización';
