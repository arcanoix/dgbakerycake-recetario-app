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

type SubscriptionSnapshot = {
  planes: Plan[];
  suscripcionActual: UserSubscription | null;
  infoSuscripcion: UserSubscriptionInfo | null;
  solicitudes: PaymentRequest[];
};

const subscriptionCache = new Map<string, SubscriptionSnapshot>();
const subscriptionRequestCache = new Map<string, Promise<SubscriptionSnapshot>>();

const isLockAbortError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("AbortError") || message.includes("Lock broken by another request");
};

const cargarDatosSuscripcion = async (userId: string) => {
  const cachedData = subscriptionCache.get(userId);
  if (cachedData) {
    return cachedData;
  }

  const pendingRequest = subscriptionRequestCache.get(userId);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = (async () => {
    try {
      const [planesData, suscripcionData, infoData, solicitudesData] = await Promise.all([
        obtenerPlanes(),
        obtenerSuscripcionActual(),
        obtenerInfoSuscripcion(),
        obtenerMisSolicitudes(),
      ]);

      const snapshot = {
        planes: planesData,
        suscripcionActual: suscripcionData,
        infoSuscripcion: infoData,
        solicitudes: solicitudesData,
      };

      subscriptionCache.set(userId, snapshot);
      return snapshot;
    } catch (error) {
      if (isLockAbortError(error)) {
        await new Promise((resolve) => setTimeout(resolve, 150));

        const [planesData, suscripcionData, infoData, solicitudesData] = await Promise.all([
          obtenerPlanes(),
          obtenerSuscripcionActual(),
          obtenerInfoSuscripcion(),
          obtenerMisSolicitudes(),
        ]);

        const snapshot = {
          planes: planesData,
          suscripcionActual: suscripcionData,
          infoSuscripcion: infoData,
          solicitudes: solicitudesData,
        };

        subscriptionCache.set(userId, snapshot);
        return snapshot;
      }

      throw error;
    } finally {
      subscriptionRequestCache.delete(userId);
    }
  })();

  subscriptionRequestCache.set(userId, request);
  return request;
};

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
      let active = true;

      const cargarDatosUsuario = async () => {
        try {
          setCargando(true);
          const snapshot = await cargarDatosSuscripcion(user.id);

          if (!active) {
            return;
          }

          setPlanes(snapshot.planes);
          setSuscripcionActual(snapshot.suscripcionActual);
          setInfoSuscripcion(snapshot.infoSuscripcion);
          setSolicitudes(snapshot.solicitudes);
          setError(null);
        } catch (err) {
          if (!active) {
            return;
          }

          setError("Error al cargar información de suscripción");
          console.error(err);
        } finally {
          if (active) {
            setCargando(false);
          }
        }
      };

      cargarDatosUsuario();

      return () => {
        active = false;
      };
    } else {
      setPlanes([]);
      setSuscripcionActual(null);
      setInfoSuscripcion(null);
      setSolicitudes([]);
      setCargando(false);
    }
  }, [user, loadingAuth]);

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
    recargar: async () => {
      if (!user) {
        return;
      }

      subscriptionCache.delete(user.id);
      subscriptionRequestCache.delete(user.id);

      setCargando(true);

      try {
        const snapshot = await cargarDatosSuscripcion(user.id);
        setPlanes(snapshot.planes);
        setSuscripcionActual(snapshot.suscripcionActual);
        setInfoSuscripcion(snapshot.infoSuscripcion);
        setSolicitudes(snapshot.solicitudes);
        setError(null);
      } catch (err) {
        setError("Error al cargar información de suscripción");
        console.error(err);
      } finally {
        setCargando(false);
      }
    },
  };
};
