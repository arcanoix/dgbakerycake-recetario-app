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
  obtenerUnidadPorId,
} from "@/lib/storageSupabase";
import {
  calcularCostoMaterial,
  calcularCostoMaterialConConversion,
  calcularCostoTotalMateriales,
  calcularCostoManoObra,
  calcularCostoTotalReceta,
  calcularPrecioVentaSugerido,
} from "@/lib/calculations";
import { verificarLimite, registrarActividad } from "@/lib/subscriptionStorage";

export const useRecetas = () => {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarRecetas();
  }, []);

  const cargarRecetas = async () => {
    try {
      setCargando(true);
      const recetasStorage = await obtenerRecetas();
      setRecetas(recetasStorage);
      setError(null);
    } catch (err) {
      setError("Error al cargar las recetas");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const obtenerReceta = async (id: string): Promise<Receta | null> => {
    return await obtenerRecetaPorId(id);
  };

  const calcularCostosReceta = (
    materiales: MaterialReceta[],
    margenGanancia?: number
  ) => {
    const costoMateriales = calcularCostoTotalMateriales(materiales);
    const costoManoObra = 0;
    const costoTotal = costoMateriales;
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

  const crearReceta = async (
    datos: RecetaFormData,
    materiales: MaterialReceta[]
  ): Promise<boolean> => {
    try {
      // Verificar límite de recetas según el plan
      const verificacion = await verificarLimite('recetas', recetas.length);
      if (!verificacion.permitido) {
        setError(verificacion.mensaje || "Has alcanzado el límite de recetas de tu plan");
        return false;
      }

      const costos = calcularCostosReceta(
        materiales,
        datos.margenGanancia
      );

      const nuevaReceta: Receta = {
        id: generarId("receta"),
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        materiales,
        rendimiento: datos.rendimiento,
        unidadRendimiento: datos.unidadRendimiento,
        tiempoPreparacion: 0,
        costoPorHora: 0,
        costoManoObra: 0,
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

      const respuesta = await guardarReceta(nuevaReceta);

      if (respuesta.exitoso) {
        await cargarRecetas();
        registrarActividad(
          'create',
          'recetas',
          `Receta creada: ${nuevaReceta.nombre}`,
          nuevaReceta.id,
          nuevaReceta.nombre
        ).catch(() => {});
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

  const actualizarReceta = async (
    id: string,
    datos: RecetaFormData,
    materiales: MaterialReceta[]
  ): Promise<boolean> => {
    try {
      const recetaExistente = await obtenerRecetaPorId(id);
      if (!recetaExistente) {
        setError("Receta no encontrada");
        return false;
      }

      const costos = calcularCostosReceta(
        materiales,
        datos.margenGanancia
      );

      const recetaActualizada: Receta = {
        ...recetaExistente,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        materiales,
        rendimiento: datos.rendimiento,
        unidadRendimiento: datos.unidadRendimiento,
        tiempoPreparacion: 0,
        costoPorHora: 0,
        costoManoObra: 0,
        costoMateriales: costos.costoMateriales,
        costoTotal: costos.costoTotal,
        margenGanancia: datos.margenGanancia,
        precioVentaSugerido: costos.precioVentaSugerido,
        categoria: datos.categoria,
        imagen: datos.imagen,
        notas: datos.notas,
        fechaActualizacion: new Date(),
      };

      const respuesta = await guardarReceta(recetaActualizada);

      if (respuesta.exitoso) {
        await cargarRecetas();
        registrarActividad(
          'update',
          'recetas',
          `Receta actualizada: ${recetaActualizada.nombre}`,
          recetaActualizada.id,
          recetaActualizada.nombre
        ).catch(() => {});
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

  const eliminar = async (id: string): Promise<boolean> => {
    try {
      // Get recipe name before deleting for the log
      const recetaAEliminar = recetas.find((r) => r.id === id);
      const respuesta = await eliminarReceta(id);

      if (respuesta.exitoso) {
        await cargarRecetas();
        registrarActividad(
          'delete',
          'recetas',
          `Receta eliminada: ${recetaAEliminar?.nombre ?? id}`,
          id,
          recetaAEliminar?.nombre
        ).catch(() => {});
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

  // ID especial para materiales personalizados (debe coincidir con MaterialSelector)
  const PRODUCTO_OTRO_ID = "__OTRO__";

  const agregarMaterial = async (
    productoId: string,
    cantidadUtilizada: number,
    unidadSeleccionadaId?: string,
    otroNombre?: string,
    otroPrecio?: number
  ): Promise<MaterialReceta | null> => {
    try {
      // ── Caso especial: producto personalizado ("Otro") ──────────────
      if (productoId === PRODUCTO_OTRO_ID) {
        if (!otroNombre || !otroPrecio || otroPrecio <= 0) {
          setError("Debes ingresar nombre y precio para el ingrediente personalizado");
          return null;
        }
        const costoMaterial = otroPrecio * cantidadUtilizada;
        const material: MaterialReceta = {
          id: generarId("material"),
          productoId: PRODUCTO_OTRO_ID,
          nombreProducto: otroNombre.trim(),
          cantidadUtilizada,
          unidadMedida: "u",
          unidadMedidaNombre: "unidad",
          unidadMedidaSimbolo: "u",
          costoUnitario: otroPrecio,
          costoMaterial,
        };
        return material;
      }

      // ── Caso normal: producto de la BD ─────────────────────────────
      const producto = await obtenerProductoPorId(productoId);
      if (!producto) {
        setError("Producto no encontrado");
        return null;
      }

      // Obtener la unidad seleccionada por el usuario (puede ser diferente a la del producto)
      const unidadSeleccionada = unidadSeleccionadaId
        ? await obtenerUnidadPorId(unidadSeleccionadaId)
        : null;

      // Obtener la unidad del producto para hacer conversión si es necesario
      const unidadProducto = producto.unidadMedida
        ? await obtenerUnidadPorId(producto.unidadMedida)
        : null;

      // Calcular costo con conversión de unidades
      const calculoCosto = calcularCostoMaterialConConversion(
        producto,
        cantidadUtilizada,
        unidadSeleccionada,
        unidadProducto
      );

      // La unidad que se muestra en la receta es la que el usuario eligió
      const unidadMostrando = unidadSeleccionada ?? unidadProducto;

      const material: MaterialReceta = {
        id: generarId("material"),
        productoId: producto.id,
        nombreProducto: producto.nombre,
        cantidadUtilizada,
        unidadMedida: unidadMostrando?.id ?? producto.unidadMedida,
        unidadMedidaNombre: unidadMostrando?.nombre,
        unidadMedidaSimbolo: unidadMostrando?.simbolo,
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
