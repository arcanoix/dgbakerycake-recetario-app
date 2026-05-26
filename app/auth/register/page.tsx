"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp, signInWithGoogle } from '@/lib/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Chrome, Check, RefreshCw, User, Mail, Lock, ShieldCheck, Sparkles, Users } from 'lucide-react';
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
            Profesionaliza tu negocio gastronómico hoy
          </h1>
          <p className="text-xl text-white/90 font-medium leading-relaxed">
            Calcula costos reales, controla inventario, gestiona ventas y toma decisiones basadas en datos. Todo en una sola plataforma.
          </p>
          
          {/* Benefits */}
          <div className="space-y-4 pt-4">
            {[
              '✅ Costeo preciso de recetas por porción',
              '✅ Control completo de inventario',
              '✅ Gestión de ventas y cotizaciones',
              '✅ Análisis de rentabilidad en tiempo real'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full backdrop-blur-sm border border-emerald-400/30 mt-4">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span className="text-sm font-bold text-emerald-100">Prueba gratis por 14 días • Sin tarjeta</span>
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
                <h2 className="text-2xl font-black">Registro Temporalmente Cerrado</h2>
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
                  Comienza gratis hoy
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
