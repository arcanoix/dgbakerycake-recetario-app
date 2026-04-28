import { supabase } from './supabase';
import { Producto, Receta, ConfiguracionGlobal, UnidadMedidaAdmin, CategoriaAdmin } from '@/types';
import { registrarActividad, registrarErrorSistema } from './subscriptionStorage';

// ============================================
// PRODUCTOS
// ============================================

export const obtenerProductos = async (): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    registrarErrorSistema(`Error al obtener productos: ${String(error)}`).catch(() => {});
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
    // PGRST116 es esperado cuando no se encuentra el registro
    if (error.code !== 'PGRST116') {
      registrarErrorSistema(`Error al obtener producto: ${String(error)}`).catch(() => {});
    }
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
    .maybeSingle();

  if (existing) {
    // Actualizar
    const { error } = await supabase
      .from('productos')
      .update(productoData)
      .eq('id', producto.id);

    if (error) {
      registrarErrorSistema(`Error al actualizar producto: ${String(error)}`).catch(() => {});
      return { exitoso: false, error: error.message };
    }
    registrarActividad('update', 'productos', `Producto actualizado: ${producto.nombre}`, producto.id, producto.nombre);
  } else {
    // Insertar
    const { error } = await supabase
      .from('productos')
      .insert([productoData]);

    if (error) {
      registrarErrorSistema(`Error al crear producto: ${String(error)}`).catch(() => {});
      return { exitoso: false, error: error.message };
    }
    registrarActividad('create', 'productos', `Producto creado: ${producto.nombre}`, producto.id, producto.nombre);
  }

  return { exitoso: true };
};

export const eliminarProducto = async (id: string) => {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) {
    registrarErrorSistema(`Error al eliminar producto: ${String(error)}`).catch(() => {});
    return { exitoso: false, error: error.message };
  }

  registrarActividad('delete', 'productos', `Producto eliminado: ${id}`, id);
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
    registrarErrorSistema(`Error al obtener recetas: ${String(error)}`).catch(() => {});
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
    // PGRST116 es esperado cuando no se encuentra el registro
    if (error.code !== 'PGRST116') {
      registrarErrorSistema(`Error al obtener receta: ${String(error)}`).catch(() => {});
    }
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
    .maybeSingle();

  if (existing) {
    // Actualizar
    const { error } = await supabase
      .from('recetas')
      .update(recetaData)
      .eq('id', receta.id);

    if (error) {
      registrarErrorSistema(`Error al actualizar receta: ${String(error)}`).catch(() => {});
      return { exitoso: false, error: error.message };
    }
    registrarActividad('update', 'recetas', `Receta actualizada: ${receta.nombre}`, receta.id, receta.nombre);
  } else {
    // Insertar
    const { error } = await supabase
      .from('recetas')
      .insert([recetaData]);

    if (error) {
      registrarErrorSistema(`Error al crear receta: ${String(error)}`).catch(() => {});
      return { exitoso: false, error: error.message };
    }
    registrarActividad('create', 'recetas', `Receta creada: ${receta.nombre}`, receta.id, receta.nombre);
  }

  return { exitoso: true };
};

