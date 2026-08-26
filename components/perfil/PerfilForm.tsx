"use client";

import { useState, useEffect, useRef } from "react";
import { usePerfil, PerfilFormData, CambiarPasswordData } from "@/hooks/usePerfil";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Calendar, 
  Key, 
  Save, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff,
  UserCircle,
  Shield,
  LogOut,
  Fingerprint,
  RefreshCw,
  Camera,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export const PerfilForm = () => {
  const { user, guardando, error, mensaje, limpiarMensajes, actualizarDatos, cambiarPassword, subirAvatar, subiendoAvatar } =
    usePerfil();

  const [datosForm, setDatosForm] = useState<PerfilFormData>({
    nombre: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState<CambiarPasswordData>({
    passwordNuevo: "",
    passwordConfirmar: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    nueva: false,
    confirmar: false,
  });

  const [accionActiva, setAccionActiva] = useState<"perfil" | "password" | null>(null);
  const [guardadoPerfil, setGuardadoPerfil] = useState(false);
  const [guardadoPassword, setGuardadoPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDatosForm({
        nombre: (user.user_metadata?.nombre as string) || "",
        email: user.email || "",
      });
      setAvatarUrl((user.user_metadata?.avatar_url as string) || null);
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const url = await subirAvatar(file);
    if (url) setAvatarUrl(url);
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
      setPasswordForm({ passwordNuevo: "", passwordConfirmar: "" });
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

  const initials = datosForm.nombre?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "?";

  return (
    <div className="space-y-8">
      {/* Perfil Overview */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-gradient-to-br from-primary/5 via-primary/10 to-violet-500/5 rounded-3xl border shadow-sm">
        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-black shadow-xl ring-4 ring-white">
            {avatarUrl ? <img src={avatarUrl} alt="Foto de perfil" className="h-full w-full object-cover" onError={() => setAvatarUrl(null)} /> : initials}
          </div>
          <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={subiendoAvatar} aria-label="Cambiar foto de perfil" className="absolute -bottom-1 -right-1 grid h-10 w-10 place-items-center rounded-full border-4 border-white bg-[#17202d] text-amber-300 shadow-md transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
            {subiendoAvatar ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="sr-only" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <h3 className="text-2xl font-black tracking-tight">{datosForm.nombre || "Usuario"}</h3>
          <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
            <Mail className="w-4 h-4" />
            {user.email}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
            <Badge variant="secondary" className="bg-white/50 text-primary border-primary/10 font-bold px-3">
              <Calendar className="w-3 h-3 mr-1.5" />
              Desde {fechaRegistro}
            </Badge>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">JPG, PNG o WebP · máximo 2 MB</p>
        </div>
      </div>

      <Tabs defaultValue="datos" className="w-full">
        <TabsList className="bg-muted/50 p-1 border h-11 mb-8">
          <TabsTrigger value="datos" className="gap-2 h-9 px-6 font-bold data-[state=active]:shadow-sm">
            <UserCircle className="w-4 h-4" />
            Datos Personales
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="gap-2 h-9 px-6 font-bold data-[state=active]:shadow-sm">
            <Shield className="w-4 h-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="m-0 space-y-6">
          <motion.div
            key="datos-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Información Básica</CardTitle>
                    <CardDescription>Actualiza tu identidad en la plataforma.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDatosSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="nombre" className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Nombre Completo</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={datosForm.nombre}
                        onChange={handleDatosChange}
                        placeholder="Tu nombre"
                        className="h-12 bg-white"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Correo Electrónico</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={datosForm.email}
                        onChange={handleDatosChange}
                        placeholder="tu@email.com"
                        required
                        className="h-12 bg-white"
                      />
                      <p className="text-[10px] text-muted-foreground font-medium px-1 italic">
                        Si cambias tu email, deberás verificar la nueva dirección.
                      </p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {accionActiva === "perfil" && (error || mensaje) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl border flex items-center gap-3 ${error ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                      >
                        {error ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        <p className="text-sm font-bold">{error || mensaje}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-end pt-4 border-t">
                    <Button 
                      type="submit" 
                      disabled={guardando && accionActiva === "perfil"}
                      className="gap-2 h-11 px-8 font-black shadow-md bg-primary"
                    >
                      {guardadoPerfil ? (
                        <><Check className="w-4 h-4" /> ¡ACTUALIZADO!</>
                      ) : guardando && accionActiva === "perfil" ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> GUARDANDO...</>
                      ) : (
                        <><Save className="w-4 h-4" /> GUARDAR CAMBIOS</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="seguridad" className="m-0 space-y-6">
          <motion.div
            key="seguridad-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Cambio de Contraseña</CardTitle>
                    <CardDescription>Mantén tu cuenta protegida con una contraseña robusta.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="passwordNuevo" className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Nueva Contraseña</Label>
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
                          className="h-12 bg-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, nueva: !p.nueva }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPasswords.nueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="passwordConfirmar" className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Confirmar Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="passwordConfirmar"
                          name="passwordConfirmar"
                          type={showPasswords.confirmar ? "text" : "password"}
                          value={passwordForm.passwordConfirmar}
                          onChange={handlePasswordChange}
                          placeholder="Repite la contraseña"
                          minLength={6}
                          required
                          className="h-12 bg-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, confirmar: !p.confirmar }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPasswords.confirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {accionActiva === "password" && (error || mensaje) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl border flex items-center gap-3 ${error ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                      >
                        {error ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        <p className="text-sm font-bold">{error || mensaje}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-end pt-4 border-t">
                    <Button 
                      type="submit" 
                      disabled={guardando && accionActiva === "password"}
                      className="gap-2 h-11 px-8 font-black shadow-md bg-amber-600 hover:bg-amber-700"
                    >
                      {guardadoPassword ? (
                        <><Check className="w-4 h-4" /> ¡ACTUALIZADA!</>
                      ) : guardando && accionActiva === "password" ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> ACTUALIZANDO...</>
                      ) : (
                        <><Shield className="w-4 h-4" /> CAMBIAR CONTRASEÑA</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Info Account Footer */}
      <div className="bg-muted/30 p-4 rounded-2xl border border-dashed text-center">
        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em]">
          ID de Usuario: {user.id}
        </p>
      </div>
    </div>
  );
};
