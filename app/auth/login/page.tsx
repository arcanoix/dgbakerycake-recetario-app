"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn, signInWithGoogle } from '@/lib/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Globe, RefreshCw, KeyRound, Mail, ShieldCheck, Wrench } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { LogoFull } from '@/components/ui/logo';
import { obtenerConfiguracionSistema, verificarModoMantenimiento } from '@/lib/systemSettings';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Verificar modo mantenimiento al cargar la página
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const settings = await obtenerConfiguracionSistema();
        if (settings.maintenance_mode) {
          setMaintenanceMessage(settings.maintenance_message || 'El sistema está en mantenimiento. Volveremos pronto.');
        }
      } catch {
        // Ignorar errores silenciosamente
      }
    };
    checkMaintenance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verificar modo mantenimiento antes de login
      const mantenimientoCheck = await verificarModoMantenimiento();
      if (mantenimientoCheck.enMantenimiento && !mantenimientoCheck.adminPuedeAcceder) {
        setError(mantenimientoCheck.mensaje || 'El sistema está en mantenimiento. Intente más tarde.');
        setLoading(false);
        return;
      }

      const result = await signIn({ email, password });

      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión');
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
        setError(result.error || 'Error al iniciar sesión con Google');
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
              Gestión para gastronomía
            </p>
          </div>
          <h1 className="max-w-xl text-5xl font-extrabold leading-[.98] tracking-[-.055em] text-white">
            Controla costos y maximiza ganancias en tu negocio gastronómico
          </h1>
          <p className="max-w-xl text-lg font-medium leading-8 text-slate-300">
            Calcula el costo real de tus recetas, gestiona inventario, controla ventas y toma decisiones basadas en datos reales.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur-sm">
              <p className="mb-1 text-sm font-semibold text-amber-300">Costeo de recetas</p>
              <p className="text-xs text-slate-400">Calcula costos exactos por porción</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur-sm">
              <p className="mb-1 text-sm font-semibold text-amber-300">Control de inventario</p>
              <p className="text-xs text-slate-400">Gestiona productos y movimientos</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur-sm">
              <p className="mb-1 text-sm font-semibold text-amber-300">Gestión de ventas</p>
              <p className="text-xs text-slate-400">Cotizaciones y órdenes completas</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur-sm">
              <p className="mb-1 text-sm font-semibold text-amber-300">Análisis de rentabilidad</p>
              <p className="text-xs text-slate-400">Identifica tus productos más rentables</p>
            </div>
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

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-[-.045em] text-[#17202d]">
              Accede a tu cuenta
            </h2>
            <p className="font-medium leading-6 text-stone-500">
              Gestiona costos, inventario y ventas de tu negocio gastronómico
            </p>
          </div>

          {/* Alerta de mantenimiento */}
          {maintenanceMessage && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
              <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Modo Mantenimiento Activado
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {maintenanceMessage}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  Solo los administradores pueden acceder en este momento.
                </p>
              </div>
            </div>
          )}

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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Contraseña
                  </Label>
                  <Link href="/auth/forgot-password" className="text-sm font-semibold text-amber-700 hover:text-amber-800 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="h-14 rounded-xl border-stone-300 bg-stone-50 pl-12 text-base focus-visible:border-amber-500 focus-visible:ring-amber-200"
                  />
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <Button 
                type="submit" 
                className="h-14 w-full rounded-xl bg-[#17202d] text-base font-bold text-white shadow-lg shadow-stone-900/15 transition hover:-translate-y-0.5 hover:bg-black"
                disabled={loading}
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                ¿Aún no tienes cuenta?{' '}
                <Link href="/auth/register" className="font-bold text-amber-700 hover:text-amber-800 hover:underline">
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
