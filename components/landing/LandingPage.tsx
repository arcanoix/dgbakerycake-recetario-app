"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Inter } from "next/font/google";
import { usePublicPlanes } from "@/hooks/usePublicPlanes";
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  ChevronDown, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  ChefHat,
  Package,
  Calculator,
  BarChart3,
  Globe,
  MessageCircle,
  Smartphone,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-inter",
  display: "swap",
  preload: true
});

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const faqs = [
  {
    question: "¿Es realmente gratis?",
    answer: "Sí, el plan básico es 100% gratuito para siempre. Queremos ayudar a los emprendedores a formalizar sus costos sin barreras de entrada."
  },
  {
    question: "¿Cómo calculan los precios?",
    answer: "DGcost utiliza fórmulas de ingeniería de costos: suma el valor proporcional de cada insumo, permite añadir merma y aplica tu margen de ganancia configurado."
  },
  {
    question: "¿Puedo usarlo desde mi celular?",
    answer: "¡Totalmente! DGcost es una Web App responsiva que funciona perfecto en navegadores móviles. Muy pronto lanzaremos la App nativa en tiendas."
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Utilizamos encriptación de nivel bancario y almacenamiento seguro en Supabase. Tus recetas y costos son privados y solo tú tienes acceso a ellos."
  }
];

const testimonials = [
  {
    name: "María González",
    role: "Repostera Profesional",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    quote: "Gracias a DGcost dejé de adivinar precios. Mis ganancias subieron un 30% en el primer mes.",
    metric: "+30%",
    metricLabel: "ganancias"
  },
  {
    name: "Carlos Rodríguez",
    role: "Dueño de Pastelería",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    quote: "La gestión de inventario es increíble. Sé exactamente cuándo debo comprar más harina.",
    metric: "100%",
    metricLabel: "control"
  },
  {
    name: "Ana Pérez",
    role: "Emprendedora Home-made",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    quote: "Es la herramienta más sencilla que he usado. En 10 minutos ya tenía costeado mi menú.",
    metric: "10 min",
    metricLabel: "setup"
  }
];

const features = [
  {
    icon: Calculator,
    title: "Cálculo Preciso",
    description: "Desglose automático de costos por ingrediente, gramo a gramo.",
    color: "bg-blue-500/10 text-blue-600"
  },
  {
    icon: TrendingUp,
    title: "Márgenes Reales",
    description: "Aplica porcentajes de utilidad y obtén precios de venta sugeridos.",
    color: "bg-emerald-500/10 text-emerald-600"
  },
  {
    icon: Package,
    title: "Inventario Inteligente",
    description: "Control de stock crítico y alertas automáticas de reposición.",
    color: "bg-violet-500/10 text-violet-600"
  },
  {
    icon: BarChart3,
    title: "Dashboard Pro",
    description: "Estadísticas visuales de rentabilidad y productos más costosos.",
    color: "bg-amber-500/10 text-amber-600"
  },
  {
    icon: Globe,
    title: "Precio Dual",
    description: "Visualiza tus costos en USD y Bolívares a tasa oficial BCV.",
    color: "bg-cyan-500/10 text-cyan-600"
  },
  {
    icon: ChefHat,
    title: "Recetario Maestro",
    description: "Organiza tus creaciones con fotos, categorías e instrucciones.",
    color: "bg-rose-500/10 text-rose-600"
  }
];

