"use client";

import { useState, useEffect } from "react";
import { CategoriaAdmin, CategoriaFormData, TipoCategoria } from "@/types";
import {
  obtenerCategorias,
  obtenerCategoriaPorId,
  guardarCategoria,
  eliminarCategoria,
  generarId,
} from "@/lib/storageSupabase";

export const useCategorias = () => {
  const [categorias, setCategorias] = useState<CategoriaAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setCargando(true);
      const categoriasStorage = await obtenerCategorias();
      setCategorias(categoriasStorage);
      setError(null);
    } catch (err) {
      setError("Error al cargar las categorías");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const crearCategoria = async (datos: CategoriaFormData): Promise<boolean> => {
    try {
      const nuevaCategoria: CategoriaAdmin = {
        id: generarId("cat"),
        nombre: datos.nombre,
        tipo: datos.tipo,
        descripcion: datos.descripcion,
        color: datos.color,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarCategoria(nuevaCategoria);

      if (respuesta.exitoso) {
        await cargarCategorias();
        return true;
      } else {
        setError(respuesta.error || "Error al crear la categoría");
        return false;
      }
    } catch (err) {
      setError("Error al crear la categoría");
      console.error(err);
      return false;
    }
  };

  const actualizarCategoria = async (
    id: string,
    datos: CategoriaFormData
  ): Promise<boolean> => {
    try {
      const categoriaExistente = await obtenerCategoriaPorId(id);
      if (!categoriaExistente) {
        setError("Categoría no encontrada");
        return false;
      }

      const categoriaActualizada: CategoriaAdmin = {
        ...categoriaExistente,
        nombre: datos.nombre,
        tipo: datos.tipo,
        descripcion: datos.descripcion,
        color: datos.color,
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarCategoria(categoriaActualizada);

      if (respuesta.exitoso) {
        await cargarCategorias();
        return true;
      } else {
        setError(respuesta.error || "Error al actualizar la categoría");
        return false;
      }
    } catch (err) {
      setError("Error al actualizar la categoría");
      console.error(err);
      return false;
    }
  };

  const eliminar = async (id: string): Promise<boolean> => {
    try {
      const respuesta = await eliminarCategoria(id);

      if (respuesta.exitoso) {
        await cargarCategorias();
        return true;
      } else {
        setError(respuesta.error || "Error al eliminar la categoría");
        return false;
      }
    } catch (err) {
      setError("Error al eliminar la categoría");
      console.error(err);
      return false;
    }
  };

  const activarCategoria = async (id: string): Promise<boolean> => {
    try {
      const categoria = await obtenerCategoriaPorId(id);
      if (!categoria) {
        setError("Categoría no encontrada");
        return false;
      }

      const categoriaActualizada: CategoriaAdmin = {
        ...categoria,
        activo: true,
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarCategoria(categoriaActualizada);

      if (respuesta.exitoso) {
        await cargarCategorias();
        return true;
      } else {
        setError(respuesta.error || "Error al activar la categoría");
        return false;
      }
    } catch (err) {
      setError("Error al activar la categoría");
      console.error(err);
      return false;
    }
  };

  const desactivarCategoria = async (id: string): Promise<boolean> => {
    try {
      const categoria = await obtenerCategoriaPorId(id);
      if (!categoria) {
        setError("Categoría no encontrada");
        return false;
      }

      const categoriaActualizada: CategoriaAdmin = {
        ...categoria,
        activo: false,
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarCategoria(categoriaActualizada);

      if (respuesta.exitoso) {
        await cargarCategorias();
        return true;
      } else {
        setError(respuesta.error || "Error al desactivar la categoría");
        return false;
      }
    } catch (err) {
      setError("Error al desactivar la categoría");
      console.error(err);
      return false;
    }
  };

  const obtenerCategoriasPorTipo = (tipo: TipoCategoria) => {
    return categorias.filter((cat) => cat.tipo === tipo);
  };

  const obtenerCategoriasActivas = () => {
    return categorias.filter((cat) => cat.activo);
  };

  const obtenerCategoriasActivasPorTipo = (tipo: TipoCategoria) => {
    return categorias.filter((cat) => cat.activo && cat.tipo === tipo);
  };

  return {
    categorias,
    cargando,
    error,
    crearCategoria,
    actualizarCategoria,
    eliminar,
    activarCategoria,
    desactivarCategoria,
    obtenerCategoriasPorTipo,
    obtenerCategoriasActivas,
    obtenerCategoriasActivasPorTipo,
    recargar: cargarCategorias,
  };
};
