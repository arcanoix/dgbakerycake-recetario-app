"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signUp, signInWithGoogle } from '@/lib/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Chrome, Check } from 'lucide-react';

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
      setError('La contraseña debe tener al menos 6 caracteres');
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
              Crea tu cuenta
            </CardTitle>
            <CardDescription className="text-gray-500">
              Comienza a gestionar tus costos gratis
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button 
            variant="outline" 
            type="button" 
            className="w-full h-11 font-medium flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            onClick={handleGoogleSignIn}
            disabled={loading || success}
          >
            <Chrome className="w-5 h-5 text-gray-600" />
            Registrarse con Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">o usa tu email</span>
            </div>
          </div>

          {!success && <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-indigo-50 border border-indigo-100 px-4 py-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      ¡Registro exitoso!
                    </p>
                    <p className="text-sm text-slate-600">
                      Te hemos enviado un correo a <span className="font-medium">{email}</span> para confirmar tu cuenta. Por favor revisa tu bandeja de entrada y sigue las instrucciones.
                    </p>
                    <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium mt-3 hover:text-indigo-700">
                      Ir al inicio de sesión
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                Nombre (opcional)
              </label>
              <Input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                disabled={loading || success}
                className="h-11"
              />
            </div>

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
                disabled={loading || success}
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
                disabled={loading || success}
                minLength={6}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading || success}
                minLength={6}
                className="h-11"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gray-900 hover:bg-gray-800" 
              disabled={loading || success}
            >
              {loading ? 'Registrando...' : (
                <>
                  Crear Cuenta
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>}

          {!success && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link href="/auth/login" className="text-gray-900 font-semibold hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
