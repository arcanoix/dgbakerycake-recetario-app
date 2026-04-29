"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRef } from "react";
import { Inter } from "next/font/google";
import { usePublicPlanes } from "@/hooks/usePublicPlanes";
import { Check, Sparkles, ArrowRight, Menu, X, ChevronDown } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap"
});

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
  const { planes, cargando: cargandoPlanes } = usePublicPlanes();

  return (
    <div className={`min-h-screen bg-slate-50 ${inter.variable}`} style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🧁</span>
              <span className="text-xl font-bold text-slate-900">
                DGcost
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/auth/register">
                <Button className="text-sm px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all">
                  Comenzar gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                <span>100% Gratis para empezar</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8 leading-tight tracking-tight text-slate-900"
            >
              Calcula tus costos,<br />
              <span className="text-indigo-600">gana más</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
            >
              DGcost calcula automáticamente el costo de tus recetas.
              Deja de adivinar precios y empieza a ganar más con cada venta.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4 sm:px-0"
            >
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
                >
                  Comenzar Gratis
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-12 px-8 border border-slate-200 text-slate-700 font-medium rounded-lg flex items-center justify-center gap-2 hover:border-slate-300 hover:bg-slate-50 transition-all w-full sm:w-auto"
                >
                  Ver demo
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto px-4 sm:px-0 pt-8 border-t border-slate-200"
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
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {stat.value}
                  </div>
                  <div className="text-slate-500 text-xs sm:text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <AnimatedSection>
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-slate-900">
                ¿Te suena conocido?
              </h2>
              <p className="text-base sm:text-lg text-slate-600 text-center mb-12 px-4 sm:px-0">
                Estos son los problemas que enfrentan los reposteros cada día
              </p>

              <div className="space-y-3 sm:space-y-4">
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
                    <Card 
                      className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden relative"
                      style={{
                        borderRadius: i === 0 ? '30px 10px 30px 10px' : i === 1 ? '10px 30px 10px 30px' : '25px 15px 25px 15px'
                      }}
                    >
                      <div 
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${problem.color.replace('border-l-', 'bg-')}`}
                        style={{
                          borderRadius: i === 0 ? '30px 0 0 10px' : i === 1 ? '0 30px 10px 0' : '25px 0 0 15px'
                        }}
                      />
                      <CardContent className="p-4 sm:p-6 pl-6 sm:pl-8">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <motion.span 
                            className="text-2xl sm:text-3xl flex-shrink-0"
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            {problem.emoji}
                          </motion.span>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg">{problem.title}</h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{problem.desc}</p>
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
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50">
          <div className="container mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                Todo lo que necesitas
              </h2>
              <p className="text-base sm:text-lg text-slate-600">
                Herramientas pensadas para reposteros profesionales
              </p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={scaleIn}>
                  <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 h-full rounded-xl">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-xl mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-slate-900">{feature.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Mobile App Section */}
      <AnimatedSection>
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-y border-slate-100">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
                <span>📱</span>
                <span>Próximamente</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                App Móvil en Camino
              </h2>
              
              <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto px-4 sm:px-0">
                Muy pronto podrás gestionar tus recetas y costos desde tu celular.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-lg border border-slate-200">
                  <span className="text-2xl">🤖</span>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">Disponible pronto</p>
                    <p className="font-semibold text-sm text-slate-900">Google Play</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-lg border border-slate-200">
                  <span className="text-2xl">🍎</span>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">Disponible pronto</p>
                    <p className="font-semibold text-sm text-slate-900">App Store</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection>
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50">
          <div className="container mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                Lo que dicen nuestros usuarios
              </h2>
              <p className="text-base sm:text-lg text-slate-600">
                Reposteros como tú ya están mejorando sus negocios
              </p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} variants={scaleIn}>
                  <Card className="bg-white border border-slate-100 shadow-sm h-full rounded-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                          loading="lazy"
                          unoptimized={false}
                        />
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900">{testimonial.name}</h4>
                          <p className="text-slate-500 text-xs">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">"{testimonial.quote}"</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-indigo-600">{testimonial.metric}</span>
                        <span className="text-slate-500 text-xs">{testimonial.metricLabel}</span>
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
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Planes flexibles</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                Planes para cada etapa
              </h2>
              <p className="text-base sm:text-lg text-slate-600">
                Empieza gratis, escala cuando quieras. Todos los planes incluyen actualizaciones gratuitas.
              </p>
            </motion.div>

            {cargandoPlanes ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
                {planes.filter(p => p.is_active).sort((a, b) => a.sort_order - b.sort_order).map((plan, i) => {
                  const isPopular = plan.name === 'profesional';
                  const isPremium = plan.name === 'empresarial';
                  const features = [
                    `${plan.max_recetas === -1 ? 'Recetas ilimitadas' : `${plan.max_recetas} recetas`}`,
                    `${plan.max_productos === -1 ? 'Productos ilimitados' : `${plan.max_productos} productos`}`,
                    ...(plan.features.exportar_pdf ? ['Exportar PDF'] : []),
                    ...(plan.features.ver_analytics ? ['Analytics avanzados'] : []),
                    ...(plan.features.api_access ? ['Acceso API'] : []),
                    ...(plan.features.soporte_prioritario ? ['Soporte prioritario'] : ['Soporte básico']),
                  ];

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                          <div 
                            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-1.5 text-sm font-semibold shadow-lg flex items-center gap-1"
                            style={{ borderRadius: '15px 8px 15px 8px' }}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Más popular
                          </div>
                        </div>
                      )}
                      <Card 
                        className={`h-full overflow-hidden transition-all duration-300 ${
                          isPopular 
                            ? 'border-2 border-amber-500 shadow-2xl shadow-amber-200/50 scale-105' 
                            : isPremium
                            ? 'border-2 border-orange-300 shadow-xl'
                            : 'border-2 border-gray-200 shadow-lg hover:shadow-xl'
                        }`}
                        style={{
                          borderRadius: i % 2 === 0 ? '32px 12px 32px 12px' : '12px 32px 12px 32px'
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold mb-2 text-gray-900" style={{ fontFamily: 'var(--font-inter)' }}>
                              {plan.display_name}
                            </h3>
                            <p className="text-sm text-gray-600">{plan.description || 'Plan completo'}</p>
                          </div>

                          <div className="text-center mb-6">
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-5xl font-black text-gray-900" style={{ fontFamily: 'var(--font-inter)' }}>
                                ${plan.price_usd}
                              </span>
                              <span className="text-gray-600 text-sm">/mes</span>
                            </div>
                            {plan.price_bs > 0 && (
                              <p className="text-sm text-gray-500 mt-1">
                                Bs. {plan.price_bs.toLocaleString('es-VE')}
                              </p>
                            )}
                          </div>

                          <ul className="space-y-3 mb-8">
                            {features.map((feat, j) => (
                              <li key={j} className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">{feat}</span>
                              </li>
                            ))}
                          </ul>

                          <Link href="/auth/register" className="block">
                            <Button
                              className={`w-full h-12 font-semibold transition-all ${
                                isPopular || isPremium
                                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-200/50 text-white'
                                  : 'border-2 border-amber-300 text-amber-700 hover:bg-amber-50'
                              }`}
                              variant={isPopular || isPremium ? 'default' : 'outline'}
                              style={{
                                borderRadius: i % 2 === 0 ? '20px 8px 20px 8px' : '8px 20px 8px 20px'
                              }}
                            >
                              {plan.price_usd === 0 ? 'Comenzar Gratis' : 'Empezar Ahora'}
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection>
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50">
          <div className="container mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                Preguntas Frecuentes
              </h2>
              <p className="text-base sm:text-lg text-slate-600">
                Todo lo que necesitas saber
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-3"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-medium text-sm text-slate-900">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === index ? "auto" : 0,
                      opacity: openFaq === index ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed">
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
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center bg-slate-900 rounded-2xl p-8 sm:p-12 text-white">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                ¿Listo para empezar?
              </h2>
              <p className="text-base sm:text-lg mb-8 text-slate-300">
                Únete a más de 500 reposteros que ya están ganando más con cada venta
              </p>
              <Link href="/auth/register">
                <Button className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-100 font-medium rounded-lg">
                  Crear Cuenta Gratis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧁</span>
                <span className="text-xl font-semibold">DGcost</span>
              </div>
              <p className="text-slate-400 text-sm">
                La herramienta de gestión de costos para reposteros profesionales.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white text-sm">Producto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorial</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white text-sm">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/terminos" className="hover:text-white transition-colors">Términos</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm text-center md:text-left">
              © 2026 DGcost. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">📘</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Instagram">📸</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">🐦</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
