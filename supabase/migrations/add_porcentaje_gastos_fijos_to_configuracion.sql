-- Agregar columna porcentaje_gastos_fijos a la tabla configuracion
-- Esta columna almacena el porcentaje del costo total que se asignará como gastos fijos

ALTER TABLE configuracion 
ADD COLUMN IF NOT EXISTS porcentaje_gastos_fijos DECIMAL(5,2) DEFAULT 0 CHECK (porcentaje_gastos_fijos >= 0 AND porcentaje_gastos_fijos <= 100);

-- Comentario explicativo
COMMENT ON COLUMN configuracion.porcentaje_gastos_fijos IS 'Porcentaje del costo total de una receta que se asigna como gastos fijos (0-100%)';
