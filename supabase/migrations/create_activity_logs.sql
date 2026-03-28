-- ============================================
-- Tabla de registro de actividades (audit log)
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,       -- 'create', 'update', 'delete', 'login', 'logout', 'view'
  module VARCHAR(100) NOT NULL,      -- 'recetas', 'productos', 'auth', 'configuracion', etc.
  description TEXT,                  -- Descripción legible de la acción
  entity_id UUID,                    -- ID de la entidad afectada (receta, producto, etc.)
  entity_name VARCHAR(255),          -- Nombre de la entidad para referencia rápida
  ip_address VARCHAR(45),            -- Dirección IP del cliente (IPv4 o IPv6)
  user_agent TEXT,                   -- User-Agent del navegador
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_module ON activity_logs(module);

-- Habilitar Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden insertar sus propios registros
CREATE POLICY "Users can insert their own activity logs"
  ON activity_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los administradores pueden ver todos los registros
CREATE POLICY "Admins can view all activity logs"
  ON activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

-- Los usuarios pueden ver sus propios registros
CREATE POLICY "Users can view their own activity logs"
  ON activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- Función para obtener logs de actividad con info del usuario (para admins)
-- ============================================

CREATE OR REPLACE FUNCTION get_activity_logs_with_user_info(
  p_limit INTEGER DEFAULT 200,
  p_offset INTEGER DEFAULT 0,
  p_user_id UUID DEFAULT NULL,
  p_module VARCHAR DEFAULT NULL,
  p_action VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  action VARCHAR(50),
  module VARCHAR(100),
  description TEXT,
  entity_id UUID,
  entity_name VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE public.user_roles.user_id = auth.uid()
      AND public.user_roles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acceso denegado: se requiere rol de administrador';
  END IF;

  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    u.email,
    al.action,
    al.module,
    al.description,
    al.entity_id,
    al.entity_name,
    al.ip_address,
    al.user_agent,
    al.created_at
  FROM public.activity_logs al
  LEFT JOIN auth.users u ON u.id = al.user_id
  WHERE
    (p_user_id IS NULL OR al.user_id = p_user_id)
    AND (p_module IS NULL OR al.module = p_module)
    AND (p_action IS NULL OR al.action = p_action)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================
-- Función para estadísticas de actividad por módulo (para admins)
-- ============================================

CREATE OR REPLACE FUNCTION get_activity_stats_by_module()
RETURNS TABLE (
  module VARCHAR(100),
  total_actions BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE public.user_roles.user_id = auth.uid()
      AND public.user_roles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  RETURN QUERY
  SELECT al.module, COUNT(*) AS total_actions
  FROM public.activity_logs al
  GROUP BY al.module
  ORDER BY total_actions DESC;
END;
$$;
