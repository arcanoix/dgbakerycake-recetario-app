"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRole } from "@/hooks/useRole";
import { obtenerTodosLosPosts, eliminarPost } from "@/lib/blog";
import { BlogPost } from "@/types/blog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import {
  PenSquare,
  Trash2,
  PlusCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  FileText,
} from "lucide-react";

export default function AdminBlogPage() {
  const router = useRouter();
  const { isAdmin, cargando: cargandoRole } = useRole();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    if (!cargandoRole && !isAdmin) {
      router.push("/");
    } else if (isAdmin) {
      cargarPosts();
    }
  }, [isAdmin, cargandoRole, router]);

  const cargarPosts = async () => {
    setCargando(true);
    const data = await obtenerTodosLosPosts();
    setPosts(data);
    setCargando(false);
  };

  const handleEliminar = async (id: string, titulo: string) => {
    if (!confirm(`¿Eliminar el post "${titulo}"? Esta acción no se puede deshacer.`)) return;
    setEliminando(id);
    const { error } = await eliminarPost(id);
    if (error) {
      alert(`Error al eliminar: ${error}`);
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
    setEliminando(null);
  };

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (cargandoRole) {
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-violet-600" />
              Gestión del Blog
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Administra los artículos del Blog / Magazine público.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={cargarPosts}
              disabled={cargando}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${cargando ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Link href="/admin/blog/nuevo">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                <PlusCircle className="w-4 h-4 mr-1" />
                Nuevo Post
              </Button>
            </Link>
          </div>
        </div>

        {/* Posts table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {posts.length} {posts.length === 1 ? "artículo" : "artículos"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cargando ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No hay posts aún</p>
                <p className="text-sm mt-1">Crea tu primer artículo</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Título</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Estado</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Publicado</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">Autor</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-xs">
                            {post.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 font-mono">{post.slug}</div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          {post.status === "published" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                              <Eye className="w-3 h-3" />
                              Publicado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
                              <EyeOff className="w-3 h-3" />
                              Borrador
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-gray-500 dark:text-gray-400 text-xs">
                          {formatFecha(post.published_at)}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-gray-500 dark:text-gray-400 text-xs">
                          {post.author_name ?? "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {post.status === "published" && (
                              <Link
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Ver en blog"
                              >
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                            )}
                            <Link href={`/admin/blog/${post.id}/editar`} title="Editar">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <PenSquare className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleEliminar(post.id, post.title)}
                              disabled={eliminando === post.id}
                              title="Eliminar"
                            >
                              {eliminando === post.id ? (
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-red-500" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </ProtectedRoute>
  );
}
