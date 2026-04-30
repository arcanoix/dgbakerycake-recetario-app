import { stripHtml, sanitizeStringFields } from '@/lib/sanitize';

// ============================================
// stripHtml
// ============================================

describe('stripHtml', () => {
  it('elimina etiquetas HTML básicas', () => {
    expect(stripHtml('<b>Texto</b>')).toBe('Texto');
  });

  it('elimina etiquetas script (XSS)', () => {
    expect(stripHtml('<script>alert("xss")</script>hola')).toBe('hola');
  });

  it('elimina etiquetas con atributos', () => {
    expect(stripHtml('<a href="https://evil.com">click</a>')).toBe('click');
  });

  it('elimina múltiples etiquetas', () => {
    expect(stripHtml('<p><strong>Hola</strong> mundo</p>')).toBe('Hola mundo');
  });

  it('retorna la cadena sin cambios cuando no hay HTML', () => {
    expect(stripHtml('Torta de Vainilla')).toBe('Torta de Vainilla');
  });

  it('recorta espacios en blanco al inicio y al final', () => {
    expect(stripHtml('  hola  ')).toBe('hola');
  });

  it('maneja cadena vacía', () => {
    expect(stripHtml('')).toBe('');
  });

  it('elimina etiquetas anidadas complejas', () => {
    const input = '<div><ul><li>item</li></ul></div>';
    expect(stripHtml(input)).toBe('item');
  });

  it('preserva el texto entre etiquetas', () => {
    const input = '<p>Harina</p><p>Azúcar</p>';
    expect(stripHtml(input)).toBe('HarinaAzúcar');
  });
});

// ============================================
// sanitizeStringFields
// ============================================

describe('sanitizeStringFields', () => {
  it('limpia cadenas con HTML en un objeto plano', () => {
    const input = { nombre: '<script>alert(1)</script>Receta', notas: 'nota normal' };
    const result = sanitizeStringFields(input);
    expect(result.nombre).toBe('Receta');
    expect(result.notas).toBe('nota normal');
  });

  it('no modifica valores no-string', () => {
    const input = { precio: 10.5, activo: true, fecha: new Date('2024-01-01') };
    const result = sanitizeStringFields(input);
    expect(result.precio).toBe(10.5);
    expect(result.activo).toBe(true);
    expect(result.fecha).toEqual(new Date('2024-01-01'));
  });

  it('maneja campos undefined sin error', () => {
    const input = { nombre: 'Harina', proveedor: undefined };
    const result = sanitizeStringFields(input);
    expect(result.nombre).toBe('Harina');
    expect(result.proveedor).toBeUndefined();
  });

  it('no muta el objeto original', () => {
    const input = { nombre: '<b>original</b>' };
    sanitizeStringFields(input);
    expect(input.nombre).toBe('<b>original</b>');
  });
});
