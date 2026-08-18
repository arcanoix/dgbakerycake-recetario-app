"use client";

import { useState } from "react";
import { Cliente } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Trash2, 
  LayoutGrid, 
  Table as TableIcon,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DataTable } from "@/components/ui/data-table";
import { getClienteColumns } from "./cliente-columns";

interface ClienteListProps {
  clientes: Cliente[];
  cargando: boolean;
  onEditar: (cliente: Cliente) => void;
  onEliminar: (id: string) => void;
}

export const ClienteList = ({ clientes, cargando, onEditar, onEliminar }: ClienteListProps) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const columns = getClienteColumns({
    onEdit: onEditar,
    onDelete: (id) => {
      setEliminandoId(id);
      Promise.resolve(onEliminar(id)).finally(() => setEliminandoId(null));
    },
  });

  if (cargando && clientes.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Cargando clientes...</p>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-3xl bg-muted/20"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Sin clientes registrados</h3>
        <p className="text-muted-foreground max-w-md leading-relaxed">
          Comienza creando tu primer cliente para gestionar sus pedidos y cotizaciones.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">
          Mostrando <span className="text-foreground font-bold">{clientes.length}</span> clientes
        </p>
        <div className="flex bg-muted p-1 rounded-lg border">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'shadow-sm' : ''}
          >
            <TableIcon className="w-4 h-4 mr-2" />
            Tabla
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'shadow-sm' : ''}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Cuadrícula
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <DataTable 
              columns={columns} 
              data={clientes} 
              searchKey="nombre"
              placeholder="Filtrar por nombre..."
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {clientes.map((cliente, index) => (
              <Card key={cliente.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-md bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold truncate flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          {cliente.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate group-hover:text-primary transition-colors">{cliente.nombre}</span>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {(cliente.email || cliente.telefono || cliente.direccion) && (
                    <div className="bg-muted/30 rounded-xl p-4 space-y-3 border">
                      {cliente.email && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <p className="font-medium text-muted-foreground truncate">{cliente.email}</p>
                        </div>
                      )}
                      {cliente.telefono && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-1.5 rounded-lg bg-green-500/10 text-green-600">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <p className="font-medium text-muted-foreground">{cliente.telefono}</p>
                        </div>
                      )}
                      {cliente.direccion && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <p className="font-medium text-muted-foreground truncate">{cliente.direccion}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 font-bold text-[10px] h-9"
                      onClick={() => onEditar(cliente)}
                      disabled={eliminandoId === cliente.id}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      EDITAR
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-2 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm(`¿Estás seguro de eliminar a "${cliente.nombre}"?`)) {
                          onEliminar(cliente.id);
                        }
                      }}
                      disabled={eliminandoId === cliente.id}
                    >
                      {eliminandoId === cliente.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
