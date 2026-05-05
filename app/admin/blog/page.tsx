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
  Crown,
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
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              Gestión del Blog
            </h1>
            <p className="text-muted-foreground mt-1">
              Administra los artículos del Blog / Magazine público
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={cargarPosts}
              disabled={cargando}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Link href="/admin/blog/nuevo">
              <Button className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Nuevo Post
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Posts table */}
        <Card className="border-0 shadow-lg">
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
              <div className="text-center py-16 text-gray-700">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No hay posts aún</p>
                <p className="text-sm mt-1">Crea tu primer artículo</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="px-6 py-3 font-medium text-gray-700">Título</th>
                      <th className="px-6 py-3 font-medium text-gray-700 hidden sm:table-cell">Estado</th>
                      <th className="px-6 py-3 font-medium text-gray-700 hidden md:table-cell">Publicado</th>
                      <th className="px-6 py-3 font-medium text-gray-700 hidden lg:table-cell">Autor</th>
                      <th className="px-6 py-3 font-medium text-gray-700 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-gray-50/50 hover:bg-gray-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">
                            {post.title}
                          </div>
                          <div className="text-xs text-gray-700 mt-0.5 font-mono">{post.slug}</div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          {post.status === "published" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50/20 text-green-700">
                              <Eye className="w-3 h-3" />
                              Publicado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-50/20 text-yellow-700">
                              <EyeOff className="w-3 h-3" />
                              Borrador
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-gray-700 text-xs">
                          {formatFecha(post.published_at)}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-gray-700 text-xs">
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
      </div>
    </ProtectedRoute>
  );
}
