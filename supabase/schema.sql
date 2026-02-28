-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  precio_total DECIMAL(10, 2) NOT NULL,
  cantidad_total DECIMAL(10, 2) NOT NULL,
  unidad_medida VARCHAR(50) NOT NULL,
  precio_por_unidad DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(100),
  proveedor VARCHAR(255),
  notas TEXT,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);

-- Crear tabla de recetas
CREATE TABLE IF NOT EXISTS recetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  materiales JSONB NOT NULL DEFAULT '[]',
  rendimiento DECIMAL(10, 2),
  unidad_rendimiento VARCHAR(50),
  tiempo_preparacion INTEGER NOT NULL,
  costo_por_hora DECIMAL(10, 2) NOT NULL,
  costo_mano_obra DECIMAL(10, 2) NOT NULL,
  costo_materiales DECIMAL(10, 2) NOT NULL,
  costo_total DECIMAL(10, 2) NOT NULL,
  margen_ganancia DECIMAL(5, 2),
  precio_venta_sugerido DECIMAL(10, 2),
  categoria VARCHAR(100),
  imagen VARCHAR(500),
  notas TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para recetas
CREATE INDEX IF NOT EXISTS idx_recetas_nombre ON recetas(nombre);
CREATE INDEX IF NOT EXISTS idx_recetas_categoria ON recetas(categoria);

-- Crear tabla de configuración
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  costo_por_hora_defecto DECIMAL(10, 2) NOT NULL DEFAULT 10,
  moneda VARCHAR(10) NOT NULL DEFAULT 'VES',
  margen_ganancia_defecto DECIMAL(5, 2) NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración por defecto si no existe
INSERT INTO configuracion (costo_por_hora_defecto, moneda, margen_ganancia_defecto)
SELECT 10, 'VES', 30
WHERE NOT EXISTS (SELECT 1 FROM configuracion LIMIT 1);

-- Habilitar Row Level Security (RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (para desarrollo)
-- IMPORTANTE: En producción, deberías implementar autenticación
CREATE POLICY "Permitir lectura pública de productos" ON productos
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción pública de productos" ON productos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización pública de productos" ON productos
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación pública de productos" ON productos
  FOR DELETE USING (true);

CREATE POLICY "Permitir lectura pública de recetas" ON recetas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción pública de recetas" ON recetas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización pública de recetas" ON recetas
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación pública de recetas" ON recetas
  FOR DELETE USING (true);

CREATE POLICY "Permitir lectura pública de configuración" ON configuracion
  FOR SELECT USING (true);

CREATE POLICY "Permitir actualización pública de configuración" ON configuracion
  FOR UPDATE USING (true);

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para productos
CREATE TRIGGER update_productos_fecha_actualizacion
  BEFORE UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para recetas
CREATE TRIGGER update_recetas_fecha_actualizacion
  BEFORE UPDATE ON recetas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar updated_at en configuración
CREATE OR REPLACE FUNCTION update_configuracion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para configuración
CREATE TRIGGER update_configuracion_updated_at
  BEFORE UPDATE ON configuracion
  FOR EACH ROW
  EXECUTE FUNCTION update_configuracion_updated_at();
