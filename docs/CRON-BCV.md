# Cron Job BCV - Documentación del Flujo de Ejecución

## 📋 Descripción General

Este cron job obtiene automáticamente la tasa de cambio USD/VES del Banco Central de Venezuela (BCV) y actualiza la configuración global de la aplicación en Supabase.

## 🔄 Flujo de Ejecución

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Vercel Cron (Producción) o Test Endpoint (Desarrollo)   │
│    Ejecuta: GET /api/cron/bcv-exchange-rate                │
│    Horario: Diariamente a las 4:00 PM UTC (12:00 PM VET)   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Validación de Seguridad                                  │
│    - Verifica header Authorization: Bearer <CRON_SECRET>    │
│    - Rechaza si no coincide (401 Unauthorized)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Sincronización con API Externa                           │
│    - POST https://python-scrapping-bcv.onrender.com/sync    │
│    - Header: X-API-Key                                      │
│    - La API externa:                                        │
│      • Obtiene tasa del BCV (scraping)                      │
│      • Valida la tasa                                       │
│      • Actualiza Supabase directamente                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Respuesta Exitosa                                        │
│    {                                                         │
│      exitoso: true,                                          │
│      actualizadoEn: "2026-04-13T23:38:00.000Z",            │
│      duracionMs: 1234,                                      │
│      mensaje: "Sincronización exitosa con API externa"      │
│    }                                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Uso en Desarrollo Local

### Opción 1: Endpoint de Prueba con Simulación (Recomendado para Docker)

```bash
# Modo simulado con tasa aleatoria (35-40 Bs/USD)
curl "http://localhost:3000/api/cron/bcv-exchange-rate/test?simulate=true"

# Modo simulado con tasa personalizada
curl "http://localhost:3000/api/cron/bcv-exchange-rate/test?simulate=true&tasa=37.50"

# PowerShell (Windows)
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/bcv-exchange-rate/test?simulate=true" -UseBasicParsing
```

**¿Por qué usar modo simulado en Docker?**
- Los contenedores Docker pueden tener restricciones de red
- El BCV puede bloquear requests desde ciertas IPs
- Permite probar el flujo completo sin depender de servicios externos

### Opción 2: Endpoint de Prueba Real (Requiere acceso a internet)

```bash
# Llama al BCV real
curl http://localhost:3000/api/cron/bcv-exchange-rate/test
```

Este endpoint:
- ✅ Solo funciona en `NODE_ENV=development`
- ✅ No requiere autenticación manual
- ✅ Llama automáticamente al endpoint principal con el header correcto
- ✅ Retorna información adicional de debug
- ⚠️ Puede fallar en Docker si no hay acceso al BCV

### Opción 3: Endpoint Principal con Autenticación

```bash
# Con CRON_SECRET configurado
curl -H "Authorization: Bearer your-cron-secret-here" \
     http://localhost:3000/api/cron/bcv-exchange-rate

# Sin CRON_SECRET (desarrollo)
curl http://localhost:3000/api/cron/bcv-exchange-rate
```

## 🐳 Configuración Docker

### Variables de Entorno Requeridas

El archivo `docker-compose.yml` debe incluir:

```yaml
environment:
  - NODE_ENV=development
  - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
  - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
  - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
  - DATABASE_URL=${DATABASE_URL}
  - CRON_SECRET=${CRON_SECRET}
  - BCV_API_KEY=${BCV_API_KEY}
```

### Archivo `.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres

# Cron Job Security
CRON_SECRET="your-cron-secret-here"

