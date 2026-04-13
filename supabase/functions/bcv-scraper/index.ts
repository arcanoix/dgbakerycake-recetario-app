import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts';

/**
 * Edge Function para obtener la tasa de cambio USD del BCV mediante scraping.
 * 
 * Usa DOMParser para parsear HTML y querySelector para extraer el valor
 * del dólar usando selectores CSS precisos.
 */

// Configuración
const BCV_URL = 'https://www.bcv.org.ve/';
const TIMEOUT_MS = 10000;
const TASA_MIN = 1.0;
const TASA_MAX = 200.0;

interface ScrapingResult {
  success: boolean;
  tasa?: number;
  error?: string;
}

interface SupabaseUpdateResult {
  success: boolean;
  actualizado?: boolean;
  tasa_anterior?: number;
  creado?: boolean;
  error?: string;
}

/**
 * Valida que la tasa esté en un rango razonable.
 */
function validarTasa(tasa: number): boolean {
  return tasa >= TASA_MIN && tasa <= TASA_MAX;
}

/**
 * Limpia y convierte texto a número flotante.
 */
function limpiarNumero(texto: string): number | null {
  if (!texto) return null;

  // Remover espacios, símbolos de moneda, etc.
  const textoLimpio = texto.trim().replace(/[^\d,.]/g, '');
  
  // Reemplazar coma por punto (formato venezolano)
  const textoConPunto = textoLimpio.replace(',', '.');
  
  try {
    return parseFloat(textoConPunto);
  } catch {
    return null;
  }
}

/**
 * Obtiene la tasa de cambio del BCV usando scraping HTML.
 */
