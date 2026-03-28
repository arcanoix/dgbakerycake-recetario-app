-- ============================================
-- CORREGIR RLS EN trigger_logs - Eliminar políticas problemáticas
-- ============================================

-- Eliminar políticas existentes (para recrearlas correctamente)
DROP POLICY IF EXISTS "Admins pueden ver todos los logs" ON public.trigger_logs;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios logs" ON public.trigger_logs;
DROP POLICY IF EXISTS "Sistema puede insertar logs" ON public.trigger_logs;

-- ============================================
-- Crear políticas seguras
-- ============================================

-- Política: Solo admins pueden ver todos los logs
CREATE POLICY "Admins pueden ver todos los logs" ON public.trigger_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Los usuarios pueden ver logs relacionados con ellos mismos
CREATE POLICY "Usuarios pueden ver sus propios logs" ON public.trigger_logs
  FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- NOTA: No creamos política INSERT
-- Las funciones SECURITY DEFINER pueden insertar sin restricciones de RLS
-- ============================================

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'trigger_logs';

SELECT 'RLS de trigger_logs corregido correctamente' as status;