# API Externa de Scraping BCV
BCV_API_KEY="tu-api-key-de-scraping"
```

### Ejecutar en Docker

```bash
# Iniciar contenedor
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Probar el cron job
curl http://localhost:3000/api/cron/bcv-exchange-rate/test
```

## 🔒 Seguridad

### Autenticación

- **Producción (Vercel)**: Vercel envía automáticamente el header `Authorization: Bearer <CRON_SECRET>`
- **Desarrollo**: El endpoint de prueba maneja la autenticación automáticamente
- **Manual**: Debes enviar el header con el secreto correcto

### Variables Sensibles

⚠️ **NUNCA** commitear:
- `.env.local` (contiene secretos reales)
- `CRON_SECRET` en código fuente

✅ **SÍ** commitear:
- `.env.example` (con valores de ejemplo)
- `docker-compose.yml` (usa variables de entorno)

## 📊 Logging y Monitoreo

### Logs de Ejecución

```
[BCV Cron] Iniciando ejecución - 2026-04-11T16:00:00.000Z
[BCV] Método 1: Intentando API externa de scraping...
[API Externa] Intentando obtener tasa desde API de scraping...
[API Externa] ✓ Tasa obtenida: 36.50 Bs/USD
[BCV] ✓ Tasa obtenida desde API externa: 36.50 Bs/USD
[BCV Cron] Conectando a Supabase...
[BCV Cron] Actualizando tasa: 35.80 → 36.50 Bs/USD
[Sync API] Sincronizando con API externa...
[Sync API] ✓ Sincronización exitosa: { success: true, ... }
[BCV Cron] ✓ Completado exitosamente en 1456ms
```

### Logs de Error

```
[BCV Fetch] Intento 1 falló: HTTP 503: Service Unavailable
[BCV Fetch] Esperando 1000ms antes de reintentar...
[BCV Fetch] Intento 2/3
[BCV Parser] No se pudo extraer tasa válida con ningún método
[BCV Cron] ✗ Error: No se pudo extraer la tasa de cambio del HTML
[BCV Cron] Stack: Error: No se pudo extraer...
```

## 🔧 Características Implementadas

### ✅ Estrategia Triple de Obtención de Datos
**Método 1: API Externa de Scraping (Primario)**
- Endpoint: `https://python-scrapping-bcv.onrender.com/currency/usd`
- API dedicada con Python para scraping del BCV
- Autenticación con `X-API-Key` header
- Método POST
- Más confiable y mantenible

**Método 2: API Alternativa PyDolarVe (Fallback 1)**
- Endpoint: `https://pydolarve.org/api/v1/dollar?page=bcv`
- Formato JSON estructurado
- No requiere autenticación
- Fallback si la API principal falla

**Método 3: Scraping TypeScript (Fallback 2)**
- Solo se usa si ambos métodos anteriores fallan
- 3 estrategias diferentes de parsing HTML con regex
- Máximo 3 intentos con exponential backoff
- Timeout: 10 segundos por intento

**Ventajas de esta estrategia:**
- ✅ Triple redundancia (tres fuentes independientes)
- ✅ API principal dedicada y optimizada para scraping
- ✅ Funciona incluso si el BCV bloquea IPs de Vercel
- ✅ Fallback automático sin intervención manual
- ✅ Logging detallado de qué método funcionó
- ✅ Fácil de mantener (scraping centralizado en API externa)

### ✅ Validación de Rango
- Tasa mínima: 1 Bs/USD
- Tasa máxima: 200 Bs/USD
- Rechaza valores fuera de rango

### ✅ Actualización Optimizada
- Solo actualiza si la tasa cambió
- Actualiza un solo registro (no todas las filas)
- Crea configuración si no existe
- Sincroniza automáticamente con API externa después de actualizar

### ✅ Sincronización con API Externa
- Llama al endpoint `/sync` de la API externa
- Mantiene sincronizada la base de datos de la API
- No bloquea el flujo principal si falla
- Usa la misma autenticación (X-API-Key)

### ✅ Logging Mejorado
- Timestamps en cada paso
- Duración de ejecución
- Stack traces en errores
- Indicadores visuales (✓/✗)
- Logging de qué método funcionó (API vs Scraping)

## 📈 Respuestas del API

### Éxito (200)

```json
{
  "exitoso": true,
  "tasaCambio": 36.50,
  "actualizadoEn": "2026-04-11T16:00:00.000Z",
  "duracionMs": 1234,
  "mensaje": "Tasa de cambio USD actualizada a 36.50 Bs/USD",
  "actualizado": true,
  "tasaAnterior": 35.80
}
```

### Sin Cambios (200)

```json
{
  "exitoso": true,
  "tasaCambio": 36.50,
  "sinCambios": true,
  "actualizadoEn": "2026-04-11T16:00:00.000Z",
  "duracionMs": 856,
  "mensaje": "Tasa sin cambios: 36.50 Bs/USD"
}
```

### Error (500)

```json
{
  "exitoso": false,
  "error": "No se pudo extraer la tasa de cambio del HTML",
  "duracionMs": 31234,
  "timestamp": "2026-04-11T16:00:00.000Z"
}
```

### No Autorizado (401)

```json
{
  "error": "No autorizado"
}
```

