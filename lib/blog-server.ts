// ============================================================
// Blog / Magazine – Server-side Data Access (RSC / API routes)
// ============================================================
// These functions use createSupabaseServerClient which requires
// next/headers and MUST only be called from Server Components,
// Route Handlers, or Server Actions — never from Client Components.
// ============================================================

import { createSupabaseServerClient } from '@/utils/supabase/server';
import { BlogPost } from '@/types/blog';

/** Fetch all published posts (server component use). */
export async function obtenerPostsPublicados(limit = 20): Promise<BlogPost[]> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error al obtener posts publicados:', error);
    return [];
  }

  return (data ?? []) as BlogPost[];
}

/** Fetch a single published post by slug (server component use). */
export async function obtenerPostPorSlug(slug: string): Promise<BlogPost | null> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    return null;
  }

  return data as BlogPost;
}

/** Fetch all published slugs – used by generateStaticParams. */
export async function obtenerSlugsPosts(): Promise<string[]> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');

  if (error) {
    return [];
  }

  return (data ?? []).map((row: { slug: string }) => row.slug);
}
