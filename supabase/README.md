# 🗄️ Configuración de Base de Datos Supabase

Esta guía te ayudará a configurar la base de datos en Supabase para el proyecto DG Bakery Cake.

---

## 📋 Información del Proyecto

- **Proyecto**: dgbakerycake
- **URL**: https://riucijrbufaucwpokgyl.supabase.co
- **Password**: US5OwGTXFkZA4pQX

---

## 🚀 Paso 1: Ejecutar el Schema SQL

### Opción A: Desde el Dashboard de Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **dgbakerycake**
3. En el menú lateral, click en **SQL Editor**
4. Click en **New Query**
5. Copia y pega el contenido de `schema.sql`
6. Click en **Run** para ejecutar el script

### Opción B: Desde la Terminal (psql)

```bash
# Conectar a la base de datos
psql "postgresql://postgres:US5OwGTXFkZA4pQX@db.riucijrbufaucwpokgyl.supabase.co:5432/postgres"

# Ejecutar el schema
\i supabase/schema.sql
```

---

## 📊 Tablas Creadas

El schema crea las siguientes tablas:

### 1. **productos**
- `id` (UUID, Primary Key)
- `nombre` (VARCHAR)
- `precio_total` (DECIMAL)
- `cantidad_total` (DECIMAL)
- `unidad_medida` (VARCHAR)
- `precio_por_unidad` (DECIMAL)
- `categoria` (VARCHAR, nullable)
- `proveedor` (VARCHAR, nullable)
- `notas` (TEXT, nullable)
- `fecha_actualizacion` (TIMESTAMP)
- `created_at` (TIMESTAMP)

### 2. **recetas**
- `id` (UUID, Primary Key)
- `nombre` (VARCHAR)
- `descripcion` (TEXT)
- `materiales` (JSONB) - Array de materiales
- `rendimiento` (DECIMAL, nullable)
- `unidad_rendimiento` (VARCHAR, nullable)
- `tiempo_preparacion` (INTEGER)
- `costo_por_hora` (DECIMAL)
- `costo_mano_obra` (DECIMAL)
- `costo_materiales` (DECIMAL)
- `costo_total` (DECIMAL)
- `margen_ganancia` (DECIMAL, nullable)
- `precio_venta_sugerido` (DECIMAL, nullable)
- `categoria` (VARCHAR, nullable)
- `imagen` (VARCHAR, nullable)
- `notas` (TEXT, nullable)
- `fecha_creacion` (TIMESTAMP)
- `fecha_actualizacion` (TIMESTAMP)

### 3. **configuracion**
- `id` (UUID, Primary Key)
- `costo_por_hora_defecto` (DECIMAL)
- `moneda` (VARCHAR)
- `margen_ganancia_defecto` (DECIMAL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## 🔒 Seguridad (Row Level Security)

El schema incluye políticas RLS que permiten acceso público para desarrollo.

**⚠️ IMPORTANTE**: En producción, deberías:
1. Implementar autenticación de usuarios
2. Modificar las políticas RLS para restringir acceso
3. Usar `auth.uid()` en las políticas

---

## 🔄 Triggers Automáticos

El schema incluye triggers que actualizan automáticamente:
- `fecha_actualizacion` en productos y recetas
- `updated_at` en configuración

---

## ✅ Verificar Instalación

Ejecuta estas queries para verificar que todo está correcto:

```sql
-- Ver todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Contar registros en configuración (debe ser 1)
SELECT COUNT(*) FROM configuracion;

-- Ver configuración por defecto
SELECT * FROM configuracion;
```

---

## 🔧 Configuración de Variables de Entorno

Asegúrate de tener estas variables en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://riucijrbufaucwpokgyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
DATABASE_URL=postgresql://postgres:US5OwGTXFkZA4pQX@db.riucijrbufaucwpokgyl.supabase.co:5432/postgres
```

---

## 📝 Notas Adicionales

- La configuración por defecto usa **Bolívares (VES)** como moneda
- El costo por hora por defecto es **10**
- El margen de ganancia por defecto es **30%**
- Los materiales en recetas se almacenan como JSONB para flexibilidad

---

## 🆘 Solución de Problemas

### Error: "relation already exists"
- Las tablas ya existen, puedes omitir este error o eliminar las tablas primero

### Error de conexión
- Verifica que la contraseña sea correcta
- Verifica que la URL del proyecto sea correcta
- Asegúrate de que tu IP esté en la whitelist de Supabase

### No se puede insertar datos
- Verifica que las políticas RLS estén habilitadas
- Revisa los logs en Supabase Dashboard → Logs

---

## 🔗 Enlaces Útiles

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Documentación de Supabase](https://supabase.com/docs)
- [SQL Editor](https://supabase.com/dashboard/project/riucijrbufaucwpokgyl/sql)
