import type { Metadata } from 'next';
import { obtenerPostsPublicados } from '@/lib/blog-server';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { BookOpen, TrendingUp, Sparkles, ChefHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog – DGcost | Consejos de Repostería y Gestión de Costos',
  description:
    'Artículos, tutoriales y consejos sobre repostería, pastelería y cómo gestionar los costos de tu negocio con DGcost.',
  openGraph: {
    title: 'Blog – DGcost',
    description:
      'Artículos, tutoriales y consejos sobre repostería, pastelería y cómo gestionar los costos de tu negocio.',
    type: 'website',
    siteName: 'DGcost',
  },
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogPage() {
  const posts = await obtenerPostsPublicados(24);
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase">
                Blog & Magazine
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Consejos, tutoriales y tendencias para llevar tu repostería al siguiente nivel.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Badge variant="secondary" className="text-xs font-bold uppercase">
                <ChefHat className="w-3 h-3 mr-1" /> Recetas
              </Badge>
              <Badge variant="secondary" className="text-xs font-bold uppercase">
                <TrendingUp className="w-3 h-3 mr-1" /> Costos
              </Badge>
              <Badge variant="secondary" className="text-xs font-bold uppercase">
                <Sparkles className="w-3 h-3 mr-1" /> Tips
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {posts.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-3xl border shadow-lg">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mb-6">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold mb-2">Próximamente</p>
              <p className="text-muted-foreground">Estamos preparando contenido increíble para ti. ¡Vuelve pronto!</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Featured Post */}
              {featuredPost && (
                <div className="relative">
                  <Badge className="absolute top-4 left-4 z-10 font-black text-[10px] uppercase tracking-widest">
                    Destacado
                  </Badge>
                  <Link href={`/blog/${featuredPost.slug}`}>
                    <div className="bg-card rounded-3xl border shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <div className="grid md:grid-cols-2 gap-0">
                        {featuredPost.cover_image && (
                          <div 
                            className="h-64 md:h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${featuredPost.cover_image})` }}
                          />
                        )}
                        <div className="p-8 md:p-12 flex flex-col justify-center space-y-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                            <span>{featuredPost.published_at ? new Date(featuredPost.published_at).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : 'Reciente'}</span>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                            {featuredPost.title}
                          </h2>
                          <p className="text-muted-foreground line-clamp-3">
                            {featuredPost.excerpt}
                          </p>
                          <div className="pt-4">
                            <span className="text-sm font-black text-primary uppercase tracking-widest hover:gap-2 inline-flex items-center gap-1">
                              Leer más →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Regular Posts Grid */}
              {regularPosts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
