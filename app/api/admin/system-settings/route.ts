import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const settingsSchema = z.object({
  max_users: z.number().min(-1).optional(),
  maintenance_mode: z.boolean().optional(),
  maintenance_message: z.string().max(500).optional(),
});

async function verifyAdmin(request: NextRequest): Promise<
  | { isAdmin: false; error: string; status: number }
  | { isAdmin: true; userId: string; supabase: ReturnType<typeof createServerClient> }
> {
  const cookieStore = await cookies();
  const supabaseServer = createServerClient(
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

  const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

  if (authError || !user) {
    return { isAdmin: false, error: 'No autenticado', status: 401 };
  }

  const { data: roleData, error: roleError } = await supabaseServer
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError || roleData?.role !== 'admin') {
    return { isAdmin: false, error: 'Acceso denegado', status: 403 };
  }

  return { isAdmin: true, userId: user.id, supabase: supabaseServer };
}

// GET - Obtener configuración del sistema
export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('count') === 'true';

    if (countOnly) {
      // Solo retornar conteo de usuarios
      const { count, error } = await adminCheck.supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'cliente');

      if (error) {
        console.error('Error al contar usuarios:', error);
        return NextResponse.json({ total: 0 });
      }

      return NextResponse.json({ total: count || 0 });
    }

    const { data, error } = await adminCheck.supabase
      .from('system_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error al obtener system_settings:', error);
      // Si la tabla no existe, devolver defaults
      if (error.code === '42P01') {
        return NextResponse.json({
          max_users: -1,
          maintenance_mode: false,
          maintenance_message: 'El sistema está en mantenimiento. Volveremos pronto.',
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        max_users: -1,
        maintenance_mode: false,
        maintenance_message: 'El sistema está en mantenimiento. Volveremos pronto.',
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error en GET system-settings:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST / PUT - Actualizar configuración del sistema
export async function POST(request: NextRequest) {
  const adminCheck = await verifyAdmin(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
    }

    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      );
    }

    const settings = parsed.data;

    // Preparar datos de actualización
    const updateData: any = {
      updated_at: new Date().toISOString(),
      updated_by: adminCheck.userId,
    };

    if (settings.max_users !== undefined) updateData.max_users = settings.max_users;
    if (settings.maintenance_mode !== undefined) updateData.maintenance_mode = settings.maintenance_mode;
    if (settings.maintenance_message !== undefined) updateData.maintenance_message = settings.maintenance_message;

    // Buscar registro existente
    const { data: existing } = await adminCheck.supabase
      .from('system_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;
    if (existing) {
      result = await adminCheck.supabase
        .from('system_settings')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await adminCheck.supabase
        .from('system_settings')
        .insert({
          max_users: settings.max_users ?? -1,
          maintenance_mode: settings.maintenance_mode ?? false,
          maintenance_message: settings.maintenance_message || 'El sistema está en mantenimiento. Volveremos pronto.',
          ...updateData,
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error al guardar system_settings:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: result.data });
  } catch (err) {
    console.error('Error en POST system-settings:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
