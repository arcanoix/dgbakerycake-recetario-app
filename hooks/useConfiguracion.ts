"use client";

import { useState, useEffect } from "react";
import { ConfiguracionGlobal, ConfiguracionFormData } from "@/types";
import { obtenerConfiguracion, guardarConfiguracion } from "@/lib/storage";

export const useConfiguracion = () => {
  const [configuracion, setConfiguracion] = useState<ConfiguracionGlobal | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = () => {
    try {
      setCargando(true);
      const config = obtenerConfiguracion();
      setConfiguracion(config);
      setError(null);
    } catch (err) {
      setError("Error al cargar la configuración");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const actualizar = (datos: ConfiguracionFormData): boolean => {
    try {
      if (!configuracion) return false;

      const configActualizada: ConfiguracionGlobal = {
        ...configuracion,
        costoPorHoraDefecto: datos.costoPorHoraDefecto,
        moneda: datos.moneda,
        margenGananciaDefecto: datos.margenGananciaDefecto,
      };

      const respuesta = guardarConfiguracion(configActualizada);

      if (respuesta.exitoso) {
        cargarConfiguracion();
        return true;
      } else {
        setError(respuesta.error || "Error al guardar la configuración");
        return false;
      }
    } catch (err) {
      setError("Error al actualizar la configuración");
      console.error(err);
      return false;
    }
  };

  return {
    configuracion,
    cargando,
    error,
    actualizar,
    cargarConfiguracion,
  };
};
