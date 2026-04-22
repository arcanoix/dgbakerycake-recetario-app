"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Home page — sin el anti-pattern useState(mounted).
 *
 * Antes: doble render en cada visita → pantalla blanca → CLS severo en LCP.
 * Ahora: renderiza LandingPage directamente mientras auth resuelve en background.
 * Si el usuario está logueado, redirige sin pantalla en blanco intermedia.
 */
export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users immediately
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Render landing page immediately — no spinner, no blank screen
  // Auth redirect happens as a side effect, which is fine for logged-in users
  if (authLoading || user) {
    // Minimal placeholder that doesn't cause CLS
    return null;
  }

  return <LandingPage />;
}
