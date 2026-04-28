-- Fix: rename fecha_actualizacion to updated_at in productos table
-- This resolves the trigger error "record 'new' has no field 'updated_at'"
-- that occurred when trying to update a product. The table was using a
-- non-standard column name while the automatic trigger expects 'updated_at'.

ALTER TABLE productos RENAME COLUMN fecha_actualizacion TO updated_at;
