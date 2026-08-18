import {
  sonUnidadesCompatibles,
  convertirUnidad,
  normalizarUnidad,
  obtenerSimboloUnidad,
  formatearCantidadConUnidad,
} from '@/lib/conversiones';
import { UnidadMedida } from '@/types';

// ============================================
// sonUnidadesCompatibles
// ============================================

describe('sonUnidadesCompatibles', () => {
  it('reconoce unidades de peso como compatibles', () => {
    expect(sonUnidadesCompatibles(UnidadMedida.GRAMOS, UnidadMedida.KILOGRAMOS)).toBe(true);
    expect(sonUnidadesCompatibles(UnidadMedida.KILOGRAMOS, UnidadMedida.ONZAS)).toBe(true);
    expect(sonUnidadesCompatibles(UnidadMedida.GRAMOS, UnidadMedida.ONZAS)).toBe(true);
  });

  it('reconoce unidades de volumen como compatibles', () => {
    expect(sonUnidadesCompatibles(UnidadMedida.LITROS, UnidadMedida.MILILITROS)).toBe(true);
    expect(sonUnidadesCompatibles(UnidadMedida.MILILITROS, UnidadMedida.LITROS)).toBe(true);
  });

  it('reconoce la misma unidad como compatible', () => {
    expect(sonUnidadesCompatibles(UnidadMedida.GRAMOS, UnidadMedida.GRAMOS)).toBe(true);
    expect(sonUnidadesCompatibles(UnidadMedida.LITROS, UnidadMedida.LITROS)).toBe(true);
  });

  it('rechaza combinación peso/volumen', () => {
    expect(sonUnidadesCompatibles(UnidadMedida.GRAMOS, UnidadMedida.LITROS)).toBe(false);
    expect(sonUnidadesCompatibles(UnidadMedida.KILOGRAMOS, UnidadMedida.MILILITROS)).toBe(false);
  });

  it('rechaza combinación peso/cantidad', () => {
    expect(sonUnidadesCompatibles(UnidadMedida.GRAMOS, UnidadMedida.UNIDAD)).toBe(false);
  });

  it('rechaza combinación volumen/cantidad', () => {
    expect(sonUnidadesCompatibles(UnidadMedida.LITROS, UnidadMedida.UNIDAD)).toBe(false);
  });
});

// ============================================
// convertirUnidad
// ============================================

describe('convertirUnidad', () => {
  it('retorna la misma cantidad cuando las unidades son iguales', () => {
    const resultado = convertirUnidad(500, UnidadMedida.GRAMOS, UnidadMedida.GRAMOS);
    expect(resultado.exitoso).toBe(true);
    expect(resultado.valorConvertido).toBe(500);
  });

  it('convierte gramos a kilogramos correctamente', () => {
    const resultado = convertirUnidad(1000, UnidadMedida.GRAMOS, UnidadMedida.KILOGRAMOS);
    expect(resultado.exitoso).toBe(true);
    expect(resultado.valorConvertido).toBeCloseTo(1);
  });

  it('convierte kilogramos a gramos correctamente', () => {
    const resultado = convertirUnidad(1, UnidadMedida.KILOGRAMOS, UnidadMedida.GRAMOS);
    expect(resultado.exitoso).toBe(true);
    expect(resultado.valorConvertido).toBe(1000);
  });

  it('convierte litros a mililitros correctamente', () => {
    const resultado = convertirUnidad(1, UnidadMedida.LITROS, UnidadMedida.MILILITROS);
    expect(resultado.exitoso).toBe(true);
    expect(resultado.valorConvertido).toBe(1000);
  });

  it('convierte mililitros a litros correctamente', () => {
    const resultado = convertirUnidad(500, UnidadMedida.MILILITROS, UnidadMedida.LITROS);
    expect(resultado.exitoso).toBe(true);
    expect(resultado.valorConvertido).toBeCloseTo(0.5);
  });

  it('convierte gramos a onzas correctamente', () => {
    const resultado = convertirUnidad(100, UnidadMedida.GRAMOS, UnidadMedida.ONZAS);
    expect(resultado.exitoso).toBe(true);
    expect(resultado.valorConvertido).toBeCloseTo(3.5274, 3);
  });

  it('retorna error cuando las unidades son incompatibles', () => {
    const resultado = convertirUnidad(100, UnidadMedida.GRAMOS, UnidadMedida.LITROS);
    expect(resultado.exitoso).toBe(false);
    expect(resultado.error).toBeDefined();
  });

  it('retorna error para combinación peso/cantidad', () => {
    const resultado = convertirUnidad(100, UnidadMedida.GRAMOS, UnidadMedida.UNIDAD);
    expect(resultado.exitoso).toBe(false);
    expect(resultado.error).toBeDefined();
  });
});

