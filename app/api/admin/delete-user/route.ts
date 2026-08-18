import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const deleteUserSchema = z.object({
  userId: z.string().uuid('userId debe ser un UUID válido'),
});

export async function POST(req: NextRequest) {
  // Verify the caller is an authenticated admin
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
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Check admin role
  const { data: roleData, error: roleError } = await supabaseServer
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError || roleData?.role !== 'admin') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }

  const parsed = deleteUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    );
  }
  const { userId } = parsed.data;

  // Use service role client for admin operations
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    // First, delete related data in the database to avoid foreign key constraints
    // Delete user_roles
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (rolesError) {
      console.error('Error al eliminar user_roles:', rolesError);
    }

    // Delete profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error al eliminar profile:', profileError);
    }

    // Delete any other related data (subscriptions, etc.)
    const { error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);

    if (subscriptionError) {
      console.error('Error al eliminar subscription:', subscriptionError);
    }

    // Delete payment requests
    const { error: paymentError } = await supabaseAdmin
      .from('payment_requests')
      .delete()
      .eq('user_id', userId);

    if (paymentError) {
      console.error('Error al eliminar payment_requests:', paymentError);
    }

    // Delete activity logs (optional - you may want to keep these for audit)
    const { error: logsError } = await supabaseAdmin
      .from('activity_logs')
      .delete()
      .eq('user_id', userId);

    if (logsError) {
      console.error('Error al eliminar activity_logs:', logsError);
    }

    // Now delete the user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error al eliminar usuario en auth:', deleteError);
      return NextResponse.json(
        { error: `Error de autenticación: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error inesperado al eliminar usuario:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error inesperado del servidor' },
      { status: 500 }
    );
  }
}
