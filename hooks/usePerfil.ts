"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { actualizarPerfil, updatePassword } from "@/lib/supabase-auth";

export interface PerfilFormData {
  nombre: string;
  email: string;
}

export interface CambiarPasswordData {
  passwordNuevo: string;
  passwordConfirmar: string;
}

export const usePerfil = () => {
  const { user, loading: loadingAuth } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);

  const limpiarMensajes = () => {
    setError(null);
    setMensaje(null);
  };

  const actualizarDatos = useCallback(
    async (datos: PerfilFormData): Promise<boolean> => {
      if (loadingAuth) return false;
      if (!user) return false;

      limpiarMensajes();
      setGuardando(true);

      try {
        const updates: { nombre?: string; email?: string } = {};

        const nombreActual = (user.user_metadata?.nombre as string) || "";
        if (datos.nombre !== nombreActual) {
          updates.nombre = datos.nombre;
        }

        if (datos.email !== user.email) {
          updates.email = datos.email;
        }

        if (Object.keys(updates).length === 0) {
          setMensaje("No hay cambios que guardar");
          return true;
        }

        const resultado = await actualizarPerfil(updates);

        if (!resultado.success) {
          setError(resultado.error || "Error al actualizar el perfil");
          return false;
        }

        if (updates.email) {
          setMensaje(
            "Perfil actualizado. Se ha enviado un correo de confirmación a tu nuevo email."
          );
        } else {
          setMensaje("Perfil actualizado exitosamente");
        }

        return true;
      } catch {
        setError("Error inesperado al actualizar el perfil");
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [user, loadingAuth]
  );

  const cambiarPassword = useCallback(
    async (datos: CambiarPasswordData): Promise<boolean> => {
      if (loadingAuth) return false;
      limpiarMensajes();

      if (!user?.email) {
        setError("No se pudo obtener el email del usuario");
        return false;
      }

      if (datos.passwordNuevo !== datos.passwordConfirmar) {
        setError("Las contraseñas no coinciden");
        return false;
      }

      if (datos.passwordNuevo.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return false;
      }

      setGuardando(true);

      try {
        const resultado = await updatePassword(datos.passwordNuevo);

        if (!resultado.success) {
          setError(resultado.error || "Error al cambiar la contraseña");
          return false;
        }

        setMensaje("Contraseña actualizada exitosamente");
        return true;
      } catch {
        setError("Error inesperado al cambiar la contraseña");
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [user, loadingAuth]
  );

  const subirAvatar = useCallback(async (archivo: File): Promise<string | null> => {
    if (!user) return null;

    limpiarMensajes();
    setSubiendoAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", archivo);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json() as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setError(payload.error || "No se pudo subir la foto de perfil");
        return null;
      }

      const resultado = await actualizarPerfil({ avatarUrl: payload.url });
      if (!resultado.success) {
        setError(resultado.error || "La foto se subió, pero no se pudo guardar en tu perfil");
        return null;
      }

      setMensaje("Foto de perfil actualizada");
      return payload.url;
    } catch {
      setError("Error inesperado al subir la foto de perfil");
      return null;
    } finally {
      setSubiendoAvatar(false);
    }
  }, [user]);

  return {
    user,
    guardando,
    error,
    mensaje,
    limpiarMensajes,
    actualizarDatos,
    cambiarPassword,
    subirAvatar,
    subiendoAvatar,
  };
};
