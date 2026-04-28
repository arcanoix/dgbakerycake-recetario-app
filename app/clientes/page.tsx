"use client";

import { useState } from "react";
import { Cliente, ClienteFormData } from "@/types";
import { useClientes } from "@/hooks/useClientes";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { ClienteForm } from "@/components/ventas/ClienteForm";
import { ClienteList } from "@/components/ventas/ClienteList";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import { Users, Plus, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ClientesPage() {
  const { clientes, cargando, error, errorCarga, crearCliente, actualizarCliente, eliminar, cargarClientes } = useClientes();
  const { canAccess, getPlanDisplayName, cargando: cargandoPlan } = usePlanAccess();

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
  };

  const handleCancelar = () => {
    setClienteEditando(undefined);
    setMostrarFormulario(false);
  };

  // Mostrar loading mientras se verifica el plan
  if (cargandoPlan) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-t-transparent border-violet-500 animate-spin"></div>
            <p className="text-gray-700">Verificando acceso...</p>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!puedeAcceder) {
    return (
      <ProtectedRoute>
        <div className="p-6 max-w-md mx-auto mt-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-violet-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Módulo de Clientes
          </h2>
          <p className="text-gray-700 mb-4 text-sm">
            Gestiona tus clientes y asígnales órdenes y cotizaciones. Disponible desde el plan
            Básico.
          </p>
          <p className="text-xs text-gray-700 mb-5">
            Tu plan actual: <strong>{getPlanDisplayName()}</strong>
          </p>
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
              Ver Planes <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
              <p className="text-sm text-gray-700">
                {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrado{clientes.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {!mostrarFormulario && (
            <Button
              onClick={() => setMostrarFormulario(true)}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
            </Button>
          )}
        </motion.div>

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50/20">
            <CardContent className="py-3 px-4 text-sm text-red-600">{error}</CardContent>
          </Card>
        )}

        {!cargando && errorCarga && clientes.length === 0 && (
          <Card className="border-amber-200 bg-amber-50/70">
            <CardContent className="py-4 space-y-3">
              <p className="font-semibold text-amber-900">No pudimos cargar tus clientes</p>
              <p className="text-amber-800 text-sm">{errorCarga}</p>
              <Button variant="outline" onClick={() => cargarClientes()} className="border-amber-300 text-amber-900 hover:bg-amber-100">
                Reintentar carga
              </Button>
            </CardContent>
          </Card>
        )}

        {!cargando && errorCarga && clientes.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="py-3 px-4 text-sm text-amber-800">
              {errorCarga}
            </CardContent>
          </Card>
        )}

        {/* Form */}
        {mostrarFormulario && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <ClienteForm
              cliente={clienteEditando}
              onGuardar={handleGuardar}
              onCancelar={handleCancelar}
            />
          </motion.div>
        )}

        {/* List */}
        {!errorCarga || clientes.length > 0 ? (
          <ClienteList
            clientes={clientes}
            cargando={cargando}
            onEditar={handleEditar}
            onEliminar={eliminar}
          />
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
