"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRef } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay, ease: "easeOut" }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

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

const features = [
  {
    icon: "📊",
    title: "Cálculo Automático",
    description: "Calcula el costo total de tus recetas en segundos. Materials, mano de obra y márgenes."
  },
  {
    icon: "💰",
    title: "Precio de Venta",
    description: "Obtén el precio sugerido basado en tu margen de ganancia deseado. No más guessing."
  },
  {
    icon: "📦",
    title: "Gestión de Productos",
    description: "Administra todos tus ingredientes, precios y proveedores en un solo lugar."
  },
  {
    icon: "📈",
    title: "Dashboard Visual",
    description: "Gráficos y estadísticas para entender la rentabilidad de tu negocio."
  },
  {
    icon: "🍰",
    title: "Recetas Detalladas",
    description: "Crea recetas con ingredientes, pasos y costos. Todo documentado y organizado."
  },
  {
    icon: "☁️",
    title: "En la Nube",
    description: "Accede desde cualquier dispositivo. Tus datos siempre disponibles y seguros."
  }
];

export const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
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
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-20 right-0 w-96 h-96 bg-violet-200 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-200 rounded-full blur-3xl opacity-20"
        />

        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <span>✨</span>
                <span>100% Gratis para empezar</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-pulse">
                Menos trabajo,
              </span>
              <br />
              <span className="text-gray-900">más ganancias</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              DGcost calcula automáticamente el costo de tus recetas.
              Deja de adivinar precios y empieza a ganar más con cada venta.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-14 text-lg px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-200 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  Comenzar Gratis
                  <span>→</span>
                </motion.button>
              </Link>
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  className="h-14 text-lg px-8 border-2 border-violet-300 text-violet-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-violet-400 hover:shadow-md transition-all"
                >
                  Ver demo
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { value: "500+", label: "Usuarios" },
                { value: "10K+", label: "Recetas" },
                { value: "100%", label: "Gratis" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <AnimatedSection>
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
                {[
                  { emoji: "😰", title: "¿Cuánto debo cobrar por mi pastel?", desc: "Calculas mentalmente y siempre dudas si estás ganando o perdiendo", color: "border-l-red-500" },
                  { emoji: "📱", title: "¿Cuánto gasté en materiales?", desc: "Llevas los precios en papel y se te pierden", color: "border-l-orange-500" },
                  { emoji: "💸", title: "¿Cuál es mi ganancia real?", desc: "Vendes pero no sabes cuánto te queda después de materiales y tiempo", color: "border-l-amber-500" }
                ].map((problem, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className={`border-l-4 ${problem.color} bg-white shadow-sm`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <span className="text-2xl">{problem.emoji}</span>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-2">{problem.title}</h3>
                            <p className="text-gray-600">{problem.desc}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection>
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              DGcost lo resuelve todo
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              La herramienta que todo repostero necesita
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={scaleIn}>
                  <Card className="bg-white border-0 shadow-xl shadow-violet-100/50 hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-300 h-full">
                    <CardContent className="p-8">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-14 h-14 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center text-2xl mb-6"
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection>
        <section className="py-20 px-4 bg-gradient-to-br from-violet-50 to-fuchsia-50">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16">
              Reposteros como tú ya están mejorando sus negocios
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} variants={scaleIn}>
                  <Card className="bg-white border-0 shadow-xl h-full">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <motion.img
                          whileHover={{ scale: 1.1 }}
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
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Pricing Section */}
      <AnimatedSection>
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Planes para cada etapa
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16">
              Empieza gratis, escala cuando quieras
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { name: "Básico", price: "$0", period: "/para siempre", features: ["20 recetas", "50 productos", "Cálculo de costos", "Precio sugerido"], popular: false },
                { name: "Profesional", price: "$9", period: "/mes", features: ["Recetas ilimitadas", "500 productos", "Reportes avanzados", "Exportar PDF", "Prioridad en soporte"], popular: true },
                { name: "Empresarial", price: "$19", period: "/mes", features: ["Todo del Pro", "Productos ilimitados", "Múltiples usuarios", "API Access", "Soporte 24/7"], popular: false }
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className={`${plan.popular ? 'border-2 border-violet-500 relative shadow-2xl shadow-violet-200' : 'border-2 border-gray-100'} h-full`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Más popular
                      </div>
                    )}
                    <CardContent className="p-8">
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-gray-500 mb-6">{i === 0 ? 'Para empezar' : i === 1 ? 'Para negocios en crecimiento' : 'Para negocios establecidos'}</p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-gray-500">{plan.period}</span>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feat, j) => (
                          <li key={j} className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/auth/register" className="block">
                        <Button
                          className={`w-full ${plan.popular ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600' : ''}`}
                          variant={plan.popular ? 'default' : 'outline'}
                        >
                          {plan.price === "$0" ? 'Comenzar Gratis' : 'Empezar Prueba'}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection>
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <motion.span
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl"
                    >
                      ▼
                    </motion.span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === index ? "auto" : 0,
                      opacity: openFaq === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Final */}
      <AnimatedSection>
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="max-w-3xl mx-auto text-center bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-12 text-white"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Listo para empezar?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Únete a más de 500 reposteros que ya están ganando más con cada venta
              </p>
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-lg px-8 py-6 bg-white text-violet-600 rounded-lg font-bold"
                >
                  Crear Cuenta Gratis
                  <span className="ml-2">→</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

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
