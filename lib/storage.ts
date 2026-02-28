import {
  Producto,
  Receta,
  ConfiguracionGlobal,
  RespuestaAPI,
} from "@/types";
import { CONFIGURACION_DEFECTO } from "./constants";

// ============================================
// CLAVES DE ALMACENAMIENTO
// ============================================

const STORAGE_KEYS = {
  PRODUCTOS: 'dgbakery_productos',
  RECETAS: 'dgbakery_recetas',
  CONFIGURACION: 'dgbakery_configuracion',
};

// ============================================
// FUNCIONES GENÉRICAS DE STORAGE
// ============================================

const guardarEnStorage = <T>(clave: string, datos: T): void => {
  try {
    localStorage.setItem(clave, JSON.stringify(datos));
  } catch (error) {
    console.error(`Error al guardar en localStorage (${clave}):`, error);
  }
};

const obtenerDeStorage = <T>(clave: string): T | null => {
  try {
    const datos = localStorage.getItem(clave);
    if (!datos) return null;
    return JSON.parse(datos) as T;
  } catch (error) {
    console.error(`Error al leer de localStorage (${clave}):`, error);
    return null;
  }
};

const eliminarDeStorage = (clave: string): void => {
  try {
    localStorage.removeItem(clave);
  } catch (error) {
    console.error(`Error al eliminar de localStorage (${clave}):`, error);
  }
};

// ============================================
// GESTIÓN DE PRODUCTOS
// ============================================

export const obtenerProductos = (): Producto[] => {
  return obtenerDeStorage<Producto[]>(STORAGE_KEYS.PRODUCTOS) || [];
};

export const obtenerProductoPorId = (id: string): Producto | null => {
  const productos = obtenerProductos();
  return productos.find((p) => p.id === id) || null;
};

export const guardarProducto = (producto: Producto): RespuestaAPI<Producto> => {
  try {
    const productos = obtenerProductos();
    const index = productos.findIndex((p) => p.id === producto.id);

    if (index >= 0) {
      // Actualizar producto existente
      productos[index] = {
        ...producto,
        fechaActualizacion: new Date(),
      };
    } else {
      // Agregar nuevo producto
      productos.push({
        ...producto,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });
    }

    guardarEnStorage(STORAGE_KEYS.PRODUCTOS, productos);

    return {
      exitoso: true,
      datos: producto,
      mensaje: index >= 0 ? 'Producto actualizado' : 'Producto creado',
    };
  } catch (error) {
    return {
      exitoso: false,
      error: 'Error al guardar el producto',
    };
  }
};

export const eliminarProducto = (id: string): RespuestaAPI<void> => {
  try {
    const productos = obtenerProductos();
    const productosFiltrados = productos.filter((p) => p.id !== id);

    if (productos.length === productosFiltrados.length) {
      return {
        exitoso: false,
        error: 'Producto no encontrado',
      };
    }

    guardarEnStorage(STORAGE_KEYS.PRODUCTOS, productosFiltrados);

    return {
      exitoso: true,
      mensaje: 'Producto eliminado',
    };
  } catch (error) {
    return {
      exitoso: false,
      error: 'Error al eliminar el producto',
    };
  }
};

// ============================================
// GESTIÓN DE RECETAS
// ============================================

export const obtenerRecetas = (): Receta[] => {
  return obtenerDeStorage<Receta[]>(STORAGE_KEYS.RECETAS) || [];
};

export const obtenerRecetaPorId = (id: string): Receta | null => {
  const recetas = obtenerRecetas();
  return recetas.find((r) => r.id === id) || null;
};

export const guardarReceta = (receta: Receta): RespuestaAPI<Receta> => {
  try {
    const recetas = obtenerRecetas();
    const index = recetas.findIndex((r) => r.id === receta.id);

    if (index >= 0) {
      // Actualizar receta existente
      recetas[index] = {
        ...receta,
        fechaActualizacion: new Date(),
      };
    } else {
      // Agregar nueva receta
      recetas.push({
        ...receta,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });
    }

    guardarEnStorage(STORAGE_KEYS.RECETAS, recetas);

    return {
      exitoso: true,
      datos: receta,
      mensaje: index >= 0 ? 'Receta actualizada' : 'Receta creada',
    };
  } catch (error) {
    return {
      exitoso: false,
      error: 'Error al guardar la receta',
    };
  }
};

export const eliminarReceta = (id: string): RespuestaAPI<void> => {
  try {
    const recetas = obtenerRecetas();
    const recetasFiltradas = recetas.filter((r) => r.id !== id);

    if (recetas.length === recetasFiltradas.length) {
      return {
        exitoso: false,
        error: 'Receta no encontrada',
      };
    }

    guardarEnStorage(STORAGE_KEYS.RECETAS, recetasFiltradas);

    return {
      exitoso: true,
      mensaje: 'Receta eliminada',
    };
  } catch (error) {
    return {
      exitoso: false,
      error: 'Error al eliminar la receta',
    };
  }
};

// ============================================
// GESTIÓN DE CONFIGURACIÓN
// ============================================

export const obtenerConfiguracion = (): ConfiguracionGlobal => {
  const config = obtenerDeStorage<ConfiguracionGlobal>(
    STORAGE_KEYS.CONFIGURACION
  );

  if (!config) {
    // Retornar configuración por defecto
    return {
      id: 'config-default',
      costoPorHoraDefecto: CONFIGURACION_DEFECTO.costoPorHoraDefecto,
      moneda: CONFIGURACION_DEFECTO.moneda,
      margenGananciaDefecto: CONFIGURACION_DEFECTO.margenGananciaDefecto,
      ultimaActualizacion: new Date(),
    };
  }

  return config;
};

export const guardarConfiguracion = (
  config: ConfiguracionGlobal
): RespuestaAPI<ConfiguracionGlobal> => {
  try {
    const configuracionActualizada = {
      ...config,
      ultimaActualizacion: new Date(),
    };

    guardarEnStorage(STORAGE_KEYS.CONFIGURACION, configuracionActualizada);

    return {
      exitoso: true,
      datos: configuracionActualizada,
      mensaje: 'Configuración guardada',
    };
  } catch (error) {
    return {
      exitoso: false,
      error: 'Error al guardar la configuración',
    };
  }
};

// ============================================
// UTILIDADES
// ============================================

export const limpiarTodoElStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach((clave) => {
    eliminarDeStorage(clave);
  });
};

export const exportarDatos = (): string => {
  const datos = {
    productos: obtenerProductos(),
    recetas: obtenerRecetas(),
    configuracion: obtenerConfiguracion(),
    fechaExportacion: new Date().toISOString(),
  };

  return JSON.stringify(datos, null, 2);
};

export const importarDatos = (datosJSON: string): RespuestaAPI<void> => {
  try {
    const datos = JSON.parse(datosJSON);

    if (datos.productos) {
      guardarEnStorage(STORAGE_KEYS.PRODUCTOS, datos.productos);
    }

    if (datos.recetas) {
      guardarEnStorage(STORAGE_KEYS.RECETAS, datos.recetas);
    }

    if (datos.configuracion) {
      guardarEnStorage(STORAGE_KEYS.CONFIGURACION, datos.configuracion);
    }

    return {
      exitoso: true,
      mensaje: 'Datos importados correctamente',
    };
  } catch (error) {
    return {
      exitoso: false,
      error: 'Error al importar los datos. Verifica el formato del archivo.',
    };
  }
};

// ============================================
// GENERADOR DE IDs
// ============================================

export const generarId = (prefijo: string = ''): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return prefijo ? `${prefijo}-${timestamp}-${random}` : `${timestamp}-${random}`;
};
