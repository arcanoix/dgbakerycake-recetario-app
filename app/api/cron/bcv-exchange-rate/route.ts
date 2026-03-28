import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/** Valores por defecto usados al crear la primera fila de configuración */
const CONFIG_POR_DEFECTO = {
  costo_por_hora_defecto: 10,
  moneda: 'VES',
  margen_ganancia_defecto: 30,
} as const;

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
    if (!isNaN(valor) && valor > 0) return valor;
  }

  // Método 2: buscar el bloque completo del dólar (div con clase que incluye "dolar")
  const bloqueDolar = html.match(
    /class=["'][^"']*dolar[^"']*["'][^>]*>[\s\S]*?<strong[^>]*>\s*([\d,.]+)\s*<\/strong>/i
  );
  if (bloqueDolar) {
    const valor = parseFloat(bloqueDolar[1].replace(',', '.'));
    if (!isNaN(valor) && valor > 0) return valor;
  }

  // Método 3: buscar cualquier <strong> que siga a texto "dólar" o "USD" en el HTML
  const contextoDolar = html.match(
    /(?:d[oó]lar|USD)[\s\S]{0,300}?<strong[^>]*>\s*([\d,.]+)\s*<\/strong>/i
  );
  if (contextoDolar) {
    const valor = parseFloat(contextoDolar[1].replace(',', '.'));
    if (!isNaN(valor) && valor > 0) return valor;
  }

  return null;
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

  try {
    // Obtener la página del BCV
    const respuestaBCV = await fetch('https://www.bcv.org.ve/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.9,en;q=0.8',
      },
      // No almacenar en caché para siempre obtener el valor actual
      cache: 'no-store',
    });

    if (!respuestaBCV.ok) {
      throw new Error(
        `Error al obtener la página del BCV: HTTP ${respuestaBCV.status}`
      );
    }

    const html = await respuestaBCV.text();

    // Parsear la tasa de cambio
    const tasaCambio = parsearTasaBCV(html);

    if (!tasaCambio) {
      throw new Error(
        'No se pudo extraer la tasa de cambio USD de la página del BCV'
      );
    }

    // Actualizar la configuración en Supabase usando el service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Obtener el registro de configuración existente
    const { data: configExistente, error: errorLectura } = await supabase
      .from('configuracion')
      .select('id')
      .maybeSingle();

    if (errorLectura) {
      throw new Error(`Error al leer la configuración: ${errorLectura.message}`);
    }

    if (configExistente) {
      // Actualizar la tasa de cambio en la fila existente
      const { error: errorActualizar } = await supabase
        .from('configuracion')
        .update({ tasa_cambio_usd: tasaCambio })
        .eq('id', configExistente.id);

      if (errorActualizar) {
        throw new Error(
          `Error al actualizar la configuración: ${errorActualizar.message}`
        );
      }
    } else {
      // Crear configuración con el valor obtenido si no existe ninguna fila
      const { error: errorInsertar } = await supabase
        .from('configuracion')
        .insert([
          {
            ...CONFIG_POR_DEFECTO,
            tasa_cambio_usd: tasaCambio,
          },
        ]);

      if (errorInsertar) {
        throw new Error(
          `Error al crear la configuración: ${errorInsertar.message}`
        );
      }
    }

    console.log(
      `[BCV Cron] Tasa de cambio actualizada: ${tasaCambio} Bs/USD`
    );

    return NextResponse.json({
      exitoso: true,
      tasaCambio,
      actualizadoEn: new Date().toISOString(),
      mensaje: `Tasa de cambio USD actualizada a ${tasaCambio} Bs/USD`,
    });
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : 'Error desconocido';
    console.error('[BCV Cron] Error:', mensaje);
    return NextResponse.json({ exitoso: false, error: mensaje }, { status: 500 });
  }
}
