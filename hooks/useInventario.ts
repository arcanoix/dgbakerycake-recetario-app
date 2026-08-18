"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MovimientoInventario,
  MovimientoFormData,
  StockProducto,
  ConfigStockProducto,
  ConfigStockFormData,
} from "@/types";
import {
  obtenerMovimientos,
  registrarMovimientoConUnidad,
  eliminarMovimiento,
  obtenerStockProductos,
  obtenerConfigsStock,
  guardarConfigStock,
  eliminarConfigStock,
} from "@/lib/storageInventario";
import { obtenerProductoPorId } from "@/lib/storageSupabase";

export const useInventario = () => {
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [stocks, setStocks] = useState<StockProducto[]>([]);
  const [configs, setConfigs] = useState<ConfigStockProducto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      const [movs, stks, cfgs] = await Promise.all([
        obtenerMovimientos(),
        obtenerStockProductos(),
        obtenerConfigsStock(),
      ]);
      setMovimientos(movs);
      setStocks(stks);
      setConfigs(cfgs);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar el inventario";
      setError(msg);
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const cargarMovimientosPorProducto = async (
    productoId: string
  ): Promise<MovimientoInventario[]> => {
    return obtenerMovimientos(productoId);
  };

  const registrarMovimiento = async (
    datos: MovimientoFormData
  ): Promise<boolean> => {
    try {
      // Obtener unidad de medida del producto
      const producto = await obtenerProductoPorId(datos.productoId);
      const unidadMedida = producto?.unidadMedidaSimbolo ?? producto?.unidadMedidaNombre ?? producto?.unidadMedida ?? "";

      const respuesta = await registrarMovimientoConUnidad(datos, unidadMedida);
      if (respuesta.exitoso) {
        await cargarDatos();
        return true;
      }
      setError(respuesta.error ?? "Error al registrar el movimiento");
      return false;
    } catch (err) {
      setError("Error al registrar el movimiento");
      console.error(err);
      return false;
    }
  };

  const eliminar = async (id: string): Promise<boolean> => {
    try {
      const respuesta = await eliminarMovimiento(id);
      if (respuesta.exitoso) {
        await cargarDatos();
        return true;
      }
      setError(respuesta.error ?? "Error al eliminar el movimiento");
      return false;
    } catch (err) {
      setError("Error al eliminar el movimiento");
      console.error(err);
      return false;
    }
  };

  const guardarConfig = async (datos: ConfigStockFormData): Promise<boolean> => {
    try {
      const respuesta = await guardarConfigStock(datos);
      if (respuesta.exitoso) {
        await cargarDatos();
        return true;
      }
      setError(respuesta.error ?? "Error al guardar la configuración");
      return false;
    } catch (err) {
      setError("Error al guardar la configuración");
      console.error(err);
      return false;
    }
  };

  const eliminarConfig = async (productoId: string): Promise<boolean> => {
    try {
      const respuesta = await eliminarConfigStock(productoId);
      if (respuesta.exitoso) {
        await cargarDatos();
        return true;
      }
      setError(respuesta.error ?? "Error al eliminar la configuración");
      return false;
    } catch (err) {
      setError("Error al eliminar la configuración");
      console.error(err);
      return false;
    }
  };

  const stocksCriticos = stocks.filter((s) => s.esStockCritico);

  return {
    movimientos,
    stocks,
    configs,
    stocksCriticos,
    cargando,
    error,
    cargarDatos,
    cargarMovimientosPorProducto,
    registrarMovimiento,
    eliminar,
    guardarConfig,
    eliminarConfig,
  };
};
