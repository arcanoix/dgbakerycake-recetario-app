"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { BlogPost, BlogPostFormData } from "@/types/blog";
import { crearPost, actualizarPost } from "@/lib/blog";
import { generarSlug } from "@/lib/blog-utils";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "motion/react";
import { ArrowLeft, Save, Eye, EyeOff, Tag } from "lucide-react";

interface BlogPostFormProps {
  post?: BlogPost;
}

const EMPTY_FORM: BlogPostFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  tags: "",
  status: "draft",
  seo_title: "",
  seo_description: "",
  og_image: "",
};

export function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isEditing = Boolean(post);

  const [form, setForm] = useState<BlogPostFormData>(
    post
      ? {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          cover_image: post.cover_image ?? "",
          tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
          status: post.status,
          seo_title: post.seo_title ?? "",
          seo_description: post.seo_description ?? "",
          og_image: post.og_image ?? "",
        }
      : EMPTY_FORM
  );

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

  const previewHtml = useMemo(() => {
    if (!form.content) return '';
    const raw = marked.parse(form.content, { async: false }) as string;
    return DOMPurify.sanitize(raw);
  }, [form.content]);

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: isEditing ? prev.slug : generarSlug(value),
    }));
  };

  const handleChange = (field: keyof BlogPostFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    if (!form.slug.trim()) {
      setError("El slug es obligatorio.");
      return;
    }
    if (!form.content.trim()) {
      setError("El contenido no puede estar vacío.");
      return;
    }

    setGuardando(true);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content,
      cover_image: form.cover_image.trim() || null,
      tags,
      author_id: user?.id ?? null,
      author_name: user?.user_metadata?.nombre ?? user?.email?.split("@")[0] ?? null,
      status: form.status,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      og_image: form.og_image.trim() || null,
    };

    const result = isEditing
      ? await actualizarPost(post!.id, payload)
      : await crearPost(payload);

    setGuardando(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/admin/blog");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/blog">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? "Editar Post" : "Nuevo Post"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {(["content", "seo"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {tab === "content" ? "Contenido" : "SEO"}
            </button>
          ))}
        </div>

        {/* CONTENT TAB */}
        {activeTab === "content" && (
          <div className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Título <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Título del artículo"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 shrink-0">/blog/</span>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    handleChange(
                      "slug",
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-")
                    )
                  }
                  placeholder="mi-articulo"
                  className="font-mono text-sm"
                  required
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Extracto / Resumen
              </label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => handleChange("excerpt", e.target.value)}
                placeholder="Breve descripción del artículo (aparece en la lista del blog)"
                rows={2}
              />
            </div>

            {/* Cover image */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                URL de imagen de portada
              </label>
              <Input
                value={form.cover_image}
                onChange={(e) => handleChange("cover_image", e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                Etiquetas
              </label>
              <Input
                value={form.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="repostería, costos, tutoriales (separadas por coma)"
              />
              <p className="text-xs text-gray-400">Separa las etiquetas con comas.</p>
            </div>

            {/* Content editor */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contenido (Markdown) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Editor */}
                <Textarea
                  value={form.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder={"# Título\n\nEscribe aquí tu contenido en **Markdown**.\n\n- Lista\n- de\n- elementos"}
                  rows={22}
                  className="font-mono text-sm resize-y"
                  required
                />
                {/* Preview */}
                <Card className="overflow-y-auto max-h-[520px]">
                  <CardHeader className="py-3 px-4 border-b">
                    <CardTitle className="text-xs text-gray-400 uppercase tracking-wider">
                      Vista previa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {previewHtml ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        Escribe contenido Markdown para ver la vista previa.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado
              </label>
              <div className="flex gap-3">
                {(["draft", "published"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleChange("status", s)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      form.status === s
                        ? s === "published"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          : "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {s === "published" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {s === "published" ? "Publicado" : "Borrador"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === "seo" && (
          <div className="space-y-5">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
              Optimiza cómo aparece este artículo en buscadores y redes sociales.
              Si los campos están vacíos se usará el título y extracto del post.
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Título SEO
              </label>
              <Input
                value={form.seo_title}
                onChange={(e) => handleChange("seo_title", e.target.value)}
                placeholder={form.title || "Título para motores de búsqueda"}
                maxLength={70}
              />
              <p className="text-xs text-gray-400">{form.seo_title.length}/70 caracteres recomendados</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta descripción
              </label>
              <Textarea
                value={form.seo_description}
                onChange={(e) => handleChange("seo_description", e.target.value)}
                placeholder={form.excerpt || "Descripción breve para motores de búsqueda"}
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-gray-400">{form.seo_description.length}/160 caracteres recomendados</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Imagen Open Graph (URL)
              </label>
              <Input
                value={form.og_image}
                onChange={(e) => handleChange("og_image", e.target.value)}
                placeholder={form.cover_image || "https://... (1200×630 px recomendado)"}
                type="url"
              />
              <p className="text-xs text-gray-400">
                Imagen que aparece al compartir en redes sociales. Si está vacío se usa la imagen de portada.
              </p>
            </div>

            {/* Preview card */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Vista previa en Google
              </p>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 max-w-lg">
                <p className="text-xs text-green-700 dark:text-green-500 mb-0.5 truncate">
                  dgcost.app › blog › {form.slug || "mi-articulo"}
                </p>
                <p className="text-base text-blue-700 dark:text-blue-400 font-medium leading-snug truncate">
                  {form.seo_title || form.title || "Título del artículo – DGcost"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                  {form.seo_description || form.excerpt || "Descripción del artículo…"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={guardando}
            className="bg-violet-600 hover:bg-violet-700 text-white min-w-[140px]"
          >
            {guardando ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                {isEditing ? "Guardar cambios" : "Crear post"}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
