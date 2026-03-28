"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabaseAuth } from '@/lib/supabase-auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);

  const sessionFoundRef = useRef(false);

  // Tiempo máximo de espera para que Supabase procese el token de recuperación
  const TOKEN_PROCESSING_TIMEOUT_MS = 1500;

  useEffect(() => {
    // Escuchar el evento PASSWORD_RECOVERY que Supabase emite al procesar el enlace
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        sessionFoundRef.current = true;
        setValidSession(true);
      }
    });

    // También verificar si ya existe una sesión activa (token ya procesado)
    const checkSession = async () => {
      const { data: { session } } = await supabaseAuth.auth.getSession();
      if (session) {
        sessionFoundRef.current = true;
        setValidSession(true);
      } else {
        // Esperar brevemente para que onAuthStateChange pueda procesar el token
        setTimeout(() => {
          if (!sessionFoundRef.current) {
            setError('Enlace de recuperación inválido o expirado');
          }
        }, TOKEN_PROCESSING_TIMEOUT_MS);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      const { error } = await supabaseAuth.auth.updateUser({
        password: password
      });

      if (error) {
        let errorMsg = error.message;
        if (errorMsg.includes('New password should be different from the old password')) {
          errorMsg = 'La nueva contraseña debe ser diferente a la contraseña anterior.';
        } else if (errorMsg.includes('Password should be at least')) {
          errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
        }
        setError(errorMsg);
      } else {
        setSuccess(true);
        // Cerrar sesión para que el usuario inicie sesión con la nueva contraseña
        await supabaseAuth.auth.signOut();
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (err) {
      setError('Error inesperado al actualizar la contraseña');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!validSession && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Verificando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🔐</h1>
          <h2 className="text-2xl font-bold text-gray-800">Nueva Contraseña</h2>
          <p className="text-gray-600 mt-2">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {!validSession ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold mb-2">❌ Enlace inválido</p>
            <p className="text-sm mb-4">
              El enlace de recuperación es inválido o ha expirado.
            </p>
            <Link href="/auth/forgot-password">
              <Button variant="outline" className="w-full">
                Solicitar nuevo enlace
              </Button>
            </Link>
          </div>
        ) : !success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </form>
        ) : (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p className="font-semibold mb-2">✅ Contraseña actualizada exitosamente</p>
            <p className="text-sm">
              Redirigiendo al login...
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Recordaste tu contraseña?{' '}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
