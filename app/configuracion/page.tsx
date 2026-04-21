"use client";

import { ConfiguracionFormData } from "@/types";
import { useConfiguracion } from "@/hooks/useConfiguracion";
import { ConfiguracionForm } from "@/components/configuracion/ConfiguracionForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import { Settings, AlertCircle, DollarSign, Percent, Globe } from "lucide-react";

export default function ConfiguracionPage() {
  const { configuracion, cargando, error, actualizar } = useConfiguracion();

  const handleSubmit = async (datos: ConfiguracionFormData) => {
    await actualizar(datos);
  };

  if (cargando) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-t-transparent border-violet-500 animate-spin"></div>
            <p className="text-gray-700">Cargando configuración...</p>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!configuracion) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
              <CardContent className="py-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 font-medium">Error al cargar la configuración</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            Configuración
          </h1>
          <p className="text-gray-700 mt-1">
            Configura los valores globales del sistema
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
              <CardContent className="py-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ConfiguracionForm configuracion={configuracion} onSubmit={handleSubmit} />
        </motion.div>

        {/* Información Adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                Información Importante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">Moneda</h4>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Afecta cómo se muestran los precios en todo el sistema
                  </p>
                </div>
                
                <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-4 border border-violet-100 dark:border-violet-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <h4 className="font-semibold text-violet-900 dark:text-violet-100 text-sm">Margen de Ganancia</h4>
                  </div>
                  <p className="text-sm text-violet-700 dark:text-violet-300">
                    Se usa para calcular el precio de venta sugerido
                  </p>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-100 dark:border-amber-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">Tasa de Cambio</h4>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Valor del USD en moneda local (actualizable desde BCV)
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-800">
                  <strong>Nota:</strong> Estos valores son por defecto. Puedes modificarlos individualmente en cada receta según tus necesidades.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
