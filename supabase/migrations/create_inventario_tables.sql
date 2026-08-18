-- ============================================
-- TABLA: inventario_movimientos (Kardex)
-- Descripción: Registra cada movimiento de stock de ingredientes/insumos
-- ============================================

CREATE TABLE IF NOT EXISTS public.inventario_movimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('compra', 'uso', 'merma', 'ajuste_entrada', 'ajuste_salida')),
  cantidad DECIMAL(14, 4) NOT NULL CHECK (cantidad > 0),
  unidad_medida TEXT NOT NULL,
  costo_unitario DECIMAL(14, 4),
  costo_total DECIMAL(14, 4),
  stock_anterior DECIMAL(14, 4) NOT NULL DEFAULT 0,
  stock_nuevo DECIMAL(14, 4) NOT NULL DEFAULT 0,
  notas TEXT,
  referencia_id UUID,
  referencia_tipo TEXT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_inv_mov_user_id ON public.inventario_movimientos(user_id);
CREATE INDEX IF NOT EXISTS idx_inv_mov_producto_id ON public.inventario_movimientos(producto_id);
CREATE INDEX IF NOT EXISTS idx_inv_mov_tipo ON public.inventario_movimientos(tipo);
CREATE INDEX IF NOT EXISTS idx_inv_mov_fecha ON public.inventario_movimientos(fecha DESC);

-- Row Level Security (RLS) para inventario_movimientos
ALTER TABLE public.inventario_movimientos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own inventario_movimientos" ON public.inventario_movimientos;
CREATE POLICY "Users can view their own inventario_movimientos"
  ON public.inventario_movimientos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own inventario_movimientos" ON public.inventario_movimientos;
CREATE POLICY "Users can insert their own inventario_movimientos"
  ON public.inventario_movimientos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own inventario_movimientos" ON public.inventario_movimientos;
CREATE POLICY "Users can update their own inventario_movimientos"
  ON public.inventario_movimientos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own inventario_movimientos" ON public.inventario_movimientos;
CREATE POLICY "Users can delete their own inventario_movimientos"
  ON public.inventario_movimientos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABLA: inventario_config_stock
-- Descripción: Configuración de stock mínimo por producto
-- ============================================

CREATE TABLE IF NOT EXISTS public.inventario_config_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  stock_minimo DECIMAL(14, 4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, producto_id)
);

CREATE INDEX IF NOT EXISTS idx_inv_cfg_user_id ON public.inventario_config_stock(user_id);
CREATE INDEX IF NOT EXISTS idx_inv_cfg_producto_id ON public.inventario_config_stock(producto_id);

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_inventario_config_stock_updated_at ON public.inventario_config_stock;
CREATE TRIGGER update_inventario_config_stock_updated_at
  BEFORE UPDATE ON public.inventario_config_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.inventario_config_stock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own inventario_config_stock" ON public.inventario_config_stock;
CREATE POLICY "Users can view their own inventario_config_stock"
  ON public.inventario_config_stock FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own inventario_config_stock" ON public.inventario_config_stock;
CREATE POLICY "Users can insert their own inventario_config_stock"
  ON public.inventario_config_stock FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own inventario_config_stock" ON public.inventario_config_stock;
CREATE POLICY "Users can update their own inventario_config_stock"
  ON public.inventario_config_stock FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own inventario_config_stock" ON public.inventario_config_stock;
CREATE POLICY "Users can delete their own inventario_config_stock"
  ON public.inventario_config_stock FOR DELETE
  USING (auth.uid() = user_id);

-- Comentarios
COMMENT ON TABLE public.inventario_movimientos IS 'Kardex de movimientos de stock de ingredientes/insumos';
COMMENT ON COLUMN public.inventario_movimientos.tipo IS 'Tipo de movimiento: compra, uso, merma, ajuste_entrada, ajuste_salida';
COMMENT ON COLUMN public.inventario_movimientos.stock_anterior IS 'Stock del producto antes del movimiento';
COMMENT ON COLUMN public.inventario_movimientos.stock_nuevo IS 'Stock del producto después del movimiento';

COMMENT ON TABLE public.inventario_config_stock IS 'Configuración de niveles mínimos de stock por producto';
COMMENT ON COLUMN public.inventario_config_stock.stock_minimo IS 'Nivel mínimo de stock antes de generar alerta';
