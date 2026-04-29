"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn, signInWithGoogle } from '@/lib/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Chrome } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🧁</span>
            <span className="text-2xl font-bold text-gray-900">
              DGcost
            </span>
          </Link>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Bienvenido de nuevo
            </CardTitle>
            <CardDescription className="text-gray-500">
              Inicia sesión para gestionar tus costos
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button 
            variant="outline" 
            type="button" 
            className="w-full h-11 font-medium flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome className="w-5 h-5 text-gray-600" />
            Continuar con Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">o continúa con email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gray-900 hover:bg-gray-800" 
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/register" className="text-gray-900 font-semibold hover:underline">
                Regístrate gratis
              </Link>
            </p>
            <Link href="/auth/forgot-password" className="text-sm text-gray-500 hover:text-gray-700">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
