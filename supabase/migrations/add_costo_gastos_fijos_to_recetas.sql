-- Agregar columna costo_gastos_fijos a la tabla recetas
-- Esta columna almacena el costo de gastos fijos calculado para cada receta

ALTER TABLE recetas 
ADD COLUMN IF NOT EXISTS costo_gastos_fijos DECIMAL(10,2) DEFAULT 0 NOT NULL;

-- Comentario explicativo
COMMENT ON COLUMN recetas.costo_gastos_fijos IS 'Costo de gastos fijos asignado a la receta, calculado como: suma(montos_mensuales_gastos_fijos) * (porcentaje_gastos_fijos / 100)';
