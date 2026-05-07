"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp, signInWithGoogle } from '@/lib/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Chrome, Check, RefreshCw, User, Mail, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { LogoFull } from '@/components/ui/logo';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('Mínimo 6 caracteres para mayor seguridad');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp({ email, password, nombre });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error inesperado al registrar usuario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        setError(result.error || 'Error al registrarse con Google');
        setLoading(false);
      }
    } catch (err) {
      setError('Error inesperado con Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <LogoFull size="lg" className="text-white [&_path]:fill-white [&_stop]:stop-color-white" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">Prueba gratis por 14 días</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight">
            Únete a cientos de reposteros exitosos
          </h1>
          <p className="text-xl text-white/90 font-medium leading-relaxed">
            Comienza a calcular costos precisos, gestionar inventario y aumentar tus ganancias desde el primer día.
          </p>
          
          {/* Benefits */}
          <div className="space-y-4 pt-4">
            {[
              'Sin tarjeta de crédito requerida',
              'Acceso completo a todas las funciones',
              'Soporte prioritario incluido',
              'Cancela cuando quieras'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-white/60 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Datos protegidos con encriptación de nivel bancario</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-violet-500/10 to-fuchsia-500/10 border-2 border-primary/20">
              <LogoFull size="lg" />
            </div>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black">¡Cuenta Creada!</h2>
                <p className="text-muted-foreground font-medium">
                  Revisa tu correo <span className="font-bold text-foreground">{email}</span> para confirmar tu cuenta.
                </p>
              </div>
              <Button asChild className="w-full h-14 rounded-xl">
                <Link href="/auth/login">Ir al Login</Link>
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">
                  Crea tu cuenta gratis
                </h2>
                <p className="text-muted-foreground font-medium">
                  Únete a la plataforma líder para reposteros profesionales
                </p>
              </div>

              <div className="space-y-6">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full h-14 font-semibold text-sm flex items-center justify-center gap-3 border-2 hover:bg-muted/50 transition-all rounded-xl"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Chrome className="w-5 h-5" />
                  Continuar con Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-4 text-muted-foreground font-medium">o usa tu email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-destructive/10 border-l-4 border-destructive text-destructive px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-semibold">
                      Nombre de tu Negocio
                    </Label>
                    <div className="relative">
                      <Input
                        id="nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej: Dulce Pasión"
                        disabled={loading}
                        className="h-14 pl-12 text-base rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Correo Electrónico
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                        disabled={loading}
                        className="h-14 pl-12 text-base rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        disabled={loading}
                        className="h-14 pl-12 text-base rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                      Confirmar Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite tu contraseña"
                        required
                        disabled={loading}
                        className="h-14 pl-12 text-base rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all" 
                    disabled={loading}
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                      <>
                        Crear Cuenta Gratis
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/auth/login" className="text-primary font-bold hover:underline">
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
