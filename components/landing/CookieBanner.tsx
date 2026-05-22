"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "cookie-consent-dgcost";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setVisible(true);
      }
    } catch {
      // Si localStorage no está disponible, mostramos el banner
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch {
      // Ignorar errores de localStorage
    }
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  // Evitar hidratación inconsistente
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Cookie className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    Usamos cookies para mejorar tu experiencia
                  </p>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    Utilizamos cookies y tecnologías similares para analizar el tráfico,
                    personalizar contenido y ofrecerte funcionalidades avanzadas.
                    Al continuar navegando, aceptas nuestra{" "}
                    <Link
                      href="/terminos"
                      className="text-primary hover:underline font-bold"
                    >
                      política de cookies
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                <Button
                  onClick={handleAccept}
                  size="sm"
                  className="font-black text-[10px] tracking-widest uppercase flex-1 md:flex-none"
                >
                  Aceptar
                </Button>
                <button
                  onClick={handleDismiss}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Cerrar aviso de cookies"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
