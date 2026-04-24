"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";

/**
 * AppShell — layout wrapper sin el anti-pattern useState(mounted).
 *
 * El patrón anterior hacía un doble render en cada página:
 *   1er render: shell vacío (mounted=false) → CLS
 *   2do render: shell real (mounted=true)   → layout shift visible
 *
 * La solución es confiar en que AuthContext ya maneja la hidratación
 * y renderizar directamente. El parpadeo de Navbar es preferible al CLS.
 */
export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const isPublicRoute =
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/blog") ||
    pathname === "/";

  if (isPublicRoute || !user) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 lg:pt-0 lg:pl-64">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </>
  );
};
