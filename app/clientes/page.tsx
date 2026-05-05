"use client";

import { useState } from "react";
import { Cliente, ClienteFormData } from "@/types";
import { useClientes } from "@/hooks/useClientes";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { ClienteForm } from "@/components/clientes/ClienteForm";
import { ClienteList } from "@/components/clientes/ClienteList";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Plus, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw, 
  X,
  UserPlus
} from "lucide-react";
import Link from "next/link";

export default function ClientesPage() {
  const { clientes, cargando, error, errorCarga, crearCliente, actualizarCliente, eliminar, cargarClientes } = useClientes();
  const { canAccess, getPlanDisplayName, getPlanName, cargando: cargandoPlan } = usePlanAccess();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | undefined>();

  const puedeAcceder = canAccess("menu_clientes");

  const handleGuardar = async (datos: ClienteFormData): Promise<boolean> => {
    if (clienteEditando) {
      return actualizarCliente(clienteEditando.id, datos);
    }
    return crearCliente(datos);
  };

  const handleEditar = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelar = () => {
    setClienteEditando(undefined);
    setMostrarFormulario(false);
  };

  if (cargandoPlan) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Verificando acceso...</p>
      </div>
    );
  }

  if (!puedeAcceder) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Módulo de Clientes</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Gestiona tu base de datos de clientes para agilizar tus ventas. 
              Disponible desde el plan <strong>Básico</strong>.
            </p>
          </div>
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
            <p className="text-sm font-medium">Plan actual: <span className="text-primary font-bold uppercase">{getPlanDisplayName()}</span></p>
          </div>
          <Link href="/pricing">
            <Button className="gap-2 h-11 px-6 shadow-lg bg-primary">
              Ver Planes <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Directorio de Clientes
            </h2>
            <p className="text-sm text-muted-foreground">
              Administra la información de contacto y pedidos de tus clientes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              size="sm"
              variant={mostrarFormulario ? "outline" : "default"}
              className={`gap-2 h-10 px-4 ${!mostrarFormulario ? 'bg-primary shadow-sm' : ''}`}
            >
              {mostrarFormulario ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{mostrarFormulario ? "Cancelar" : "Nuevo Cliente"}</span>
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 shadow-none">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => cargarClientes()} className="h-8">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {mostrarFormulario ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <ClienteForm
                cliente={clienteEditando}
                onGuardar={handleGuardar}
                onCancelar={handleCancelar}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <ClienteList
                clientes={clientes}
                cargando={cargando}
                onEditar={handleEditar}
                onEliminar={eliminar}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
