import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
