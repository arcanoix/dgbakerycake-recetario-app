# Instrucciones de Migración - Categorías Administrables

## 📋 Descripción General

Este documento describe cómo configurar el sistema de categorías administrables en Supabase para la aplicación DG Bakery Cake.

## 🗄️ Paso 1: Ejecutar el Script SQL

### 1.1 Acceder a Supabase

1. Ir a [Supabase Dashboard](https://app.supabase.com)
2. Seleccionar tu proyecto
3. Ir a **SQL Editor** en el menú lateral

### 1.2 Ejecutar el Script

1. Abrir el archivo `supabase/migrations/create_categorias.sql`
2. Copiar todo el contenido del archivo
3. Pegarlo en el SQL Editor de Supabase
4. Hacer clic en **Run** o presionar `Ctrl + Enter`

### 1.3 Verificar la Creación

Ejecutar la siguiente consulta para verificar que la tabla se creó correctamente:

```sql
SELECT * FROM categorias LIMIT 5;
```

Deberías ver una tabla vacía con las siguientes columnas:
- `id` (UUID)
- `user_id` (UUID)
- `nombre` (VARCHAR)
- `tipo` (VARCHAR)
- `descripcion` (TEXT)
- `color` (VARCHAR)
- `activo` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔐 Paso 2: Verificar Políticas de Seguridad (RLS)

Ejecutar estas consultas para verificar que las políticas están activas:

```sql
-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'categorias';

-- Ver las políticas creadas
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'categorias';
```

Deberías ver 4 políticas:
1. `Users can view own categorias` (SELECT)
2. `Users can insert own categorias` (INSERT)
3. `Users can update own categorias` (UPDATE)
4. `Users can delete own categorias` (DELETE)

## 📦 Paso 3: Insertar Categorías por Defecto (Opcional)

Si deseas insertar categorías por defecto para tu usuario, ejecuta:

```sql
-- Reemplaza 'TU_USER_ID' con tu UUID de usuario real
-- Puedes obtenerlo con: SELECT id FROM auth.users WHERE email = 'tu@email.com';

-- Categorías de Productos
INSERT INTO categorias (user_id, nombre, tipo, descripcion, color, activo) VALUES
  ('TU_USER_ID', 'Lácteos', 'producto', 'Leche, mantequilla, queso, crema', '#60A5FA', true),
  ('TU_USER_ID', 'Harinas', 'producto', 'Harina de trigo, maíz, almendra', '#F59E0B', true),
  ('TU_USER_ID', 'Azúcares', 'producto', 'Azúcar blanca, morena, glas', '#EC4899', true),
  ('TU_USER_ID', 'Grasas', 'producto', 'Aceites, manteca, margarina', '#FBBF24', true),
  ('TU_USER_ID', 'Huevos', 'producto', 'Huevos frescos y derivados', '#FCD34D', true),
  ('TU_USER_ID', 'Saborizantes', 'producto', 'Vainilla, esencias, extractos', '#A78BFA', true),
  ('TU_USER_ID', 'Decoración', 'producto', 'Sprinkles, fondant, colorantes', '#F472B6', true),
  ('TU_USER_ID', 'Otros', 'producto', 'Ingredientes varios', '#9CA3AF', true);

-- Categorías de Recetas
INSERT INTO categorias (user_id, nombre, tipo, descripcion, color, activo) VALUES
  ('TU_USER_ID', 'Tortas', 'receta', 'Tortas y pasteles', '#EF4444', true),
  ('TU_USER_ID', 'Cupcakes', 'receta', 'Cupcakes y muffins', '#10B981', true),
  ('TU_USER_ID', 'Galletas', 'receta', 'Galletas y cookies', '#F59E0B', true),
  ('TU_USER_ID', 'Postres', 'receta', 'Postres y dulces', '#8B5CF6', true),
  ('TU_USER_ID', 'Panes', 'receta', 'Panes dulces y salados', '#D97706', true),
  ('TU_USER_ID', 'Otros', 'receta', 'Otras recetas', '#6B7280', true);
```

## ✅ Paso 4: Verificar en la Aplicación

1. Iniciar la aplicación
2. Navegar a `/categorias`
3. Verificar que puedes:
   - Ver las categorías (si insertaste las por defecto)
   - Crear nuevas categorías
   - Editar categorías existentes
   - Activar/Desactivar categorías
   - Eliminar categorías

## 🔄 Integración Futura

Una vez que el sistema de categorías esté funcionando, puedes:

1. **Actualizar formularios de productos** para usar categorías administrables
2. **Actualizar formularios de recetas** para usar categorías administrables
3. **Migrar datos existentes** de las constantes a categorías administrables

## 🐛 Solución de Problemas

### Error: "permission denied for table categorias"

**Causa:** Las políticas RLS no están configuradas correctamente.

**Solución:** Verificar que las 4 políticas existen y que RLS está habilitado.

### Error: "duplicate key value violates unique constraint"

**Causa:** Intentas crear una categoría con un nombre que ya existe para el mismo tipo.

**Solución:** Cada usuario puede tener categorías con nombres únicos por tipo (producto o receta).

### No aparecen categorías en la aplicación

**Causa:** No hay categorías creadas o el filtro está ocultándolas.

**Solución:** 
1. Verificar filtros en la página de categorías
2. Crear al menos una categoría
3. Verificar que el usuario está autenticado correctamente

## 📚 Recursos Adicionales

- [Documentación de Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)

---

**Última actualización:** 2024
**Versión:** 1.0.0
