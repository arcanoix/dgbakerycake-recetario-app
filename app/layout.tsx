import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

// Optimizar fuente con display swap para mejor FCP
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#111722",
};

export const metadata: Metadata = {
  title: {
    default: "DGcost — Costos, inventario y ventas para gastronomía",
    template: "%s | DGcost",
  },
  description: "Calcula el costo real de tus recetas, incorpora mermas, controla inventario y protege el margen de tu negocio gastronómico.",
  metadataBase: new URL("https://www.dgcost.online"),
  openGraph: {
    title: "DGcost — Convierte cada receta en un negocio rentable",
    description: "Costeo gastronómico, inventario y ventas en una sola plataforma.",
    url: "https://www.dgcost.online",
    siteName: "DGcost",
    locale: "es_LA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-gray-100`}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
