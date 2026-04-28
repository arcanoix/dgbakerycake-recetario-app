"use client";

import { useState, useEffect } from "react";
import { ConfiguracionGlobal, ConfiguracionFormData } from "@/types";
import { obtenerConfiguracion, guardarConfiguracion } from "@/lib/storageSupabase";
import { useAuth } from "@/contexts/AuthContext";

export const useConfiguracion = () => {
  const { user, loading: loadingAuth } = useAuth();
  const [configuracion, setConfiguracion] = useState<ConfiguracionGlobal | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  useEffect(() => {
    if (loadingAuth) {
      return;
    }

    if (!user) {
      setConfiguracion(null);
      setCargando(false);
      return;
    }

    cargarConfiguracion();
  }, [loadingAuth, user]);

  const cargarConfiguracion = async () => {
    try {
      setCargando(true);
      const config = await obtenerConfiguracion();
      setConfiguracion(config);
      setErrorCarga(null);
    } catch (err) {
      setErrorCarga(
        configuracion
          ? "No se pudo actualizar la configuración por una conexión lenta. Se mantiene la última configuración cargada."
          : "No se pudo cargar la configuración en este momento. Revisa tu conexión e intenta nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  const actualizar = async (datos: ConfiguracionFormData): Promise<boolean> => {
    try {
      if (!configuracion) return false;

      const configActualizada: ConfiguracionGlobal = {
        ...configuracion,
        costoPorHoraDefecto: datos.costoPorHoraDefecto,
        moneda: datos.moneda,
        margenGananciaDefecto: datos.margenGananciaDefecto,
        tasaCambioUSD: datos.tasaCambioUSD,
      };

      const respuesta = await guardarConfiguracion(configActualizada);

      if (respuesta.exitoso) {
        await cargarConfiguracion();
        return true;
      } else {
        setError(respuesta.error || "Error al guardar la configuración");
        return false;
      }
    } catch (err) {
      setError("Error al actualizar la configuración");
      return false;
    }
  };

  return {
    configuracion,
    cargando,
    error,
    errorCarga,
    actualizar,
    cargarConfiguracion,
  };
};
