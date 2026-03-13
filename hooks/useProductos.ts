"use client";

import { useState, useEffect } from "react";
import { Producto, ProductoFormData } from "@/types";
import {
  obtenerProductos,
  obtenerProductoPorId,
  guardarProducto,
  eliminarProducto,
  generarId,
  obtenerUnidadPorId,
} from "@/lib/storageSupabase";
import { calcularPrecioPorUnidad } from "@/lib/calculations";
import { verificarLimite } from "@/lib/subscriptionStorage";

export const useProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const productosStorage = await obtenerProductos();
      setProductos(productosStorage);
      setError(null);
    } catch (err) {
      setError("Error al cargar los productos");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const obtenerProducto = async (id: string): Promise<Producto | null> => {
    return await obtenerProductoPorId(id);
  };

  const crearProducto = async (datos: ProductoFormData): Promise<boolean> => {
    try {
      // Verificar límite de productos según el plan
      const verificacion = await verificarLimite('productos', productos.length);
      if (!verificacion.permitido) {
        setError(verificacion.mensaje || "Has alcanzado el límite de productos de tu plan");
        return false;
      }

      // Obtener información de la unidad de medida
      const unidad = await obtenerUnidadPorId(datos.unidadMedida);
      
      // Calcular valores automáticamente
      const cantidadTotal = datos.tamañoPresentacion * datos.cantidadPresentaciones;
      const precioPorUnidad = datos.precioTotal / cantidadTotal;
      const precioPorPresentacion = datos.precioTotal / datos.cantidadPresentaciones;

      const nuevoProducto: Producto = {
        id: generarId("prod"),
        nombre: datos.nombre,
        precioTotal: datos.precioTotal,
        tamañoPresentacion: datos.tamañoPresentacion,
        cantidadPresentaciones: datos.cantidadPresentaciones,
        cantidadTotal,
        unidadMedida: datos.unidadMedida,
        unidadMedidaNombre: unidad?.nombre,
        unidadMedidaSimbolo: unidad?.simbolo,
        precioPorUnidad,
        precioPorPresentacion,
        categoria: datos.categoria,
        proveedor: datos.proveedor,
        notas: datos.notas,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarProducto(nuevoProducto);

      if (respuesta.exitoso) {
        await cargarProductos();
        return true;
      } else {
        setError(respuesta.error || "Error al crear el producto");
        return false;
      }
    } catch (err) {
      setError("Error al crear el producto");
      console.error(err);
      return false;
    }
  };

  const actualizarProducto = async (id: string, datos: ProductoFormData): Promise<boolean> => {
    try {
      const productoExistente = await obtenerProductoPorId(id);
      if (!productoExistente) {
        setError("Producto no encontrado");
        return false;
      }

      // Obtener información de la unidad de medida
      const unidad = await obtenerUnidadPorId(datos.unidadMedida);
      
      // Calcular valores automáticamente
      const cantidadTotal = datos.tamañoPresentacion * datos.cantidadPresentaciones;
      const precioPorUnidad = datos.precioTotal / cantidadTotal;
      const precioPorPresentacion = datos.precioTotal / datos.cantidadPresentaciones;

      const productoActualizado: Producto = {
        ...productoExistente,
        nombre: datos.nombre,
        precioTotal: datos.precioTotal,
        tamañoPresentacion: datos.tamañoPresentacion,
        cantidadPresentaciones: datos.cantidadPresentaciones,
        cantidadTotal,
        unidadMedida: datos.unidadMedida,
        unidadMedidaNombre: unidad?.nombre,
        unidadMedidaSimbolo: unidad?.simbolo,
        precioPorUnidad,
        precioPorPresentacion,
        categoria: datos.categoria,
        proveedor: datos.proveedor,
        notas: datos.notas,
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarProducto(productoActualizado);

      if (respuesta.exitoso) {
        await cargarProductos();
        return true;
      } else {
        setError(respuesta.error || "Error al actualizar el producto");
        return false;
      }
    } catch (err) {
      setError("Error al actualizar el producto");
      console.error(err);
      return false;
    }
  };

  const eliminar = async (id: string): Promise<boolean> => {
    try {
      const respuesta = await eliminarProducto(id);

      if (respuesta.exitoso) {
        await cargarProductos();
        return true;
      } else {
        setError(respuesta.error || "Error al eliminar el producto");
        return false;
      }
    } catch (err) {
      setError("Error al eliminar el producto");
      console.error(err);
      return false;
    }
  };

  const buscarProductos = (termino: string): Producto[] => {
    if (!termino) return productos;

    const terminoLower = termino.toLowerCase();
    return productos.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(terminoLower) ||
        producto.categoria?.toLowerCase().includes(terminoLower) ||
        producto.proveedor?.toLowerCase().includes(terminoLower)
    );
  };

  const filtrarPorCategoria = (categoria: string): Producto[] => {
    if (!categoria) return productos;
    return productos.filter((producto) => producto.categoria === categoria);
  };

  const filtrarPorUnidad = (unidad: UnidadMedida): Producto[] => {
    return productos.filter((producto) => producto.unidadMedida === unidad);
  };

  return {
    productos,
    cargando,
    error,
    cargarProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminar,
    buscarProductos,
    filtrarPorCategoria,
    filtrarPorUnidad,
  };
};
