import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { updateSession } from '@/utils/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

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

// Rutas permitidas incluso en mantenimiento
const MAINTENANCE_ALLOWED_PATHS = [
  '/mantenimiento',
  '/auth/login',
  '/auth/register',
  '/api/admin/system-settings',
  '/api/admin/activity-logs',
  '/admin',
];

async function isMaintenanceMode(request: NextRequest): Promise<{ enabled: boolean; message?: string; isAdmin: boolean }> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op: en middleware no modificamos cookies aquí
            // Las cookies se manejan en updateSession
          },
        },
      }
    );

    // Verificar configuración del sistema
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('maintenance_mode, maintenance_message')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !settings) {
      return { enabled: false, isAdmin: false };
    }

    if (!settings.maintenance_mode) {
      return { enabled: false, isAdmin: false };
    }

    // Verificar si el usuario es admin
    const { data: { user } } = await supabase.auth.getUser();
    let isAdmin = false;
    if (user) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      isAdmin = roleData?.role === 'admin';
    }

    return {
      enabled: true,
      message: settings.maintenance_message || 'El sistema está en mantenimiento. Volveremos pronto.',
      isAdmin,
    };
  } catch {
    return { enabled: false, isAdmin: false };
  }
}

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

  // Verificar modo mantenimiento (solo para rutas no excluidas)
  const isAllowedPath = MAINTENANCE_ALLOWED_PATHS.some(path => pathname.startsWith(path));
  const isStaticOrApi = pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname === '/favicon.ico';

  if (!isAllowedPath && !isStaticOrApi) {
    const maintenance = await isMaintenanceMode(request);
    if (maintenance.enabled && !maintenance.isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/mantenimiento';
      return NextResponse.redirect(url);
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
