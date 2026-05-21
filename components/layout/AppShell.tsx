"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

// Lazy load Sidebar and Header para reducir bundle inicial
const Sidebar = dynamic(() => import("./sidebar").then(mod => ({ default: mod.Sidebar })), {
  ssr: false,
  loading: () => <div className="w-64 bg-card border-r" />
});

const Header = dynamic(() => import("./header").then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="h-16 bg-card border-b" />
});

/**
 * AppShell — Rediseñado siguiendo la estética de shadcn-admin.
 */
export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Persistir estado del sidebar
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setIsCollapsed(saved === "true");
  }, []);

  const handleSetCollapsed = (value: boolean) => {
    setIsCollapsed(value);
    localStorage.setItem("sidebar-collapsed", value.toString());
  };

  const isPublicRoute =
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/blog") ||
    pathname === "/";

  if (isPublicRoute || !user) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  // Prevenir saltos visuales durante la hidratación del sidebar
  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Sidebar - Oculto en móvil (manejado por Sheet en Header), fijo en desktop */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={handleSetCollapsed} 
        className="hidden md:flex" 
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Contiene el toggle de móvil y breadcrumbs */}
        <Header 
          isCollapsed={isCollapsed} 
          setIsCollapsed={handleSetCollapsed} 
        />

        {/* Contenido Principal */}
        <main 
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 transition-all duration-300",
            // Si el sidebar no es sticky/fixed, este margen no es necesario
            // Pero como usamos md:sticky en Sidebar, necesitamos que el main fluya
          )}
        >
          <div id="main-content" className="mx-auto h-full w-full max-w-7xl animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* WhatsApp Button - Flotante */}
      <WhatsAppButton />

      {/* Tour de bienvenida */}
      <OnboardingTour />
    </div>
  );
};
