"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPassword } from "@/lib/supabase-auth";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Mail, ChefHat, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Error al enviar el correo de recuperación");
      }
    } catch (err) {
      setError("Error inesperado al solicitar recuperación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden bg-card">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
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
              Recuperar Acceso
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium px-4">
              Te enviaremos un enlace para restablecer tu contraseña.
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
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-sm uppercase tracking-tight text-emerald-700">¡Correo Enviado!</p>
                  <p className="text-xs text-emerald-600 font-medium leading-relaxed">
                    Revisa tu bandeja de entrada en <span className="font-bold underline">{email}</span> para continuar.
                  </p>
                </div>
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-black text-[10px] tracking-widest uppercase">
                    VOLVER AL LOGIN
                  </Button>
                </Link>
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

                <Button 
                  type="submit" 
                  className="w-full h-12 font-black tracking-widest text-[10px] uppercase shadow-xl bg-primary hover:shadow-primary/20 transition-all" 
                  disabled={loading}
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "ENVIAR INSTRUCCIONES"}
                </Button>

                <Link href="/auth/login" className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group">
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  VOLVER AL INICIO DE SESIÓN
                </Link>
              </form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
