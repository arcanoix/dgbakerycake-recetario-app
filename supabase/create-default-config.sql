-- ============================================
-- CREAR CONFIGURACIÓN POR DEFECTO PARA USUARIOS
-- ============================================

-- Crear trigger para asignar configuración por defecto a nuevos usuarios
CREATE OR REPLACE FUNCTION public.assign_default_config()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.configuracion (
    user_id,
    costo_por_hora_defecto,
    moneda,
    margen_ganancia_defecto
  )
  VALUES (
    NEW.id,
    10,     -- Costo por hora defecto
    'VES',  -- Moneda (Bolívares)
    30      -- 30% margen de ganancia
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Si falla, no bloquear el registro
  RETURN NEW;
END;
$$;

-- Crear trigger
DROP TRIGGER IF EXISTS on_user_created_config ON auth.users;
CREATE TRIGGER on_user_created_config
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_config();

-- Crear configuración para usuarios existentes que no la tienen
INSERT INTO configuracion (user_id, costo_por_hora_defecto, moneda, margen_ganancia_defecto)
SELECT 
  u.id,
  10,
  'VES',
  30
FROM auth.users u
LEFT JOIN configuracion c ON u.id = c.user_id
WHERE c.id IS NULL;

SELECT 'Configuración por defecto creada. Recarga la página.' AS mensaje;
