import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/cron/bcv-exchange-rate/test
 *
 * Endpoint de prueba para desarrollo local que permite ejecutar el cron job
 * sin necesidad de autenticación. SOLO DISPONIBLE EN DESARROLLO.
 *
 * Parámetros de query:
 * - simulate=true: Simula una tasa de cambio sin llamar al BCV (útil en Docker)
 * - tasa=36.50: Especifica una tasa personalizada para la simulación
 */
export async function GET(req: NextRequest) {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Este endpoint solo está disponible en desarrollo' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const simulate = searchParams.get('simulate') === 'true';
  const tasaPersonalizada = searchParams.get('tasa');

  // Modo simulado: actualiza directamente sin llamar al BCV
  if (simulate) {
    try {
      const inicioEjecucion = Date.now();
      console.log('[BCV Test] Modo simulado activado');

      // Usar tasa personalizada o generar una aleatoria
      const tasaCambio = tasaPersonalizada 
        ? parseFloat(tasaPersonalizada)
        : parseFloat((35 + Math.random() * 5).toFixed(2)); // Entre 35 y 40

      console.log(`[BCV Test] Tasa simulada: ${tasaCambio} Bs/USD`);

      // Actualizar en Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

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
        const tasaAnterior = configExistente.tasa_cambio_usd;
        
        const { error: errorActualizar } = await supabase
          .from('configuracion')
          .update({ tasa_cambio_usd: tasaCambio })
          .eq('id', configExistente.id);

        if (errorActualizar) {
          throw new Error(`Error al actualizar configuración: ${errorActualizar.message}`);
        }
        resultado = { actualizado: true, tasaAnterior };
      } else {
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
      console.log(`[BCV Test] ✓ Simulación completada en ${duracion}ms`);

      return NextResponse.json({
        exitoso: true,
        tasaCambio,
        actualizadoEn: new Date().toISOString(),
        duracionMs: duracion,
        mensaje: `Tasa simulada actualizada a ${tasaCambio} Bs/USD`,
        ...resultado,
        _test: {
          modo: 'simulado',
          mensaje: 'Datos simulados sin llamar al BCV',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[BCV Test] Error en simulación:', mensaje);
      return NextResponse.json(
        { exitoso: false, error: mensaje },
        { status: 500 }
      );
    }
  }

  // Modo normal: llama al endpoint principal
  try {
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const cronSecret = process.env.CRON_SECRET;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (cronSecret) {
      headers['Authorization'] = `Bearer ${cronSecret}`;
    }

    const response = await fetch(`${baseUrl}/api/cron/bcv-exchange-rate`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    return NextResponse.json({
      ...data,
      _test: {
        modo: 'real',
        mensaje: 'Ejecutado desde endpoint de prueba',
        cronSecretConfigured: !!cronSecret,
        timestamp: new Date().toISOString(),
        sugerencia: 'Si hay problemas de red, usa ?simulate=true',
      },
    }, { status: response.status });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[BCV Test] Error:', mensaje);
    return NextResponse.json(
      { 
        exitoso: false, 
        error: mensaje,
        sugerencia: 'Intenta con ?simulate=true para modo simulado'
      },
      { status: 500 }
    );
  }
}
