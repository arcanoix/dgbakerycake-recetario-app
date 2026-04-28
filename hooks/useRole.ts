"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/subscription";
import { supabase } from "@/lib/supabase";
import { registrarErrorSistema } from "@/lib/subscriptionStorage";

const roleCache = new Map<string, UserRole>();
const roleRequestCache = new Map<string, Promise<UserRole>>();

const isLockAbortError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("AbortError") || message.includes("Lock broken by another request");
};

const obtenerRolUsuario = (userId: string) => {
  const cachedRole = roleCache.get(userId);
  if (cachedRole) {
    return Promise.resolve(cachedRole);
  }

  const pendingRequest = roleRequestCache.get(userId);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = (async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      const userRole = data.role as UserRole;
      roleCache.set(userId, userRole);
      return userRole;
    } finally {
      roleRequestCache.delete(userId);
    }
  })();

  roleRequestCache.set(userId, request);
  return request;
};

export const useRole = () => {
  const { user, loading: loadingAuth } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let active = true;

    if (loadingAuth) {
      return () => {
        active = false;
      };
    }

    if (user) {
      const cargarRoleUsuario = async () => {
        try {
          setCargando(true);
          const userRole = await obtenerRolUsuario(user.id);

          if (!active) {
            return;
          }

          setRole(userRole);
          setIsAdmin(userRole === 'admin');
        } catch (error) {
          if (!active) {
            return;
          }

          if (isLockAbortError(error)) {
            try {
              await new Promise((resolve) => setTimeout(resolve, 150));
              const userRole = await obtenerRolUsuario(user.id);

              if (!active) {
                return;
              }

              setRole(userRole);
              setIsAdmin(userRole === 'admin');
              return;
            } catch (retryError) {
              if (!active) {
                return;
              }

              setRole('cliente');
              setIsAdmin(false);
              registrarErrorSistema(
                `Error al cargar rol tras reintento: ${String(retryError)}`,
                user.id,
                user.email ?? undefined
              ).catch(() => {});
              return;
            }
          } else {
            registrarErrorSistema(
              `Error al cargar rol: ${String(error)}`,
              user.id,
              user.email ?? undefined
            ).catch(() => {});
          }

          setRole('cliente');
          setIsAdmin(false);
        } finally {
          if (active) {
            setCargando(false);
          }
        }
      };

      cargarRoleUsuario();
    } else {
      setRole(null);
      setIsAdmin(false);
      setCargando(false);
    }
  }, [user, loadingAuth]);

  return {
    role,
    isAdmin,
    cargando,
    recargar: async () => {
      if (!user) {
        return;
      }

      roleCache.delete(user.id);
      roleRequestCache.delete(user.id);

      setCargando(true);

      try {
        const userRole = await obtenerRolUsuario(user.id);
        setRole(userRole);
        setIsAdmin(userRole === 'admin');
      } catch (error) {
        setRole('cliente');
        setIsAdmin(false);
      } finally {
        setCargando(false);
      }
    },
  };
};
