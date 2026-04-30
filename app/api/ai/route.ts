import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { planToFeatures, PLAN_FEATURES, Plan } from '@/types/subscription';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AIAction =
  | 'generar_descripcion'
  | 'consejos_reduccion_costos'
  | 'sugerir_sustitutos'
  | 'proponer_recetas_inventario';

export interface AIRequest {
  action: AIAction;
  /** Nombre de la receta (required for generar_descripcion, consejos_reduccion_costos, sugerir_sustitutos) */
  recetaNombre?: string;
  /** Descripción actual de la receta (optional context) */
  recetaDescripcion?: string;
  /** Lista de ingredientes/materiales de la receta */
  materiales?: Array<{ nombre: string; cantidad: number; unidad: string; costo?: number }>;
  /** Ingrediente faltante del que se quiere encontrar sustituto (sugerir_sustitutos) */
  ingredienteFaltante?: string;
  /** Productos disponibles en inventario (proponer_recetas_inventario) */
  inventario?: Array<{ nombre: string; cantidad: number; unidad: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPrompt(req: AIRequest): string {
  switch (req.action) {
    case 'generar_descripcion': {
      const ingredientesList = (req.materiales ?? [])
        .map((m) => `${m.nombre} (${m.cantidad} ${m.unidad})`)
        .join(', ');
      return (
        `Eres un experto en marketing de pastelería y repostería. ` +
        `Genera una descripción atractiva y apetitosa para vender la siguiente receta:\n\n` +
        `Nombre: ${req.recetaNombre ?? 'Receta sin nombre'}\n` +
        (req.recetaDescripcion ? `Descripción actual: ${req.recetaDescripcion}\n` : '') +
        (ingredientesList ? `Ingredientes principales: ${ingredientesList}\n` : '') +
        `\nLa descripción debe:\n` +
        `- Ser atractiva y despertar el apetito del cliente\n` +
        `- Mencionar los ingredientes más llamativos\n` +
        `- Tener entre 2 y 4 oraciones\n` +
        `- Estar en español\n` +
        `- No incluir precios ni información de costos\n\n` +
        `Responde ÚNICAMENTE con la descripción, sin encabezados ni explicaciones adicionales.`
      );
    }

    case 'consejos_reduccion_costos': {
      const materialesDetalle = (req.materiales ?? [])
        .map((m) => `- ${m.nombre}: ${m.cantidad} ${m.unidad}${m.costo !== undefined ? ` (costo: $${m.costo.toFixed(2)})` : ''}`)
        .join('\n');
      return (
        `Eres un consultor experto en optimización de costos para pastelerías. ` +
        `Analiza los siguientes ingredientes de la receta "${req.recetaNombre ?? 'esta receta'}" ` +
        `y proporciona consejos prácticos para reducir costos:\n\n` +
        `${materialesDetalle}\n\n` +
        `Proporciona entre 3 y 5 consejos concretos y accionables en español. ` +
        `Considera alternativas de compra a granel, sustitutos económicos, proveedores, etc. ` +
        `Responde en formato de lista numerada.`
      );
    }

    case 'sugerir_sustitutos': {
      const contexto = (req.materiales ?? [])
        .map((m) => m.nombre)
        .join(', ');
      return (
        `Eres un experto en repostería y pastelería. ` +
        `Sugiere sustitutos prácticos para el ingrediente "${req.ingredienteFaltante ?? 'ingrediente desconocido'}" ` +
        `en la receta "${req.recetaNombre ?? 'esta receta'}".\n\n` +
        (contexto ? `Otros ingredientes disponibles en la receta: ${contexto}\n\n` : '') +
        `Proporciona entre 2 y 4 sustitutos con:\n` +
        `- El nombre del sustituto\n` +
        `- La proporción de sustitución (ej. "usar 3/4 de la cantidad original")\n` +
        `- Cómo afecta al resultado final\n` +
        `Responde en español en formato de lista.`
      );
    }

    case 'proponer_recetas_inventario': {
      const inventarioLista = (req.inventario ?? [])
        .map((i) => `- ${i.nombre}: ${i.cantidad} ${i.unidad}`)
        .join('\n');
      return (
        `Eres un chef pastelero creativo. ` +
        `Basándote en los siguientes ingredientes disponibles en el inventario, ` +
        `propón entre 3 y 5 recetas de pastelería o repostería que se puedan elaborar:\n\n` +
        `${inventarioLista || 'Inventario no disponible'}\n\n` +
        `Para cada receta incluye:\n` +
        `- Nombre de la receta\n` +
        `- Ingredientes del inventario que utiliza\n` +
        `- Nivel de dificultad (fácil/medio/difícil)\n` +
        `- Tiempo aproximado de preparación\n` +
        `Responde en español.`
      );
    }

    default:
      return '';
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Authenticate user
  const cookieStore = await cookies();
  const supabase = createServerClient(
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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // 2. Check if user has AI feature access
  const hasAIAccess = await checkAIAccess(supabase, user.id);
  if (!hasAIAccess) {
    return NextResponse.json(
      {
        error: 'Funcionalidad de IA disponible solo para planes Profesional y Empresarial.',
        code: 'PLAN_UPGRADE_REQUIRED',
      },
      { status: 403 }
    );
  }

  // 3. Parse request body
  let body: AIRequest;
  try {
    body = (await request.json()) as AIRequest;
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }

  const validActions: AIAction[] = [
    'generar_descripcion',
    'consejos_reduccion_costos',
    'sugerir_sustitutos',
    'proponer_recetas_inventario',
  ];

  if (!validActions.includes(body.action)) {
    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  }

  // 4. Check OpenAI API key
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    return NextResponse.json(
      { error: 'El servicio de IA no está configurado. Contacta al administrador.' },
      { status: 503 }
    );
  }

  // 5. Build prompt and call OpenAI
  const prompt = buildPrompt(body);

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Error al conectar con el servicio de IA. Intenta de nuevo más tarde.' },
        { status: 502 }
      );
    }

    const openAIData = await openAIResponse.json();
    const result = openAIData.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({ result });
  } catch (err) {
    console.error('Error calling OpenAI:', err);
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud de IA.' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helper: check IA feature access via subscriptions table
// ---------------------------------------------------------------------------

async function checkAIAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<boolean> {
  // Admins always have access
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (roleData?.role === 'admin') return true;

  // Check active subscription
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('plan_id, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!subData) {
    // No active subscription → free plan → no AI
    return false;
  }

  // Get plan details
  const { data: planData } = await supabase
    .from('plans')
    .select('*')
    .eq('id', subData.plan_id)
    .single();

  if (!planData) return false;

  const features = planToFeatures(planData as Plan);
  return features.ia_features;
}
