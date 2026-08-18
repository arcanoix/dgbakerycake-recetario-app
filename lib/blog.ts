// ============================================================
// Blog / Magazine – Client-side Data Access (browser)
// ============================================================
// All functions here use the browser Supabase singleton.
// For server-side (SSR/RSC) functions, see lib/blog-server.ts
// ============================================================

import { supabase } from '@/lib/supabase';
import { BlogPost, BlogPostInsert, BlogPostUpdate } from '@/types/blog';
export { generarSlug } from '@/lib/blog-utils';

/** Fetch ALL posts (draft + published) for admin management. */
export async function obtenerTodosLosPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener posts:', error);
    return [];
  }

  return (data ?? []) as BlogPost[];
}

/** Fetch a single post by id for admin editing. */
export async function obtenerPostPorId(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data as BlogPost;
}

/** Create a new blog post. */
export async function crearPost(post: BlogPostInsert): Promise<{ data: BlogPost | null; error: string | null }> {
  const payload = {
    ...post,
    published_at: post.status === 'published' ? (post.published_at ?? new Date().toISOString()) : null,
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(payload)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as BlogPost, error: null };
}

/** Update an existing blog post. */
export async function actualizarPost(
  id: string,
  updates: BlogPostUpdate
): Promise<{ data: BlogPost | null; error: string | null }> {
  const payload = {
    ...updates,
    published_at:
      updates.status === 'published' && !updates.published_at
        ? new Date().toISOString()
        : updates.published_at,
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as BlogPost, error: null };
}

/** Delete a blog post by id. */
export async function eliminarPost(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  return { error: error ? error.message : null };
}
