-- ============================================
-- TABLA: ordenes
-- Descripción: Almacena órdenes y cotizaciones del módulo de ventas
-- ============================================

CREATE TABLE IF NOT EXISTS public.ordenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  numero_orden TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'cotizacion' CHECK (estado IN ('cotizacion', 'confirmada', 'en_proceso', 'entregada', 'cancelada')),
  fecha_entrega DATE,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  descuento_porcentaje DECIMAL(5, 2) NOT NULL DEFAULT 0,
  descuento_monto DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  pago_adelantado DECIMAL(10, 2) NOT NULL DEFAULT 0,
  saldo_pendiente DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLA: orden_items
-- Descripción: Almacena los ítems de cada orden
-- ============================================

CREATE TABLE IF NOT EXISTS public.orden_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES public.ordenes(id) ON DELETE CASCADE,
  receta_id UUID REFERENCES public.recetas(id) ON DELETE RESTRICT,
  nombre_item TEXT NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ordenes_user_id ON public.ordenes(user_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente_id ON public.ordenes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON public.ordenes(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_numero_orden ON public.ordenes(numero_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha_entrega ON public.ordenes(fecha_entrega) WHERE fecha_entrega IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orden_items_orden_id ON public.orden_items(orden_id);
CREATE INDEX IF NOT EXISTS idx_orden_items_receta_id ON public.orden_items(receta_id);

-- Trigger para actualizar updated_at automáticamente en ordenes
DROP TRIGGER IF EXISTS update_ordenes_updated_at ON public.ordenes;
CREATE TRIGGER update_ordenes_updated_at
  BEFORE UPDATE ON public.ordenes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) para ordenes
ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias órdenes
DROP POLICY IF EXISTS "Users can view their own ordenes" ON public.ordenes;
CREATE POLICY "Users can view their own ordenes"
  ON public.ordenes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias órdenes
DROP POLICY IF EXISTS "Users can insert their own ordenes" ON public.ordenes;
CREATE POLICY "Users can insert their own ordenes"
  ON public.ordenes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias órdenes
DROP POLICY IF EXISTS "Users can update their own ordenes" ON public.ordenes;
CREATE POLICY "Users can update their own ordenes"
  ON public.ordenes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias órdenes
DROP POLICY IF EXISTS "Users can delete their own ordenes" ON public.ordenes;
CREATE POLICY "Users can delete their own ordenes"
  ON public.ordenes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Row Level Security (RLS) para orden_items
ALTER TABLE public.orden_items ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver ítems de sus propias órdenes
DROP POLICY IF EXISTS "Users can view their own orden_items" ON public.orden_items;
CREATE POLICY "Users can view their own orden_items"
  ON public.orden_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ordenes
      WHERE ordenes.id = orden_items.orden_id
      AND ordenes.user_id = auth.uid()
    )
  );

-- Política: Los usuarios pueden insertar ítems en sus propias órdenes
DROP POLICY IF EXISTS "Users can insert their own orden_items" ON public.orden_items;
CREATE POLICY "Users can insert their own orden_items"
  ON public.orden_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ordenes
      WHERE ordenes.id = orden_items.orden_id
      AND ordenes.user_id = auth.uid()
    )
  );

-- Política: Los usuarios pueden actualizar ítems de sus propias órdenes
DROP POLICY IF EXISTS "Users can update their own orden_items" ON public.orden_items;
CREATE POLICY "Users can update their own orden_items"
  ON public.orden_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.ordenes
      WHERE ordenes.id = orden_items.orden_id
      AND ordenes.user_id = auth.uid()
    )
  );

-- Política: Los usuarios pueden eliminar ítems de sus propias órdenes
DROP POLICY IF EXISTS "Users can delete their own orden_items" ON public.orden_items;
CREATE POLICY "Users can delete their own orden_items"
  ON public.orden_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.ordenes
      WHERE ordenes.id = orden_items.orden_id
      AND ordenes.user_id = auth.uid()
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE public.ordenes IS 'Tabla de órdenes y cotizaciones del módulo de ventas';
COMMENT ON COLUMN public.ordenes.id IS 'Identificador único de la orden';
COMMENT ON COLUMN public.ordenes.user_id IS 'ID del usuario propietario de la orden';
COMMENT ON COLUMN public.ordenes.cliente_id IS 'ID del cliente asociado a la orden';
COMMENT ON COLUMN public.ordenes.numero_orden IS 'Número único de la orden';
COMMENT ON COLUMN public.ordenes.estado IS 'Estado actual de la orden (cotizacion, confirmada, en_proceso, entregada, cancelada)';
COMMENT ON COLUMN public.ordenes.fecha_entrega IS 'Fecha estimada de entrega';
COMMENT ON COLUMN public.ordenes.subtotal IS 'Subtotal de la orden antes de descuentos';
COMMENT ON COLUMN public.ordenes.descuento_porcentaje IS 'Porcentaje de descuento aplicado';
COMMENT ON COLUMN public.ordenes.descuento_monto IS 'Monto de descuento aplicado en valor absoluto';
COMMENT ON COLUMN public.ordenes.total IS 'Total de la orden después de descuentos';
COMMENT ON COLUMN public.ordenes.pago_adelantado IS 'Monto pagado por adelantado';
COMMENT ON COLUMN public.ordenes.saldo_pendiente IS 'Saldo pendiente de pago';

COMMENT ON TABLE public.orden_items IS 'Tabla de ítems/productos de cada orden';
COMMENT ON COLUMN public.orden_items.id IS 'Identificador único del ítem';
COMMENT ON COLUMN public.orden_items.orden_id IS 'ID de la orden a la que pertenece';
COMMENT ON COLUMN public.orden_items.receta_id IS 'ID de la receta/producto (opcional si es un ítem personalizado)';
COMMENT ON COLUMN public.orden_items.nombre_item IS 'Nombre del ítem/producto';
COMMENT ON COLUMN public.orden_items.cantidad IS 'Cantidad de unidades';
COMMENT ON COLUMN public.orden_items.precio_unitario IS 'Precio por unidad';
COMMENT ON COLUMN public.orden_items.subtotal IS 'Subtotal del ítem (cantidad * precio_unitario)';
COMMENT ON COLUMN public.orden_items.notas IS 'Notas u observaciones del ítem';
