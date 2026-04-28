"use client";

import { useState, useEffect } from "react";
import { Cliente, ClienteFormData } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  obtenerClientes,
  obtenerClientePorId,
  guardarCliente,
  eliminarCliente,
} from "@/lib/storageVentas";

export const useClientes = () => {
  const { user, loading: loadingAuth } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  useEffect(() => {
    if (loadingAuth) {
      return;
    }

    if (!user) {
      setClientes([]);
      setCargando(false);
      return;
    }

    cargarClientes();
  }, [loadingAuth, user]);

  const cargarClientes = async () => {
    try {
      setCargando(true);
      const data = await obtenerClientes();
      setClientes(data);
      setErrorCarga(null);
    } catch (err) {
      setErrorCarga(
        clientes.length > 0
          ? "No se pudo actualizar la lista de clientes por una conexión lenta. Se muestran los últimos clientes cargados."
          : "No se pudieron cargar los clientes en este momento. Revisa tu conexión e intenta nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  const obtenerCliente = async (id: string): Promise<Cliente | null> => {
    return await obtenerClientePorId(id);
  };

  const crearCliente = async (datos: ClienteFormData): Promise<boolean> => {
    try {
      const respuesta = await guardarCliente(datos);
      if (respuesta.exitoso) {
        await cargarClientes();
        return true;
      }
      setError(respuesta.error || "Error al crear el cliente");
      return false;
    } catch (err) {
      setError("Error al crear el cliente");
      return false;
    }
  };

  const actualizarCliente = async (id: string, datos: ClienteFormData): Promise<boolean> => {
    try {
      const respuesta = await guardarCliente({ ...datos, id });
      if (respuesta.exitoso) {
        await cargarClientes();
        return true;
      }
      setError(respuesta.error || "Error al actualizar el cliente");
      return false;
    } catch (err) {
      setError("Error al actualizar el cliente");
      return false;
    }
  };

  const eliminar = async (id: string): Promise<boolean> => {
    try {
      const respuesta = await eliminarCliente(id);
      if (respuesta.exitoso) {
        await cargarClientes();
        return true;
      }
      setError(respuesta.error || "Error al eliminar el cliente");
      return false;
    } catch (err) {
      setError("Error al eliminar el cliente");
      return false;
    }
  };

  const buscarClientes = (termino: string): Cliente[] => {
    if (!termino) return clientes;
    const t = termino.toLowerCase();
    return clientes.filter(
      c =>
        c.nombre.toLowerCase().includes(t) ||
        c.email?.toLowerCase().includes(t) ||
        c.telefono?.toLowerCase().includes(t)
    );
  };

  return {
    clientes,
    cargando,
    error,
    errorCarga,
    cargarClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminar,
    buscarClientes,
  };
};
