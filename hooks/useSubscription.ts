"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  SubscriptionPlan,
  UserSubscription,
  PaymentRequest,
  UserSubscriptionInfo,
  Plan,
} from "@/types/subscription";
import {
  obtenerPlanes,
  obtenerSuscripcionActual,
  obtenerInfoSuscripcion,
  obtenerMisSolicitudes,
  verificarLimite,
} from "@/lib/subscriptionStorage";

export const useSubscription = () => {
  const { user, loading: loadingAuth } = useAuth();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [suscripcionActual, setSuscripcionActual] = useState<UserSubscription | null>(null);
  const [infoSuscripcion, setInfoSuscripcion] = useState<UserSubscriptionInfo | null>(null);
  const [solicitudes, setSolicitudes] = useState<PaymentRequest[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loadingAuth) {
      return;
    }

    if (user) {
      cargarDatos();
    } else {
      setPlanes([]);
      setSuscripcionActual(null);
      setInfoSuscripcion(null);
      setSolicitudes([]);
      setCargando(false);
    }
  }, [user, loadingAuth]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [planesData, suscripcionData, infoData, solicitudesData] = await Promise.all([
        obtenerPlanes(),
        obtenerSuscripcionActual(),
        obtenerInfoSuscripcion(),
        obtenerMisSolicitudes(),
      ]);

      setPlanes(planesData);
      setSuscripcionActual(suscripcionData);
      setInfoSuscripcion(infoData);
      setSolicitudes(solicitudesData);
      setError(null);
    } catch (err) {
      setError("Error al cargar información de suscripción");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const verificarLimiteProductos = async (cantidadActual: number) => {
    return await verificarLimite('productos', cantidadActual);
  };

  const verificarLimiteRecetas = async (cantidadActual: number) => {
    return await verificarLimite('recetas', cantidadActual);
  };

  const recargarSolicitudes = async () => {
    const solicitudesData = await obtenerMisSolicitudes();
    setSolicitudes(solicitudesData);
  };

  return {
    planes,
    suscripcionActual,
    infoSuscripcion,
    solicitudes,
    cargando,
    error,
    verificarLimiteProductos,
    verificarLimiteRecetas,
    recargarSolicitudes,
    recargar: cargarDatos,
  };
};
