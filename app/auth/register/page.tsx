"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp, signInWithGoogle } from '@/lib/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Check, RefreshCw, User, Mail, Lock, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { LogoFull } from '@/components/ui/logo';
import { verificarLimiteRegistro, verificarModoMantenimiento } from '@/lib/systemSettings';

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
  const [registrationBlocked, setRegistrationBlocked] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ current: number; max: number } | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Verificar límite de usuarios al cargar la página
  useEffect(() => {
    const checkLimit = async () => {
      try {
        const result = await verificarLimiteRegistro();
        if (!result.permitido) {
          setRegistrationBlocked(true);
          setLimitInfo({ current: result.totalUsuarios, max: result.maxUsers });
        }
      } catch {
        // En caso de error, permitir registro
      }
    };
    checkLimit();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (registrationBlocked) {
      setError('El registro de nuevos usuarios está temporalmente deshabilitado.');
      return;
    }

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
      // Verificar límite de usuarios
      const limiteCheck = await verificarLimiteRegistro();
      if (!limiteCheck.permitido) {
        setError(limiteCheck.mensaje || 'No se permiten más registros en este momento.');
        setRegistrationBlocked(true);
        setLimitInfo({ current: limiteCheck.totalUsuarios, max: limiteCheck.maxUsers });
        setLoading(false);
        return;
      }

      // Verificar modo mantenimiento
      const mantenimientoCheck = await verificarModoMantenimiento();
      if (mantenimientoCheck.enMantenimiento && !mantenimientoCheck.adminPuedeAcceder) {
        setError(mantenimientoCheck.mensaje || 'El sistema está en mantenimiento. Intente más tarde.');
        setLoading(false);
        return;
      }

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
    <div className="landing-surface min-h-dvh bg-[#f8f6f1] text-[#17202d] lg:flex">
      {/* Left Side - Hero Section */}
      <div className="relative hidden overflow-hidden bg-[#111722] p-12 lg:flex lg:w-[48%] lg:flex-col lg:justify-between">
        {/* Decorative Elements */}
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
        
        <div className="relative z-10">
          <LogoFull size="lg" className="text-white [&_path]:fill-white [&_stop]:stop-color-white" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="mb-4 inline-block rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-300">
              Tu cocina, con números claros
            </p>
          </div>
          <h1 className="max-w-xl text-5xl font-extrabold leading-[.98] tracking-[-.055em] text-white">
            Profesionaliza tu negocio gastronómico hoy
          </h1>
          <p className="max-w-xl text-lg font-medium leading-8 text-slate-300">
            Calcula costos reales, controla inventario, gestiona ventas y toma decisiones basadas en datos. Todo en una sola plataforma.
          </p>
          
          {/* Benefits */}
          <div className="space-y-4 pt-4">
            {[
              'Costeo preciso de recetas por porción',
              'Control completo de inventario',
              'Gestión de ventas y cotizaciones',
              'Análisis de rentabilidad en tiempo real'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
                  <Check className="h-4 w-4 text-emerald-300" />
                </div>
                <span className="font-medium text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span className="text-sm font-bold text-emerald-100">Prueba gratis por 14 días • Sin tarjeta</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs font-semibold text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Datos protegidos con encriptación de nivel bancario</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-1 items-center justify-center p-5 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-7 rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,.45)] sm:p-9">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
              <LogoFull size="lg" />
            </div>
          </div>

          {registrationBlocked ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold tracking-[-.04em]">Registro Temporalmente Cerrado</h2>
                <p className="text-muted-foreground font-medium">
                  Hemos alcanzado el límite de usuarios permitidos en este momento.
                </p>
                {limitInfo && limitInfo.max > 0 && (
                  <p className="text-sm text-amber-600 font-semibold">
                    {limitInfo.current} / {limitInfo.max} usuarios registrados
                  </p>
                )}
              </div>
              <Button asChild variant="outline" className="w-full h-14 rounded-xl">
                <Link href="/auth/login">Ir al Login</Link>
              </Button>
            </motion.div>
          ) : success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-[-.04em]">¡Cuenta Creada!</h2>
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
                <h2 className="text-3xl font-extrabold tracking-[-.045em] text-[#17202d]">
                  Comienza gratis hoy
                </h2>
                <p className="font-medium leading-6 text-stone-500">
                  Gestiona costos, inventario y ventas de tu negocio gastronómico
                </p>
              </div>

              <div className="space-y-6">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="h-14 w-full rounded-xl border-stone-300 bg-white text-sm font-semibold shadow-sm transition hover:border-amber-400 hover:bg-amber-50"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Globe className="w-5 h-5" />
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
                        className="h-14 rounded-xl border-stone-300 bg-stone-50 pl-12 text-base focus-visible:border-amber-500 focus-visible:ring-amber-200"
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
                        className="h-14 rounded-xl border-stone-300 bg-stone-50 pl-12 text-base focus-visible:border-amber-500 focus-visible:ring-amber-200"
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
                        className="h-14 rounded-xl border-stone-300 bg-stone-50 pl-12 text-base focus-visible:border-amber-500 focus-visible:ring-amber-200"
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
                        className="h-14 rounded-xl border-stone-300 bg-stone-50 pl-12 text-base focus-visible:border-amber-500 focus-visible:ring-amber-200"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="h-14 w-full rounded-xl bg-[#17202d] text-base font-bold text-white shadow-lg shadow-stone-900/15 transition hover:-translate-y-0.5 hover:bg-black"
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
                    <Link href="/auth/login" className="font-bold text-amber-700 hover:text-amber-800 hover:underline">
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
