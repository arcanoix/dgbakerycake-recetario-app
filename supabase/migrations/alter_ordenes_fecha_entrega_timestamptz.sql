-- ============================================
-- MIGRACIÓN: Cambiar fecha_entrega a TIMESTAMPTZ
-- Descripción: Permite guardar fecha y hora de entrega
-- ============================================

ALTER TABLE public.ordenes
  ALTER COLUMN fecha_entrega TYPE TIMESTAMPTZ
  USING CASE
    WHEN fecha_entrega IS NULL THEN NULL
    ELSE fecha_entrega::timestamptz
  END;

COMMENT ON COLUMN public.ordenes.fecha_entrega IS 'Fecha y hora estimada de entrega';
