"use client";

import { useState } from "react";
import { Cliente } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Edit2, Trash2, User, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "motion/react";

interface ClienteListProps {
  clientes: Cliente[];
  cargando: boolean;
  onEditar: (cliente: Cliente) => void;
  onEliminar: (id: string) => void;
}

export const ClienteList = ({ clientes, cargando, onEditar, onEliminar }: ClienteListProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const clientesFiltrados = busqueda
    ? clientes.filter(
        c =>
          c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.telefono?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : clientes;

  const handleEliminar = (id: string) => {
    if (eliminandoId === id) {
      return;
    }

    if (confirmandoEliminar === id) {
      setEliminandoId(id);
      Promise.resolve(onEliminar(id)).finally(() => {
        setEliminandoId(null);
        setConfirmandoEliminar(null);
      });
    } else {
      setConfirmandoEliminar(id);
      setTimeout(() => setConfirmandoEliminar(null), 3000);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar clientes..."
          className="pl-9"
        />
      </div>

      {clientesFiltrados.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">
            {busqueda ? "No se encontraron clientes" : "Sin clientes registrados"}
          </p>
          <p className="text-sm mt-1">
            {!busqueda && "Crea tu primer cliente para comenzar a gestionar tus ventas"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesFiltrados.map((cliente, index) => (
            <motion.div
              key={cliente.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 flex items-center justify-center text-violet-700 font-bold text-sm flex-shrink-0">
                          {cliente.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{cliente.nombre}</span>
                      </CardTitle>
                    </div>
                  </div>
                  {(cliente.email || cliente.telefono) && (
                    <CardDescription className="line-clamp-1 mt-2">
                      {cliente.email || cliente.telefono}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {(cliente.email || cliente.telefono || cliente.direccion) && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3 border">
                      {cliente.email && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <p className="text-[11px] uppercase tracking-wider text-blue-700 font-semibold mb-1 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            Email
                          </p>
                          <p className="text-sm font-medium text-blue-800 truncate">{cliente.email}</p>
                        </div>
                      )}
                      {cliente.telefono && (
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="text-[11px] uppercase tracking-wider text-green-700 font-semibold mb-1 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            Teléfono
                          </p>
                          <p className="text-sm font-medium text-green-800">{cliente.telefono}</p>
                        </div>
                      )}
                      {cliente.direccion && (
                        <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                          <p className="text-[11px] uppercase tracking-wider text-violet-700 font-semibold mb-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            Dirección
                          </p>
                          <p className="text-sm font-medium text-violet-800 truncate">{cliente.direccion}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => onEditar(cliente)}
                      disabled={eliminandoId === cliente.id}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-destructive hover:bg-destructive/10"
                      onClick={() => handleEliminar(cliente.id)}
                      disabled={eliminandoId === cliente.id}
                    >
                      {eliminandoId === cliente.id ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>

                  {confirmandoEliminar === cliente.id && (
                    <p className="text-xs text-destructive font-medium text-center">
                      Haz clic de nuevo para confirmar
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
