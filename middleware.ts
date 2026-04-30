import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { updateSession } from '@/utils/supabase/middleware';

// Inicializa Redis con Upstash – funciona gracefully si los ENV no están configurados
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://dummy.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy',
});

// Permite 10 peticiones por ventana de 10 segundos por IP (rutas API generales)
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Las rutas de cron usan su propio sistema de autenticación (CRON_SECRET)
  if (pathname.startsWith('/api/cron/')) {
    return NextResponse.next();
  }

  // Rate limiting para rutas API (requiere Upstash configurado)
  if (pathname.startsWith('/api/') && process.env.UPSTASH_REDIS_REST_URL) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }
  }

  // Gestión de sesión Supabase SSR + redirección autenticación
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplica el middleware a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image  (optimización de imágenes)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
