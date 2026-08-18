import {
  calcularPrecioPorUnidad,
  calcularCostoMaterial,
  calcularCostoTotalMateriales,
  calcularCostoManoObra,
  calcularCostoGastosFijos,
  calcularCostoTotalReceta,
  calcularPrecioVentaSugerido,
  calcularCostoPorPorcion,
  calcularPrecioVentaPorPorcion,
  generarDesgloseCostos,
  validarValorNumerico,
  validarProducto,
  redondear,
  calcularPorcentaje,
  calcularMargenGanancia,
} from '@/lib/calculations';
import type { Producto, MaterialReceta, Receta } from '@/types';

// ============================================
// Fixtures
// ============================================

const productoBase: Producto = {
  id: 'prod-1',
  nombre: 'Harina',
  precioTotal: 5,
  tamañoPresentacion: 1000,
  unidadMedida: 'gramos',
  cantidadPresentaciones: 1,
  cantidadTotal: 1000,
  precioPorUnidad: 0.005,
  precioPorPresentacion: 5,
  fechaCreacion: new Date('2024-01-01'),
  fechaActualizacion: new Date('2024-01-01'),
};

const materialBase: MaterialReceta = {
  id: 'mat-1',
  productoId: 'prod-1',
  nombreProducto: 'Harina',
  cantidadUtilizada: 200,
  unidadMedida: 'gramos',
  costoUnitario: 0.005,
  costoMaterial: 1,
};

const recetaBase: Receta = {
  id: 'rec-1',
  nombre: 'Torta de Vainilla',
  descripcion: 'Torta básica de vainilla',
  materiales: [
    { ...materialBase },
    {
      id: 'mat-2',
      productoId: 'prod-2',
      nombreProducto: 'Azúcar',
      cantidadUtilizada: 150,
      unidadMedida: 'gramos',
      costoUnitario: 0.002,
      costoMaterial: 0.3,
    },
  ],
  rendimiento: 8,
  cantidadHoras: 0,
  costoPorHora: 0,
  costoManoObra: 0,
  costoGastosFijos: 0,
  costoMateriales: 1.3,
  costoTotal: 1.3,
  margenGanancia: 30,
  fechaCreacion: new Date('2024-01-01'),
  fechaActualizacion: new Date('2024-01-01'),
};

// ============================================
// calcularPrecioPorUnidad
// ============================================

describe('calcularPrecioPorUnidad', () => {
  it('devuelve el precio por unidad correctamente', () => {
    expect(calcularPrecioPorUnidad(5, 1000)).toBeCloseTo(0.005);
  });

  it('retorna 0 cuando la cantidad total es 0', () => {
    expect(calcularPrecioPorUnidad(5, 0)).toBe(0);
  });

  it('retorna 0 cuando la cantidad total es negativa', () => {
    expect(calcularPrecioPorUnidad(5, -10)).toBe(0);
  });

  it('maneja precio de 0', () => {
    expect(calcularPrecioPorUnidad(0, 500)).toBe(0);
  });
});

// ============================================
// calcularCostoMaterial
// ============================================

describe('calcularCostoMaterial', () => {
  it('calcula el costo del material correctamente', () => {
    const resultado = calcularCostoMaterial(productoBase, 200);
    expect(resultado.costoCalculado).toBeCloseTo(1);
  });

  it('retorna los datos del producto correctamente', () => {
    const resultado = calcularCostoMaterial(productoBase, 500);
    expect(resultado.productoId).toBe('prod-1');
    expect(resultado.nombreProducto).toBe('Harina');
    expect(resultado.cantidadUtilizada).toBe(500);
  });

  it('costo es 0 cuando la cantidad utilizada es 0', () => {
    const resultado = calcularCostoMaterial(productoBase, 0);
    expect(resultado.costoCalculado).toBe(0);
  });
});

// ============================================
// calcularCostoTotalMateriales
// ============================================

describe('calcularCostoTotalMateriales', () => {
  it('suma el costo de todos los materiales', () => {
    const materiales: MaterialReceta[] = [
      { ...materialBase, costoMaterial: 1 },
      { ...materialBase, id: 'mat-2', costoMaterial: 0.5 },
      { ...materialBase, id: 'mat-3', costoMaterial: 2.25 },
    ];
    expect(calcularCostoTotalMateriales(materiales)).toBeCloseTo(3.75);
  });

  it('retorna 0 para lista vacía', () => {
    expect(calcularCostoTotalMateriales([])).toBe(0);
  });

  it('retorna el único costo cuando hay un solo material', () => {
    expect(calcularCostoTotalMateriales([{ ...materialBase, costoMaterial: 2.5 }])).toBeCloseTo(2.5);
  });
});

// ============================================
// calcularCostoManoObra
// ============================================

