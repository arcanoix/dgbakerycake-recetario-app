"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn, signInWithGoogle } from '@/lib/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Chrome, RefreshCw, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { LogoFull } from '@/components/ui/logo';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <p className="text-sm font-black text-white uppercase tracking-wider">
              🍰 Sistema de Gestión para Gastronomía
            </p>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight">
            Controla costos y maximiza ganancias en tu negocio gastronómico
          </h1>
          <p className="text-xl text-white/90 font-medium leading-relaxed">
            Calcula el costo real de tus recetas, gestiona inventario, controla ventas y toma decisiones basadas en datos reales.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-white/80 font-semibold mb-1">📊 Costeo de Recetas</p>
              <p className="text-xs text-white/70">Calcula costos exactos por porción</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-white/80 font-semibold mb-1">📦 Control de Inventario</p>
              <p className="text-xs text-white/70">Gestiona productos y movimientos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-white/80 font-semibold mb-1">💰 Gestión de Ventas</p>
              <p className="text-xs text-white/70">Cotizaciones y órdenes completas</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-white/80 font-semibold mb-1">📈 Análisis de Rentabilidad</p>
              <p className="text-xs text-white/70">Identifica tus productos más rentables</p>
            </div>
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

          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">
              Accede a tu cuenta
            </h2>
            <p className="text-muted-foreground font-medium">
              Gestiona costos, inventario y ventas de tu negocio gastronómico
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Contraseña
                  </Label>
                  <Link href="/auth/forgot-password" className="text-sm font-semibold text-primary hover:underline">
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
                    className="h-14 pl-12 text-base rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all" 
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
                <Link href="/auth/register" className="text-primary font-bold hover:underline">
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
