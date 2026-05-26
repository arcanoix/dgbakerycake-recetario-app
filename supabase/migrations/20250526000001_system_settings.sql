-- ============================================
-- MIGRACIÓN: Configuración Global del Sistema
-- ============================================
-- Ejecutar esto en el SQL Editor de Supabase

-- Crear tabla de configuraciones globales del sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_users INTEGER NOT NULL DEFAULT -1,           -- -1 = ilimitado, 0 = bloqueado, >0 = límite
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,  -- true = sistema en mantenimiento
  maintenance_message TEXT DEFAULT 'El sistema está en mantenimiento. Volveremos pronto.',
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Política para que cualquier usuario autenticado pueda leer la configuración
CREATE POLICY "Allow authenticated read" ON system_settings
  FOR SELECT TO authenticated USING (true);

-- Política para que solo admins puedan modificar la configuración
CREATE POLICY "Allow admin write" ON system_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insertar configuración por defecto si no existe
INSERT INTO system_settings (max_users, maintenance_mode)
SELECT -1, false
WHERE NOT EXISTS (SELECT 1 FROM system_settings);
