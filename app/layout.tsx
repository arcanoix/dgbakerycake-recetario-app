import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "DG Bakery Cake - Gestión de Costos",
  description: "Sistema de gestión de costos de recetas de repostería y pastelería",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2026 DG Bakery Cake - Sistema de Gestión de Costos de Recetas</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
