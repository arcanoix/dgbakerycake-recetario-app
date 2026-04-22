-- ============================================
-- MIGRACIÓN: Agregar columnas faltantes a tablas existentes
-- Descripción: Agrega descuento_porcentaje, descuento_monto, nombre_item y notas
-- Ejecutar SOLO si las tablas ya existen con el esquema antiguo
-- ============================================

-- Agregar columnas faltantes a la tabla ordenes
ALTER TABLE public.ordenes 
  ADD COLUMN IF NOT EXISTS descuento_porcentaje DECIMAL(5, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS descuento_monto DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Eliminar columna antigua 'descuento' si existe
ALTER TABLE public.ordenes 
  DROP COLUMN IF EXISTS descuento;

-- Agregar columnas faltantes a la tabla orden_items
ALTER TABLE public.orden_items 
  ADD COLUMN IF NOT EXISTS nombre_item TEXT,
  ADD COLUMN IF NOT EXISTS notas TEXT;

-- Hacer receta_id nullable (permite items personalizados)
ALTER TABLE public.orden_items 
  ALTER COLUMN receta_id DROP NOT NULL;

-- Actualizar comentarios
COMMENT ON COLUMN public.ordenes.descuento_porcentaje IS 'Porcentaje de descuento aplicado';
COMMENT ON COLUMN public.ordenes.descuento_monto IS 'Monto de descuento aplicado en valor absoluto';
COMMENT ON COLUMN public.orden_items.nombre_item IS 'Nombre del ítem/producto';
COMMENT ON COLUMN public.orden_items.notas IS 'Notas u observaciones del ítem';

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Migración completada: columnas agregadas exitosamente';
END $$;
