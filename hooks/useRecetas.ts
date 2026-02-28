"use client";

import { useState, useEffect } from "react";
import { Receta, RecetaFormData, MaterialReceta, Producto } from "@/types";
import {
  obtenerRecetas,
  obtenerRecetaPorId,
  guardarReceta,
  eliminarReceta,
  generarId,
  obtenerProductoPorId,
} from "@/lib/storage";
import {
  calcularCostoMaterial,
  calcularCostoTotalMateriales,
  calcularCostoManoObra,
  calcularCostoTotalReceta,
  calcularPrecioVentaSugerido,
} from "@/lib/calculations";

export const useRecetas = () => {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarRecetas();
  }, []);

  const cargarRecetas = () => {
    try {
      setCargando(true);
      const recetasStorage = obtenerRecetas();
      setRecetas(recetasStorage);
      setError(null);
    } catch (err) {
      setError("Error al cargar las recetas");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const obtenerReceta = (id: string): Receta | null => {
    return obtenerRecetaPorId(id);
  };

  const calcularCostosReceta = (
    materiales: MaterialReceta[],
    tiempoPreparacion: number,
    costoPorHora: number,
    margenGanancia?: number
  ) => {
    const costoMateriales = calcularCostoTotalMateriales(materiales);
    const costoManoObra = calcularCostoManoObra(tiempoPreparacion, costoPorHora);
    const costoTotal = calcularCostoTotalReceta(costoMateriales, costoManoObra);
    const precioVentaSugerido = margenGanancia
      ? calcularPrecioVentaSugerido(costoTotal, margenGanancia)
      : undefined;

    return {
      costoMateriales,
      costoManoObra,
      costoTotal,
      precioVentaSugerido,
    };
  };

  const crearReceta = (
    datos: RecetaFormData,
    materiales: MaterialReceta[]
  ): boolean => {
    try {
      const costos = calcularCostosReceta(
        materiales,
        datos.tiempoPreparacion,
        datos.costoPorHora || 0,
        datos.margenGanancia
      );

      const nuevaReceta: Receta = {
        id: generarId("receta"),
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        materiales,
        rendimiento: datos.rendimiento,
        unidadRendimiento: datos.unidadRendimiento,
        tiempoPreparacion: datos.tiempoPreparacion,
        costoPorHora: datos.costoPorHora || 0,
        costoManoObra: costos.costoManoObra,
        costoMateriales: costos.costoMateriales,
        costoTotal: costos.costoTotal,
        margenGanancia: datos.margenGanancia,
        precioVentaSugerido: costos.precioVentaSugerido,
        categoria: datos.categoria,
        imagen: datos.imagen,
        notas: datos.notas,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      const respuesta = guardarReceta(nuevaReceta);

      if (respuesta.exitoso) {
        cargarRecetas();
        return true;
      } else {
        setError(respuesta.error || "Error al crear la receta");
        return false;
      }
    } catch (err) {
      setError("Error al crear la receta");
      console.error(err);
      return false;
    }
  };

  const actualizarReceta = (
    id: string,
    datos: RecetaFormData,
    materiales: MaterialReceta[]
  ): boolean => {
    try {
      const recetaExistente = obtenerRecetaPorId(id);
      if (!recetaExistente) {
        setError("Receta no encontrada");
        return false;
      }

      const costos = calcularCostosReceta(
        materiales,
        datos.tiempoPreparacion,
        datos.costoPorHora || 0,
        datos.margenGanancia
      );

      const recetaActualizada: Receta = {
        ...recetaExistente,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        materiales,
        rendimiento: datos.rendimiento,
        unidadRendimiento: datos.unidadRendimiento,
        tiempoPreparacion: datos.tiempoPreparacion,
        costoPorHora: datos.costoPorHora || 0,
        costoManoObra: costos.costoManoObra,
        costoMateriales: costos.costoMateriales,
        costoTotal: costos.costoTotal,
        margenGanancia: datos.margenGanancia,
        precioVentaSugerido: costos.precioVentaSugerido,
        categoria: datos.categoria,
        imagen: datos.imagen,
        notas: datos.notas,
        fechaActualizacion: new Date(),
      };

      const respuesta = guardarReceta(recetaActualizada);

      if (respuesta.exitoso) {
        cargarRecetas();
        return true;
      } else {
        setError(respuesta.error || "Error al actualizar la receta");
        return false;
      }
    } catch (err) {
      setError("Error al actualizar la receta");
      console.error(err);
      return false;
    }
  };

  const eliminar = (id: string): boolean => {
    try {
      const respuesta = eliminarReceta(id);

      if (respuesta.exitoso) {
        cargarRecetas();
        return true;
      } else {
        setError(respuesta.error || "Error al eliminar la receta");
        return false;
      }
    } catch (err) {
      setError("Error al eliminar la receta");
      console.error(err);
      return false;
    }
  };

  const agregarMaterial = (
    productoId: string,
    cantidadUtilizada: number
  ): MaterialReceta | null => {
    try {
      const producto = obtenerProductoPorId(productoId);
      if (!producto) {
        setError("Producto no encontrado");
        return null;
      }

      const calculoCosto = calcularCostoMaterial(producto, cantidadUtilizada);

      const material: MaterialReceta = {
        id: generarId("material"),
        productoId: producto.id,
        nombreProducto: producto.nombre,
        cantidadUtilizada,
        unidadMedida: producto.unidadMedida,
        costoUnitario: producto.precioPorUnidad,
        costoMaterial: calculoCosto.costoCalculado,
      };

      return material;
    } catch (err) {
      setError("Error al agregar material");
      console.error(err);
      return null;
    }
  };

  const buscarRecetas = (termino: string): Receta[] => {
    if (!termino) return recetas;

    const terminoLower = termino.toLowerCase();
    return recetas.filter(
      (receta) =>
        receta.nombre.toLowerCase().includes(terminoLower) ||
        receta.descripcion.toLowerCase().includes(terminoLower) ||
        receta.categoria?.toLowerCase().includes(terminoLower)
    );
  };

  const filtrarPorCategoria = (categoria: string): Receta[] => {
    if (!categoria) return recetas;
    return recetas.filter((receta) => receta.categoria === categoria);
  };

  return {
    recetas,
    cargando,
    error,
    cargarRecetas,
    obtenerReceta,
    crearReceta,
    actualizarReceta,
    eliminar,
    agregarMaterial,
    buscarRecetas,
    filtrarPorCategoria,
    calcularCostosReceta,
  };
};
