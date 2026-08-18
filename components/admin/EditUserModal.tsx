"use client";

import { useState, useEffect } from "react";
import { UserData } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface EditUserModalProps {
  usuario: UserData | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditUserModal = ({ usuario, onClose, onUpdate }: EditUserModalProps) => {
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setError(null);
      setGuardado(false);
    }
  }, [usuario]);

  if (!usuario) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    try {
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: usuario.id, nombre }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al actualizar el usuario");
        return;
      }

      setGuardado(true);
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1000);
    } catch {
      setError("Error inesperado al actualizar el usuario");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Editar Usuario</CardTitle>
          <p className="text-sm text-muted-foreground">{usuario.email}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-admin">Nombre</Label>
              <Input
                id="nombre-admin"
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setError(null);
                }}
                placeholder="Nombre del usuario"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded-md">
                {usuario.email}
              </p>
              <p className="text-xs text-muted-foreground">
                El email no puede modificarse desde el panel de administrador.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {guardado && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">Usuario actualizado exitosamente</p>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={guardando}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando || guardado}>
                {guardado ? "✓ Guardado" : guardando ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
