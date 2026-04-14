import { supabase } from './supabase';

/**
 * Obtiene el precio USD desde la API externa de BCV
 */
async function obtenerPrecioBCVDesdeAPI(): Promise<number | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_BCV_API_KEY;

    if (!apiKey) {
      console.error('[BCV Sync] BCV_API_KEY no configurada');
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
      console.error(`[BCV Sync] HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const precio = data.price || data.rate || data.value || data.tasa;

    if (!precio) {
      console.error('[BCV Sync] No se encontró el precio en la respuesta:', data);
      return null;
    }

    const precioNumero = typeof precio === 'string' ? parseFloat(precio.replace(',', '.')) : precio;
    
    if (isNaN(precioNumero) || precioNumero <= 0) {
      console.error(`[BCV Sync] Precio inválido: ${precioNumero}`);
      return null;
    }

    return precioNumero;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error('[BCV Sync] Error al obtener precio:', mensaje);
    return null;
  }
}

/**
 * Sincroniza el precio BCV al iniciar sesión
 * Compara el precio almacenado en configuración con el de la API
 * Si son diferentes, actualiza la configuración
 */
export async function sincronizarPrecioBCVAlLogin(): Promise<void> {
  try {
    console.log('[BCV Sync] Iniciando sincronización al login...');

    // 1. Obtener configuración actual de Supabase
    const { data: configActual, error: errorConfig } = await supabase
      .from('configuracion')
      .select('id, tasa_cambio_usd')
      .limit(1)
      .maybeSingle();

    if (errorConfig) {
      console.error('[BCV Sync] Error al obtener configuración:', errorConfig);
      return;
    }

    // 2. Obtener precio desde la API externa
    const precioAPI = await obtenerPrecioBCVDesdeAPI();

    if (!precioAPI) {
      console.log('[BCV Sync] No se pudo obtener precio de la API, se mantiene el actual');
      return;
    }

    // 3. Comparar precios
    const precioActual = configActual?.tasa_cambio_usd ? parseFloat(configActual.tasa_cambio_usd) : null;

    if (precioActual === precioAPI) {
      console.log(`[BCV Sync] ✓ Precio sin cambios: ${precioAPI} Bs/USD`);
      return;
    }

    console.log(`[BCV Sync] Precio diferente. Actual: ${precioActual}, API: ${precioAPI}`);

    // 4. Actualizar configuración si existe, o crear si no existe
    if (configActual) {
      const { error: errorUpdate } = await supabase
        .from('configuracion')
        .update({ tasa_cambio_usd: precioAPI })
        .eq('id', configActual.id);

      if (errorUpdate) {
        console.error('[BCV Sync] Error al actualizar configuración:', errorUpdate);
        return;
      }

      console.log(`[BCV Sync] ✓ Configuración actualizada: ${precioActual} → ${precioAPI} Bs/USD`);
    } else {
      // Crear configuración por defecto con el precio de la API
      const { error: errorCreate } = await supabase
        .from('configuracion')
        .insert([{
          costo_por_hora_defecto: 10,
          moneda: 'VES',
          margen_ganancia_defecto: 30,
          tasa_cambio_usd: precioAPI,
        }]);

      if (errorCreate) {
        console.error('[BCV Sync] Error al crear configuración:', errorCreate);
        return;
      }

      console.log(`[BCV Sync] ✓ Configuración creada con precio: ${precioAPI} Bs/USD`);
    }
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error('[BCV Sync] Error en sincronización:', mensaje);
  }
}
