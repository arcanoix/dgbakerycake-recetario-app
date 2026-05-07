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
          <h1 className="text-5xl font-black text-white leading-tight">
            Gestiona tu negocio de repostería como un profesional
          </h1>
          <p className="text-xl text-white/90 font-medium leading-relaxed">
            Calcula costos precisos, controla inventario y maximiza tus ganancias con la plataforma líder para reposteros.
          </p>
          <div className="flex gap-8 pt-4">
            <div className="space-y-1">
              <p className="text-4xl font-black text-white">500+</p>
              <p className="text-sm text-white/80 font-semibold">Reposteros activos</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-black text-white">98%</p>
              <p className="text-sm text-white/80 font-semibold">Satisfacción</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-black text-white">24/7</p>
              <p className="text-sm text-white/80 font-semibold">Soporte</p>
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
          <div className="lg:hidden flex justify-center">
            <LogoFull size="lg" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">
              Bienvenido de nuevo
            </h2>
            <p className="text-muted-foreground font-medium">
              Inicia sesión para continuar gestionando tu negocio
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
