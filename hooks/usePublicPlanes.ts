"use client";

import { useState, useEffect } from "react";
import { Plan } from "@/types/subscription";
import { obtenerPlanes } from "@/lib/subscriptionStorage";

/**
 * Hook para obtener planes públicos (sin autenticación)
 * Usado en la landing page
 */
export const usePublicPlanes = () => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        setCargando(true);
        const data = await obtenerPlanes();
        setPlanes(data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar planes:", err);
        setError("Error al cargar los planes");
      } finally {
        setCargando(false);
      }
    };

    cargarPlanes();
  }, []);

  return { planes, cargando, error };
};
