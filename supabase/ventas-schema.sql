-- ============================================================
-- MÓDULO DE VENTAS: Clientes, Órdenes, Ítems de Orden
-- ============================================================

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);

-- Tabla de Órdenes / Cotizaciones
CREATE TABLE IF NOT EXISTS ordenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  numero_orden VARCHAR(50) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'cotizacion'
    CHECK (estado IN ('cotizacion', 'confirmada', 'entregada', 'cancelada')),
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  descuento_porcentaje DECIMAL(5, 2) NOT NULL DEFAULT 0,
  descuento_monto DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  pago_adelantado DECIMAL(12, 2) NOT NULL DEFAULT 0,
  saldo_pendiente DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notas TEXT,
  fecha_entrega DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_user_id ON ordenes(user_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente_id ON ordenes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes(estado);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ordenes_user_numero ON ordenes(user_id, numero_orden);

-- Tabla de Ítems de Orden
CREATE TABLE IF NOT EXISTS orden_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  receta_id UUID REFERENCES recetas(id) ON DELETE SET NULL,
  nombre_item VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orden_items_orden_id ON orden_items(orden_id);
CREATE INDEX IF NOT EXISTS idx_orden_items_receta_id ON orden_items(receta_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_items ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
CREATE POLICY "clientes_select_own" ON clientes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "clientes_insert_own" ON clientes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "clientes_update_own" ON clientes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "clientes_delete_own" ON clientes
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para ordenes
CREATE POLICY "ordenes_select_own" ON ordenes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ordenes_insert_own" ON ordenes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ordenes_update_own" ON ordenes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ordenes_delete_own" ON ordenes
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para orden_items (acceso a través del user_id de la orden)
CREATE POLICY "orden_items_select_own" ON orden_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ordenes
      WHERE ordenes.id = orden_items.orden_id
        AND ordenes.user_id = auth.uid()
    )
  );

CREATE POLICY "orden_items_insert_own" ON orden_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ordenes
      WHERE ordenes.id = orden_items.orden_id
        AND ordenes.user_id = auth.uid()
    )
  );

CREATE POLICY "orden_items_update_own" ON orden_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM ordenes
      WHERE ordenes.id = orden_items.orden_id
        AND ordenes.user_id = auth.uid()
    )
  );

CREATE POLICY "orden_items_delete_own" ON orden_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM ordenes
      WHERE ordenes.id = orden_items.orden_id
        AND ordenes.user_id = auth.uid()
    )
  );

-- ============================================================
-- FUNCIÓN PARA AUTO-INCREMENTAR NÚMERO DE ORDEN POR USUARIO
-- ============================================================

CREATE OR REPLACE FUNCTION generar_numero_orden(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_numero TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM ordenes
  WHERE user_id = p_user_id;

  v_numero := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(v_count::TEXT, 4, '0');
  RETURN v_numero;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
