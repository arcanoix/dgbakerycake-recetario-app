"use client";

import { useState, useEffect } from "react";
import { UnidadMedidaAdmin, UnidadMedidaFormData } from "@/types";
import {
  obtenerUnidades,
  obtenerUnidadPorId,
  guardarUnidad,
  eliminarUnidad,
  generarId,
} from "@/lib/storageSupabase";

export const useUnidades = () => {
  const [unidades, setUnidades] = useState<UnidadMedidaAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarUnidades();
  }, []);

  const cargarUnidades = async () => {
    try {
      setCargando(true);
      const unidadesStorage = await obtenerUnidades();
      setUnidades(unidadesStorage);
      setError(null);
    } catch (err) {
      setError("Error al cargar las unidades");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const obtenerUnidad = async (id: string): Promise<UnidadMedidaAdmin | null> => {
    return await obtenerUnidadPorId(id);
  };

  const crearUnidad = async (datos: UnidadMedidaFormData): Promise<boolean> => {
    try {
      const nuevaUnidad: UnidadMedidaAdmin = {
        id: generarId("unidad"),
        nombre: datos.nombre,
        simbolo: datos.simbolo,
        tipo: datos.tipo,
        factorConversionBase: datos.factorConversionBase,
        unidadBase: datos.unidadBase,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarUnidad(nuevaUnidad);

      if (respuesta.exitoso) {
        await cargarUnidades();
        return true;
      } else {
        setError(respuesta.error || "Error al crear la unidad");
        return false;
      }
    } catch (err) {
      setError("Error al crear la unidad");
      console.error(err);
      return false;
    }
  };

  const actualizarUnidad = async (
    id: string,
    datos: UnidadMedidaFormData
  ): Promise<boolean> => {
    try {
      const unidadExistente = await obtenerUnidadPorId(id);
      if (!unidadExistente) {
        setError("Unidad no encontrada");
        return false;
      }

      const unidadActualizada: UnidadMedidaAdmin = {
        ...unidadExistente,
        nombre: datos.nombre,
        simbolo: datos.simbolo,
        tipo: datos.tipo,
        factorConversionBase: datos.factorConversionBase,
        unidadBase: datos.unidadBase,
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarUnidad(unidadActualizada);

      if (respuesta.exitoso) {
        await cargarUnidades();
        return true;
      } else {
        setError(respuesta.error || "Error al actualizar la unidad");
        return false;
      }
    } catch (err) {
      setError("Error al actualizar la unidad");
      console.error(err);
      return false;
    }
  };

  const eliminar = async (id: string): Promise<boolean> => {
    try {
      const respuesta = await eliminarUnidad(id);

      if (respuesta.exitoso) {
        await cargarUnidades();
        return true;
      } else {
        setError(respuesta.error || "Error al eliminar la unidad");
        return false;
      }
    } catch (err) {
      setError("Error al eliminar la unidad");
      console.error(err);
      return false;
    }
  };

  const desactivarUnidad = async (id: string): Promise<boolean> => {
    try {
      const unidad = await obtenerUnidadPorId(id);
      if (!unidad) {
        setError("Unidad no encontrada");
        return false;
      }

      const unidadActualizada: UnidadMedidaAdmin = {
        ...unidad,
        activo: false,
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarUnidad(unidadActualizada);

      if (respuesta.exitoso) {
        await cargarUnidades();
        return true;
      } else {
        setError(respuesta.error || "Error al desactivar la unidad");
        return false;
      }
    } catch (err) {
      setError("Error al desactivar la unidad");
      console.error(err);
      return false;
    }
  };

  const activarUnidad = async (id: string): Promise<boolean> => {
    try {
      const unidad = await obtenerUnidadPorId(id);
      if (!unidad) {
        setError("Unidad no encontrada");
        return false;
      }

      const unidadActualizada: UnidadMedidaAdmin = {
        ...unidad,
        activo: true,
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarUnidad(unidadActualizada);

      if (respuesta.exitoso) {
        await cargarUnidades();
        return true;
      } else {
        setError(respuesta.error || "Error al activar la unidad");
        return false;
      }
    } catch (err) {
      setError("Error al activar la unidad");
      console.error(err);
      return false;
    }
  };

  const obtenerUnidadesActivas = (): UnidadMedidaAdmin[] => {
    return unidades.filter((u) => u.activo);
  };

  const obtenerUnidadesPorTipo = (tipo: string): UnidadMedidaAdmin[] => {
    return unidades.filter((u) => u.activo && u.tipo === tipo);
  };

  return {
    unidades,
    cargando,
    error,
    cargarUnidades,
    obtenerUnidad,
    crearUnidad,
    actualizarUnidad,
    eliminar,
    desactivarUnidad,
    activarUnidad,
    obtenerUnidadesActivas,
    obtenerUnidadesPorTipo,
  };
};
