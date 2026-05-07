// ============================================================
// Blog / Magazine – TypeScript Types
// ============================================================

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  tags: string[];
  author_id: string | null;
  author_name: string | null;
  status: BlogPostStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  tags: string; // comma-separated in the form, converted to array on save
  status: BlogPostStatus;
  seo_title: string;
  seo_description: string;
  og_image: string;
}

export interface BlogPostInsert {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  cover_image?: string | null;
  tags?: string[];
  author_id?: string | null;
  author_name?: string | null;
  status: BlogPostStatus;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
}

export interface BlogPostUpdate {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  cover_image?: string | null;
  tags?: string[];
  author_name?: string | null;
  status?: BlogPostStatus;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
}