async function obtenerTasaBCV(): Promise<ScrapingResult> {
  try {
    console.log(`[BCV Scraper] Obteniendo página: ${BCV_URL}`);

    // Headers para simular navegador
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-VE,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
    };

    // Realizar request con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(BCV_URL, {
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[BCV Scraper] HTTP ${response.status}: ${response.statusText}`);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const html = await response.text();
    console.log(`[BCV Scraper] Página obtenida: ${response.status}`);

    // Parsear HTML con DOMParser
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    if (!doc) {
      console.error('[BCV Scraper] No se pudo parsear el HTML');
      return {
        success: false,
        error: 'No se pudo parsear el HTML',
      };
    }

    // Intentar múltiples selectores para encontrar el dólar
    const selectores = [
      // Método 1: Por ID
      '#dolar strong',
      '[id*="dolar"] strong',
      
      // Método 2: Por clase
      '[class*="dolar"] strong',
      '.recuadroMoneda:has-text("Dólar") strong',
      
      // Método 3: Buscar por texto "USD" o "Dólar"
      'div:has-text("USD") strong',
      'div:has-text("Dólar") strong',
      
      // Método 4: Estructura específica del BCV
      'div.col-sm-6.col-xs-6.centrado strong',
    ];

    let textoTasa: string | null = null;

    for (const selector of selectores) {
      try {
        const elemento = doc.querySelector(selector);
        if (elemento && elemento.textContent) {
          const texto = elemento.textContent.trim();
          // Verificar que contenga números
          if (/\d/.test(texto)) {
            textoTasa = texto;
            console.log(`[BCV Scraper] Selector exitoso: "${selector}" → "${texto}"`);
            break;
          }
        }
      } catch (e) {
        // Continuar con el siguiente selector
        continue;
      }
    }

    if (!textoTasa) {
      console.error('[BCV Scraper] No se encontró el elemento con ningún selector');
      
      // Intentar con regex como último recurso
      const regexPatterns = [
        /id="dolar"[^>]*>[\s\S]*?<strong[^>]*>([\d,\.]+)/i,
        /class="[^"]*dolar[^"]*"[^>]*>[\s\S]*?<strong[^>]*>([\d,\.]+)/i,
        /USD[\s\S]*?<strong[^>]*>([\d,\.]+)/i,
      ];

      for (const pattern of regexPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          textoTasa = match[1];
          console.log(`[BCV Scraper] Regex exitoso: "${pattern}" → "${textoTasa}"`);
          break;
        }
      }

      if (!textoTasa) {
        return {
          success: false,
          error: 'No se encontró el elemento del dólar en el HTML',
        };
      }
    }

    // Limpiar y convertir a número
    const tasa = limpiarNumero(textoTasa);

    if (tasa === null) {
      console.error(`[BCV Scraper] No se pudo convertir a número: "${textoTasa}"`);
      return {
        success: false,
        error: `No se pudo parsear el valor: "${textoTasa}"`,
      };
    }

    // Validar rango
    if (!validarTasa(tasa)) {
      console.error(`[BCV Scraper] Tasa fuera de rango: ${tasa}`);
      return {
        success: false,
        error: `Tasa fuera de rango válido (${TASA_MIN}-${TASA_MAX}): ${tasa}`,
      };
    }

    console.log(`[BCV Scraper] ✓ Tasa obtenida: ${tasa} Bs/USD`);
    return {
      success: true,
      tasa,
    };

  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error(`[BCV Scraper] Error: ${mensaje}`);
    return {
      success: false,
      error: mensaje,
    };
  }
}

/**
 * Actualiza la tasa de cambio en Supabase.
 */
async function actualizarSupabase(tasa: number): Promise<SupabaseUpdateResult> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: 'Variables de entorno de Supabase no configuradas',
      };
    }

    console.log('[BCV Scraper] Conectando a Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener configuración existente
    const { data: configs, error: errorObtener } = await supabase
      .from('configuracion')
      .select('id, tasa_cambio_usd')
      .limit(1);

    if (errorObtener) {
      return {
        success: false,
        error: `Error al obtener configuración: ${errorObtener.message}`,
      };
    }

    if (configs && configs.length > 0) {
      // Actualizar configuración existente
      const config = configs[0];
      const tasaAnterior = config.tasa_cambio_usd;

      console.log(`[BCV Scraper] Actualizando tasa: ${tasaAnterior} → ${tasa} Bs/USD`);

      const { error: errorActualizar } = await supabase
        .from('configuracion')
        .update({ tasa_cambio_usd: tasa })
        .eq('id', config.id);

      if (errorActualizar) {
        return {
          success: false,
          error: `Error al actualizar: ${errorActualizar.message}`,
        };
      }

      return {
        success: true,
        actualizado: true,
        tasa_anterior: tasaAnterior,
      };
    } else {
      // Crear nueva configuración
      console.log('[BCV Scraper] Creando nueva configuración...');

      const { error: errorCrear } = await supabase
        .from('configuracion')
        .insert({
          costo_por_hora_defecto: 10,
          moneda: 'VES',
          margen_ganancia_defecto: 30,
          tasa_cambio_usd: tasa,
        });

      if (errorCrear) {
        return {
          success: false,
          error: `Error al crear: ${errorCrear.message}`,
        };
      }

      return {
        success: true,
        actualizado: true,
        creado: true,
      };
    }
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error(`[BCV Scraper] Error al actualizar Supabase: ${mensaje}`);
    return {
      success: false,
      error: mensaje,
    };
  }
}

/**
 * Handler principal de la Edge Function.
 */
serve(async (req) => {
  const inicio = new Date();
  console.log(`[BCV Scraper] Iniciando ejecución - ${inicio.toISOString()}`);

  try {
    // Verificar método
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Método no permitido' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parsear body
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body vacío está bien
    }

    // Verificar secreto (opcional)
    const functionSecret = Deno.env.get('FUNCTION_SECRET');
    if (functionSecret && body.secret !== functionSecret) {
      console.log('[BCV Scraper] ✗ Secreto inválido');
      return new Response(
        JSON.stringify({ success: false, error: 'No autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener tasa del BCV
    const resultadoScraping = await obtenerTasaBCV();

    if (!resultadoScraping.success || !resultadoScraping.tasa) {
      return new Response(
        JSON.stringify({
          success: false,
          error: resultadoScraping.error,
          timestamp: inicio.toISOString(),
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const tasa = resultadoScraping.tasa;

    // Actualizar en Supabase
    const resultadoActualizacion = await actualizarSupabase(tasa);

    if (!resultadoActualizacion.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: resultadoActualizacion.error,
          tasa_cambio: tasa,
          scraping_exitoso: true,
          timestamp: inicio.toISOString(),
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calcular duración
    const fin = new Date();
    const duracionMs = fin.getTime() - inicio.getTime();

    console.log(`[BCV Scraper] ✓ Completado exitosamente en ${duracionMs}ms`);

    // Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        tasa_cambio: tasa,
        timestamp: inicio.toISOString(),
        duracion_ms: duracionMs,
        metodo: 'deno-scraping',
        ...resultadoActualizacion,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error(`[BCV Scraper] ✗ Error fatal: ${mensaje}`);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Error fatal: ${mensaje}`,
        timestamp: inicio.toISOString(),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
