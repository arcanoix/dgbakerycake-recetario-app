import { generarSlug } from '@/lib/blog-utils';

describe('generarSlug', () => {
  it('converts spaces to hyphens', () => {
    expect(generarSlug('Hola Mundo')).toBe('hola-mundo');
  });

  it('lowercases the title', () => {
    expect(generarSlug('REPOSTERÍA FÁCIL')).toBe('reposteria-facil');
  });

  it('removes diacritics (accents)', () => {
    expect(generarSlug('Cómo hacer pasteles')).toBe('como-hacer-pasteles');
  });

  it('removes non-alphanumeric characters except hyphens', () => {
    expect(generarSlug('¡Tutorial #1!')).toBe('tutorial-1');
  });

  it('collapses multiple hyphens into one', () => {
    expect(generarSlug('a  -  b')).toBe('a-b');
  });

  it('trims leading and trailing spaces', () => {
    expect(generarSlug('  mi receta  ')).toBe('mi-receta');
  });

  it('handles empty string', () => {
    expect(generarSlug('')).toBe('');
  });
});
