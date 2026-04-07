import type { Metadata } from 'next';
import { obtenerPostsPublicados } from '@/lib/blog-server';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { BookOpen } from 'lucide-react';

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

  return (
    <>
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 mb-4">
          <BookOpen className="w-7 h-7 text-violet-600 dark:text-violet-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
          Blog & Magazine
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Consejos, tutoriales y tendencias para llevar tu repostería al siguiente nivel.
        </p>
      </div>

      {/* Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-24 text-gray-400 dark:text-gray-500">
          <p className="text-xl font-medium mb-2">Próximamente</p>
          <p className="text-sm">Estamos preparando contenido para ti. ¡Vuelve pronto!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
