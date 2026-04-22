-- ============================================
-- TABLA: clientes
-- Descripción: Almacena información de clientes para el módulo de ventas
-- ============================================

CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON public.clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email) WHERE email IS NOT NULL;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clientes_updated_at ON public.clientes;
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios clientes
DROP POLICY IF EXISTS "Users can view their own clientes" ON public.clientes;
CREATE POLICY "Users can view their own clientes"
  ON public.clientes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios clientes
DROP POLICY IF EXISTS "Users can insert their own clientes" ON public.clientes;
CREATE POLICY "Users can insert their own clientes"
  ON public.clientes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios clientes
DROP POLICY IF EXISTS "Users can update their own clientes" ON public.clientes;
CREATE POLICY "Users can update their own clientes"
  ON public.clientes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios clientes
DROP POLICY IF EXISTS "Users can delete their own clientes" ON public.clientes;
CREATE POLICY "Users can delete their own clientes"
  ON public.clientes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE public.clientes IS 'Tabla de clientes para el módulo de ventas';
COMMENT ON COLUMN public.clientes.id IS 'Identificador único del cliente';
COMMENT ON COLUMN public.clientes.user_id IS 'ID del usuario propietario del cliente';
COMMENT ON COLUMN public.clientes.nombre IS 'Nombre completo del cliente';
COMMENT ON COLUMN public.clientes.email IS 'Correo electrónico del cliente (opcional)';
COMMENT ON COLUMN public.clientes.telefono IS 'Número de teléfono del cliente (opcional)';
COMMENT ON COLUMN public.clientes.direccion IS 'Dirección del cliente (opcional)';
COMMENT ON COLUMN public.clientes.notas IS 'Notas u observaciones adicionales (opcional)';
COMMENT ON COLUMN public.clientes.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN public.clientes.updated_at IS 'Fecha y hora de última actualización del registro';
