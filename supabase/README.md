# Migraciones de Base de Datos Supabase

Este directorio contiene los scripts SQL necesarios para crear las tablas del módulo de ventas en Supabase.

## 📋 Tablas Requeridas

### 1. Tabla `clientes`
Almacena información de clientes para el módulo de ventas.

**Archivo**: `migrations/create_clientes_table.sql`

**Campos**:
- `id` - UUID (Primary Key)
- `user_id` - UUID (Foreign Key a auth.users)
- `nombre` - TEXT (requerido)
- `email` - TEXT (opcional)
- `telefono` - TEXT (opcional)
- `direccion` - TEXT (opcional)
- `notas` - TEXT (opcional)
- `created_at` - TIMESTAMPTZ
- `updated_at` - TIMESTAMPTZ

### 2. Tabla `ordenes`
Almacena órdenes y cotizaciones del módulo de ventas.

**Archivo**: `migrations/create_ordenes_table.sql`

**Campos**:
- `id` - UUID (Primary Key)
- `user_id` - UUID (Foreign Key a auth.users)
- `cliente_id` - UUID (Foreign Key a clientes)
- `numero_orden` - TEXT (requerido)
- `estado` - TEXT (cotizacion, confirmada, en_proceso, entregada, cancelada)
- `fecha_entrega` - DATE (opcional)
- `subtotal` - DECIMAL(10, 2)
- `descuento` - DECIMAL(10, 2)
- `total` - DECIMAL(10, 2)
- `pago_adelantado` - DECIMAL(10, 2)
- `saldo_pendiente` - DECIMAL(10, 2)
- `notas` - TEXT (opcional)
- `created_at` - TIMESTAMPTZ
- `updated_at` - TIMESTAMPTZ

### 3. Tabla `orden_items`
Almacena los ítems de cada orden.

**Archivo**: `migrations/create_ordenes_table.sql` (incluido en el mismo archivo)

**Campos**:
- `id` - UUID (Primary Key)
- `orden_id` - UUID (Foreign Key a ordenes)
- `receta_id` - UUID (Foreign Key a recetas)
- `cantidad` - INTEGER (requerido, > 0)
- `precio_unitario` - DECIMAL(10, 2)
- `subtotal` - DECIMAL(10, 2)
- `created_at` - TIMESTAMPTZ

## 🚀 Cómo Ejecutar las Migraciones

### ⚠️ IMPORTANTE: Elige UNA de las siguientes opciones

#### Opción A: Tablas NO Existen (Primera Instalación)

Si las tablas `clientes`, `ordenes` y `orden_items` **NO existen** en tu base de datos:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido de cada archivo SQL en el siguiente orden:
   - `create_clientes_table.sql`
   - `create_ordenes_table.sql`
5. Ejecuta cada script haciendo clic en **Run**

#### Opción B: Tablas YA Existen (Migración)

Si las tablas **YA existen** pero les faltan columnas:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido de:
   - `alter_ordenes_add_columns.sql`
5. Ejecuta el script haciendo clic en **Run**

Este script agregará las columnas faltantes:
- `descuento_porcentaje` y `descuento_monto` a `ordenes`
- `nombre_item` y `notas` a `orden_items`
- Hará `receta_id` nullable en `orden_items`

### Opción 2: Usando Supabase CLI

```bash
# Asegúrate de tener Supabase CLI instalado
npm install -g supabase

# Inicializa Supabase en tu proyecto (si no lo has hecho)
supabase init

# Ejecuta las migraciones
supabase db push
```

## ✅ Verificación

Después de ejecutar las migraciones, verifica que las tablas se crearon correctamente:

```sql
-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clientes', 'ordenes', 'orden_items');

-- Verificar políticas RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clientes', 'ordenes', 'orden_items');
```

## 🔒 Seguridad (Row Level Security)

Todas las tablas tienen **RLS (Row Level Security)** habilitado con las siguientes políticas:

- Los usuarios solo pueden ver, crear, actualizar y eliminar **sus propios registros**
- Los registros están vinculados al `user_id` del usuario autenticado
- Los ítems de orden están protegidos a través de la relación con la tabla `ordenes`

## 📝 Notas Importantes

1. **Orden de ejecución**: Ejecuta `create_clientes_table.sql` **antes** que `create_ordenes_table.sql` porque `ordenes` tiene una foreign key a `clientes`.

2. **Dependencias**: La tabla `orden_items` requiere que exista la tabla `recetas`. Asegúrate de que esta tabla ya esté creada antes de ejecutar el script de órdenes.

3. **Triggers**: Se incluyen triggers automáticos para actualizar el campo `updated_at` cuando se modifica un registro.

4. **Índices**: Se crean índices en campos frecuentemente consultados para mejorar el rendimiento.

## 🐛 Solución de Problemas

### Error: "Could not find the table 'public.clientes' in the schema cache"

**Causa**: La tabla no existe en Supabase.

**Solución**: Ejecuta el script `create_clientes_table.sql` en el SQL Editor de Supabase.

### Error: "relation 'public.recetas' does not exist"

**Causa**: La tabla `recetas` no existe y es requerida por `orden_items`.

**Solución**: Asegúrate de crear la tabla `recetas` antes de ejecutar `create_ordenes_table.sql`.

### Error: "permission denied for table clientes"

**Causa**: Las políticas RLS no están configuradas correctamente.

**Solución**: Verifica que las políticas RLS se hayan creado ejecutando la query de verificación mencionada arriba.

## 📞 Soporte

Si encuentras algún problema al ejecutar las migraciones, verifica:
1. Que tienes permisos de administrador en el proyecto de Supabase
2. Que todas las tablas dependientes existen
3. Que el usuario está autenticado correctamente en la aplicación
