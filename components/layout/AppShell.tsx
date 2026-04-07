"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

// Componente interno que maneja la lógica de autenticación y rutas
// Solo se renderiza en el cliente para evitar errores de useContext durante SSR/Build
const AppShellContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const isAuthRoute = pathname.startsWith("/auth/");
  const isBlogRoute = pathname.startsWith("/blog");

  if (isAuthRoute || isBlogRoute || !user) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen lg:pl-64">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </>
  );
};

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Durante el SSR o antes de la hidratación, solo mostramos el contenido básico
  // Sin llamar a ningún hook que use contextos (useAuth, usePathname)
  if (!mounted) {
    return <main className="min-h-screen">{children}</main>;
  }

  return <AppShellContent>{children}</AppShellContent>;
};
