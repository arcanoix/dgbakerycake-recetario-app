-- ============================================
-- AGREGAR CAMPO TASA DE CAMBIO USD A CONFIGURACIÓN
-- ============================================

-- Agregar columna tasa_cambio_usd a la tabla configuracion
ALTER TABLE configuracion 
ADD COLUMN IF NOT EXISTS tasa_cambio_usd DECIMAL(10, 2) DEFAULT 50;

-- Actualizar registros existentes con un valor por defecto
UPDATE configuracion 
SET tasa_cambio_usd = 50 
WHERE tasa_cambio_usd IS NULL;

-- Verificar que se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'configuracion' 
  AND column_name = 'tasa_cambio_usd';

-- Mostrar configuración actual
SELECT * FROM configuracion;

SELECT 'Campo tasa_cambio_usd agregado exitosamente. Recarga la aplicación.' AS mensaje;
