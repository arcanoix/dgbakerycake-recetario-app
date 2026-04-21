"use client";

import { useState } from "react";
import { Cliente } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Edit2, Trash2, User, Mail, Phone, MapPin } from "lucide-react";

interface ClienteListProps {
  clientes: Cliente[];
  cargando: boolean;
  onEditar: (cliente: Cliente) => void;
  onEliminar: (id: string) => void;
}

export const ClienteList = ({ clientes, cargando, onEditar, onEliminar }: ClienteListProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<string | null>(null);

  const clientesFiltrados = busqueda
    ? clientes.filter(
        c =>
          c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.telefono?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : clientes;

  const handleEliminar = (id: string) => {
    if (confirmandoEliminar === id) {
      onEliminar(id);
      setConfirmandoEliminar(null);
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
        <Input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar clientes..."
          className="pl-9"
        />
      </div>

      {clientesFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-700">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">
            {busqueda ? "No se encontraron clientes" : "Sin clientes registrados"}
          </p>
          <p className="text-sm mt-1">
            {!busqueda && "Crea tu primer cliente para comenzar a gestionar tus ventas"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clientesFiltrados.map(cliente => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                      {cliente.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {cliente.nombre}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditar(cliente)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-700 hover:text-violet-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEliminar(cliente.id)}
                      className={`p-1.5 rounded transition-colors ${
                        confirmandoEliminar === cliente.id
                          ? "bg-red-50 text-red-600"
                          : "hover:bg-gray-100 text-gray-700 hover:text-red-500"
                      }`}
                      title={confirmandoEliminar === cliente.id ? "Confirmar eliminación" : "Eliminar"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600">
                  {cliente.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                  )}
                  {cliente.telefono && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{cliente.telefono}</span>
                    </div>
                  )}
                  {cliente.direccion && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{cliente.direccion}</span>
                    </div>
                  )}
                </div>

                {confirmandoEliminar === cliente.id && (
                  <p className="mt-2 text-xs text-red-500 font-medium">
                    Haz clic de nuevo para confirmar la eliminación
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
