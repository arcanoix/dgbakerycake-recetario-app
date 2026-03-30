import {
  convertirUSDaBS,
  convertirBSaUSD,
  formatearUSD,
  formatearBS,
  calcularPrecioConversion,
} from '@/lib/currency';

// ============================================
// convertirUSDaBS
// ============================================

describe('convertirUSDaBS', () => {
  it('convierte USD a bolívares correctamente', () => {
    expect(convertirUSDaBS(10, 50)).toBe(500);
  });

  it('retorna 0 cuando el valor en USD es 0', () => {
    expect(convertirUSDaBS(0, 50)).toBe(0);
  });

  it('maneja tasas de cambio decimales', () => {
    expect(convertirUSDaBS(1, 36.5)).toBeCloseTo(36.5);
  });
});

// ============================================
// convertirBSaUSD
// ============================================

describe('convertirBSaUSD', () => {
  it('convierte bolívares a USD correctamente', () => {
    expect(convertirBSaUSD(500, 50)).toBe(10);
  });

  it('retorna 0 cuando el valor en bolívares es 0', () => {
    expect(convertirBSaUSD(0, 50)).toBe(0);
  });

  it('es la operación inversa de convertirUSDaBS', () => {
    const usd = 25;
    const tasa = 40;
    const bs = convertirUSDaBS(usd, tasa);
    expect(convertirBSaUSD(bs, tasa)).toBeCloseTo(usd);
  });
});

// ============================================
// formatearUSD
// ============================================

describe('formatearUSD', () => {
  it('formatea un valor en dólares', () => {
    const resultado = formatearUSD(10);
    expect(resultado).toContain('10');
    expect(resultado).toMatch(/\$|USD/);
  });

  it('incluye dos decimales', () => {
    const resultado = formatearUSD(10);
    expect(resultado).toMatch(/10[.,]00/);
  });

  it('maneja valores decimales', () => {
    const resultado = formatearUSD(9.99);
    expect(resultado).toContain('9');
    expect(resultado).toContain('99');
  });
});

// ============================================
// formatearBS
// ============================================

describe('formatearBS', () => {
  it('formatea un valor en bolívares', () => {
    const resultado = formatearBS(500);
    expect(resultado).toContain('500');
  });

  it('incluye dos decimales', () => {
    const resultado = formatearBS(500);
    expect(resultado).toMatch(/500[.,]00/);
  });
});

// ============================================
// calcularPrecioConversion
// ============================================

describe('calcularPrecioConversion', () => {
  it('retorna el objeto de conversión completo', () => {
    const resultado = calcularPrecioConversion(10, 50);
    expect(resultado.usd).toBe(10);
    expect(resultado.bs).toBe(500);
    expect(resultado.usdFormateado).toBeDefined();
    expect(resultado.bsFormateado).toBeDefined();
    expect(resultado.dualFormateado).toBeDefined();
  });

  it('el campo bs es el resultado de convertirUSDaBS', () => {
    const resultado = calcularPrecioConversion(10, 50);
    expect(resultado.bs).toBe(convertirUSDaBS(10, 50));
  });

  it('dualFormateado contiene ambas monedas', () => {
    const resultado = calcularPrecioConversion(10, 50);
    // Debe contener el valor en USD y BS
    expect(resultado.dualFormateado).toContain('10');
    expect(resultado.dualFormateado).toContain('500');
  });
});
