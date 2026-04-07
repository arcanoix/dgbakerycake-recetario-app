"use client";

import { useState, useEffect } from "react";
import { Orden, OrdenFormData, EstadoOrden } from "@/types";
import {
  obtenerOrdenes,
  obtenerOrdenPorId,
  crearOrden,
  actualizarOrden,
  actualizarEstadoOrden,
  eliminarOrden,
} from "@/lib/storageVentas";

export const useOrdenes = () => {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = async () => {
    try {
      setCargando(true);
      const data = await obtenerOrdenes();
      setOrdenes(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar las órdenes");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const obtenerOrden = async (id: string): Promise<Orden | null> => {
    return await obtenerOrdenPorId(id);
  };

  const crear = async (datos: OrdenFormData): Promise<boolean> => {
    try {
      const respuesta = await crearOrden(datos);
      if (respuesta.exitoso) {
        await cargarOrdenes();
        return true;
      }
      setError(respuesta.error || "Error al crear la orden");
      return false;
    } catch (err) {
      setError("Error al crear la orden");
      console.error(err);
      return false;
    }
  };

  const actualizar = async (id: string, datos: OrdenFormData): Promise<boolean> => {
    try {
      const respuesta = await actualizarOrden(id, datos);
      if (respuesta.exitoso) {
        await cargarOrdenes();
        return true;
      }
      setError(respuesta.error || "Error al actualizar la orden");
      return false;
    } catch (err) {
      setError("Error al actualizar la orden");
      console.error(err);
      return false;
    }
  };

  const cambiarEstado = async (id: string, estado: EstadoOrden): Promise<boolean> => {
    try {
      const respuesta = await actualizarEstadoOrden(id, estado);
      if (respuesta.exitoso) {
        await cargarOrdenes();
        return true;
      }
      setError(respuesta.error || "Error al actualizar el estado");
      return false;
    } catch (err) {
      setError("Error al actualizar el estado");
      console.error(err);
      return false;
    }
  };

  const eliminar = async (id: string): Promise<boolean> => {
    try {
      const respuesta = await eliminarOrden(id);
      if (respuesta.exitoso) {
        await cargarOrdenes();
        return true;
      }
      setError(respuesta.error || "Error al eliminar la orden");
      return false;
    } catch (err) {
      setError("Error al eliminar la orden");
      console.error(err);
      return false;
    }
  };

  const filtrarPorEstado = (estado: EstadoOrden | ''): Orden[] => {
    if (!estado) return ordenes;
    return ordenes.filter(o => o.estado === estado);
  };

  const filtrarPorCliente = (clienteId: string): Orden[] => {
    if (!clienteId) return ordenes;
    return ordenes.filter(o => o.clienteId === clienteId);
  };

  const buscarOrdenes = (termino: string): Orden[] => {
    if (!termino) return ordenes;
    const t = termino.toLowerCase();
    return ordenes.filter(
      o =>
        o.numeroOrden.toLowerCase().includes(t) ||
        o.clienteNombre?.toLowerCase().includes(t) ||
        o.notas?.toLowerCase().includes(t)
    );
  };

  return {
    ordenes,
    cargando,
    error,
    cargarOrdenes,
    obtenerOrden,
    crear,
    actualizar,
    cambiarEstado,
    eliminar,
    filtrarPorEstado,
    filtrarPorCliente,
    buscarOrdenes,
  };
};
