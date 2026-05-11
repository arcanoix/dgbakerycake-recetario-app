import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const activityLogSchema = z.object({
  action: z.enum(['create', 'update', 'delete', 'login', 'logout', 'view', 'error']),
  module: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  entity_id: z.string().max(100).optional(),
  entity_name: z.string().max(200).optional(),
});

/**
 * Helper: build server-side Supabase client for the authenticated user.
 */
async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

/**
 * Extract real IP from request headers (supports proxies / Vercel).
 */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip') ||
    '0.0.0.0'
  );
}

// ============================================================
// GET /api/admin/activity-logs
// Returns activity logs for admin users.
// Query params: limit, offset, user_id, module, action
// ============================================================
export async function GET(req: NextRequest) {
  const supabaseServer = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabaseServer.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Verify admin role
  const { data: roleData, error: roleError } = await supabaseServer
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError || roleData?.role !== 'admin') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '200', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const filterUserId = searchParams.get('user_id') || null;
  const filterModule = searchParams.get('module') || null;
  const filterAction = searchParams.get('action') || null;

  const { data, error } = await supabaseServer.rpc('get_activity_logs_with_user_info', {
    p_limit: limit,
    p_offset: offset,
    p_user_id: filterUserId,
    p_module: filterModule,
    p_action: filterAction,
  });

  if (error) {
    console.error('Error al obtener activity logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// ============================================================
// POST /api/admin/activity-logs
// Logs a user activity. Called by client-side code after
// performing a CRUD operation. Captures real IP server-side.
// Body: { action, module, description, entity_id?, entity_name? }
// ============================================================
export async function POST(req: NextRequest) {
  const supabaseServer = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabaseServer.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = activityLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    );
  }
  const { action, module: mod, description, entity_id, entity_name } = parsed.data;

  if (!action || !mod) {
    return NextResponse.json({ error: 'action y module son requeridos' }, { status: 400 });
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent') || '';

  // Use service role to bypass RLS for insert (the INSERT policy only allows
  // auth.uid() = user_id, but we're inserting server-side so we use service role).
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await supabaseAdmin.from('activity_logs').insert([
    {
      user_id: user.id,
      action,
      module: mod,
      description: description || null,
      entity_id: entity_id || null,
      entity_name: entity_name || null,
      ip_address: ip,
      user_agent: userAgent,
    },
  ]);

  if (error) {
    console.error('Error al insertar activity log:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
