import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';


/**
 * Sincroniza con la API externa.
 * La API externa obtiene la tasa del BCV y la almacena en Supabase.
 * Endpoint: POST https://python-scrapping-bcv.onrender.com/sync
 */
async function sincronizarConAPIExterna(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('[Sync API] Sincronizando con API externa...');
    
    const apiKey = process.env.BCV_API_KEY;

    if (!apiKey) {
      console.error('[Sync API] BCV_API_KEY no configurada');
      return { success: false, error: 'BCV_API_KEY no configurada' };
    }

    const response = await fetch(
      'https://python-scrapping-bcv.onrender.com/sync',
      {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error(`[Sync API] HTTP ${response.status}: ${response.statusText}`);
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    console.log(`[Sync API] ✓ Sincronización exitosa:`, data);
    return { success: true, data };
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error('[Sync API] Error en sincronización:', mensaje);
    return { success: false, error: mensaje };
  }
}

function tieneCredencialCronValida(authHeader: string | null, cronSecret: string | undefined): boolean {
  if (!cronSecret || !authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const credencial = Buffer.from(authHeader.slice('Bearer '.length));
  const secreto = Buffer.from(cronSecret);

  return credencial.length === secreto.length && timingSafeEqual(credencial, secreto);
}


/**
 * GET /api/cron/bcv-exchange-rate
 *
 * Cron job diario que sincroniza con la API externa.
 * La API externa obtiene la tasa del BCV y la almacena en Supabase.
 *
 * Protegido por el secreto CRON_SECRET enviado por Vercel en el header
 * "Authorization: Bearer <CRON_SECRET>".
 */
export async function GET(req: NextRequest) {
  // Verificar el secreto del cron para evitar ejecuciones no autorizadas
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!tieneCredencialCronValida(authHeader, cronSecret)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const inicioEjecucion = Date.now();
  console.log(`[BCV Cron] Iniciando ejecución - ${new Date().toISOString()}`);

  try {
    // Sincronizar con API externa (obtiene tasa y actualiza Supabase)
    const resultado = await sincronizarConAPIExterna();

    if (!resultado.success) {
      throw new Error(resultado.error || 'Error en sincronización');
    }

    const duracion = Date.now() - inicioEjecucion;
    console.log(`[BCV Cron] ✓ Completado exitosamente en ${duracion}ms`);

    return NextResponse.json({
      exitoso: true,
      actualizadoEn: new Date().toISOString(),
      duracionMs: duracion,
      mensaje: 'Sincronización exitosa con API externa',
      ...resultado.data,
    });
  } catch (error) {
    const duracion = Date.now() - inicioEjecucion;
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[BCV Cron] ✗ Error:', mensaje);
    console.error('[BCV Cron] Stack:', error instanceof Error ? error.stack : 'N/A');

    return NextResponse.json(
      {
        exitoso: false,
        error: mensaje,
        duracionMs: duracion,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
