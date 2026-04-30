import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// ── Zod schema for the AI-extracted recipe ────────────────────────────────────
const RecetaExtraidaSchema = z.object({
  nombre: z.string().min(1).max(200),
  descripcion: z.string().max(1000).default(''),
  categoria: z.string().max(100).optional().default(''),
  materiales: z.array(
    z.object({
      nombre: z.string().min(1).max(200),
      cantidad: z.number().positive(),
      unidad: z.string().min(1).max(50),
    })
  ),
});

export type RecetaExtraida = z.infer<typeof RecetaExtraidaSchema>;

// ── Build authenticated Supabase server client ────────────────────────────────
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

// ── Fetch user plan info from Supabase ────────────────────────────────────────
async function getUserPlanInfo(supabase: Awaited<ReturnType<typeof getServerSupabase>>, userId: string) {
  const { data } = await supabase
    .from('user_subscription_info')
    .select('plan_name')
    .eq('user_id', userId)
    .single();
  return data;
}

// ── Call OpenAI GPT-4o Vision to extract recipe data from the image ───────────
async function extractRecipeFromImage(base64Image: string, mimeType: string): Promise<RecetaExtraida> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no está configurado en el servidor.');
  }

  const prompt = `Analiza esta imagen que contiene una receta de repostería o panadería.
Extrae la información y devuelve ÚNICAMENTE un JSON válido con la siguiente estructura (sin texto adicional ni bloques de código):
{
  "nombre": "nombre de la receta",
  "descripcion": "descripción breve de la receta",
  "categoria": "categoría (ej: Tortas, Galletas, Panes, Postres, Cupcakes, etc.)",
  "materiales": [
    { "nombre": "nombre del ingrediente", "cantidad": número, "unidad": "unidad de medida (gramos, ml, unidades, etc.)" }
  ]
}
Si la imagen no contiene una receta, devuelve: { "error": "La imagen no contiene una receta reconocible." }`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: 'high' },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Error al llamar a OpenAI (${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  const content: string = result?.choices?.[0]?.message?.content ?? '';

  // Extract JSON from the response (handle potential markdown code blocks)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('La respuesta de IA no contiene un JSON válido.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('No se pudo interpretar la respuesta de la IA.');
  }

  // Check for explicit error from the AI
  if (parsed && typeof parsed === 'object' && 'error' in parsed) {
    throw new Error(String((parsed as Record<string, unknown>).error));
  }

  const validated = RecetaExtraidaSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error('La receta extraída no tiene el formato esperado. Intenta con una imagen más clara.');
  }

  return validated.data;
}

// ============================================================
// POST /api/recetas/importar-foto
// Accepts multipart/form-data with an 'imagen' file field.
// Returns extracted recipe data as JSON.
// Only available for profesional and empresarial plan users.
// ============================================================
export async function POST(req: NextRequest) {
  // 1. Authenticate
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // 2. Check plan – feature is only available for profesional and empresarial
  const planInfo = await getUserPlanInfo(supabase, user.id);
  const planName = planInfo?.plan_name ?? 'free';
  if (planName !== 'profesional' && planName !== 'empresarial') {
    return NextResponse.json(
      { error: 'Esta función solo está disponible en planes Profesional y Empresarial.' },
      { status: 403 }
    );
  }

  // 3. Parse multipart form data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'No se pudo leer la imagen enviada.' }, { status: 400 });
  }

  const imageFile = formData.get('imagen');
  if (!imageFile || !(imageFile instanceof Blob)) {
    return NextResponse.json({ error: 'Se requiere el campo "imagen" con un archivo de imagen.' }, { status: 400 });
  }

  // 4. Validate file type and size (max 10 MB)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(imageFile.type)) {
    return NextResponse.json(
      { error: 'Tipo de imagen no válido. Se aceptan: JPEG, PNG, WebP o GIF.' },
      { status: 400 }
    );
  }

  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
  if (imageFile.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'La imagen es demasiado grande. El tamaño máximo es 10 MB.' },
      { status: 400 }
    );
  }

  // 5. Convert to base64
  const buffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  // 6. Call AI
  try {
    const recetaExtraida = await extractRecipeFromImage(base64, imageFile.type);
    return NextResponse.json({ receta: recetaExtraida });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al procesar la imagen con IA.';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
