"use client";

import { useState, useEffect } from "react";
import { usePerfil, PerfilFormData, CambiarPasswordData } from "@/hooks/usePerfil";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card>
        <CardHeader>
          <CardTitle>Información de la Cuenta</CardTitle>
          <CardDescription>Datos de registro y actividad de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground w-36">Email actual:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground w-36">Registrado el:</span>
            <span>{fechaRegistro}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground w-36">ID de usuario:</span>
            <span className="font-mono text-xs text-muted-foreground">{user.id}</span>
          </div>
        </CardContent>
      </Card>

      {/* Datos personales */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Personales</CardTitle>
          <CardDescription>Actualiza tu nombre y dirección de correo electrónico</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDatosSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                value={datosForm.nombre}
                onChange={handleDatosChange}
                placeholder="Tu nombre"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={datosForm.email}
                onChange={handleDatosChange}
                placeholder="tu@email.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                Si cambias tu email, recibirás un correo de confirmación en la nueva dirección.
              </p>
            </div>

            {accionActiva === "perfil" && error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {accionActiva === "perfil" && mensaje && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{mensaje}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={guardando && accionActiva === "perfil"}>
                {guardadoPerfil
                  ? "✓ Guardado"
                  : guardando && accionActiva === "perfil"
                  ? "Guardando..."
                  : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Cambiar contraseña */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwordActual">Contraseña Actual</Label>
              <Input
                id="passwordActual"
                name="passwordActual"
                type="password"
                value={passwordForm.passwordActual}
                onChange={handlePasswordChange}
                placeholder="Tu contraseña actual"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordNuevo">Nueva Contraseña</Label>
              <Input
                id="passwordNuevo"
                name="passwordNuevo"
                type="password"
                value={passwordForm.passwordNuevo}
                onChange={handlePasswordChange}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmar">Confirmar Nueva Contraseña</Label>
              <Input
                id="passwordConfirmar"
                name="passwordConfirmar"
                type="password"
                value={passwordForm.passwordConfirmar}
                onChange={handlePasswordChange}
                placeholder="Repite la nueva contraseña"
                minLength={6}
                required
              />
            </div>

            {accionActiva === "password" && error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {accionActiva === "password" && mensaje && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{mensaje}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={guardando && accionActiva === "password"}
                variant="outline"
              >
                {guardadoPassword
                  ? "✓ Contraseña actualizada"
                  : guardando && accionActiva === "password"
                  ? "Actualizando..."
                  : "Cambiar Contraseña"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