// ============================================
// normalizarUnidad
// ============================================

describe('normalizarUnidad', () => {
  it('normaliza kilogramos a gramos', () => {
    expect(normalizarUnidad(2, UnidadMedida.KILOGRAMOS)).toBeCloseTo(2000);
  });

  it('normaliza onzas a gramos', () => {
    expect(normalizarUnidad(1, UnidadMedida.ONZAS)).toBeCloseTo(28.3495, 3);
  });

  it('gramos ya están en unidad base', () => {
    expect(normalizarUnidad(500, UnidadMedida.GRAMOS)).toBe(500);
  });

  it('normaliza litros a litros (unidad base de volumen)', () => {
    expect(normalizarUnidad(2, UnidadMedida.LITROS)).toBe(2);
  });

  it('normaliza mililitros a litros', () => {
    expect(normalizarUnidad(500, UnidadMedida.MILILITROS)).toBeCloseTo(0.5);
  });

  it('mantiene unidades de cantidad sin conversión', () => {
    expect(normalizarUnidad(10, UnidadMedida.UNIDAD)).toBe(10);
  });
});

// ============================================
// obtenerSimboloUnidad
// ============================================

describe('obtenerSimboloUnidad', () => {
  it('retorna el símbolo correcto para gramos', () => {
    expect(obtenerSimboloUnidad(UnidadMedida.GRAMOS)).toBe('g');
  });

  it('retorna el símbolo correcto para kilogramos', () => {
    expect(obtenerSimboloUnidad(UnidadMedida.KILOGRAMOS)).toBe('kg');
  });

  it('retorna el símbolo correcto para onzas', () => {
    expect(obtenerSimboloUnidad(UnidadMedida.ONZAS)).toBe('oz');
  });

  it('retorna el símbolo correcto para litros', () => {
    expect(obtenerSimboloUnidad(UnidadMedida.LITROS)).toBe('l');
  });

  it('retorna el símbolo correcto para mililitros', () => {
    expect(obtenerSimboloUnidad(UnidadMedida.MILILITROS)).toBe('ml');
  });

  it('retorna el símbolo correcto para unidad', () => {
    expect(obtenerSimboloUnidad(UnidadMedida.UNIDAD)).toBe('u');
  });
});

// ============================================
// formatearCantidadConUnidad
// ============================================

describe('formatearCantidadConUnidad', () => {
  it('formatea cantidad con unidad correctamente', () => {
    expect(formatearCantidadConUnidad(500, UnidadMedida.GRAMOS)).toBe('500.00 g');
  });

  it('formatea con decimales personalizados', () => {
    expect(formatearCantidadConUnidad(1.5, UnidadMedida.KILOGRAMOS, 1)).toBe('1.5 kg');
  });

  it('formatea mililitros correctamente', () => {
    expect(formatearCantidadConUnidad(250, UnidadMedida.MILILITROS, 0)).toBe('250 ml');
  });

  it('formatea litros correctamente', () => {
    expect(formatearCantidadConUnidad(2.5, UnidadMedida.LITROS)).toBe('2.50 l');
  });
});
