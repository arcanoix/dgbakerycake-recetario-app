import { supabase } from './supabase';
import { Producto, Receta, ConfiguracionGlobal, UnidadMedidaAdmin, CategoriaAdmin, GastoFijo, TotalesGastosFijos } from '@/types';
import { registrarActividad, registrarErrorSistema } from './subscriptionStorage';
import {
  ProductoFormSchema,
  RecetaFormSchema,
  ConfiguracionFormSchema,
  UnidadMedidaFormSchema,
  CategoriaFormSchema,
  GastoFijoFormSchema,
} from './validators';
import { sanitizeStringFields } from './sanitize';

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
    throw error;
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
  // Validate and sanitize user-supplied text fields before writing to Supabase
  const sanitized = sanitizeStringFields({
    nombre: producto.nombre,
    unidadMedida: producto.unidadMedida,
    categoria: producto.categoria,
    proveedor: producto.proveedor,
    notas: producto.notas,
  });

  const parsed = ProductoFormSchema.safeParse({
    ...sanitized,
    precioTotal: producto.precioTotal,
    tamañoPresentacion: producto.tamañoPresentacion,
    cantidadPresentaciones: producto.cantidadPresentaciones,
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Datos de producto inválidos';
    return { exitoso: false, error: msg };
  }

  const productoData = mapProductoToDB({
    ...producto,
    ...parsed.data,
  });

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
    throw error;
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
  // Obtener usuario autenticado (necesario para satisfacer las políticas RLS)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { exitoso: false, error: 'Usuario no autenticado' };
  }

  // Validate and sanitize user-supplied text fields before writing to Supabase
  const sanitized = sanitizeStringFields({
    nombre: receta.nombre,
    descripcion: receta.descripcion,
    unidadRendimiento: receta.unidadRendimiento,
    categoria: receta.categoria,
    imagen: receta.imagen,
    notas: receta.notas,
  });

  const parsed = RecetaFormSchema.safeParse({
    ...sanitized,
    rendimiento: receta.rendimiento,
    cantidadHoras: receta.cantidadHoras,
    margenGanancia: receta.margenGanancia,
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Datos de receta inválidos';
    return { exitoso: false, error: msg };
  }

  const recetaData = mapRecetaToDB({
    ...receta,
    ...parsed.data,
  }, user.id);

  // Verificar si existe
  const { data: existing } = await supabase
    .from('recetas')
    .select('id')
    .eq('id', receta.id)
    .maybeSingle();

  if (existing) {
    // Actualizar — excluir fecha_creacion y user_id para no pisar valores originales
    const { id: _id, fecha_creacion: _fc, user_id: _uid, ...updatePayload } = recetaData;
    const { data: updated, error } = await supabase
      .from('recetas')
      .update(updatePayload)
      .eq('id', receta.id)
      .select('id');

    if (error) {
      registrarErrorSistema(`Error al actualizar receta: ${String(error)}`).catch(() => {});
      return { exitoso: false, error: error.message };
    }
    if (!updated || updated.length === 0) {
      registrarErrorSistema(`UPDATE de receta sin filas afectadas: id=${receta.id}`).catch(() => {});
      return { exitoso: false, error: 'No se pudo actualizar la receta. Verifica que tienes permiso para editarla.' };
    }
    registrarActividad('update', 'recetas', `Receta actualizada: ${receta.nombre}`, receta.id, receta.nombre);
  } else {
    // Insertar (incluye user_id para satisfacer RLS INSERT policy)
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

/**
 * Recalcula la mano de obra de todas las recetas del usuario autenticado
 * cuando cambia el costo por hora en la configuración global.
 * Mantiene materiales, gastos fijos y margen intactos. Recalcula:
 *   costoPorHora, costoManoObra, costoTotal, precioVentaSugerido, fecha_actualizacion.
 */
export const recalcularManoObraRecetas = async (
  nuevoCostoPorHora: number
): Promise<{ exitoso: boolean; actualizadas: number; error?: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { exitoso: false, actualizadas: 0, error: 'Usuario no autenticado' };
  }

  // Las políticas RLS ya filtran por user_id, pero filtramos explícito por seguridad.
  const { data: recetasDb, error: errorLectura } = await supabase
    .from('recetas')
    .select('id, tiempo_preparacion, costo_materiales, costo_gastos_fijos, margen_ganancia')
    .eq('user_id', user.id);

  if (errorLectura) {
    registrarErrorSistema(`Error al leer recetas para recálculo de mano de obra: ${String(errorLectura)}`).catch(() => {});
    return { exitoso: false, actualizadas: 0, error: errorLectura.message };
  }

  if (!recetasDb || recetasDb.length === 0) {
    return { exitoso: true, actualizadas: 0 };
  }

  const ahoraISO = new Date().toISOString();

  const resultados = await Promise.all(
    recetasDb.map(async (r: any) => {
      const cantidadHoras = parseFloat(r.tiempo_preparacion || 0);
      const costoMateriales = parseFloat(r.costo_materiales || 0);
      const costoGastosFijos = parseFloat(r.costo_gastos_fijos || 0);
      const margenGanancia = r.margen_ganancia !== null && r.margen_ganancia !== undefined
        ? parseFloat(r.margen_ganancia)
        : null;

      const costoManoObra = cantidadHoras > 0 && nuevoCostoPorHora > 0
        ? cantidadHoras * nuevoCostoPorHora
        : 0;
      const costoTotal = costoMateriales + costoManoObra + costoGastosFijos;
      const precioVentaSugerido = margenGanancia && margenGanancia > 0
        ? costoTotal * (1 + margenGanancia / 100)
        : null;

      const { error } = await supabase
        .from('recetas')
        .update({
          costo_por_hora: nuevoCostoPorHora,
          costo_mano_obra: costoManoObra,
          costo_total: costoTotal,
          precio_venta_sugerido: precioVentaSugerido,
          fecha_actualizacion: ahoraISO,
        })
        .eq('id', r.id)
        .eq('user_id', user.id);

      return { id: r.id, ok: !error, error };
    })
  );

  const fallidas = resultados.filter((r) => !r.ok);
  const actualizadas = resultados.length - fallidas.length;

  if (fallidas.length > 0) {
    registrarErrorSistema(
      `Recálculo de mano de obra: ${fallidas.length} recetas fallaron. Primera: ${String(fallidas[0].error)}`
    ).catch(() => {});
    return {
      exitoso: actualizadas > 0,
      actualizadas,
      error: `${fallidas.length} recetas no pudieron actualizarse.`,
    };
  }

  registrarActividad(
    'update',
    'recetas',
    `Mano de obra recalculada en ${actualizadas} recetas (nuevo costo/hora: ${nuevoCostoPorHora})`
  ).catch(() => {});

  return { exitoso: true, actualizadas };
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
    throw error;
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
      registrarErrorSistema(`Error al crear configuración por defecto: ${String(errorCrear)}`).catch(() => {});
      return null;
    }

    return nuevaConfig ? mapConfiguracionFromDB(nuevaConfig) : null;
  }

  return mapConfiguracionFromDB(data);
};

