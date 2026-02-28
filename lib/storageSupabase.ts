import { supabase } from './supabase';
import { Producto, Receta, ConfiguracionGlobal } from '@/types';

// ============================================
// PRODUCTOS
// ============================================

export const obtenerProductos = async (): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }

  return (data || []).map(mapProductoFromDB);
};

export const obtenerProductoPorId = async (id: string): Promise<Producto | null> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener producto:', error);
    return null;
  }

  return data ? mapProductoFromDB(data) : null;
};

export const guardarProducto = async (producto: Producto) => {
  const productoData = mapProductoToDB(producto);

  // Verificar si existe
  const { data: existing } = await supabase
    .from('productos')
    .select('id')
    .eq('id', producto.id)
    .single();

  if (existing) {
    // Actualizar
    const { error } = await supabase
      .from('productos')
      .update(productoData)
      .eq('id', producto.id);

    if (error) {
      console.error('Error al actualizar producto:', error);
      return { exitoso: false, error: error.message };
    }
  } else {
    // Insertar
    const { error } = await supabase
      .from('productos')
      .insert([productoData]);

    if (error) {
      console.error('Error al crear producto:', error);
      return { exitoso: false, error: error.message };
    }
  }

  return { exitoso: true };
};

export const eliminarProducto = async (id: string) => {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar producto:', error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true };
};

// ============================================
// RECETAS
// ============================================

export const obtenerRecetas = async (): Promise<Receta[]> => {
  const { data, error } = await supabase
    .from('recetas')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  if (error) {
    console.error('Error al obtener recetas:', error);
    return [];
  }

  return (data || []).map(mapRecetaFromDB);
};

export const obtenerRecetaPorId = async (id: string): Promise<Receta | null> => {
  const { data, error } = await supabase
    .from('recetas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener receta:', error);
    return null;
  }

  return data ? mapRecetaFromDB(data) : null;
};

export const guardarReceta = async (receta: Receta) => {
  const recetaData = mapRecetaToDB(receta);

  // Verificar si existe
  const { data: existing } = await supabase
    .from('recetas')
    .select('id')
    .eq('id', receta.id)
    .single();

  if (existing) {
    // Actualizar
    const { error } = await supabase
      .from('recetas')
      .update(recetaData)
      .eq('id', receta.id);

    if (error) {
      console.error('Error al actualizar receta:', error);
      return { exitoso: false, error: error.message };
    }
  } else {
    // Insertar
    const { error } = await supabase
      .from('recetas')
      .insert([recetaData]);

    if (error) {
      console.error('Error al crear receta:', error);
      return { exitoso: false, error: error.message };
    }
  }

  return { exitoso: true };
};

export const eliminarReceta = async (id: string) => {
  const { error } = await supabase
    .from('recetas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar receta:', error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true };
};

// ============================================
// CONFIGURACIÓN
// ============================================

export const obtenerConfiguracion = async (): Promise<ConfiguracionGlobal | null> => {
  const { data, error } = await supabase
    .from('configuracion')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error al obtener configuración:', error);
    return null;
  }

  return data ? mapConfiguracionFromDB(data) : null;
};

export const guardarConfiguracion = async (config: ConfiguracionGlobal) => {
  const configData = mapConfiguracionToDB(config);

  // Verificar si existe alguna configuración
  const { data: existing } = await supabase
    .from('configuracion')
    .select('id')
    .limit(1)
    .single();

  if (existing) {
    // Actualizar la existente
    const { error } = await supabase
      .from('configuracion')
      .update(configData)
      .eq('id', existing.id);

    if (error) {
      console.error('Error al actualizar configuración:', error);
      return { exitoso: false, error: error.message };
    }
  } else {
    // Insertar nueva
    const { error } = await supabase
      .from('configuracion')
      .insert([configData]);

    if (error) {
      console.error('Error al crear configuración:', error);
      return { exitoso: false, error: error.message };
    }
  }

  return { exitoso: true };
};