describe('calcularCostoManoObra', () => {
  it('calcula el costo de mano de obra correctamente', () => {
    // 1 hora * $10/hora = $10
    expect(calcularCostoManoObra(1, 10)).toBeCloseTo(10);
  });

  it('calcula correctamente para tiempo parcial', () => {
    // 0.5 horas * $10/hora = $5
    expect(calcularCostoManoObra(0.5, 10)).toBeCloseTo(5);
  });

  it('retorna 0 cuando las horas son 0', () => {
    expect(calcularCostoManoObra(0, 10)).toBe(0);
  });

  it('retorna 0 cuando el costo por hora es 0', () => {
    expect(calcularCostoManoObra(2, 0)).toBe(0);
  });

  it('retorna 0 cuando las horas son negativas', () => {
    expect(calcularCostoManoObra(-1, 10)).toBe(0);
  });

  it('calcula correctamente con múltiples horas', () => {
    expect(calcularCostoManoObra(3, 15)).toBeCloseTo(45);
  });
});

// ============================================
// calcularCostoGastosFijos
// ============================================

describe('calcularCostoGastosFijos', () => {
  it('calcula el costo de gastos fijos correctamente', () => {
    // Total gastos mensuales $100 * 10% = $10
    expect(calcularCostoGastosFijos(100, 10)).toBeCloseTo(10);
  });

  it('calcula correctamente con porcentaje decimal', () => {
    // Total gastos mensuales $50 * 5.5% = $2.75
    expect(calcularCostoGastosFijos(50, 5.5)).toBeCloseTo(2.75);
  });

  it('retorna 0 cuando el total de gastos es 0', () => {
    expect(calcularCostoGastosFijos(0, 10)).toBe(0);
  });

  it('retorna 0 cuando el porcentaje es 0', () => {
    expect(calcularCostoGastosFijos(100, 0)).toBe(0);
  });

  it('retorna 0 cuando ambos valores son negativos', () => {
    expect(calcularCostoGastosFijos(-100, -10)).toBe(0);
  });
});

// ============================================
// calcularCostoTotalReceta
// ============================================

describe('calcularCostoTotalReceta', () => {
  it('suma el costo de materiales, mano de obra y gastos fijos', () => {
    expect(calcularCostoTotalReceta(10, 5, 3)).toBeCloseTo(18);
  });

  it('retorna el costo de materiales cuando mano de obra y gastos fijos son 0', () => {
    expect(calcularCostoTotalReceta(10, 0, 0)).toBeCloseTo(10);
  });

  it('funciona con valores decimales', () => {
    expect(calcularCostoTotalReceta(1.35, 0.75, 0.50)).toBeCloseTo(2.6);
  });

  it('funciona sin gastos fijos (parámetro opcional)', () => {
    expect(calcularCostoTotalReceta(10, 5)).toBeCloseTo(15);
  });
});

// ============================================
// calcularPrecioVentaSugerido
// ============================================

describe('calcularPrecioVentaSugerido', () => {
  it('aplica el margen de ganancia correctamente', () => {
    // costo $10, margen 30% → $13
    expect(calcularPrecioVentaSugerido(10, 30)).toBeCloseTo(13);
  });

  it('retorna el costo cuando el margen es 0', () => {
    expect(calcularPrecioVentaSugerido(10, 0)).toBeCloseTo(10);
  });

  it('retorna el costo cuando el margen es negativo', () => {
    expect(calcularPrecioVentaSugerido(10, -10)).toBeCloseTo(10);
  });

  it('calcula correctamente con margen del 100%', () => {
    expect(calcularPrecioVentaSugerido(10, 100)).toBeCloseTo(20);
  });
});

// ============================================
// calcularCostoPorPorcion
// ============================================

describe('calcularCostoPorPorcion', () => {
  it('divide el costo total entre el rendimiento', () => {
    expect(calcularCostoPorPorcion(10, 8)).toBeCloseTo(1.25);
  });

  it('retorna el costo total cuando el rendimiento es 0', () => {
    expect(calcularCostoPorPorcion(10, 0)).toBe(10);
  });

  it('retorna el costo total cuando el rendimiento es negativo', () => {
    expect(calcularCostoPorPorcion(10, -4)).toBe(10);
  });
});

// ============================================
// calcularPrecioVentaPorPorcion
// ============================================

describe('calcularPrecioVentaPorPorcion', () => {
  it('divide el precio de venta entre el rendimiento', () => {
    expect(calcularPrecioVentaPorPorcion(13, 8)).toBeCloseTo(1.625);
  });

  it('retorna el precio total cuando el rendimiento es 0', () => {
    expect(calcularPrecioVentaPorPorcion(13, 0)).toBe(13);
  });
});

// ============================================
// generarDesgloseCostos
// ============================================

