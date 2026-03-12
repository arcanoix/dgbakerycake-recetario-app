-- Migración: Agregar campos de presentación a la tabla productos
-- Fecha: 2026-03-12
-- Descripción: Agrega campos para manejar tamaño de presentación individual y cantidad de presentaciones

-- Agregar nuevas columnas
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS tamaño_presentacion DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS cantidad_presentaciones INTEGER,
ADD COLUMN IF NOT EXISTS precio_por_presentacion DECIMAL(10,2);

-- Migrar datos existentes: asumir que cantidad_total es el tamaño de presentación y hay 1 presentación
UPDATE productos 
SET 
  tamaño_presentacion = cantidad_total,
  cantidad_presentaciones = 1,
  precio_por_presentacion = precio_total
WHERE tamaño_presentacion IS NULL;

-- Hacer las columnas NOT NULL después de la migración
ALTER TABLE productos 
ALTER COLUMN tamaño_presentacion SET NOT NULL,
ALTER COLUMN cantidad_presentaciones SET NOT NULL,
ALTER COLUMN precio_por_presentacion SET NOT NULL;

-- Agregar comentarios para documentación
COMMENT ON COLUMN productos.tamaño_presentacion IS 'Tamaño de una unidad/paquete individual del producto (ej: 900 para una bolsa de 900g)';
COMMENT ON COLUMN productos.cantidad_presentaciones IS 'Número de unidades/paquetes comprados';
COMMENT ON COLUMN productos.precio_por_presentacion IS 'Precio de una presentación individual (calculado: precio_total / cantidad_presentaciones)';
