import { Producto, Receta } from '@/types';

export interface EstadisticasGenerales {
  totalProductos: number;
  totalRecetas: number;
  costoPromedioReceta: number;
  recetaMasCostosa: Receta | null;
  recetaMasEconomica: Receta | null;
  productosPorCategoria: { categoria: string; cantidad: number }[];
  recetasPorCategoria: { categoria: string; cantidad: number }[];
}

export const calcularEstadisticas = (
  productos: Producto[],
  recetas: Receta[]
): EstadisticasGenerales => {
  // Productos por categoría
  const productosPorCategoria = productos.reduce((acc, producto) => {
    const categoria = producto.categoria || 'Sin categoría';
    const existing = acc.find(item => item.categoria === categoria);
    if (existing) {
      existing.cantidad++;
    } else {
      acc.push({ categoria, cantidad: 1 });
    }
    return acc;
  }, [] as { categoria: string; cantidad: number }[]);

  // Recetas por categoría
  const recetasPorCategoria = recetas.reduce((acc, receta) => {
    const categoria = receta.categoria || 'Sin categoría';
    const existing = acc.find(item => item.categoria === categoria);
    if (existing) {
      existing.cantidad++;
    } else {
      acc.push({ categoria, cantidad: 1 });
    }
    return acc;
  }, [] as { categoria: string; cantidad: number }[]);

  // Costo promedio de recetas
  const costoPromedioReceta = recetas.length > 0
    ? recetas.reduce((sum, r) => sum + r.costoTotal, 0) / recetas.length
    : 0;

  // Receta más costosa
  const recetaMasCostosa = recetas.length > 0
    ? recetas.reduce((max, r) => r.costoTotal > max.costoTotal ? r : max)
    : null;

  // Receta más económica
  const recetaMasEconomica = recetas.length > 0
    ? recetas.reduce((min, r) => r.costoTotal < min.costoTotal ? r : min)
    : null;

  return {
    totalProductos: productos.length,
    totalRecetas: recetas.length,
    costoPromedioReceta,
    recetaMasCostosa,
    recetaMasEconomica,
    productosPorCategoria: productosPorCategoria.sort((a, b) => b.cantidad - a.cantidad),
    recetasPorCategoria: recetasPorCategoria.sort((a, b) => b.cantidad - a.cantidad),
  };
};

export const calcularValorInventario = (productos: Producto[]): number => {
  return productos.reduce((total, producto) => total + producto.precioTotal, 0);
};

export const calcularCostoTotalRecetas = (recetas: Receta[]): number => {
  return recetas.reduce((total, receta) => total + receta.costoTotal, 0);
};

export const obtenerProductosMasUsados = (recetas: Receta[], productos: Producto[], limit: number = 5) => {
  const conteoProductos = new Map<string, { producto: Producto; veces: number }>();

  recetas.forEach(receta => {
    receta.materiales.forEach(material => {
      const producto = productos.find(p => p.id === material.productoId);
      if (producto) {
        const existing = conteoProductos.get(producto.id);
        if (existing) {
          existing.veces++;
        } else {
          conteoProductos.set(producto.id, { producto, veces: 1 });
        }
      }
    });
  });

  return Array.from(conteoProductos.values())
    .sort((a, b) => b.veces - a.veces)
    .slice(0, limit);
};
