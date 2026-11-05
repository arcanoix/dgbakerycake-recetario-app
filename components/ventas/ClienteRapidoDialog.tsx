"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ClienteRapidoDialogProps {
  abierto: boolean;
  onCerrar: () => void;
  onCrear: (datos: { nombre: string; telefono?: string }) => Promise<{ id?: string; error?: string }>;
  onCreado: (id: string) => void;
}

export const ClienteRapidoDialog = ({ abierto, onCerrar, onCrear, onCreado }: ClienteRapidoDialogProps) => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const reiniciar = () => {
    setNombre("");
    setTelefono("");
    setError(null);
  };

  const cerrar = () => {
    reiniciar();
    onCerrar();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Stop propagation so the parent order form is not submitted (React portals bubble synthetic events).
    e.preventDefault();
    e.stopPropagation();

    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setGuardando(true);
    const resultado = await onCrear({
      nombre: nombre.trim(),
      telefono: telefono.trim() || undefined,
    });
    setGuardando(false);

    if (resultado.id) {
      onCreado(resultado.id);
      cerrar();
    } else {
      setError(resultado.error || "No se pudo crear el cliente");
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && cerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription>
            Creación rápida. Podrás completar el resto de los datos desde Clientes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="clienteRapidoNombre">Nombre *</Label>
            <Input
              id="clienteRapidoNombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="clienteRapidoTelefono">Teléfono</Label>
            <Input
              id="clienteRapidoTelefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Crear y seleccionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