export const eliminarReceta = async (id: string) => {
  const { error } = await supabase
    .from('recetas')
    .delete()
    .eq('id', id);

  if (error) {
    registrarErrorSistema(`Error al eliminar receta: ${String(error)}`).catch(() => {});
    return { exitoso: false, error: error.message };
  }

  registrarActividad('delete', 'recetas', `Receta eliminada: ${id}`, id);
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
    .maybeSingle();

  if (error) {
    registrarErrorSistema(`Error al obtener configuración: ${String(error)}`).catch(() => {});
    return null;
  }

  // Si no existe configuración, crear una por defecto
  if (!data) {
    console.log('No se encontró configuración, creando una por defecto...');
    
    // Obtener la tasa de cambio del último registro existente
    let tasaCambioUSD = 50; // Valor fallback
    const { data: ultimaConfig } = await supabase
      .from('configuracion')
      .select('tasa_cambio_usd')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (ultimaConfig && ultimaConfig.tasa_cambio_usd) {
      tasaCambioUSD = parseFloat(ultimaConfig.tasa_cambio_usd);
      console.log(`Usando tasa de cambio del último registro: ${tasaCambioUSD}`);
    }
    
    const configPorDefecto = {
      costo_por_hora_defecto: 10,
      moneda: 'USD',
      margen_ganancia_defecto: 35,
      tasa_cambio_usd: tasaCambioUSD,
    };

    const { data: nuevaConfig, error: errorCrear } = await supabase
      .from('configuracion')
      .insert([configPorDefecto])
      .select()
      .single();

    if (errorCrear) {
      console.error('Error al crear configuración por defecto:', errorCrear);
      return null;
    }

    return nuevaConfig ? mapConfiguracionFromDB(nuevaConfig) : null;
  }

  return mapConfiguracionFromDB(data);
};

export const guardarConfiguracion = async (config: ConfiguracionGlobal) => {
  const configData = mapConfiguracionToDB(config);

  // Verificar si existe alguna configuración
  const { data: existing } = await supabase
    .from('configuracion')
    .select('id')
    .limit(1)
    .maybeSingle();

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
    tamañoPresentacion: parseFloat(data.tamaño_presentacion || data.cantidad_total || 0),
    cantidadPresentaciones: parseFloat(data.cantidad_presentaciones || 1),
    unidadMedida: data.unidad_medida,
    cantidadTotal: parseFloat(data.cantidad_total),
    precioPorUnidad: parseFloat(data.precio_por_unidad),
    precioPorPresentacion: parseFloat(data.precio_por_presentacion || data.precio_total || 0),
    categoria: data.categoria || '',
    proveedor: data.proveedor || '',
    notas: data.notas || '',
    fechaCreacion: new Date(data.created_at),
    fechaActualizacion: new Date(data.updated_at),
  };
}

function mapProductoToDB(producto: Producto) {
  return {
    id: producto.id,
    nombre: producto.nombre,
    precio_total: producto.precioTotal,
    tamaño_presentacion: producto.tamañoPresentacion,
    cantidad_presentaciones: producto.cantidadPresentaciones,
    cantidad_total: producto.cantidadTotal,
    unidad_medida: producto.unidadMedida,
    precio_por_unidad: producto.precioPorUnidad,
    precio_por_presentacion: producto.precioPorPresentacion,
    categoria: producto.categoria || null,
    proveedor: producto.proveedor || null,
    notas: producto.notas || null,
    created_at: producto.fechaCreacion.toISOString(),
    updated_at: producto.fechaActualizacion.toISOString(),
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
    tasaCambioUSD: data.tasa_cambio_usd ? parseFloat(data.tasa_cambio_usd) : undefined,
    ultimaActualizacion: new Date(data.updated_at),
  };
}

function mapConfiguracionToDB(config: ConfiguracionGlobal) {
  return {
    costo_por_hora_defecto: config.costoPorHoraDefecto,
    moneda: config.moneda,
    margen_ganancia_defecto: config.margenGananciaDefecto,
    tasa_cambio_usd: config.tasaCambioUSD || null,
  };
}

// ============================================
// UNIDADES DE MEDIDA
// ============================================

export const obtenerUnidades = async (): Promise<UnidadMedidaAdmin[]> => {
  const { data, error } = await supabase
    .from('unidades_medida')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener unidades:', error);
    return [];
  }

  return (data || []).map(mapUnidadFromDB);
};

export const obtenerUnidadPorId = async (id: string): Promise<UnidadMedidaAdmin | null> => {
  const { data, error } = await supabase
    .from('unidades_medida')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // PGRST116 es esperado cuando no se encuentra el registro
    if (error.code !== 'PGRST116') {
      console.error('Error al obtener unidad:', error);
    }
    return null;
  }

  return data ? mapUnidadFromDB(data) : null;
};

