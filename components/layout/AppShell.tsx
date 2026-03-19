"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

/**
 * AppShell: wraps the app content with conditional Navbar and footer.
 * Auth routes (/auth/*) get a clean layout without any chrome.
 */
export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth/");

  if (isAuthRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 DG Bakery Cake - Sistema de Gestión de Costos de Recetas</p>
        </div>
      </footer>
    </>
  );
};
