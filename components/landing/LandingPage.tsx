"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "¿Es realmente gratis?",
    answer: "Sí, el plan básico es 100% gratuito. No necesitas tarjeta de crédito para comenzar."
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Tus datos están protegidos con autenticación segura y almacenamiento en la nube con Supabase."
  },
  {
    question: "¿Puedo usar sin conexión?",
    answer: "DGcost es una aplicación web. Necesitas internet para acceder, pero tus datos siempre estarán disponibles."
  },
  {
    question: "¿Hay límite de recetas?",
    answer: "El plan gratuito permite hasta 20 recetas. Los planes de pago tienen límites más altos o ilimitados."
  }
];

const testimonials = [
  {
    name: "María González",
    role: "Repostera profesional",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    quote: "Desde que uso DGcost puedo calcular mis precios de forma precisa. Mis ganancias aumentaron un 30%",
    metric: "+30%",
    metricLabel: "en ganancias"
  },
  {
    name: "Carlos Rodríguez",
    role: "Dueño de panadería",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    quote: "Me encantó la facilidad de uso. En 5 minutos configuré todas mis recetas del menú",
    metric: "5 min",
    metricLabel: "para empezar"
  },
  {
    name: "Ana Pérez",
    role: "Emprendedora pasteles",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    quote: "El mejor investimento que hice para mi negocio. Ahora sé exactamente cuánto gano en cada pedido",
    metric: "100%",
    metricLabel: "control total"
  }
];

export const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🧁</span>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                DGcost
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Iniciar sesión
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
                  Comenzar gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-violet-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-200 rounded-full blur-3xl opacity-20" />

        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span>✨</span>
              <span>100% Gratis para empezar</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
                Menos trabajo,
              </span>
              <br />
              <span className="text-gray-900">más ganancias</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              DGcost calcula automáticamente el costo de tus recetas. 
             Deja de adivinar precios y empieza a ganar más con cada venta.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-200">
                  Comenzar Gratis
                  <span className="ml-2">→</span>
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  Ver demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  500+
                </div>
                <div className="text-gray-500 text-sm">Usuarios</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-gray-500 text-sm">Recetas calculadas</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  100%
                </div>
                <div className="text-gray-500 text-sm">Gratis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              ¿Te suena conocido?
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Estos son los problemas que enfrentan los reposteros cada día
            </p>

            <div className="space-y-4">
              <Card className="border-l-4 border-l-red-500 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">😰</span>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">¿Cuánto debo cobrar por mi pastel?</h3>
                      <p className="text-gray-600">Calculas mentalmente y siempre dudas si estás ganando o perdiendo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">📱</span>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">¿Cuánto gasté en materiales?</h3>
                      <p className="text-gray-600">Llevas los precios en papel o en notas del celular y se te pierden</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">💸</span>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">¿Cuál es mi ganancia real?</h3>
                      <p className="text-gray-600">Vendes pero no sabes cuánto te queda después de materiales y tiempo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            DGcost lo resuelve todo
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            La herramienta que todo repostero necesita
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white border-0 shadow-xl shadow-violet-100/50 hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  📊
                </div>
                <h3 className="text-xl font-bold mb-3">Cálculo Automático</h3>
                <p className="text-gray-600">
                  Calcula el costo total de tus recetas en segundos. Materials, mano de obra y márgenes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl shadow-violet-100/50 hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  💰
                </div>
                <h3 className="text-xl font-bold mb-3">Precio de Venta</h3>
                <p className="text-gray-600">
                  Obtén el precio sugerido basado en tu margen de ganancia deseado. No más guessing.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl shadow-violet-100/50 hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  📦
                </div>
                <h3 className="text-xl font-bold mb-3">Gestión de Productos</h3>
                <p className="text-gray-600">
                  Administra todos tus ingredientes, precios y proveedores en un solo lugar.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl shadow-violet-100/50 hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  📈
                </div>
                <h3 className="text-xl font-bold mb-3">Dashboard Visual</h3>
                <p className="text-gray-600">
                  Gráficos y estadísticas para entender la rentabilidad de tu negocio.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl shadow-violet-100/50 hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  🍰
                </div>
                <h3 className="text-xl font-bold mb-3">Recetas Detalladas</h3>
                <p className="text-gray-600">
                  Crea recetas con ingredientes, pasos y costos. Todo documentado y organizado.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl shadow-violet-100/50 hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  ☁️
                </div>
                <h3 className="text-xl font-bold mb-3">En la Nube</h3>
                <p className="text-gray-600">
                  Accede desde cualquier dispositivo. Tus datos siempre disponibles y seguros.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-50 to-fuchsia-50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            Repteros como tú ya están mejorando sus negocios
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-500 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                      {testimonial.metric}
                    </span>
                    <span className="text-gray-500 text-sm">{testimonial.metricLabel}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Planes para cada etapa
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            Empieza gratis, escala cuando quieras
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-100">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">Básico</h3>
                <p className="text-gray-500 mb-6">Para empezar</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-500">/para siempre</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Hasta 20 recetas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>50 productos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Cálculo de costos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Precio sugerido</span>
                  </li>
                </ul>
                <Link href="/auth/register" className="block">
                  <Button className="w-full" variant="outline">
                    Comenzar Gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-violet-500 relative shadow-2xl shadow-violet-200">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Más popular
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">Profesional</h3>
                <p className="text-gray-500 mb-6">Para negocios en crecimiento</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-gray-500">/mes</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Recetas ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>500 productos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Reportes avanzados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Exportar PDF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Prioridad en soporte</span>
                  </li>
                </ul>
                <Link href="/auth/register" className="block">
                  <Button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
                    Empezar Prueba
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-100">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">Empresarial</h3>
                <p className="text-gray-500 mb-6">Para negocios establecidos</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-gray-500">/mes</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Todo del Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Productos ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Múltiples usuarios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>API Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Soporte 24/7</span>
                  </li>
                </ul>
                <Link href="/auth/register" className="block">
                  <Button className="w-full" variant="outline">
                    Contactar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            Todo lo que necesitas saber
          </p>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <span className={`text-2xl transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a más de 500 reposteros que ya están ganando más con cada venta
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Crear Cuenta Gratis
                <span className="ml-2">→</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧁</span>
                <span className="text-xl font-bold">DGcost</span>
              </div>
              <p className="text-gray-400">
                La herramienta de gestión de costos para reposteros profesionales.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Características</a></li>
                <li><a href="#" className="hover:text-white">Precios</a></li>
                <li><a href="#" className="hover:text-white">Tutorial</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Términos</a></li>
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 DGcost. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white text-2xl">📘</a>
              <a href="#" className="text-gray-400 hover:text-white text-2xl">📸</a>
              <a href="#" className="text-gray-400 hover:text-white text-2xl">🐦</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
