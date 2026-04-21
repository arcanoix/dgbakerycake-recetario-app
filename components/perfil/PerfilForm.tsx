"use client";

import { useState, useEffect } from "react";
import { usePerfil, PerfilFormData, CambiarPasswordData } from "@/hooks/usePerfil";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { User, Mail, Calendar, Key, Save, Check, AlertCircle, Eye, EyeOff } from "lucide-react";

export const PerfilForm = () => {
  const { user, guardando, error, mensaje, limpiarMensajes, actualizarDatos, cambiarPassword } =
    usePerfil();

  const [datosForm, setDatosForm] = useState<PerfilFormData>({
    nombre: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState<CambiarPasswordData>({
    passwordActual: "",
    passwordNuevo: "",
    passwordConfirmar: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });

  const [accionActiva, setAccionActiva] = useState<"perfil" | "password" | null>(null);
  const [guardadoPerfil, setGuardadoPerfil] = useState(false);
  const [guardadoPassword, setGuardadoPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setDatosForm({
        nombre: (user.user_metadata?.nombre as string) || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleDatosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosForm((prev) => ({ ...prev, [name]: value }));
    limpiarMensajes();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    limpiarMensajes();
  };

  const handleDatosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccionActiva("perfil");
    const exito = await actualizarDatos(datosForm);
    if (exito) {
      setGuardadoPerfil(true);
      setTimeout(() => setGuardadoPerfil(false), 3000);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccionActiva("password");
    const exito = await cambiarPassword(passwordForm);
    if (exito) {
      setPasswordForm({ passwordActual: "", passwordNuevo: "", passwordConfirmar: "" });
      setGuardadoPassword(true);
      setTimeout(() => setGuardadoPassword(false), 3000);
    }
  };

  if (!user) return null;

  const fechaRegistro = user.created_at
    ? new Date(user.created_at).toLocaleDateString("es-VE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="space-y-6">
      {/* Información de la cuenta */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            Información de la Cuenta
          </CardTitle>
          <CardDescription>Datos de registro y actividad de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                <Mail className="w-4 h-4" />
                Email actual
              </div>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div className="bg-gray-50/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                <Calendar className="w-4 h-4" />
                Registrado el
              </div>
              <p className="font-medium text-gray-900">{fechaRegistro}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-gray-700 font-mono">ID: {user.id}</p>
          </div>
        </CardContent>
      </Card>

      {/* Datos personales */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500" />
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            Datos Personales
          </CardTitle>
          <CardDescription>Actualiza tu nombre y dirección de correo electrónico</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDatosSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-700" />
                Nombre
              </Label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                value={datosForm.nombre}
                onChange={handleDatosChange}
                placeholder="Tu nombre"
                maxLength={100}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-700" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={datosForm.email}
                onChange={handleDatosChange}
                placeholder="tu@email.com"
                required
                className="h-11"
              />
              <p className="text-xs text-gray-700">
                Si cambias tu email, recibirás un correo de confirmación en la nueva dirección.
              </p>
            </div>

            <AnimatePresence>
              {accionActiva === "perfil" && error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-50/30 border border-red-200 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              {accionActiva === "perfil" && mensaje && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-green-50/30 border border-green-200 rounded-lg flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-green-700">{mensaje}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={guardando && accionActiva === "perfil"}
                className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 border-0"
              >
                {guardadoPerfil ? (
                  <>
                    <Check className="w-4 h-4" />
                    Guardado
                  </>
                ) : guardando && accionActiva === "perfil" ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Cambiar contraseña */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Key className="w-4 h-4 text-white" />
            </div>
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwordActual" className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-700" />
                Contraseña Actual
              </Label>
              <div className="relative">
                <Input
                  id="passwordActual"
                  name="passwordActual"
                  type={showPasswords.actual ? "text" : "password"}
                  value={passwordForm.passwordActual}
                  onChange={handlePasswordChange}
                  placeholder="Tu contraseña actual"
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(p => ({ ...p, actual: !p.actual }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-600"
                >
                  {showPasswords.actual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordNuevo" className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-700" />
                Nueva Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="passwordNuevo"
                  name="passwordNuevo"
                  type={showPasswords.nueva ? "text" : "password"}
                  value={passwordForm.passwordNuevo}
                  onChange={handlePasswordChange}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(p => ({ ...p, nueva: !p.nueva }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-600"
                >
                  {showPasswords.nueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmar" className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-700" />
                Confirmar Nueva Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="passwordConfirmar"
                  name="passwordConfirmar"
                  type={showPasswords.confirmar ? "text" : "password"}
                  value={passwordForm.passwordConfirmar}
                  onChange={handlePasswordChange}
                  placeholder="Repite la nueva contraseña"
                  minLength={6}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(p => ({ ...p, confirmar: !p.confirmar }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-600"
                >
                  {showPasswords.confirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {accionActiva === "password" && error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-50/30 border border-red-200 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              {accionActiva === "password" && mensaje && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-green-50/30 border border-green-200 rounded-lg flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-green-700">{mensaje}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={guardando && accionActiva === "password"}
                variant="outline"
                className="gap-2"
              >
                {guardadoPassword ? (
                  <>
                    <Check className="w-4 h-4" />
                    Contraseña actualizada
                  </>
                ) : guardando && accionActiva === "password" ? (
                  "Actualizando..."
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Cambiar Contraseña
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
