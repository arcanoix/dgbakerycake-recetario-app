"use client";

import { useState, useEffect } from "react";
import { GastoFijo, GastoFijoFormData, TotalesGastosFijos } from "@/types";
import { 
  obtenerGastosFijos, 
  guardarGastoFijo, 
  eliminarGastoFijo,
  calcularTotalesGastosFijos,
  generarId 
} from "@/lib/storageSupabase";
import { useAuth } from "@/contexts/AuthContext";

export const useGastosFijos = () => {
  const { user, loading: loadingAuth } = useAuth();
  const [gastosFijos, setGastosFijos] = useState<GastoFijo[]>([]);
  const [totales, setTotales] = useState<TotalesGastosFijos>({
    totalMontoMensual: 0,
    totalCostoAsignado: 0,
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loadingAuth) {
      return;
    }

    if (!user) {
      setGastosFijos([]);
      setCargando(false);
      return;
    }

    cargarGastosFijos();
  }, [loadingAuth, user]);

  useEffect(() => {
    if (gastosFijos.length > 0) {
      const totalesCalculados = calcularTotalesGastosFijos(gastosFijos);
      setTotales(totalesCalculados);
    }
  }, [gastosFijos]);

  const cargarGastosFijos = async () => {
    try {
      setCargando(true);
      const datos = await obtenerGastosFijos();
      setGastosFijos(datos);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar los gastos fijos. Intenta nuevamente.");
      console.error("Error al cargar gastos fijos:", err);
    } finally {
      setCargando(false);
    }
  };

  const crear = async (datos: GastoFijoFormData): Promise<boolean> => {
    try {
      const nuevoGastoFijo: GastoFijo = {
        id: generarId(),
        userId: user?.id || "",
        nombre: datos.nombre,
        montoMensual: datos.montoMensual,
        unidadesEstimadas: datos.unidadesEstimadas,
        costoAsignado: datos.unidadesEstimadas > 0 ? datos.montoMensual / datos.unidadesEstimadas : 0,
        porcentajeDistribucion: 0,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarGastoFijo(nuevoGastoFijo);

      if (respuesta.exitoso) {
        await cargarGastosFijos();
        return true;
      } else {
        setError(respuesta.error || "Error al crear el gasto fijo");
        return false;
      }
    } catch (err) {
      setError("Error al crear el gasto fijo");
      return false;
    }
  };

  const actualizar = async (id: string, datos: GastoFijoFormData): Promise<boolean> => {
    try {
      const gastoExistente = gastosFijos.find(g => g.id === id);
      if (!gastoExistente) {
        setError("Gasto fijo no encontrado");
        return false;
      }

      const gastoActualizado: GastoFijo = {
        ...gastoExistente,
        nombre: datos.nombre,
        montoMensual: datos.montoMensual,
        unidadesEstimadas: datos.unidadesEstimadas,
        costoAsignado: datos.unidadesEstimadas > 0 ? datos.montoMensual / datos.unidadesEstimadas : 0,
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarGastoFijo(gastoActualizado);

      if (respuesta.exitoso) {
        await cargarGastosFijos();
        return true;
      } else {
        setError(respuesta.error || "Error al actualizar el gasto fijo");
        return false;
      }
    } catch (err) {
      setError("Error al actualizar el gasto fijo");
      return false;
    }
  };

  const eliminar = async (id: string): Promise<boolean> => {
    try {
      const respuesta = await eliminarGastoFijo(id);

      if (respuesta.exitoso) {
        await cargarGastosFijos();
        return true;
      } else {
        setError(respuesta.error || "Error al eliminar el gasto fijo");
        return false;
      }
    } catch (err) {
      setError("Error al eliminar el gasto fijo");
      return false;
    }
  };

  return {
    gastosFijos,
    totales,
    cargando,
    error,
    crear,
    actualizar,
    eliminar,
    cargarGastosFijos,
  };
};