export const guardarUnidad = async (unidad: UnidadMedidaAdmin) => {
  const unidadData = mapUnidadToDB(unidad);

  const { data: existing } = await supabase
    .from('unidades_medida')
    .select('id')
    .eq('id', unidad.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('unidades_medida')
      .update(unidadData)
      .eq('id', unidad.id);

    if (error) {
      console.error('Error al actualizar unidad:', error);
      return { exitoso: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from('unidades_medida')
      .insert([unidadData]);

    if (error) {
      console.error('Error al crear unidad:', error);
      return { exitoso: false, error: error.message };
    }
  }

  return { exitoso: true };
};

export const eliminarUnidad = async (id: string) => {
  const { error } = await supabase
    .from('unidades_medida')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar unidad:', error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true };
};

function mapUnidadFromDB(data: any): UnidadMedidaAdmin {
  return {
    id: data.id,
    nombre: data.nombre,
    simbolo: data.simbolo,
    tipo: data.tipo,
    factorConversionBase: data.factor_conversion_base ? parseFloat(data.factor_conversion_base) : undefined,
    unidadBase: data.unidad_base || undefined,
    activo: data.activo ?? true,
    fechaCreacion: new Date(data.created_at),
    fechaActualizacion: new Date(data.updated_at),
  };
}

function mapUnidadToDB(unidad: UnidadMedidaAdmin) {
  return {
    id: unidad.id,
    nombre: unidad.nombre,
    simbolo: unidad.simbolo,
    tipo: unidad.tipo,
    factor_conversion_base: unidad.factorConversionBase || null,
    unidad_base: unidad.unidadBase || null,
    activo: unidad.activo,
    created_at: unidad.fechaCreacion.toISOString(),
    updated_at: unidad.fechaActualizacion.toISOString(),
  };
}

// ============================================
// CATEGORÍAS
// ============================================

export const obtenerCategorias = async (): Promise<CategoriaAdmin[]> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("user_id", user.id)
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al obtener categorías:", error);
    throw error;
  }

  return (data || []).map(mapCategoriaDesdeBD);
};

export const obtenerCategoriaPorId = async (id: string): Promise<CategoriaAdmin | null> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error("Error al obtener categoría:", error);
    }
    return null;
  }

  return data ? mapCategoriaDesdeBD(data) : null;
};

export const guardarCategoria = async (categoria: CategoriaAdmin): Promise<{ exitoso: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { exitoso: false, error: "Usuario no autenticado" };
  }

  const categoriaDB = mapCategoriaHaciaBD(categoria, user.id);

  const { error } = await supabase
    .from("categorias")
    .upsert(categoriaDB);

  if (error) {
    console.error("Error al guardar categoría:", error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true };
};

export const eliminarCategoria = async (id: string): Promise<{ exitoso: boolean; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { exitoso: false, error: "Usuario no autenticado" };
  }

  const { error } = await supabase
    .from("categorias")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error al eliminar categoría:", error);
    return { exitoso: false, error: error.message };
  }

  return { exitoso: true };
};

function mapCategoriaDesdeBD(data: any): CategoriaAdmin {
  return {
    id: data.id,
    nombre: data.nombre,
    tipo: data.tipo,
    descripcion: data.descripcion,
    color: data.color,
    activo: data.activo,
    fechaCreacion: new Date(data.created_at),
    fechaActualizacion: new Date(data.updated_at),
  };
}

function mapCategoriaHaciaBD(categoria: CategoriaAdmin, userId: string): any {
  return {
    id: categoria.id,
    user_id: userId,
    nombre: categoria.nombre,
    tipo: categoria.tipo,
    descripcion: categoria.descripcion,
    color: categoria.color,
    activo: categoria.activo,
    created_at: categoria.fechaCreacion.toISOString(),
    updated_at: categoria.fechaActualizacion.toISOString(),
  };
}

// ============================================
// UTILIDADES
// ============================================

export const generarId = (prefijo: string = ''): string => {
  return crypto.randomUUID();
};
