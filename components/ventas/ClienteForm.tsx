"use client";

import { useState, useEffect } from "react";
import { Cliente, ClienteFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface ClienteFormProps {
  cliente?: Cliente;
  onGuardar: (datos: ClienteFormData) => Promise<boolean>;
  onCancelar: () => void;
}

export const ClienteForm = ({ cliente, onGuardar, onCancelar }: ClienteFormProps) => {
  const [nombre, setNombre] = useState(cliente?.nombre || "");
  const [email, setEmail] = useState(cliente?.email || "");
  const [telefono, setTelefono] = useState(cliente?.telefono || "");
  const [direccion, setDireccion] = useState(cliente?.direccion || "");
  const [notas, setNotas] = useState(cliente?.notas || "");
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cliente) {
      setNombre(cliente.nombre);
      setEmail(cliente.email || "");
      setTelefono(cliente.telefono || "");
      setDireccion(cliente.direccion || "");
      setNotas(cliente.notas || "");
    }
  }, [cliente]);

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    if (!nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nuevosErrores.email = "El email no es válido";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    setGuardando(true);
    const exito = await onGuardar({
      nombre: nombre.trim(),
      email: email.trim() || undefined,
      telefono: telefono.trim() || undefined,
      direccion: direccion.trim() || undefined,
      notas: notas.trim() || undefined,
    });
    setGuardando(false);
    if (exito) onCancelar();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">
          {cliente ? "Editar Cliente" : "Nuevo Cliente"}
        </CardTitle>
        <button onClick={onCancelar} className="p-1 rounded hover:bg-accent">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Nombre completo del cliente"
            />
            {errores.nombre && <p className="text-sm text-destructive">{errores.nombre}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
              {errores.email && <p className="text-sm text-destructive">{errores.email}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="+58 412 0000000"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              placeholder="Dirección del cliente"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={guardando} className="flex-1">
              {guardando ? "Guardando..." : cliente ? "Actualizar" : "Crear Cliente"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancelar} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
