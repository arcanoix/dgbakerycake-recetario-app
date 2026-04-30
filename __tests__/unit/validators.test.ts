import {
  ProductoFormSchema,
  RecetaFormSchema,
  ClienteFormSchema,
  OrdenFormSchema,
  MovimientoFormSchema,
  UnidadMedidaFormSchema,
  CategoriaFormSchema,
  ConfiguracionFormSchema,
} from '@/lib/validators';

// ============================================
// ProductoFormSchema
// ============================================

describe('ProductoFormSchema', () => {
  const base = {
    nombre: 'Harina de Trigo',
    precioTotal: 5.0,
    tamañoPresentacion: 1000,
    unidadMedida: 'gramos',
    cantidadPresentaciones: 1,
  };

  it('acepta un producto válido', () => {
    expect(ProductoFormSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza nombre vacío', () => {
    const result = ProductoFormSchema.safeParse({ ...base, nombre: '' });
    expect(result.success).toBe(false);
  });

  it('rechaza nombre demasiado largo (> 200 chars)', () => {
    const result = ProductoFormSchema.safeParse({ ...base, nombre: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('rechaza precio total de 0 o negativo', () => {
    expect(ProductoFormSchema.safeParse({ ...base, precioTotal: 0 }).success).toBe(false);
    expect(ProductoFormSchema.safeParse({ ...base, precioTotal: -1 }).success).toBe(false);
  });

  it('rechaza cantidadPresentaciones negativa', () => {
    const result = ProductoFormSchema.safeParse({ ...base, cantidadPresentaciones: -5 });
    expect(result.success).toBe(false);
  });

  it('acepta notas opcionales', () => {
    const result = ProductoFormSchema.safeParse({ ...base, notas: 'Comprado en supermercado' });
    expect(result.success).toBe(true);
  });

  it('rechaza notas con más de 2000 caracteres', () => {
    const result = ProductoFormSchema.safeParse({ ...base, notas: 'N'.repeat(2001) });
    expect(result.success).toBe(false);
  });
});

// ============================================
// RecetaFormSchema
// ============================================

describe('RecetaFormSchema', () => {
  const base = {
    nombre: 'Torta de Vainilla',
    descripcion: 'Receta clásica',
  };

  it('acepta una receta válida', () => {
    expect(RecetaFormSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza nombre vacío', () => {
    const result = RecetaFormSchema.safeParse({ ...base, nombre: '' });
    expect(result.success).toBe(false);
  });

  it('rechaza margenGanancia negativo', () => {
    const result = RecetaFormSchema.safeParse({ ...base, margenGanancia: -10 });
    expect(result.success).toBe(false);
  });

  it('acepta margenGanancia 0', () => {
    const result = RecetaFormSchema.safeParse({ ...base, margenGanancia: 0 });
    expect(result.success).toBe(true);
  });

  it('acepta rendimiento positivo', () => {
    const result = RecetaFormSchema.safeParse({ ...base, rendimiento: 8 });
    expect(result.success).toBe(true);
  });

  it('rechaza rendimiento de 0', () => {
    const result = RecetaFormSchema.safeParse({ ...base, rendimiento: 0 });
    expect(result.success).toBe(false);
  });
});

// ============================================
// ClienteFormSchema
// ============================================

describe('ClienteFormSchema', () => {
  const base = { nombre: 'María García' };

  it('acepta un cliente válido con solo nombre', () => {
    expect(ClienteFormSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza nombre vacío', () => {
    const result = ClienteFormSchema.safeParse({ nombre: '' });
    expect(result.success).toBe(false);
  });

  it('acepta email válido', () => {
    const result = ClienteFormSchema.safeParse({ ...base, email: 'maria@example.com' });
    expect(result.success).toBe(true);
  });

  it('rechaza email con formato inválido', () => {
    const result = ClienteFormSchema.safeParse({ ...base, email: 'no-es-un-email' });
    expect(result.success).toBe(false);
  });

  it('acepta email vacío (string vacío)', () => {
    const result = ClienteFormSchema.safeParse({ ...base, email: '' });
    expect(result.success).toBe(true);
  });

  it('acepta campos opcionales como undefined', () => {
    const result = ClienteFormSchema.safeParse({ ...base, telefono: undefined });
    expect(result.success).toBe(true);
  });

  it('rechaza teléfono demasiado largo (> 50 chars)', () => {
    const result = ClienteFormSchema.safeParse({ ...base, telefono: '1'.repeat(51) });
    expect(result.success).toBe(false);
  });
});

// ============================================
// OrdenFormSchema
// ============================================

describe('OrdenFormSchema', () => {
  const itemBase = {
    nombreItem: 'Torta de 3 pisos',
    cantidad: 1,
    precioUnitario: 50,
  };

  const base = {
    clienteId: 'cliente-uuid-123',
    estado: 'cotizacion' as const,
    items: [itemBase],
    descuentoPorcentaje: 0,
    pagoAdelantado: 0,
  };

  it('acepta una orden válida', () => {
    expect(OrdenFormSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza orden sin clienteId', () => {
    const result = OrdenFormSchema.safeParse({ ...base, clienteId: '' });
    expect(result.success).toBe(false);
  });

  it('rechaza orden sin ítems', () => {
    const result = OrdenFormSchema.safeParse({ ...base, items: [] });
    expect(result.success).toBe(false);
  });

  it('rechaza estado inválido', () => {
    const result = OrdenFormSchema.safeParse({ ...base, estado: 'pendiente' });
    expect(result.success).toBe(false);
  });

  it('rechaza descuento mayor a 100', () => {
    const result = OrdenFormSchema.safeParse({ ...base, descuentoPorcentaje: 101 });
    expect(result.success).toBe(false);
  });

  it('rechaza descuento negativo', () => {
    const result = OrdenFormSchema.safeParse({ ...base, descuentoPorcentaje: -5 });
    expect(result.success).toBe(false);
  });

  it('rechaza ítem con nombre vacío', () => {
    const result = OrdenFormSchema.safeParse({
      ...base,
      items: [{ ...itemBase, nombreItem: '' }],
    });
    expect(result.success).toBe(false);
  });

  it('rechaza ítem con cantidad negativa', () => {
    const result = OrdenFormSchema.safeParse({
      ...base,
      items: [{ ...itemBase, cantidad: -1 }],
    });
    expect(result.success).toBe(false);
  });
});

// ============================================
// MovimientoFormSchema
// ============================================

describe('MovimientoFormSchema', () => {
  const base = {
    productoId: 'prod-uuid-456',
    tipo: 'compra' as const,
    cantidad: 500,
  };

  it('acepta un movimiento válido', () => {
    expect(MovimientoFormSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza tipo de movimiento inválido', () => {
    const result = MovimientoFormSchema.safeParse({ ...base, tipo: 'venta' });
    expect(result.success).toBe(false);
  });

  it('acepta todos los tipos válidos', () => {
    for (const tipo of ['compra', 'uso', 'merma', 'ajuste_entrada', 'ajuste_salida']) {
      expect(MovimientoFormSchema.safeParse({ ...base, tipo }).success).toBe(true);
    }
  });

  it('rechaza cantidad de 0', () => {
    const result = MovimientoFormSchema.safeParse({ ...base, cantidad: 0 });
    expect(result.success).toBe(false);
  });

  it('rechaza costo unitario negativo', () => {
    const result = MovimientoFormSchema.safeParse({ ...base, costoUnitario: -1 });
    expect(result.success).toBe(false);
  });

  it('acepta costo unitario de 0', () => {
    const result = MovimientoFormSchema.safeParse({ ...base, costoUnitario: 0 });
    expect(result.success).toBe(true);
  });
});

// ============================================
// UnidadMedidaFormSchema
// ============================================

describe('UnidadMedidaFormSchema', () => {
  const base = {
    nombre: 'kilogramos',
    simbolo: 'kg',
    tipo: 'peso' as const,
  };

  it('acepta una unidad de medida válida', () => {
    expect(UnidadMedidaFormSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza nombre vacío', () => {
    const result = UnidadMedidaFormSchema.safeParse({ ...base, nombre: '' });
    expect(result.success).toBe(false);
  });

  it('rechaza símbolo vacío', () => {
    const result = UnidadMedidaFormSchema.safeParse({ ...base, simbolo: '' });
    expect(result.success).toBe(false);
  });

  it('rechaza tipo inválido', () => {
    const result = UnidadMedidaFormSchema.safeParse({ ...base, tipo: 'temperatura' });
    expect(result.success).toBe(false);
  });

  it('acepta todos los tipos válidos', () => {
    for (const tipo of ['peso', 'volumen', 'cantidad', 'otro']) {
      expect(UnidadMedidaFormSchema.safeParse({ ...base, tipo }).success).toBe(true);
    }
  });
});

// ============================================
// CategoriaFormSchema
// ============================================

describe('CategoriaFormSchema', () => {
  const base = { nombre: 'Tortas', tipo: 'receta' as const };

  it('acepta una categoría válida', () => {
    expect(CategoriaFormSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza nombre vacío', () => {
    const result = CategoriaFormSchema.safeParse({ nombre: '', tipo: 'receta' });
    expect(result.success).toBe(false);
  });

  it('rechaza tipo inválido', () => {
    const result = CategoriaFormSchema.safeParse({ ...base, tipo: 'otro' });
    expect(result.success).toBe(false);
  });

  it('acepta color hexadecimal válido', () => {
    const result = CategoriaFormSchema.safeParse({ ...base, color: '#FF5733' });
    expect(result.success).toBe(true);
  });

  it('rechaza color con formato inválido', () => {
    const result = CategoriaFormSchema.safeParse({ ...base, color: 'rojo' });
    expect(result.success).toBe(false);
  });

  it('acepta color vacío (string vacío)', () => {
    const result = CategoriaFormSchema.safeParse({ ...base, color: '' });
    expect(result.success).toBe(true);
  });
});

// ============================================
// ConfiguracionFormSchema
// ============================================

describe('ConfiguracionFormSchema', () => {
  const base = {
    costoPorHoraDefecto: 10,
    moneda: 'USD',
  };

  it('acepta una configuración válida', () => {
    expect(ConfiguracionFormSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza costoPorHoraDefecto negativo', () => {
    const result = ConfiguracionFormSchema.safeParse({ ...base, costoPorHoraDefecto: -1 });
    expect(result.success).toBe(false);
  });

  it('acepta costoPorHoraDefecto de 0', () => {
    const result = ConfiguracionFormSchema.safeParse({ ...base, costoPorHoraDefecto: 0 });
    expect(result.success).toBe(true);
  });

  it('rechaza moneda vacía', () => {
    const result = ConfiguracionFormSchema.safeParse({ ...base, moneda: '' });
    expect(result.success).toBe(false);
  });

  it('rechaza tasa de cambio negativa o cero', () => {
    expect(ConfiguracionFormSchema.safeParse({ ...base, tasaCambioUSD: 0 }).success).toBe(false);
    expect(ConfiguracionFormSchema.safeParse({ ...base, tasaCambioUSD: -5 }).success).toBe(false);
  });

  it('acepta tasa de cambio positiva', () => {
    const result = ConfiguracionFormSchema.safeParse({ ...base, tasaCambioUSD: 50 });
    expect(result.success).toBe(true);
  });
});
