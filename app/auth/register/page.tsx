"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signUp, signInWithGoogle } from '@/lib/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Chrome, Check, ChefHat, RefreshCw, User, Mail, Lock } from 'lucide-react';
import { Label } from '@/components/ui/label';

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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden bg-card">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500" />
        <CardHeader className="text-center space-y-4 pt-8">
          <Link href="/" className="inline-flex items-center gap-2 group mx-auto">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary/20">
               <ChefHat className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-foreground">
              DGcost
            </span>
          </Link>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tight">
              {success ? "¡Casi listo!" : "Crea tu cuenta"}
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium px-4">
              {success ? "Solo un paso más para empezar." : "Únete a la plataforma líder para reposteros profesionales."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {!success && (
            <>
              <Button 
                variant="outline" 
                type="button" 
                className="w-full h-12 font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 border-2 hover:bg-muted/50 transition-all"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <Chrome className="w-4 h-4" />
                REGISTRARSE CON GOOGLE
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-black tracking-widest">o usa tu email</span>
                </div>
              </div>
            </>
          )}

          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary/5 border border-primary/20 p-6 rounded-2xl space-y-4"
            >
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                <Check className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-black text-sm uppercase tracking-tight text-primary">
                  ¡Registro exitoso!
                </p>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Te hemos enviado un correo a <span className="font-bold text-foreground underline">{email}</span>. Por favor confirma tu cuenta para poder ingresar.
                </p>
              </div>
              <Link href="/auth/login" className="block">
                <Button className="w-full h-11 font-black text-[10px] tracking-widest uppercase shadow-md bg-primary">
                  IR AL LOGIN <ArrowRight className="ml-2 w-3 h-3" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
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
                    className="h-12 bg-muted/30 border-0 focus-visible:ring-primary pl-10"
                  />
                  <ChefHat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
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
                    className="h-12 bg-muted/30 border-0 focus-visible:ring-primary pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      minLength={6}
                      className="h-12 bg-muted/30 border-0 focus-visible:ring-primary pl-10"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                    Confirmar
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      minLength={6}
                      className="h-12 bg-muted/30 border-0 focus-visible:ring-primary pl-10"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 font-black tracking-widest text-[10px] uppercase shadow-xl bg-primary hover:shadow-primary/20 transition-all mt-4" 
                disabled={loading}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
                  <>
                    CREAR MI CUENTA
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {!success && (
            <div className="text-center pt-2">
              <p className="text-xs font-medium text-muted-foreground">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/auth/login" className="text-primary font-black hover:underline uppercase tracking-tighter ml-1">
                  Inicia Sesión
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
