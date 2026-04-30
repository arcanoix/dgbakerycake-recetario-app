"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePassword } from "@/lib/supabase-auth";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChefHat, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff,
  ShieldCheck
} from "lucide-react";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("Mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const result = await updatePassword(password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setError(result.error || "Error al actualizar la contraseña");
      }
    } catch (err) {
      setError("Error inesperado al restablecer contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden bg-card">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500" />
        <CardHeader className="text-center space-y-4 pt-8">
          <Link href="/" className="inline-flex items-center gap-2 mx-auto">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
               <ChefHat className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-foreground">
              DGcost
            </span>
          </Link>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tight">
              Nueva Contraseña
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium px-4">
              Establece una nueva clave de acceso para tu taller digital.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl space-y-4 text-center"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-sm uppercase tracking-tight text-emerald-700">¡Actualizada!</p>
                  <p className="text-xs text-emerald-600 font-medium leading-relaxed">
                    Tu contraseña ha sido cambiada con éxito. Serás redirigido al inicio de sesión en unos segundos...
                  </p>
                </div>
                <Button 
                  onClick={() => router.push("/auth/login")}
                  className="w-full font-black text-[10px] tracking-widest uppercase shadow-md bg-emerald-600 hover:bg-emerald-700"
                >
                  IR AL LOGIN AHORA
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                    Nueva Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={loading}
                      className="h-12 bg-muted/30 border-0 focus-visible:ring-primary pl-10 pr-10"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu nueva contraseña"
                      required
                      disabled={loading}
                      className="h-12 bg-muted/30 border-0 focus-visible:ring-primary pl-10"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 font-black tracking-widest text-[10px] uppercase shadow-xl bg-primary hover:shadow-primary/20 transition-all" 
                  disabled={loading}
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "CAMBIAR CONTRASEÑA"}
                </Button>
              </form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
