-- ============================================
-- CORREGIR RLS Policy Always True en unidades_medida
-- ============================================
-- Este script reemplaza las políticas permisivas con políticas seguras
-- Solo los admins pueden modificar unidades_medida
-- ============================================

-- ============================================
-- PASO 1: Eliminar políticas permisivas existentes
-- ============================================

DROP POLICY IF EXISTS "Permitir inserción de unidades a usuarios autenticados" ON unidades_medida;
DROP POLICY IF EXISTS "Permitir actualización de unidades a usuarios autenticados" ON unidades_medida;
DROP POLICY IF EXISTS "Permitir eliminación de unidades a usuarios autenticados" ON unidades_medida;

-- ============================================
-- PASO 2: Crear políticas seguras (solo admins pueden modificar)
-- ============================================

-- Política: Solo admins pueden insertar nuevas unidades
CREATE POLICY "Solo admins pueden insertar unidades"
  ON unidades_medida
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Solo admins pueden actualizar unidades
CREATE POLICY "Solo admins pueden actualizar unidades"
  ON unidades_medida
  FOR UPDATE
  TO authenticated
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

-- Política: Solo admins pueden eliminar unidades
CREATE POLICY "Solo admins pueden eliminar unidades"
  ON unidades_medida
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar políticas de la tabla
SELECT 
    tablename,
    policyname,
    cmd,
    qual IS NOT NULL as has_using_clause,
    with_check IS NOT NULL as has_with_check_clause
FROM pg_policies
WHERE tablename = 'unidades_medida'
ORDER BY cmd;

SELECT 'Políticas RLS de unidades_medida actualizadas correctamente' as status;