export const guardarConfiguracion = async (config: ConfiguracionGlobal) => {
  // Validate user-supplied fields before writing to Supabase
  const sanitized = sanitizeStringFields({ moneda: config.moneda });

  const parsed = ConfiguracionFormSchema.safeParse({
    moneda: sanitized.moneda,
    costoPorHoraDefecto: config.costoPorHoraDefecto,
    margenGananciaDefecto: config.margenGananciaDefecto,
    tasaCambioUSD: config.tasaCambioUSD,
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Datos de configuración inválidos';
    return { exitoso: false, error: msg };
  }

  const configData = mapConfiguracionToDB({
    ...config,
    ...parsed.data,
  });

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
      registrarErrorSistema(`Error al actualizar configuración: ${String(error)}`).catch(() => {});
      return { exitoso: false, error: error.message };
    }
  } else {
    // Insertar nueva
    const { error } = await supabase
      .from('configuracion')
      .insert([configData]);

    if (error) {
      registrarErrorSistema(`Error al crear configuración: ${String(error)}`).catch(() => {});
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
    cantidadHoras: parseFloat(data.tiempo_preparacion || 0),
    costoPorHora: parseFloat(data.costo_por_hora),
    costoManoObra: parseFloat(data.costo_mano_obra),
    costoGastosFijos: parseFloat(data.costo_gastos_fijos || 0),
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

function mapRecetaToDB(receta: Receta, userId?: string) {
  return {
    id: receta.id,
    nombre: receta.nombre,
    descripcion: receta.descripcion,
    materiales: receta.materiales,
    rendimiento: receta.rendimiento || null,
    unidad_rendimiento: receta.unidadRendimiento || null,
    tiempo_preparacion: receta.cantidadHoras || 0,
    costo_por_hora: receta.costoPorHora,
    costo_mano_obra: receta.costoManoObra,
    costo_gastos_fijos: receta.costoGastosFijos || 0,
    costo_materiales: receta.costoMateriales,
    costo_total: receta.costoTotal,
    margen_ganancia: receta.margenGanancia || null,
    precio_venta_sugerido: receta.precioVentaSugerido || null,
    categoria: receta.categoria || null,
    imagen: receta.imagen || null,
    notas: receta.notas || null,
    fecha_creacion: receta.fechaCreacion.toISOString(),
    fecha_actualizacion: receta.fechaActualizacion.toISOString(),
    ...(userId ? { user_id: userId } : {}),
  };
}

function mapConfiguracionFromDB(data: any): ConfiguracionGlobal {
  return {
    id: data.id,
    costoPorHoraDefecto: parseFloat(data.costo_por_hora_defecto),
    moneda: data.moneda,
    margenGananciaDefecto: parseFloat(data.margen_ganancia_defecto),
    tasaCambioUSD: data.tasa_cambio_usd ? parseFloat(data.tasa_cambio_usd) : undefined,
    porcentajeGastosFijos: data.porcentaje_gastos_fijos ? parseFloat(data.porcentaje_gastos_fijos) : undefined,
    ultimaActualizacion: new Date(data.updated_at),
  };
}

function mapConfiguracionToDB(config: ConfiguracionGlobal) {
  return {
    costo_por_hora_defecto: config.costoPorHoraDefecto,
    moneda: config.moneda,
    margen_ganancia_defecto: config.margenGananciaDefecto,
    tasa_cambio_usd: config.tasaCambioUSD || null,
    porcentaje_gastos_fijos: config.porcentajeGastosFijos || null,
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
    registrarErrorSistema(`Error al obtener unidades: ${String(error)}`).catch(() => {});
    throw error;
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
  // Validate and sanitize user-supplied fields before writing to Supabase
  const sanitized = sanitizeStringFields({
    nombre: unidad.nombre,
    simbolo: unidad.simbolo,
    tipo: unidad.tipo,
    unidadBase: unidad.unidadBase,
  });

  const parsed = UnidadMedidaFormSchema.safeParse({
    ...sanitized,
    factorConversionBase: unidad.factorConversionBase,
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Datos de unidad de medida inválidos';
    return { exitoso: false, error: msg };
  }

  const unidadData = mapUnidadToDB({
    ...unidad,
    ...parsed.data,
  });

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
    registrarErrorSistema(`Error al obtener categorías: ${String(error)}`).catch(() => {});
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

  // Validate and sanitize user-supplied fields before writing to Supabase
  const sanitized = sanitizeStringFields({
    nombre: categoria.nombre,
    tipo: categoria.tipo,
    descripcion: categoria.descripcion,
    color: categoria.color,
  });

  const parsed = CategoriaFormSchema.safeParse(sanitized);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Datos de categoría inválidos';
    return { exitoso: false, error: msg };
  }

  const categoriaDB = mapCategoriaHaciaBD({ ...categoria, ...parsed.data }, user.id);

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
// GASTOS FIJOS
// ============================================

export const obtenerGastosFijos = async (): Promise<GastoFijo[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('gastos_fijos')
    .select('*')
    .eq('user_id', user.id)
    .order('nombre', { ascending: true });

  if (error) {
    registrarErrorSistema(`Error al obtener gastos fijos: ${String(error)}`).catch(() => {});
    throw error;
  }

  return (data || []).map(mapGastoFijoFromDB);
};

export const obtenerGastoFijoPorId = async (id: string): Promise<GastoFijo | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('gastos_fijos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      registrarErrorSistema(`Error al obtener gasto fijo: ${String(error)}`).catch(() => {});
    }
    return null;
  }

  return data ? mapGastoFijoFromDB(data) : null;
};

export const guardarGastoFijo = async (gastoFijo: GastoFijo) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  const sanitized = sanitizeStringFields({
    nombre: gastoFijo.nombre,
  });

  const parsed = GastoFijoFormSchema.safeParse({
    nombre: sanitized.nombre,
    montoMensual: gastoFijo.montoMensual,
    unidadesEstimadas: gastoFijo.unidadesEstimadas,
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Datos de gasto fijo inválidos';
    return { exitoso: false, error: msg };
  }

  const gastoFijoData = {
    id: gastoFijo.id,
    user_id: user.id,
    nombre: parsed.data.nombre,
    monto_mensual: parsed.data.montoMensual,
    unidades_estimadas: parsed.data.unidadesEstimadas,
  };

  const { data: existing } = await supabase
    .from('gastos_fijos')
    .select('id')
    .eq('id', gastoFijo.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('gastos_fijos')
      .update(gastoFijoData)
      .eq('id', gastoFijo.id)
      .eq('user_id', user.id);

    if (error) {
      registrarErrorSistema(`Error al actualizar gasto fijo: ${String(error)}`).catch(() => {});
      return { exitoso: false, error: error.message };
    }
    registrarActividad('update', 'gastos_fijos', `Gasto fijo actualizado: ${gastoFijo.nombre}`, gastoFijo.id, gastoFijo.nombre);
  } else {
    const { error } = await supabase
      .from('gastos_fijos')
      .insert([gastoFijoData]);

    if (error) {
      registrarErrorSistema(`Error al crear gasto fijo: ${String(error)}`).catch(() => {});
      return { exitoso: false, error: error.message };
    }
    registrarActividad('create', 'gastos_fijos', `Gasto fijo creado: ${gastoFijo.nombre}`, gastoFijo.id, gastoFijo.nombre);
  }

  return { exitoso: true };
};

export const eliminarGastoFijo = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exitoso: false, error: 'Usuario no autenticado' };

  const { error } = await supabase
    .from('gastos_fijos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    registrarErrorSistema(`Error al eliminar gasto fijo: ${String(error)}`).catch(() => {});
    return { exitoso: false, error: error.message };
  }

  registrarActividad('delete', 'gastos_fijos', `Gasto fijo eliminado: ${id}`, id);
  return { exitoso: true };
};

export const calcularTotalesGastosFijos = (gastosFijos: GastoFijo[]): TotalesGastosFijos => {
  const totalMontoMensual = gastosFijos.reduce((sum, gf) => sum + gf.montoMensual, 0);
  const totalCostoAsignado = gastosFijos.reduce((sum, gf) => sum + gf.costoAsignado, 0);

  return {
    totalMontoMensual,
    totalCostoAsignado,
  };
};

function mapGastoFijoFromDB(data: any): GastoFijo {
  const montoMensual = parseFloat(data.monto_mensual);
  const unidadesEstimadas = parseFloat(data.unidades_estimadas);
  const costoAsignado = unidadesEstimadas > 0 ? montoMensual / unidadesEstimadas : 0;

  return {
    id: data.id,
    userId: data.user_id,
    nombre: data.nombre,
    montoMensual,
    unidadesEstimadas,
    costoAsignado,
    porcentajeDistribucion: 0, // Se calculará en el frontend con el total
    fechaCreacion: new Date(data.created_at),
    fechaActualizacion: new Date(data.updated_at),
  };
}

// ============================================
// UTILIDADES
// ============================================

export const generarId = (prefijo: string = ''): string => {
  return crypto.randomUUID();
};
