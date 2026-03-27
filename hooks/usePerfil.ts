"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { actualizarPerfil, updatePassword, signIn } from "@/lib/supabase-auth";

export interface PerfilFormData {
  nombre: string;
  email: string;
}

export interface CambiarPasswordData {
  passwordActual: string;
  passwordNuevo: string;
  passwordConfirmar: string;
}

export const usePerfil = () => {
  const { user } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const limpiarMensajes = () => {
    setError(null);
    setMensaje(null);
  };

  const actualizarDatos = useCallback(
    async (datos: PerfilFormData): Promise<boolean> => {
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
    [user]
  );

  const cambiarPassword = useCallback(
    async (datos: CambiarPasswordData): Promise<boolean> => {
      limpiarMensajes();

      if (!user?.email) {
        setError("No se pudo obtener el email del usuario");
        return false;
      }

      if (!datos.passwordActual) {
        setError("Debes ingresar tu contraseña actual");
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
        // Verify current password by re-authenticating
        const verificacion = await signIn({
          email: user.email,
          password: datos.passwordActual,
        });

        if (!verificacion.success) {
          setError("La contraseña actual es incorrecta");
          return false;
        }

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
    [user]
  );

  return {
    user,
    guardando,
    error,
    mensaje,
    limpiarMensajes,
    actualizarDatos,
    cambiarPassword,
  };
};
