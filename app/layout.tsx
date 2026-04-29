import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "DGcost - Gestión de Costos",
  description: "Sistema de gestión de costos de recetas de repostería y pastelería",
  metadataBase: new URL("https://www.dgcost.online"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Preconnect para fuentes de Google */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Precargar recursos críticos */}
        <link rel="preload" href="/images/testimonial-1.jpg" as="image" type="image/webp" />
        <link rel="preload" href="/images/testimonial-2.jpg" as="image" type="image/webp" />
      </head>
      <body className="antialiased bg-gray-100">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
