-- Actualizar políticas RLS para usar autenticación de usuarios

-- Eliminar políticas públicas anteriores
DROP POLICY IF EXISTS "Permitir lectura pública de productos" ON productos;
DROP POLICY IF EXISTS "Permitir inserción pública de productos" ON productos;
DROP POLICY IF EXISTS "Permitir actualización pública de productos" ON productos;
DROP POLICY IF EXISTS "Permitir eliminación pública de productos" ON productos;

DROP POLICY IF EXISTS "Permitir lectura pública de recetas" ON recetas;
DROP POLICY IF EXISTS "Permitir inserción pública de recetas" ON recetas;
DROP POLICY IF EXISTS "Permitir actualización pública de recetas" ON recetas;
DROP POLICY IF EXISTS "Permitir eliminación pública de recetas" ON recetas;

DROP POLICY IF EXISTS "Permitir lectura pública de configuración" ON configuracion;
DROP POLICY IF EXISTS "Permitir actualización pública de configuración" ON configuracion;

-- Agregar columna user_id a las tablas (si no existe)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE recetas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índices para user_id
CREATE INDEX IF NOT EXISTS idx_productos_user_id ON productos(user_id);
CREATE INDEX IF NOT EXISTS idx_recetas_user_id ON recetas(user_id);
CREATE INDEX IF NOT EXISTS idx_configuracion_user_id ON configuracion(user_id);

-- Políticas RLS para productos (solo el usuario puede ver/editar sus propios datos)
CREATE POLICY "Usuarios pueden ver sus propios productos" ON productos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propios productos" ON productos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios productos" ON productos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios productos" ON productos
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para recetas
CREATE POLICY "Usuarios pueden ver sus propias recetas" ON recetas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias recetas" ON recetas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias recetas" ON recetas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propias recetas" ON recetas
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para configuración
CREATE POLICY "Usuarios pueden ver su propia configuración" ON configuracion
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear su propia configuración" ON configuracion
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su propia configuración" ON configuracion
  FOR UPDATE USING (auth.uid() = user_id);

-- Función para establecer user_id automáticamente en nuevos registros
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para establecer user_id automáticamente
DROP TRIGGER IF EXISTS set_productos_user_id ON productos;
CREATE TRIGGER set_productos_user_id
  BEFORE INSERT ON productos
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_recetas_user_id ON recetas;
CREATE TRIGGER set_recetas_user_id
  BEFORE INSERT ON recetas
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_configuracion_user_id ON configuracion;
CREATE TRIGGER set_configuracion_user_id
  BEFORE INSERT ON configuracion
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

-- Nota: Los datos existentes no tendrán user_id. 
-- Puedes ejecutar esto para asignar todos los datos existentes a un usuario específico:
-- UPDATE productos SET user_id = 'tu-user-id-aqui' WHERE user_id IS NULL;
-- UPDATE recetas SET user_id = 'tu-user-id-aqui' WHERE user_id IS NULL;
-- UPDATE configuracion SET user_id = 'tu-user-id-aqui' WHERE user_id IS NULL;
