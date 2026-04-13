# Guía de Configuración - Supabase Edge Function Python

Esta guía te ayudará a desplegar la Edge Function Python para scraping del BCV en Supabase.

## 📋 Pre-requisitos

- Cuenta de Supabase activa
- Proyecto de Supabase creado
- Supabase CLI instalado
- Python 3.9+ (para desarrollo local)

## 🚀 Instalación de Supabase CLI

### Windows (Scoop)
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### macOS (Homebrew)
```bash
brew install supabase/tap/supabase
```

### Linux
```bash
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
```

### Verificar instalación
```bash
supabase --version
```

## 🔐 Configuración Inicial

### 1. Login en Supabase
```bash
supabase login
```

Esto abrirá tu navegador para autenticarte.

### 2. Link con tu proyecto
```bash
# Desde la raíz del proyecto
supabase link --project-ref tu-project-ref

# Puedes encontrar tu project-ref en:
# Supabase Dashboard → Settings → General → Reference ID
```

## 📦 Desplegar la Edge Function

### 1. Desplegar la función
```bash
# Desde la raíz del proyecto
supabase functions deploy bcv-scraper
```

### 2. Configurar variables de entorno (secrets)
```bash
# URL de tu proyecto Supabase
supabase secrets set SUPABASE_URL=https://tu-proyecto.supabase.co

# Service Role Key (Dashboard → Settings → API → service_role key)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Secreto opcional para proteger la función
supabase secrets set FUNCTION_SECRET=tu-secreto-seguro
```

### 3. Verificar que se desplegó correctamente
```bash
supabase functions list
```

Deberías ver `bcv-scraper` en la lista.

## 🧪 Probar la Edge Function

### Desde la terminal
```bash
# Con secreto
curl -X POST \
  https://tu-proyecto.supabase.co/functions/v1/bcv-scraper \
  -H "Authorization: Bearer tu-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"secret": "tu-secreto-seguro"}'

# Sin secreto (si no lo configuraste)
curl -X POST \
  https://tu-proyecto.supabase.co/functions/v1/bcv-scraper \
  -H "Authorization: Bearer tu-anon-key"
```

### Desde Supabase Dashboard
1. Ve a **Edge Functions** en el dashboard
2. Selecciona `bcv-scraper`
3. Click en **Invoke Function**
4. Agrega el body: `{"secret": "tu-secreto"}`
5. Click en **Send Request**

## 📊 Ver Logs

### En tiempo real
```bash
supabase functions logs bcv-scraper --follow
```

### Últimos logs
```bash
supabase functions logs bcv-scraper --limit 50
```

### Desde Dashboard
1. Ve a **Edge Functions** → `bcv-scraper`
2. Tab **Logs**

## 🔧 Configurar en Vercel

### 1. Agregar variables de entorno en Vercel
Ve a tu proyecto en Vercel → Settings → Environment Variables:

```
FUNCTION_SECRET=tu-secreto-seguro
```

(Las variables de Supabase ya deberían estar configuradas)

### 2. Re-desplegar
Los cambios en el código ya están integrados. Solo necesitas hacer push:

```bash
git add .
git commit -m "feat: integrate Python Edge Function for BCV scraping"
git push origin main
```

## 🐛 Troubleshooting

### Error: "Function not found"
- Verifica que desplegaste la función: `supabase functions list`
- Verifica la URL: debe ser `https://tu-proyecto.supabase.co/functions/v1/bcv-scraper`

### Error: "No autorizado"
- Verifica que estás usando el `anon_key` correcto
- Si configuraste `FUNCTION_SECRET`, asegúrate de enviarlo en el body

### Error: "No se encontró el elemento con el XPath"
El BCV cambió la estructura de su página. Necesitas:
1. Inspeccionar la página del BCV
2. Obtener el nuevo XPath usando DevTools
3. Actualizar `XPATH_DOLAR` en `supabase/functions/bcv-scraper/index.py`
4. Re-desplegar: `supabase functions deploy bcv-scraper`

### Error: "Timeout"
- Las Edge Functions tienen un timeout de 60 segundos
- Verifica que el BCV esté accesible: `curl https://www.bcv.org.ve/`

## 🔄 Actualizar la Edge Function

Cuando hagas cambios en el código:

```bash
# 1. Editar el archivo
# supabase/functions/bcv-scraper/index.py

# 2. Re-desplegar
supabase functions deploy bcv-scraper

# 3. Verificar logs
supabase functions logs bcv-scraper --follow
```

## 📈 Monitoreo

### Verificar que está funcionando
```bash
# Ejecutar manualmente
curl -X POST https://tu-proyecto.supabase.co/functions/v1/bcv-scraper \
  -H "Authorization: Bearer tu-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"secret": "tu-secreto"}'

# Verificar en la base de datos
# Conecta a Supabase y verifica la tabla configuracion
```

### Logs esperados (exitoso)
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

## 🎯 Integración Completa

Una vez desplegada la Edge Function, el flujo completo será:

```
Vercel Cron (cada día a las 4 PM UTC)
    ↓
1. Intenta API PyDolarVe → ✓ Éxito (90%)
    ↓ (si falla)
2. Intenta Edge Function Python → ✓ Éxito (9%)
    ↓ (si falla)
3. Intenta Scraping TypeScript → ✓ Éxito (1%)
    ↓
Actualiza tabla configuracion en Supabase
```

## 📚 Recursos Adicionales

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Python lxml Documentation](https://lxml.de/)
- [XPath Tutorial](https://www.w3schools.com/xml/xpath_intro.asp)

## ✅ Checklist de Configuración

- [ ] Supabase CLI instalado
- [ ] Login en Supabase CLI
- [ ] Proyecto linkeado
- [ ] Edge Function desplegada
- [ ] Variables de entorno configuradas (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FUNCTION_SECRET)
- [ ] Función probada manualmente
- [ ] FUNCTION_SECRET agregado en Vercel
- [ ] Código integrado y desplegado en Vercel
- [ ] Logs verificados