// ============================================
// MAPPERS (DB <-> App)
// ============================================

function mapProductoFromDB(data: any): Producto {
  return {
    id: data.id,
    nombre: data.nombre,
    precioTotal: parseFloat(data.precio_total),
    cantidadTotal: parseFloat(data.cantidad_total),
    unidadMedida: data.unidad_medida,
    precioPorUnidad: parseFloat(data.precio_por_unidad),
    categoria: data.categoria || '',
    proveedor: data.proveedor || '',
    notas: data.notas || '',
    fechaCreacion: new Date(data.created_at),
    fechaActualizacion: new Date(data.fecha_actualizacion),
  };
}

function mapProductoToDB(producto: Producto) {
  return {
    id: producto.id,
    nombre: producto.nombre,
    precio_total: producto.precioTotal,
    cantidad_total: producto.cantidadTotal,
    unidad_medida: producto.unidadMedida,
    precio_por_unidad: producto.precioPorUnidad,
    categoria: producto.categoria || null,
    proveedor: producto.proveedor || null,
    notas: producto.notas || null,
    created_at: producto.fechaCreacion.toISOString(),
    fecha_actualizacion: producto.fechaActualizacion.toISOString(),
  };
}

function mapRecetaFromDB(data: any): Receta {
  return {
    id: data.id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    materiales: data.materiales || [],
    rendimiento: data.rendimiento ? parseFloat(data.rendimiento) : undefined,
    unidadRendimiento: data.unidad_rendimiento || undefined,
    tiempoPreparacion: data.tiempo_preparacion,
    costoPorHora: parseFloat(data.costo_por_hora),
    costoManoObra: parseFloat(data.costo_mano_obra),
    costoMateriales: parseFloat(data.costo_materiales),
    costoTotal: parseFloat(data.costo_total),
    margenGanancia: data.margen_ganancia ? parseFloat(data.margen_ganancia) : undefined,
    precioVentaSugerido: data.precio_venta_sugerido ? parseFloat(data.precio_venta_sugerido) : undefined,
    categoria: data.categoria || undefined,
    imagen: data.imagen || undefined,
    notas: data.notas || undefined,
    fechaCreacion: new Date(data.fecha_creacion),
    fechaActualizacion: new Date(data.fecha_actualizacion),
  };
}

function mapRecetaToDB(receta: Receta) {
  return {
    id: receta.id,
    nombre: receta.nombre,
    descripcion: receta.descripcion,
    materiales: receta.materiales,
    rendimiento: receta.rendimiento || null,
    unidad_rendimiento: receta.unidadRendimiento || null,
    tiempo_preparacion: receta.tiempoPreparacion,
    costo_por_hora: receta.costoPorHora,
    costo_mano_obra: receta.costoManoObra,
    costo_materiales: receta.costoMateriales,
    costo_total: receta.costoTotal,
    margen_ganancia: receta.margenGanancia || null,
    precio_venta_sugerido: receta.precioVentaSugerido || null,
    categoria: receta.categoria || null,
    imagen: receta.imagen || null,
    notas: receta.notas || null,
    fecha_creacion: receta.fechaCreacion.toISOString(),
    fecha_actualizacion: receta.fechaActualizacion.toISOString(),
  };
}

function mapConfiguracionFromDB(data: any): ConfiguracionGlobal {
  return {
    id: data.id,
    costoPorHoraDefecto: parseFloat(data.costo_por_hora_defecto),
    moneda: data.moneda,
    margenGananciaDefecto: parseFloat(data.margen_ganancia_defecto),
    ultimaActualizacion: new Date(data.updated_at),
  };
}

function mapConfiguracionToDB(config: ConfiguracionGlobal) {
  return {
    costo_por_hora_defecto: config.costoPorHoraDefecto,
    moneda: config.moneda,
    margen_ganancia_defecto: config.margenGananciaDefecto,
  };
}

// ============================================
// UTILIDADES
// ============================================

export const generarId = (prefijo: string = ''): string => {
  return crypto.randomUUID();
};
