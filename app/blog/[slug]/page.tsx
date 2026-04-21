import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { obtenerPostPorSlug } from '@/lib/blog-server';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

/* ------------------------------------------------------------------ */
/* SEO metadata                                                          */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await obtenerPostPorSlug(slug);

  if (!post) {
    return { title: 'Post no encontrado – DGcost' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dgcost.app';
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
  const ogImage = post.og_image ?? post.cover_image ?? `${siteUrl}/og-default.png`;

  return {
    title: post.seo_title ?? `${post.title} – DGcost`,
    description: post.seo_description ?? post.excerpt ?? '',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt ?? '',
      url: canonicalUrl,
      siteName: 'DGcost',
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      authors: post.author_name ? [post.author_name] : undefined,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: post.title }]
        : undefined,
      tags: Array.isArray(post.tags) ? post.tags : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt ?? '',
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/* ------------------------------------------------------------------ */
/* JSON-LD structured data                                              */
/* ------------------------------------------------------------------ */

function buildJsonLd(post: Awaited<ReturnType<typeof obtenerPostPorSlug>>) {
  if (!post) return null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dgcost.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? '',
    image: post.cover_image ?? undefined,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author_name ?? 'DGcost',
    },
    publisher: {
      '@type': 'Organization',
      name: 'DGcost',
      url: siteUrl,
    },
    url: `${siteUrl}/blog/${post.slug}`,
    keywords: Array.isArray(post.tags) ? post.tags.join(', ') : '',
  };
}

/* ------------------------------------------------------------------ */
/* Page component                                                        */
/* ------------------------------------------------------------------ */

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await obtenerPostPorSlug(slug);

  if (!post) {
    notFound();
  }

  const publishDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const tags: string[] = Array.isArray(post.tags) ? post.tags : [];
  const jsonLd = buildJsonLd(post);

  return (
    <>
      {/* JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-violet-600 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Blog
      </Link>

      <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover image */}
        {post.cover_image && (
          <div className="relative w-full h-64 sm:h-80">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        )}

        <div className="p-6 sm:p-10">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-violet-50/30 text-violet-700"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 pb-8 border-b border-gray-200 mb-8">
            {post.author_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author_name}
              </span>
            )}
            {publishDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {publishDate}
              </span>
            )}
          </div>

          {/* Content */}
          <MarkdownRenderer content={post.content} />
        </div>
      </article>
    </>
  );
}
