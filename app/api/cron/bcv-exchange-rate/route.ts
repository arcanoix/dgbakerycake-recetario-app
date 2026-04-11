import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Constantes de configuración
const TASA_MIN = 1;
const TASA_MAX = 200;
const MAX_REINTENTOS = 3;
const TIMEOUT_MS = 10000;



/**
 * Valida que la tasa de cambio esté dentro de un rango razonable.
 */
function validarTasa(tasa: number): boolean {
  return !isNaN(tasa) && tasa >= TASA_MIN && tasa <= TASA_MAX;
}

/**
 * Extrae la tasa de cambio USD del HTML de la página del BCV.
 *
 * XPath de referencia del BCV:
 * /html/body/div[4]/div/div[2]/div/div[1]/div[1]/section[1]/div/div[2]/div/div[7]/div/div/div[2]/strong
 *
 * La sección del dólar tiene id="dolar" y el valor está en un elemento <strong>.
 */
function parsearTasaBCV(html: string): number | null {
  // Método 1: buscar la sección con id="dolar" y extraer el <strong> más cercano
  const seccionDolar = html.match(
    /id=["']dolar["'][^>]*>[\s\S]*?<strong[^>]*>\s*([\d,.]+)\s*<\/strong>/i
  );
  if (seccionDolar) {
    // El BCV usa coma como separador decimal en español (ej. "36,50")
    const valor = parseFloat(seccionDolar[1].replace(',', '.'));
    if (validarTasa(valor)) {
      console.log(`[BCV Parser] Método 1 exitoso: ${valor} Bs/USD`);
      return valor;
    }
  }

  // Método 2: buscar el bloque completo del dólar (div con clase que incluye "dolar")
  const bloqueDolar = html.match(
    /class=["'][^"']*dolar[^"']*["'][^>]*>[\s\S]*?<strong[^>]*>\s*([\d,.]+)\s*<\/strong>/i
  );
  if (bloqueDolar) {
    const valor = parseFloat(bloqueDolar[1].replace(',', '.'));
    if (validarTasa(valor)) {
      console.log(`[BCV Parser] Método 2 exitoso: ${valor} Bs/USD`);
      return valor;
    }
  }

  // Método 3: buscar cualquier <strong> que siga a texto "dólar" o "USD" en el HTML
  const contextoDolar = html.match(
    /(?:d[oó]lar|USD)[\s\S]{0,300}?<strong[^>]*>\s*([\d,.]+)\s*<\/strong>/i
  );
  if (contextoDolar) {
    const valor = parseFloat(contextoDolar[1].replace(',', '.'));
    if (validarTasa(valor)) {
      console.log(`[BCV Parser] Método 3 exitoso: ${valor} Bs/USD`);
      return valor;
    }
  }

  console.error('[BCV Parser] No se pudo extraer tasa válida con ningún método');
  return null;
}

/**
 * Obtiene la tasa de cambio del BCV con reintentos.
 */
async function obtenerTasaBCVConReintentos(): Promise<number> {
  let ultimoError: Error | null = null;

  for (let intento = 1; intento <= MAX_REINTENTOS; intento++) {
    try {
      console.log(`[BCV Fetch] Intento ${intento}/${MAX_REINTENTOS}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const respuestaBCV = await fetch('https://www.bcv.org.ve/', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-VE,es;q=0.9,en;q=0.8',
        },
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!respuestaBCV.ok) {
        throw new Error(`HTTP ${respuestaBCV.status}: ${respuestaBCV.statusText}`);
      }

      const html = await respuestaBCV.text();
      const tasaCambio = parsearTasaBCV(html);

      if (!tasaCambio) {
        throw new Error('No se pudo extraer la tasa de cambio del HTML');
      }

      console.log(`[BCV Fetch] Éxito: ${tasaCambio} Bs/USD`);
      return tasaCambio;
    } catch (error) {
      ultimoError = error instanceof Error ? error : new Error(String(error));
      console.error(`[BCV Fetch] Intento ${intento} falló:`, ultimoError.message);

      // Esperar antes de reintentar (exponential backoff)
      if (intento < MAX_REINTENTOS) {
        const espera = Math.min(1000 * Math.pow(2, intento - 1), 5000);
        console.log(`[BCV Fetch] Esperando ${espera}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, espera));
      }
    }
  }

  throw ultimoError || new Error('Error desconocido al obtener tasa BCV');
}

/**
 * GET /api/cron/bcv-exchange-rate
 *
 * Cron job diario que obtiene la tasa de cambio USD del BCV y actualiza
 * la configuración global de la aplicación en Supabase.
 *
 * Protegido por el secreto CRON_SECRET enviado por Vercel en el header
 * "Authorization: Bearer <CRON_SECRET>".
 */
export async function GET(req: NextRequest) {
  // Verificar el secreto del cron para evitar ejecuciones no autorizadas
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const inicioEjecucion = Date.now();
  console.log(`[BCV Cron] Iniciando ejecución - ${new Date().toISOString()}`);

  try {
    // Obtener la tasa de cambio con reintentos
    const tasaCambio = await obtenerTasaBCVConReintentos();

    // Actualizar la configuración en Supabase usando el service role key
    console.log('[BCV Cron] Conectando a Supabase...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Obtener la primera configuración existente
    const { data: configExistente, error: errorObtener } = await supabase
      .from('configuracion')
      .select('id, tasa_cambio_usd')
      .limit(1)
      .maybeSingle();

    if (errorObtener) {
      throw new Error(`Error al obtener configuración: ${errorObtener.message}`);
    }

    let resultado;
    if (configExistente) {
      // Actualizar solo si la tasa cambió
      const tasaAnterior = configExistente.tasa_cambio_usd;
      if (tasaAnterior === tasaCambio) {
        console.log(`[BCV Cron] Tasa sin cambios: ${tasaCambio} Bs/USD`);
        const duracion = Date.now() - inicioEjecucion;
        return NextResponse.json({
          exitoso: true,
          tasaCambio,
          sinCambios: true,
          actualizadoEn: new Date().toISOString(),
          duracionMs: duracion,
          mensaje: `Tasa sin cambios: ${tasaCambio} Bs/USD`,
        });
      }

      console.log(`[BCV Cron] Actualizando tasa: ${tasaAnterior} → ${tasaCambio} Bs/USD`);
      const { error: errorActualizar } = await supabase
        .from('configuracion')
        .update({ tasa_cambio_usd: tasaCambio })
        .eq('id', configExistente.id);

      if (errorActualizar) {
        throw new Error(`Error al actualizar configuración: ${errorActualizar.message}`);
      }
      resultado = { actualizado: true, tasaAnterior };
    } else {
      // Crear nueva configuración si no existe
      console.log('[BCV Cron] Creando nueva configuración...');
      const { error: errorCrear } = await supabase
        .from('configuracion')
        .insert([{
          costo_por_hora_defecto: 10,
          moneda: 'VES',
          margen_ganancia_defecto: 30,
          tasa_cambio_usd: tasaCambio,
        }]);

      if (errorCrear) {
        throw new Error(`Error al crear configuración: ${errorCrear.message}`);
      }
      resultado = { creado: true };
    }

    const duracion = Date.now() - inicioEjecucion;
    console.log(`[BCV Cron] ✓ Completado exitosamente en ${duracion}ms`);

    return NextResponse.json({
      exitoso: true,
      tasaCambio,
      actualizadoEn: new Date().toISOString(),
      duracionMs: duracion,
      mensaje: `Tasa de cambio USD actualizada a ${tasaCambio} Bs/USD`,
      ...resultado,
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