export const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { planes, cargando: cargandoPlanes } = usePublicPlanes();

  return (
    <div className={`min-h-screen bg-background text-foreground ${inter.variable}`} style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground group-hover:rotate-12 transition-transform duration-300">
               <ChefHat className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase">
              DGcost
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
              LOG IN
            </Link>
            <Link href="/auth/register">
              <Button className="h-9 px-5 font-black text-xs tracking-widest uppercase shadow-lg bg-primary hover:shadow-xl transition-all">
                EMPEZAR GRATIS
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 blur-[120px]">
           <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary rounded-full animate-pulse" />
           <div className="absolute top-40 right-1/4 w-96 h-96 bg-violet-500 rounded-full" />
        </div>

        <div className="container mx-auto px-6 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary font-black text-[10px] tracking-[0.2em] uppercase">
              <Sparkles className="w-3 h-3 mr-2" />
              SaaS para Repostería Profesional
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-foreground"
          >
            Calcula tus costos.<br />
            <span className="text-primary italic">Multiplica</span> tus ganancias.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed"
          >
            La plataforma definitiva para reposteros que quieren dejar de adivinar y empezar a facturar con precisión. Inventario, recetas y precios en un solo lugar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/auth/register">
              <Button size="lg" className="h-14 px-10 font-black tracking-widest text-xs uppercase shadow-2xl bg-primary hover:shadow-primary/20">
                COMENZAR AHORA <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="h-14 px-10 font-black tracking-widest text-xs uppercase border-2">
                VER DEMO
              </Button>
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t"
          >
             {[
               { value: "500+", label: "Emprendedores" },
               { value: "15k", label: "Recetas Creadas" },
               { value: "100%", label: "Seguro" },
               { value: "24/7", label: "Acceso Cloud" }
             ].map((stat, i) => (
               <div key={i} className="space-y-1">
                 <p className="text-3xl font-black text-foreground">{stat.value}</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
               </div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Herramientas de Alto Nivel</h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto">Todo lo que necesitas para profesionalizar tu taller de repostería desde el día uno.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <Card className="h-full border-0 shadow-lg bg-card group hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-8 space-y-4">
                    <div className={`p-3 rounded-2xl w-fit ${feature.color} group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Historias de Éxito</h2>
            <p className="text-muted-foreground font-medium">Usuarios que transformaron su pasión en un negocio rentable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <Card className="h-full border-0 shadow-xl bg-card overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <p className="text-sm font-medium italic text-muted-foreground leading-relaxed">"{t.quote}"</p>
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <Image src={t.image} alt={t.name} width={48} height={48} className="rounded-full bg-muted" />
                      <div>
                        <p className="font-bold text-sm">{t.name}</p>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">{t.role}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase text-muted-foreground">Logro:</span>
                       <span className="text-lg font-black text-primary">{t.metric} <span className="text-[10px] uppercase font-bold text-muted-foreground">{t.metricLabel}</span></span>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Promo */}
      <section className="py-24 bg-muted/50 border-y">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-black text-[10px] tracking-widest uppercase">Próximamente</Badge>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">Tu negocio en tu bolsillo</h2>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
              Estamos construyendo la App móvil nativa para que gestiones tus costos directamente desde la cocina, escaneando facturas y recibiendo notificaciones de stock.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-6 py-3 rounded-2xl bg-card border shadow-sm flex items-center gap-3 opacity-60">
                 <Smartphone className="w-6 h-6 text-muted-foreground" />
                 <div className="text-left">
                   <p className="text-[9px] font-black text-muted-foreground uppercase">Disponible pronto</p>
                   <p className="font-bold text-xs">App Store & Play Store</p>
                 </div>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative z-10 p-4 bg-background rounded-[3rem] border shadow-2xl shadow-primary/20 max-w-sm mx-auto">
               <div className="aspect-[9/19] bg-muted rounded-[2.5rem] overflow-hidden flex items-center justify-center">
                  <div className="text-center p-8 space-y-4">
                     <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                       <RefreshCw className="w-8 h-8 animate-spin" />
                     </div>
                     <p className="font-black text-xs uppercase tracking-widest">Compilando...</p>
                  </div>
               </div>
            </div>
            {/* Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Planes para cada Etapa</h2>
            <p className="text-muted-foreground font-medium">Empieza gratis, escala cuando el éxito toque tu puerta.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {cargandoPlanes ? (
              <div className="col-span-full h-64 flex items-center justify-center"><RefreshCw className="animate-spin" /></div>
            ) : (
              planes.filter(p => p.is_active).sort((a, b) => a.sort_order - b.sort_order).map((plan, i) => (
                <Card key={plan.id} className={`flex flex-col border-0 shadow-lg bg-card hover:-translate-y-2 transition-all duration-300 ${plan.name === 'basico' ? 'ring-2 ring-primary shadow-2xl shadow-primary/10' : ''}`}>
                  <CardContent className="p-8 flex flex-col h-full space-y-6">
                    <div className="space-y-1">
                      <p className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">{plan.name}</p>
                      <h3 className="text-2xl font-black tracking-tight">{plan.display_name}</h3>
                    </div>
                    
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">${plan.price_usd}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">/mes</span>
                    </div>

                    <Separator className="opacity-50" />

                    <ul className="flex-1 space-y-3">
                       <li className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                         <Check className="w-3.5 h-3.5 text-primary" /> {plan.max_recetas === -1 ? 'Ilimitadas' : plan.max_recetas} Recetas
                       </li>
                       <li className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                         <Check className="w-3.5 h-3.5 text-primary" /> {plan.max_productos === -1 ? 'Ilimitados' : plan.max_productos} Productos
                       </li>
                       {plan.features.exportar_pdf && (
                         <li className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                           <Check className="w-3.5 h-3.5 text-primary" /> Exportar PDF
                         </li>
                       )}
                    </ul>

                    <Link href="/auth/register" className="block pt-4">
                       <Button variant={plan.name === 'basico' ? 'default' : 'outline'} className="w-full font-black text-[10px] tracking-widest uppercase">
                         {plan.price_usd === 0 ? 'LOG IN FREE' : 'SELECCIONAR'}
                       </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest hover:gap-4 transition-all">
            Ver detalle de beneficios <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-6 text-center space-y-10 relative z-10">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">¿Listo para ser un repostero Pro?</h2>
          <p className="text-lg md:text-xl font-bold opacity-80 max-w-xl mx-auto">Únete hoy a la comunidad que está transformando la repostería artesanal en negocios de alta rentabilidad.</p>
          <Link href="/auth/register">
            <Button size="lg" className="h-16 px-12 bg-background text-foreground hover:bg-background/90 font-black text-xs tracking-widest uppercase shadow-2xl">
              CREAR MI CUENTA GRATUITA
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-background border-t">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 space-y-6">
               <div className="flex items-center gap-2">
                 <div className="p-1 rounded bg-primary text-primary-foreground">
                   <ChefHat className="w-4 h-4" />
                 </div>
                 <span className="text-lg font-black tracking-tight uppercase">DGcost</span>
               </div>
               <p className="text-sm text-muted-foreground font-medium max-w-xs">
                 La plataforma inteligente de gestión de costos e inventario para la industria repostera.
               </p>
               <div className="flex gap-4">
                 <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"><MessageCircle className="w-4 h-4" /></div>
                 <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"><TrendingUp className="w-4 h-4" /></div>
               </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Producto</h4>
              <ul className="space-y-2 text-sm font-bold text-foreground/70">
                <li><Link href="/pricing" className="hover:text-primary">Precios</Link></li>
                <li><a href="#" className="hover:text-primary">Características</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Legal</h4>
              <ul className="space-y-2 text-sm font-bold text-foreground/70">
                <li><Link href="/terminos" className="hover:text-primary">Términos</Link></li>
                <li><a href="#" className="hover:text-primary">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <Separator />
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <p>© 2026 DGCOST. DGBakeryCake Solutions.</p>
            <p>Hecho con ❤️ para reposteros</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
