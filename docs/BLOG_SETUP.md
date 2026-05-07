# Configuración del Blog

Este documento explica cómo configurar la tabla de blog en Supabase.

## 🗄️ Crear la Tabla en Supabase

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**
4. Copia y pega el contenido del archivo: `supabase/migrations/create_blog_posts_table.sql`
5. Haz clic en **Run** (o presiona Ctrl+Enter)
6. Verifica que se ejecutó correctamente (debería mostrar "Success")

### Opción 2: Usando Supabase CLI

Si tienes Supabase CLI instalado:

```bash
# Asegúrate de estar en la raíz del proyecto
cd f:\developer\arcanoix\dgbakerycake-costo-app

# Ejecutar la migración
supabase db push
```

### Opción 3: Ejecutar SQL Manualmente

Copia el siguiente SQL y ejecútalo en el SQL Editor de Supabase:

```sql
-- Ver el archivo: supabase/migrations/create_blog_posts_table.sql
```

## 📋 Estructura de la Tabla

### Tabla: `blog_posts`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | ID único del post (auto-generado) |
| `title` | TEXT | Título del post (requerido) |
| `slug` | TEXT | URL amigable (único, requerido) |
| `excerpt` | TEXT | Resumen breve (opcional) |
| `content` | TEXT | Contenido en Markdown (requerido) |
| `cover_image` | TEXT | URL de imagen de portada (opcional) |
| `tags` | TEXT[] | Array de etiquetas (opcional) |
| `status` | TEXT | Estado: draft, published, archived |
| `author_id` | UUID | ID del autor (referencia a auth.users) |
| `author_name` | TEXT | Nombre del autor (opcional) |
| `seo_title` | TEXT | Título SEO (opcional) |
| `seo_description` | TEXT | Descripción SEO (opcional) |
| `og_image` | TEXT | Imagen Open Graph (opcional) |
| `views` | INTEGER | Contador de vistas (default: 0) |
| `created_at` | TIMESTAMPTZ | Fecha de creación (auto) |
| `updated_at` | TIMESTAMPTZ | Fecha de actualización (auto) |
| `published_at` | TIMESTAMPTZ | Fecha de publicación (auto) |

## 🔒 Políticas de Seguridad (RLS)

La tabla tiene Row Level Security (RLS) habilitado con las siguientes políticas:

### Lectura (SELECT)
- ✅ **Público**: Cualquiera puede leer posts publicados
- ✅ **Autenticado**: Los usuarios pueden leer sus propios borradores

### Creación (INSERT)
- ✅ **Autenticado**: Usuarios autenticados pueden crear posts

### Actualización (UPDATE)
- ✅ **Propietario**: Solo el autor puede actualizar sus posts

### Eliminación (DELETE)
- ✅ **Propietario**: Solo el autor puede eliminar sus posts

## ⚙️ Triggers Automáticos

### 1. Actualizar `updated_at`
Cada vez que se actualiza un post, `updated_at` se actualiza automáticamente.

### 2. Establecer `published_at`
Cuando el `status` cambia a `published`, se establece `published_at` automáticamente.

## 🔍 Índices

Para optimizar las consultas, se crean los siguientes índices:

- `idx_blog_posts_slug`: Búsqueda rápida por slug
- `idx_blog_posts_status`: Filtrado por estado
- `idx_blog_posts_published_at`: Ordenamiento por fecha de publicación
- `idx_blog_posts_author_id`: Filtrado por autor

## ✅ Verificar la Instalación

Después de ejecutar la migración, verifica que todo esté correcto:

### 1. Verificar la tabla

```sql
SELECT * FROM public.blog_posts LIMIT 1;
```

Debería devolver 0 filas (tabla vacía) sin errores.

### 2. Verificar políticas RLS

```sql
SELECT * FROM pg_policies WHERE tablename = 'blog_posts';
```

Debería mostrar 5 políticas.

### 3. Verificar triggers

```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%blog_posts%';
```

Debería mostrar 2 triggers.

## 🚀 Usar el Blog

Una vez creada la tabla, puedes:

1. **Crear posts**: Ve a `/admin/blog/nuevo`
2. **Editar posts**: Ve a `/admin/blog/[id]/editar`
3. **Ver posts**: Ve a `/blog`
4. **Ver post individual**: Ve a `/blog/[slug]`

## 🐛 Troubleshooting

### Error: "Could not find the table 'public.blog_posts'"

**Solución**: La tabla no existe. Ejecuta la migración SQL.

### Error: "permission denied for table blog_posts"

**Solución**: Verifica que las políticas RLS estén creadas correctamente.

### Error: "duplicate key value violates unique constraint"

**Solución**: El slug ya existe. Cambia el título o el slug manualmente.

### Posts no aparecen en `/blog`

**Solución**: Verifica que el `status` sea `published` y no `draft`.

## 📊 Datos de Ejemplo

Para probar, puedes insertar un post de ejemplo:

```sql
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  status,
  author_name
) VALUES (
  'Mi Primer Post',
  'mi-primer-post',
  'Este es un post de ejemplo para probar el blog',
  '# Mi Primer Post\n\nEste es el contenido del post en **Markdown**.\n\n- Lista 1\n- Lista 2',
  'published',
  'Admin'
);
```

## 📚 Recursos

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Markdown Guide](https://www.markdownguide.org/)
