# BCV Scraper - Supabase Edge Function (Python)

Edge Function en Python para obtener la tasa de cambio USD del BCV mediante scraping web usando XPath.

## 🎯 Características

- ✅ **XPath preciso**: Usa el XPath específico `/html/body/div[4]/div/div[2]/div/div[1]/div[1]/section[1]/div/div[2]/div/div[7]/div/div/div[2]`
- ✅ **Scraping robusto**: Usa `lxml` para parsing HTML eficiente
- ✅ **Validación de datos**: Verifica que la tasa esté en rango válido (1-200 Bs/USD)
- ✅ **Actualización automática**: Guarda directamente en tabla `configuracion` de Supabase
- ✅ **Logging detallado**: Logs completos para debugging
- ✅ **Manejo de errores**: Captura y reporta errores de red, parsing, etc.

## 📋 Requisitos

### Dependencias Python
```
requests==2.31.0
lxml==5.1.0
supabase==2.3.4
```

### Variables de Entorno
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
FUNCTION_SECRET=tu-secreto-opcional
```

## 🚀 Despliegue

### 1. Instalar Supabase CLI

```bash
# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# macOS (Homebrew)
brew install supabase/tap/supabase

# Linux
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
```

### 2. Inicializar Supabase (si no está inicializado)

```bash
supabase init
```

### 3. Desplegar la función

```bash
# Desde la raíz del proyecto
supabase functions deploy bcv-scraper

# Con variables de entorno
supabase secrets set SUPABASE_URL=https://tu-proyecto.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu-key
supabase secrets set FUNCTION_SECRET=tu-secreto
```

## 📡 Uso

### Llamar desde Next.js (Vercel Cron)

```typescript
// app/api/cron/bcv-exchange-rate/route.ts
async function obtenerTasaDesdeSuperbaseFunction(): Promise<number | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/bcv-scraper`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: process.env.FUNCTION_SECRET
        })
      }
    );

    const data = await response.json();
    
    if (data.success) {
      return data.tasa_cambio;
    }
    
    return null;
  } catch (error) {
    console.error('[Supabase Function] Error:', error);
    return null;
  }
}
```

### Llamar directamente (curl)

```bash
# Con secreto
curl -X POST \
  https://tu-proyecto.supabase.co/functions/v1/bcv-scraper \
  -H "Authorization: Bearer tu-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"secret": "tu-function-secret"}'

# Sin secreto (si no está configurado)
curl -X POST \
  https://tu-proyecto.supabase.co/functions/v1/bcv-scraper \
  -H "Authorization: Bearer tu-anon-key"
```

## 📊 Respuestas

### Éxito (200)

```json
{
  "success": true,
  "tasa_cambio": 36.50,
  "timestamp": "2026-04-13T17:02:00.000Z",
  "duracion_ms": 1234,
  "metodo": "xpath",
  "xpath_usado": "/html/body/div[4]/div/div[2]/div/div[1]/div[1]/section[1]/div/div[2]/div/div[7]/div/div/div[2]",
  "actualizado": true,
  "tasa_anterior": 35.80
}
```

### Error de Scraping (500)

```json
{
  "success": false,
  "error": "No se encontró el elemento con el XPath proporcionado",
  "timestamp": "2026-04-13T17:02:00.000Z"
}
```

### Error de Autorización (401)

```json
{
  "success": false,
  "error": "No autorizado"
}
```

## 🔧 Desarrollo Local

### 1. Servir la función localmente

```bash
supabase functions serve bcv-scraper --env-file supabase/functions/bcv-scraper/.env
```

### 2. Probar localmente

```bash
curl -X POST http://localhost:54321/functions/v1/bcv-scraper \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"secret": "test-secret"}'
```

## 🐛 Debugging

### Ver logs en tiempo real

```bash
supabase functions logs bcv-scraper --follow
```

### Logs esperados

```
[BCV Scraper] Iniciando ejecución - 2026-04-13T17:02:00.000Z
[BCV Scraper] Obteniendo página: https://www.bcv.org.ve/
[BCV Scraper] Página obtenida: 200
[BCV Scraper] Texto extraído: "36,50"
[BCV Scraper] ✓ Tasa obtenida: 36.5 Bs/USD
[BCV Scraper] Conectando a Supabase...
[BCV Scraper] Actualizando tasa: 35.8 → 36.5 Bs/USD
[BCV Scraper] ✓ Completado exitosamente en 1234ms
```

## 🔄 Integración con Cron Job Actual

### Estrategia Recomendada: Triple Fallback

```typescript
// app/api/cron/bcv-exchange-rate/route.ts
async function obtenerTasaBCV(): Promise<number> {
  // Método 1: API alternativa (PyDolarVe)
  const tasaAPI = await obtenerTasaDesdeBCVAPI();
  if (tasaAPI) return tasaAPI;

  // Método 2: Edge Function Python (Supabase)
  const tasaEdgeFunction = await obtenerTasaDesdeSuperbaseFunction();
  if (tasaEdgeFunction) return tasaEdgeFunction;

  // Método 3: Scraping TypeScript (fallback final)
  return await obtenerTasaBCVConReintentos();
}
```

## ⚠️ Consideraciones

### Ventajas
- ✅ Python es mejor para scraping que TypeScript
- ✅ XPath es más preciso que regex
- ✅ lxml es más rápido que BeautifulSoup
- ✅ Se ejecuta en infraestructura de Supabase (puede tener mejor acceso)

### Limitaciones
- ⚠️ Edge Functions tienen timeout de 60 segundos
- ⚠️ Puede tener el mismo problema de bloqueo de IPs
- ⚠️ Requiere configuración adicional de Supabase CLI

## 📝 Mantenimiento

### Actualizar XPath si cambia la estructura del BCV

1. Inspeccionar la página del BCV
2. Obtener nuevo XPath usando DevTools
3. Actualizar la constante `XPATH_DOLAR` en `index.py`
4. Re-desplegar: `supabase functions deploy bcv-scraper`

### Agregar métodos alternativos de extracción

```python
# Agregar XPaths alternativos como fallback
XPATHS_ALTERNATIVOS = [
    '/html/body/div[4]/div/div[2]/div/div[1]/div[1]/section[1]/div/div[2]/div/div[7]/div/div/div[2]',
    '//div[@id="dolar"]//strong',
    '//div[contains(@class, "dolar")]//strong'
]

for xpath in XPATHS_ALTERNATIVOS:
    elementos = tree.xpath(xpath)
    if elementos:
        # Procesar...
        break
```

## 🔗 Enlaces Útiles

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [lxml XPath Tutorial](https://lxml.de/xpathxslt.html)
