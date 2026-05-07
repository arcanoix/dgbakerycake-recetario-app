"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Clock, TrendingUp, Users, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface PostStats {
  id: string;
  title: string;
  slug: string;
  status: string;
  unique_views: number;
  total_views: number;
  avg_read_time: number;
  avg_scroll_depth: number;
  total_likes: number;
  total_shares: number;
  last_viewed_at: string;
}

interface DashboardStats {
  posts: PostStats[];
}

export const BlogAnalyticsDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!stats || stats.posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>No hay estadísticas disponibles aún</p>
          <p className="text-sm mt-2">Las estadísticas aparecerán cuando los usuarios visiten tus artículos</p>
        </CardContent>
      </Card>
    );
  }

  const totalViews = stats.posts.reduce((sum, post) => sum + (post.total_views || 0), 0);
  const totalUniqueViews = stats.posts.reduce((sum, post) => sum + (post.unique_views || 0), 0);
  const avgReadTime = stats.posts.reduce((sum, post) => sum + (post.avg_read_time || 0), 0) / stats.posts.length;
  const avgScrollDepth = stats.posts.reduce((sum, post) => sum + (post.avg_scroll_depth || 0), 0) / stats.posts.length;

  const formatReadTime = (seconds: number) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vistas</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalUniqueViews.toLocaleString()} visitantes únicos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo de Lectura</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatReadTime(avgReadTime)}</div>
              <p className="text-xs text-muted-foreground mt-1">Promedio por artículo</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profundidad de Scroll</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(avgScrollDepth)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Promedio de lectura</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Artículos Publicados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.posts.filter(p => p.status === 'published').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                de {stats.posts.length} totales
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Artículos Más Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Artículo</th>
                  <th className="text-right py-3 px-4 font-medium">Vistas</th>
                  <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">Únicas</th>
                  <th className="text-right py-3 px-4 font-medium hidden md:table-cell">Tiempo</th>
                  <th className="text-right py-3 px-4 font-medium hidden lg:table-cell">Scroll</th>
                </tr>
              </thead>
              <tbody>
                {stats.posts
                  .sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
                  .slice(0, 10)
                  .map((post, index) => (
                    <tr key={post.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground font-mono text-xs">
                            #{index + 1}
                          </span>
                          <div>
                            <div className="font-medium line-clamp-1">{post.title}</div>
                            <div className="text-xs text-muted-foreground">{post.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {(post.total_views || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground hidden sm:table-cell">
                        {(post.unique_views || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground hidden md:table-cell">
                        {formatReadTime(post.avg_read_time || 0)}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground hidden lg:table-cell">
                        {Math.round(post.avg_scroll_depth || 0)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
