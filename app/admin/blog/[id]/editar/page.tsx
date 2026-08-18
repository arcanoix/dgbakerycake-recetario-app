"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRole } from "@/hooks/useRole";
import { obtenerPostPorId } from "@/lib/blog";
import { BlogPost } from "@/types/blog";

const BlogPostForm = dynamic(
  () => import("@/components/blog/BlogPostForm").then((mod) => mod.BlogPostForm),
  { ssr: false }
);

export default function EditarPostPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, cargando: cargandoRole } = useRole();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [cargando, setCargando] = useState(true);

  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  useEffect(() => {
    if (!cargandoRole && !isAdmin) {
      router.push("/");
      return;
    }
    if (isAdmin && id) {
      obtenerPostPorId(id).then((data) => {
        if (!data) {
          router.push("/admin/blog");
        } else {
          setPost(data);
        }
        setCargando(false);
      });
    }
  }, [isAdmin, cargandoRole, id, router]);

  if (cargandoRole || cargando) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      {post && <BlogPostForm post={post} />}
    </ProtectedRoute>
  );
}
