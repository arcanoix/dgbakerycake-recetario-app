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
    <div className={`min-h-screen bg-white ${inter.variable}`} style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-300"
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">🧁</span>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-inter)' }}>
                DGcost
              </span>
              <span className="hidden sm:inline-block bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                BETA
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/auth/login" className="text-sm sm:text-base text-gray-700 hover:text-amber-700 font-medium transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/auth/register">
                <Button className="text-sm sm:text-base px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-200/50 transition-all">
                  Comenzar gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/30 to-white"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-20 right-0 w-96 h-96 bg-amber-300 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-orange-300 rounded-full blur-3xl opacity-20"
        />

        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div 
                className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-5 py-2.5 text-sm font-semibold mb-8 shadow-sm"
                style={{ borderRadius: '20px 8px 20px 8px' }}
              >
                <span>✨</span>
                <span>100% Gratis para empezar</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 leading-tight"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              <span className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 bg-[length:200%_auto] bg-clip-text text-transparent">
                Menos trabajo,
              </span>
              <br />
              <span className="text-gray-900">más ganancias</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-normal px-4 sm:px-0"
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-12 sm:h-14 text-base sm:text-lg px-6 sm:px-8 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-300/50 font-semibold flex items-center justify-center gap-2 text-white w-full sm:w-auto"
                  style={{ borderRadius: '28px 12px 28px 12px' }}
                >
                  Comenzar Gratis
                  <span>→</span>
                </motion.button>
              </Link>
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  className="h-12 sm:h-14 text-base sm:text-lg px-6 sm:px-8 border-2 border-amber-300 text-amber-700 font-semibold flex items-center justify-center gap-2 hover:border-amber-400 hover:shadow-md transition-all w-full sm:w-auto"
                  style={{ borderRadius: '12px 28px 12px 28px' }}
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
              className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto px-4 sm:px-0"
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
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-inter)' }}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <AnimatedSection>
        <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-100">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-900" style={{ fontFamily: 'var(--font-inter)' }}>
              ¿Te suena conocido?
            </h2>
            <p className="text-base sm:text-xl text-gray-600 text-center mb-8 sm:mb-12 px-4 sm:px-0">
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
        <section className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-900" style={{ fontFamily: 'var(--font-inter)' }}>
              DGcost lo resuelve todo
            </h2>
            <p className="text-base sm:text-xl text-gray-600 text-center mb-10 sm:mb-16 max-w-2xl mx-auto px-4 sm:px-0">
              La herramienta que todo repostero necesita
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={scaleIn}>
                  <Card 
                    className="bg-white border-0 shadow-xl shadow-amber-100/50 hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-300 h-full overflow-hidden"
                    style={{
                      borderRadius: index % 3 === 0 ? '35px 15px 35px 15px' : index % 3 === 1 ? '15px 35px 15px 35px' : '28px 18px 28px 18px'
                    }}
                  >
                    <CardContent className="p-6 sm:p-8">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-6"
                        style={{
                          borderRadius: index % 3 === 0 ? '18px 8px 18px 8px' : index % 3 === 1 ? '8px 18px 8px 18px' : '15px 10px 15px 10px'
                        }}
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">{feature.title}</h3>
                      <p className="text-sm sm:text-base text-gray-700">{feature.description}</p>
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
        <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-amber-50 to-orange-50/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 text-sm font-semibold mb-6 shadow-sm"
                style={{ borderRadius: '18px 8px 18px 8px' }}
              >
                <span>📱</span>
                <span>Próximamente</span>
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900" style={{ fontFamily: 'var(--font-inter)' }}>
                App Móvil en Camino
              </h2>
              
              <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
                Muy pronto podrás gestionar tus recetas y costos desde tu celular. 
                Estamos trabajando en aplicaciones nativas para Android e iOS.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <div 
                  className="flex items-center gap-3 bg-white px-5 sm:px-6 py-3 sm:py-4 shadow-lg w-full sm:w-auto max-w-xs sm:max-w-none"
                  style={{ borderRadius: '22px 10px 22px 10px' }}
                >
                  <span className="text-2xl sm:text-3xl">🤖</span>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Disponible pronto en</p>
                    <p className="font-bold text-sm sm:text-base text-gray-900">Google Play</p>
                  </div>
                </div>
                
                <div 
                  className="flex items-center gap-3 bg-white px-5 sm:px-6 py-3 sm:py-4 shadow-lg w-full sm:w-auto max-w-xs sm:max-w-none"
                  style={{ borderRadius: '10px 22px 10px 22px' }}
                >
                  <span className="text-2xl sm:text-3xl">🍎</span>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Disponible pronto en</p>
                    <p className="font-bold text-sm sm:text-base text-gray-900">App Store</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection>
        <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-100">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-900" style={{ fontFamily: 'var(--font-inter)' }}>
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-base sm:text-xl text-gray-600 text-center mb-10 sm:mb-16 px-4 sm:px-0">
              Reposteros como tú ya están mejorando sus negocios
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} variants={scaleIn}>
                  <Card 
                    className="bg-white border-0 shadow-xl h-full overflow-hidden"
                    style={{
                      borderRadius: index === 0 ? '32px 12px 32px 12px' : index === 1 ? '12px 32px 12px 32px' : '26px 16px 26px 16px'
                    }}
                  >
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                          loading="lazy"
                          unoptimized={false}
                        />
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-gray-900">{testimonial.name}</h4>
                          <p className="text-muted-foreground text-xs sm:text-sm">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 italic">"{testimonial.quote}"</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-inter)' }}>
                          {testimonial.metric}
                        </span>
                        <span className="text-muted-foreground text-xs sm:text-sm">{testimonial.metricLabel}</span>
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
        <section className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-16"
            >
              <div 
                className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 text-sm font-semibold mb-6 shadow-sm"
                style={{ borderRadius: '18px 8px 18px 8px' }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Planes flexibles</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900" style={{ fontFamily: 'var(--font-inter)' }}>
                Planes para cada etapa
              </h2>
              <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
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
        <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-100">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-900" style={{ fontFamily: 'var(--font-inter)' }}>
              Preguntas Frecuentes
            </h2>
            <p className="text-base sm:text-xl text-gray-600 text-center mb-10 sm:mb-16 px-4 sm:px-0">
              Todo lo que necesitas saber
            </p>

            <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white shadow-sm border border-gray-200 overflow-hidden"
                  style={{
                    borderRadius: index % 2 === 0 ? '24px 10px 24px 10px' : '10px 24px 10px 24px'
                  }}
                >
                  <button
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between gap-3"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-semibold text-sm sm:text-base text-gray-900">{faq.question}</span>
                    <motion.span
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-xl sm:text-2xl flex-shrink-0"
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
                    <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-sm sm:text-base text-gray-700">
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
        <section className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="container mx-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="max-w-3xl mx-auto text-center bg-gradient-to-br from-amber-600 to-orange-600 p-8 sm:p-12 text-white shadow-2xl shadow-amber-300/30"
              style={{
                borderRadius: '45px 20px 45px 20px'
              }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                ¿Listo para empezar?
              </h2>
              <p className="text-base sm:text-xl mb-6 sm:mb-8 opacity-95">
                Únete a más de 500 reposteros que ya están ganando más con cada venta
              </p>
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-white text-amber-700 font-bold shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
                  style={{
                    borderRadius: '25px 12px 25px 12px'
                  }}
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
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧁</span>
                <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-inter)' }}>DGcost</span>
              </div>
              <p className="text-gray-400">
                La herramienta de gestión de costos para reposteros profesionales.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Producto</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Tutorial</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Empresa</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Legal</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><Link href="/terminos" className="hover:text-amber-400 transition-colors">Términos y Condiciones</Link></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © 2026 DGcost. Todos los derechos reservados.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a href="#" className="text-gray-400 hover:text-amber-400 text-xl sm:text-2xl transition-colors" aria-label="Facebook">📘</a>
              <a href="#" className="text-gray-400 hover:text-amber-400 text-2xl transition-colors" aria-label="Instagram">📸</a>
              <a href="#" className="text-gray-400 hover:text-amber-400 text-2xl transition-colors" aria-label="Twitter">🐦</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
