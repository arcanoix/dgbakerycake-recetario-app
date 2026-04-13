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
 * Obtiene la tasa de cambio desde la API externa de scraping.
 * API: https://python-scrapping-bcv.onrender.com/currency/usd
 */
async function obtenerTasaDesdeAPIExterna(): Promise<number | null> {
  try {
    console.log('[API Externa] Intentando obtener tasa desde API de scraping...');
    
    const apiKey = process.env.BCV_API_KEY;

    if (!apiKey) {
      console.error('[API Externa] BCV_API_KEY no configurada');
      return null;
    }

    const response = await fetch(
      'https://python-scrapping-bcv.onrender.com/currency/usd',
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
      console.error(`[API Externa] HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Extraer la tasa del response (ajustar según la estructura de tu API)
    const tasa = data.price || data.rate || data.value || data.tasa;
    
    if (!tasa) {
      console.error('[API Externa] No se encontró la tasa en la respuesta:', data);
      return null;
    }

    const tasaNumero = typeof tasa === 'string' ? parseFloat(tasa.replace(',', '.')) : tasa;
    
    if (validarTasa(tasaNumero)) {
      console.log(`[API Externa] ✓ Tasa obtenida: ${tasaNumero} Bs/USD`);
      return tasaNumero;
    }
    
    console.error(`[API Externa] Tasa fuera de rango: ${tasaNumero}`);
    return null;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error('[API Externa] Error:', mensaje);
    return null;
  }
}

/**
 * Obtiene la tasa de cambio desde la API JSON del BCV (alternativa al scraping).
 * Endpoint: https://pydolarve.org/api/v1/dollar?page=bcv
 */
async function obtenerTasaDesdeBCVAPI(): Promise<number | null> {
  try {
    console.log('[BCV API] Intentando obtener tasa desde API alternativa...');
    
    const response = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[BCV API] HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // La API retorna: { monitors: { bcv: { price: "36.50", ... } } }
    const precio = data?.monitors?.bcv?.price;
    
    if (!precio) {
      console.error('[BCV API] No se encontró el precio en la respuesta');
      return null;
    }

    const tasa = parseFloat(precio);
    
    if (validarTasa(tasa)) {
      console.log(`[BCV API] ✓ Tasa obtenida: ${tasa} Bs/USD`);
      return tasa;
    }
    
    console.error(`[BCV API] Tasa fuera de rango: ${tasa}`);
    return null;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error('[BCV API] Error:', mensaje);
    return null;
  }
}

/**
 * Obtiene la tasa de cambio del BCV con reintentos (scraping HTML).
 */
async function obtenerTasaBCVConReintentos(): Promise<number> {
  let ultimoError: Error | null = null;

  for (let intento = 1; intento <= MAX_REINTENTOS; intento++) {
    try {
      console.log(`[BCV Fetch] Intento ${intento}/${MAX_REINTENTOS}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      console.log(`[BCV Fetch] Intentando conectar a BCV...`);
      
      const respuestaBCV = await fetch('https://www.bcv.org.ve/', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'es-VE,es;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
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
      console.error(`[BCV Fetch] Error type:`, error instanceof Error ? error.constructor.name : typeof error);
      console.error(`[BCV Fetch] Error cause:`, error instanceof Error && 'cause' in error ? error.cause : 'N/A');

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
 * Obtiene la tasa de cambio intentando múltiples métodos con fallback automático.
 * 
 * Estrategia de fallback:
 * 1. API externa de scraping (python-scrapping-bcv) - Método principal
 * 2. API alternativa (PyDolarVe) - Fallback 1
 * 3. Scraping TypeScript (Next.js) - Fallback final
 */
async function obtenerTasaBCV(): Promise<number> {
  // Método 1: API externa de scraping (principal)
  console.log('[BCV] Método 1: Intentando API externa de scraping...');
  const tasaAPIExterna = await obtenerTasaDesdeAPIExterna();
  
  if (tasaAPIExterna) {
    console.log(`[BCV] ✓ Tasa obtenida desde API externa: ${tasaAPIExterna} Bs/USD`);
    return tasaAPIExterna;
  }

  // Método 2: API alternativa PyDolarVe
  console.log('[BCV] Método 2: Intentando API alternativa (PyDolarVe)...');
  const tasaAPI = await obtenerTasaDesdeBCVAPI();
  
  if (tasaAPI) {
    console.log(`[BCV] ✓ Tasa obtenida desde API PyDolarVe: ${tasaAPI} Bs/USD`);
    return tasaAPI;
  }

  // Método 3: Scraping TypeScript (fallback final)
  console.log('[BCV] Método 3: Intentando scraping TypeScript (regex)...');
  try {
    const tasaScraping = await obtenerTasaBCVConReintentos();
    console.log(`[BCV] ✓ Tasa obtenida desde scraping TS: ${tasaScraping} Bs/USD`);
    return tasaScraping;
  } catch (error) {
    console.error('[BCV] ✗ Todos los métodos fallaron');
    throw new Error('No se pudo obtener la tasa de cambio del BCV. Intentos: API externa, API PyDolarVe y scraping TypeScript.');
  }
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
    // Obtener la tasa de cambio (API primero, luego scraping)
    const tasaCambio = await obtenerTasaBCV();

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
