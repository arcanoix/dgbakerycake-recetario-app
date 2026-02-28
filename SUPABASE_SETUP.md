# 🚀 Guía de Configuración de Supabase

## 📋 Paso 1: Ejecutar el Schema en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/riucijrbufaucwpokgyl
2. Click en **SQL Editor** en el menú lateral
3. Click en **New Query**
4. Copia el contenido del archivo `supabase/schema.sql`
5. Pega el contenido en el editor
6. Click en **Run** para ejecutar

Esto creará las tablas:
- ✅ `productos`
- ✅ `recetas`
- ✅ `configuracion`

---

## 🔑 Paso 2: Obtener las API Keys

1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia las siguientes claves:
   - **Project URL**: `https://riucijrbufaucwpokgyl.supabase.co`
   - **anon/public key**: Busca en "Project API keys"

---

## 📝 Paso 3: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://riucijrbufaucwpokgyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
DATABASE_URL=postgresql://postgres:US5OwGTXFkZA4pQX@db.riucijrbufaucwpokgyl.supabase.co:5432/postgres
```

**⚠️ IMPORTANTE**: 
- Reemplaza `tu-anon-key-aqui` con tu clave real de Supabase
- Este archivo NO se subirá a GitHub (está en .gitignore)

---

## ✅ Paso 4: Verificar la Instalación

Ejecuta estas queries en el SQL Editor de Supabase:

```sql
-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar configuración por defecto
SELECT * FROM configuracion;
```

Deberías ver:
- 3 tablas: productos, recetas, configuracion
- 1 registro en configuracion con valores por defecto

---

## 🔄 Paso 5: Reiniciar el Servidor de Desarrollo

```bash
# Detener el contenedor
docker-compose down

# Iniciar nuevamente
docker-compose up
```

Esto cargará las nuevas variables de entorno.

---

## 🎯 Próximos Pasos

La aplicación ahora usará Supabase en lugar de localStorage:
- ✅ Datos persistentes en la nube
- ✅ Acceso desde múltiples dispositivos
- ✅ Backup automático
- ✅ Sincronización en tiempo real

---

## 📖 Documentación Adicional

Ver `supabase/README.md` para más detalles sobre:
- Estructura de tablas
- Políticas de seguridad
- Triggers automáticos
- Solución de problemas
