"""
Edge Function para obtener la tasa de cambio USD del BCV mediante scraping.

Esta función utiliza lxml y XPath para extraer el valor del dólar de forma precisa
desde la página web del Banco Central de Venezuela.

Endpoint: /functions/v1/bcv-scraper
Método: POST
Headers: Authorization: Bearer <anon_key>
Body: { "secret": "your-function-secret" }

Respuesta exitosa:
{
  "success": true,
  "tasa_cambio": 36.50,
  "timestamp": "2026-04-13T17:02:00.000Z",
  "metodo": "xpath"
}
"""

import os
import json
import re
from datetime import datetime
from typing import Dict, Any, Optional

# Importaciones para HTTP y scraping
try:
    import requests
    from lxml import html
except ImportError:
    # Fallback si no están disponibles en el runtime
    requests = None
    html = None

# Supabase client
try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None


# Configuración
XPATH_DOLAR = '/html/body/div[4]/div/div[2]/div/div[1]/div[1]/section[1]/div/div[2]/div/div[7]/div/div/div[2]'
BCV_URL = 'https://www.bcv.org.ve/'
TIMEOUT = 10  # segundos
TASA_MIN = 1.0
TASA_MAX = 200.0


def validar_tasa(tasa: float) -> bool:
    """Valida que la tasa esté en un rango razonable."""
    return TASA_MIN <= tasa <= TASA_MAX


def limpiar_numero(texto: str) -> Optional[float]:
    """
    Limpia y convierte texto a número flotante.
    
    Ejemplos:
    - "36,50" -> 36.50
    - "36.50" -> 36.50
    - "Bs. 36,50" -> 36.50
    """
    if not texto:
        return None
    
    # Remover espacios, símbolos de moneda, etc.
    texto_limpio = re.sub(r'[^\d,.]', '', texto.strip())
    
    # Reemplazar coma por punto (formato venezolano)
    texto_limpio = texto_limpio.replace(',', '.')
    
    try:
        return float(texto_limpio)
    except ValueError:
        return None