## 🧪 Testing

### Test Manual

```bash
# 1. Verificar que el contenedor está corriendo
docker-compose ps

# 2. Ejecutar el endpoint de prueba
curl http://localhost:3000/api/cron/bcv-exchange-rate/test

# 3. Verificar logs
docker-compose logs -f app | grep BCV

# 4. Verificar en Supabase
# Ve a: https://supabase.com/dashboard/project/xxx/editor
# Tabla: configuracion
# Columna: tasa_cambio_usd
```

### Test de Seguridad

```bash
# Sin autenticación (debe fallar en producción)
curl http://localhost:3000/api/cron/bcv-exchange-rate

# Con autenticación incorrecta (debe retornar 401)
curl -H "Authorization: Bearer wrong-secret" \
     http://localhost:3000/api/cron/bcv-exchange-rate

# Con autenticación correcta (debe funcionar)
curl -H "Authorization: Bearer your-cron-secret-here" \
     http://localhost:3000/api/cron/bcv-exchange-rate
```

## 🐛 Troubleshooting

### Problema: "No autorizado" (401)

**Causa**: CRON_SECRET no coincide o no está configurado

**Solución**:
```bash
# Verificar que existe en .env.local
cat .env.local | grep CRON_SECRET

# Usar el endpoint de prueba en desarrollo
curl http://localhost:3000/api/cron/bcv-exchange-rate/test
```

### Problema: "Error al obtener la página del BCV"

**Causa**: BCV.org.ve está caído o bloqueando requests

**Solución**:
- Esperar y reintentar (el sistema reintenta automáticamente)
- Verificar conectividad: `curl https://www.bcv.org.ve/`
- Considerar implementar API alternativa (DolarToday, etc.)

### Problema: "fetch failed" en Docker o Vercel

**Causa**: El servidor no puede acceder a https://www.bcv.org.ve/ (bloqueado por IP)

**Solución Automática**: 
El sistema ahora usa una **estrategia dual**:
1. **Primero** intenta obtener la tasa desde la API alternativa (PyDolarVe)
2. **Si falla**, intenta scraping del sitio web del BCV
3. **Solo falla** si ambos métodos fallan

**Solución Manual (desarrollo)**:
```bash
# Usar modo simulado
curl "http://localhost:3000/api/cron/bcv-exchange-rate/test?simulate=true&tasa=37.50"

# O en PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/bcv-exchange-rate/test?simulate=true&tasa=37.50" -UseBasicParsing
```

**Nota**: Con la API alternativa, el cron job debería funcionar correctamente en Vercel incluso si el BCV bloquea las IPs de AWS.

### Problema: "No se pudo extraer la tasa de cambio"

**Causa**: BCV cambió la estructura HTML de su página

**Solución**:
1. Inspeccionar el HTML actual: `curl https://www.bcv.org.ve/ > bcv.html`
2. Buscar el nuevo patrón del dólar
3. Actualizar los regex en `parsearTasaBCV()`

### Problema: Variables de entorno no se cargan en Docker

**Causa**: Docker no está leyendo `.env.local`

**Solución**:
```bash
# El archivo docker-compose.yml ya incluye env_file: .env.local
# Solo necesitas reiniciar:
docker-compose down
docker-compose up -d
```

## 📅 Configuración de Vercel Cron

En `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/bcv-exchange-rate",
      "schedule": "0 16 * * *"
    }
  ]
}
```

- **Schedule**: `0 16 * * *` = Diariamente a las 4:00 PM UTC (12:00 PM VET)
- **Formato**: Cron expression estándar
- **Timezone**: UTC (Vercel usa UTC por defecto)

### Cambiar Horario

```json
"schedule": "0 14 * * *"  // 2:00 PM UTC = 10:00 AM VET
"schedule": "0 18 * * *"  // 6:00 PM UTC = 2:00 PM VET
"schedule": "0 */6 * * *" // Cada 6 horas
```

## 🔗 Referencias

- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Service Role](https://supabase.com/docs/guides/api/api-keys)
- [BCV Website](https://www.bcv.org.ve/)

## 📝 Notas Adicionales

- El cron job usa `SUPABASE_SERVICE_ROLE_KEY` para bypass RLS policies
- La tasa se actualiza solo si cambió (optimización)
- Los logs incluyen duración para monitoreo de performance
- El sistema es resiliente a fallos temporales del BCV