describe('generarDesgloseCostos', () => {
  it('genera el desglose de costos correctamente', () => {
    const desglose = generarDesgloseCostos(recetaBase);
    expect(desglose.costoMateriales).toBeCloseTo(1.3);
    expect(desglose.costoManoObra).toBe(0);
    expect(desglose.costoTotal).toBeCloseTo(1.3);
  });

  it('calcula el precio de venta sugerido con margen de ganancia', () => {
    const desglose = generarDesgloseCostos(recetaBase);
    // 1.3 * 1.30 = 1.69
    expect(desglose.precioVentaSugerido).toBeCloseTo(1.69);
  });

  it('incluye el desglose de cada material', () => {
    const desglose = generarDesgloseCostos(recetaBase);
    expect(desglose.detallesMateriales).toHaveLength(2);
  });

  it('calcula los porcentajes de cada material sobre el total', () => {
    const desglose = generarDesgloseCostos(recetaBase);
    const totalPorcentaje = desglose.detallesMateriales.reduce(
      (sum, m) => sum + m.porcentaje,
      0
    );
    expect(totalPorcentaje).toBeCloseTo(100);
  });

  it('no incluye precioVentaSugerido cuando no hay margen de ganancia', () => {
    const recetaSinMargen: Receta = { ...recetaBase, margenGanancia: undefined };
    const desglose = generarDesgloseCostos(recetaSinMargen);
    expect(desglose.precioVentaSugerido).toBeUndefined();
  });
});

// ============================================
// validarValorNumerico
// ============================================

describe('validarValorNumerico', () => {
  it('valida un número correcto', () => {
    const resultado = validarValorNumerico(5, 'Precio', 0);
    expect(resultado.valido).toBe(true);
    expect(resultado.error).toBeUndefined();
  });

  it('detecta NaN', () => {
    const resultado = validarValorNumerico(NaN, 'Precio', 0);
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toContain('Precio');
  });

  it('detecta valor por debajo del mínimo', () => {
    const resultado = validarValorNumerico(0, 'Precio', 0.01);
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toContain('0.01');
  });

  it('acepta valor igual al mínimo', () => {
    const resultado = validarValorNumerico(0.01, 'Precio', 0.01);
    expect(resultado.valido).toBe(true);
  });
});

// ============================================
// validarProducto
// ============================================

describe('validarProducto', () => {
  it('valida un producto con datos correctos', () => {
    const resultado = validarProducto(5, 1000);
    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toHaveLength(0);
  });

  it('rechaza precio inválido (cero)', () => {
    const resultado = validarProducto(0, 1000);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.length).toBeGreaterThan(0);
  });

  it('rechaza cantidad inválida (cero)', () => {
    const resultado = validarProducto(5, 0);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.length).toBeGreaterThan(0);
  });

  it('rechaza ambos valores inválidos', () => {
    const resultado = validarProducto(0, 0);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toHaveLength(2);
  });
});

// ============================================
// redondear
// ============================================

describe('redondear', () => {
  it('redondea a 2 decimales por defecto', () => {
    expect(redondear(1.2345)).toBe(1.23);
  });

  it('redondea hacia arriba correctamente', () => {
    expect(redondear(1.2355, 2)).toBe(1.24);
  });

  it('redondea a 0 decimales', () => {
    expect(redondear(1.6, 0)).toBe(2);
  });

  it('funciona con número entero', () => {
    expect(redondear(5, 2)).toBe(5);
  });
});

// ============================================
// calcularPorcentaje
// ============================================

describe('calcularPorcentaje', () => {
  it('calcula el porcentaje correctamente', () => {
    expect(calcularPorcentaje(25, 100)).toBe(25);
  });

  it('retorna 0 cuando el total es 0', () => {
    expect(calcularPorcentaje(10, 0)).toBe(0);
  });

  it('calcula porcentaje fraccionario', () => {
    expect(calcularPorcentaje(1, 3)).toBeCloseTo(33.33, 1);
  });
});

// ============================================
// calcularMargenGanancia
// ============================================

describe('calcularMargenGanancia', () => {
  it('calcula el margen de ganancia correctamente', () => {
    // precio $13, costo $10 → margen 30%
    expect(calcularMargenGanancia(13, 10)).toBeCloseTo(30);
  });

  it('retorna 0 cuando el costo es 0', () => {
    expect(calcularMargenGanancia(13, 0)).toBe(0);
  });

  it('retorna 0 cuando el precio es igual al costo', () => {
    expect(calcularMargenGanancia(10, 10)).toBe(0);
  });

  it('retorna un porcentaje negativo cuando se vende con pérdida', () => {
    expect(calcularMargenGanancia(8, 10)).toBeCloseTo(-20);
  });
});