def obtener_tasa_bcv() -> Dict[str, Any]:
    """
    Obtiene la tasa de cambio del BCV usando XPath.
    
    Returns:
        Dict con 'success', 'tasa', 'error'
    """
    if not requests or not html:
        return {
            'success': False,
            'error': 'Librerías de scraping no disponibles',
            'tasa': None
        }
    
    try:
        print(f'[BCV Scraper] Obteniendo página: {BCV_URL}')
        
        # Headers para simular navegador
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-VE,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        # Realizar request
        response = requests.get(BCV_URL, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
        
        print(f'[BCV Scraper] Página obtenida: {response.status_code}')
        
        # Parsear HTML con lxml
        tree = html.fromstring(response.content)
        
        # Extraer valor usando XPath
        elementos = tree.xpath(XPATH_DOLAR)
        
        if not elementos:
            print(f'[BCV Scraper] ✗ No se encontró elemento en XPath: {XPATH_DOLAR}')
            return {
                'success': False,
                'error': 'No se encontró el elemento con el XPath proporcionado',
                'tasa': None
            }
        
        # Obtener texto del primer elemento
        texto_tasa = elementos[0].text_content().strip()
        print(f'[BCV Scraper] Texto extraído: "{texto_tasa}"')
        
        # Limpiar y convertir a número
        tasa = limpiar_numero(texto_tasa)
        
        if tasa is None:
            print(f'[BCV Scraper] ✗ No se pudo convertir a número: "{texto_tasa}"')
            return {
                'success': False,
                'error': f'No se pudo parsear el valor: "{texto_tasa}"',
                'tasa': None
            }
        
        # Validar rango
        if not validar_tasa(tasa):
            print(f'[BCV Scraper] ✗ Tasa fuera de rango: {tasa}')
            return {
                'success': False,
                'error': f'Tasa fuera de rango válido ({TASA_MIN}-{TASA_MAX}): {tasa}',
                'tasa': tasa
            }
        
        print(f'[BCV Scraper] ✓ Tasa obtenida: {tasa} Bs/USD')
        return {
            'success': True,
            'tasa': tasa,
            'error': None
        }
        
    except requests.Timeout:
        print('[BCV Scraper] ✗ Timeout al conectar con BCV')
        return {
            'success': False,
            'error': 'Timeout al conectar con el BCV',
            'tasa': None
        }
    except requests.RequestException as e:
        print(f'[BCV Scraper] ✗ Error de red: {str(e)}')
        return {
            'success': False,
            'error': f'Error de red: {str(e)}',
            'tasa': None
        }
    except Exception as e:
        print(f'[BCV Scraper] ✗ Error inesperado: {str(e)}')
        return {
            'success': False,
            'error': f'Error inesperado: {str(e)}',
            'tasa': None
        }


def actualizar_supabase(tasa: float) -> Dict[str, Any]:
    """
    Actualiza la tasa de cambio en la tabla configuracion de Supabase.
    
    Args:
        tasa: Tasa de cambio a guardar
        
    Returns:
        Dict con 'success', 'actualizado', 'error'
    """
    if not create_client:
        return {
            'success': False,
            'error': 'Cliente de Supabase no disponible',
            'actualizado': False
        }
    
    try:
        # Obtener credenciales de variables de entorno
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            return {
                'success': False,
                'error': 'Variables de entorno de Supabase no configuradas',
                'actualizado': False
            }
        
        print('[BCV Scraper] Conectando a Supabase...')
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Obtener configuración existente
        response = supabase.table('configuracion').select('id, tasa_cambio_usd').limit(1).execute()
        
        if response.data and len(response.data) > 0:
            # Actualizar configuración existente
            config_id = response.data[0]['id']
            tasa_anterior = response.data[0].get('tasa_cambio_usd')
            
            print(f'[BCV Scraper] Actualizando tasa: {tasa_anterior} → {tasa} Bs/USD')
            
            supabase.table('configuracion').update({
                'tasa_cambio_usd': tasa
            }).eq('id', config_id).execute()
            
            return {
                'success': True,
                'actualizado': True,
                'tasa_anterior': tasa_anterior,
                'error': None
            }
        else:
            # Crear nueva configuración
            print('[BCV Scraper] Creando nueva configuración...')
            
            supabase.table('configuracion').insert({
                'costo_por_hora_defecto': 10,
                'moneda': 'VES',
                'margen_ganancia_defecto': 30,
                'tasa_cambio_usd': tasa
            }).execute()
            
            return {
                'success': True,
                'actualizado': True,
                'creado': True,
                'error': None
            }
            
    except Exception as e:
        print(f'[BCV Scraper] ✗ Error al actualizar Supabase: {str(e)}')
        return {
            'success': False,
            'error': f'Error al actualizar Supabase: {str(e)}',
            'actualizado': False
        }


def handler(event, context):
    """
    Handler principal de la Edge Function.
    
    Args:
        event: Evento HTTP de Supabase
        context: Contexto de ejecución
        
    Returns:
        Response HTTP con JSON
    """
    inicio = datetime.utcnow()
    print(f'[BCV Scraper] Iniciando ejecución - {inicio.isoformat()}')
    
    try:
        # Parsear body si existe
        body = {}
        if hasattr(event, 'json'):
            body = event.json()
        elif hasattr(event, 'body'):
            try:
                body = json.loads(event.body) if event.body else {}
            except json.JSONDecodeError:
                body = {}
        
        # Verificar secreto (opcional, para seguridad adicional)
        function_secret = os.environ.get('FUNCTION_SECRET')
        if function_secret and body.get('secret') != function_secret:
            print('[BCV Scraper] ✗ Secreto inválido')
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': False,
                    'error': 'No autorizado'
                })
            }
        
        # Obtener tasa del BCV
        resultado_scraping = obtener_tasa_bcv()
        
        if not resultado_scraping['success']:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': False,
                    'error': resultado_scraping['error'],
                    'timestamp': inicio.isoformat()
                })
            }
        
        tasa = resultado_scraping['tasa']
        
        # Actualizar en Supabase
        resultado_actualizacion = actualizar_supabase(tasa)
        
        if not resultado_actualizacion['success']:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': False,
                    'error': resultado_actualizacion['error'],
                    'tasa_cambio': tasa,
                    'scraping_exitoso': True,
                    'timestamp': inicio.isoformat()
                })
            }
        
        # Calcular duración
        fin = datetime.utcnow()
        duracion_ms = int((fin - inicio).total_seconds() * 1000)
        
        print(f'[BCV Scraper] ✓ Completado exitosamente en {duracion_ms}ms')
        
        # Respuesta exitosa
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'tasa_cambio': tasa,
                'timestamp': inicio.isoformat(),
                'duracion_ms': duracion_ms,
                'metodo': 'xpath',
                'xpath_usado': XPATH_DOLAR,
                **resultado_actualizacion
            })
        }
        
    except Exception as e:
        print(f'[BCV Scraper] ✗ Error fatal: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': False,
                'error': f'Error fatal: {str(e)}',
                'timestamp': inicio.isoformat()
            })
        }
