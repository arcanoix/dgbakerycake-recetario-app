"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <img src="https://g2vx4pgn24b8d9ki.public.blob.vercel-storage.com/logo.png" alt="DGcost" className="w-40 h-auto mb-4" />
          </div>
          <h1 className="sr-only">
            DGcost
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            Gestión Inteligente de Costos para Repostería
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Calcula costos precisos, optimiza tus recetas y maximiza tus ganancias.
            La herramienta definitiva para profesionales de la repostería.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-6">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          ¿Por qué elegir DGcost?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">Cálculo Automático de Costos</h3>
              <p className="text-gray-600">
                Calcula automáticamente el costo total de tus recetas incluyendo materiales,
                mano de obra y márgenes de ganancia.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold mb-3">Gestión de Inventario</h3>
              <p className="text-gray-600">
                Administra todos tus productos e insumos en un solo lugar.
                Controla precios, cantidades y proveedores fácilmente.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-3">Recetas Detalladas</h3>
              <p className="text-gray-600">
                Crea recetas con ingredientes, cantidades y tiempos de preparación.
                Visualiza el desglose completo de costos.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3">Precio de Venta Sugerido</h3>
              <p className="text-gray-600">
                Obtén automáticamente el precio de venta recomendado basado en
                tus costos y margen de ganancia deseado.
              </p>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-3">Dashboard Interactivo</h3>
              <p className="text-gray-600">
                Visualiza estadísticas, gráficos y análisis de rentabilidad
                de tus productos y recetas en tiempo real.
              </p>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3">Datos Seguros</h3>
              <p className="text-gray-600">
                Tus datos están protegidos con autenticación segura y
                almacenamiento en la nube con Supabase.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Optimiza tu Negocio de Repostería
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <p className="text-lg">Gratis</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">⚡</div>
                <p className="text-lg">Rápido y Fácil</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">☁️</div>
                <p className="text-lg">En la Nube</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          ¿Cómo Funciona?
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Registra tus Productos</h3>
              <p className="text-gray-600">
                Agrega todos tus ingredientes e insumos con sus precios y cantidades.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Crea tus Recetas</h3>
              <p className="text-gray-600">
                Define las recetas con ingredientes, cantidades y tiempo de preparación.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Obtén Resultados</h3>
              <p className="text-gray-600">
                Visualiza costos, márgenes y precios de venta sugeridos automáticamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para Optimizar tu Negocio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete hoy y comienza a calcular tus costos de manera profesional
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-3xl mb-4">🍰</div>
          <p className="text-lg font-semibold mb-2">DGcost</p>
          <p className="text-gray-400 mb-4">
            Sistema de Gestión de Costos para Repostería
          </p>
          <p className="text-sm text-gray-500">
            © 2026 DGcost. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
