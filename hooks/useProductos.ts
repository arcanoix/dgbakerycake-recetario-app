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
import { verificarLimite } from "@/lib/subscriptionStorage";

export interface ResultadoImportacionMasiva {
  importados: number;
  errores: number;
  omitidos: number;
  mensaje: string;
}

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

  const filtrarPorUnidad = (unidadId: string): Producto[] => {
    return productos.filter((producto) => producto.unidadMedida === unidadId);
  };

  const importarProductosMasivo = async (
    productosFormData: ProductoFormData[]
  ): Promise<ResultadoImportacionMasiva> => {
    try {
      const verificacion = await verificarLimite('productos', productos.length);

      if (!verificacion.permitido) {
        const mensaje = verificacion.mensaje || "Has alcanzado el límite de productos de tu plan";
        setError(mensaje);
        return { importados: 0, errores: 0, omitidos: productosFormData.length, mensaje };
      }

      // Calculate how many can be imported within the plan limit
      const espacioDisponible =
        verificacion.limite === -1
          ? productosFormData.length
          : verificacion.limite - productos.length;

      const aImportar = productosFormData.slice(0, espacioDisponible);
      const omitidos = productosFormData.length - aImportar.length;

      let importados = 0;
      let errores = 0;

      for (const datos of aImportar) {
        try {
          const unidad = await obtenerUnidadPorId(datos.unidadMedida);
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
            importados++;
          } else {
            errores++;
          }
        } catch (err) {
          errores++;
          console.error('Error al importar producto:', err);
        }
      }

      // Reload the product list once after all imports
      await cargarProductos();

      let mensaje = '';
      if (importados > 0) {
        mensaje = `Se importaron ${importados} producto${importados !== 1 ? 's' : ''} correctamente`;
        if (errores > 0) mensaje += `, ${errores} con errores`;
        if (omitidos > 0) mensaje += `, ${omitidos} omitido${omitidos !== 1 ? 's' : ''} por límite del plan`;
        mensaje += '.';
      } else {
        mensaje = `No se importaron productos.${errores > 0 ? ` ${errores} con errores.` : ''}`;
      }

      return { importados, errores, omitidos, mensaje };
    } catch (err) {
      const mensaje = "Error durante la importación masiva";
      setError(mensaje);
      console.error(err);
      return { importados: 0, errores: productosFormData.length, omitidos: 0, mensaje };
    }
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
    importarProductosMasivo,
  };
};
