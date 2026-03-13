# Instrucciones para Configurar Unidades de Medida en Supabase

## 📋 Pasos para ejecutar la migración

### 1. Acceder al Editor SQL de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, selecciona **SQL Editor**
3. Haz clic en **New Query** para crear una nueva consulta

### 2. Ejecutar el Script de Migración

1. Abre el archivo `supabase/migrations/create_unidades_medida.sql`
2. Copia **todo el contenido** del archivo
3. Pégalo en el editor SQL de Supabase
4. Haz clic en **Run** (o presiona `Ctrl + Enter`)

### 3. Verificar la Creación

Ejecuta esta consulta para verificar que la tabla se creó correctamente:

```sql
SELECT * FROM unidades_medida ORDER BY tipo, nombre;
```

Deberías ver 13 unidades de medida predefinidas:
- **Peso**: gramos, kilogramos, onzas, libras
- **Volumen**: mililitros, litros, tazas, cucharadas, cucharaditas
- **Cantidad**: unidad, docena, paquete, caja

### 4. Verificar Políticas de Seguridad

Ejecuta esta consulta para verificar que las políticas RLS están activas:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'unidades_medida';
```

Deberías ver 4 políticas (SELECT, INSERT, UPDATE, DELETE).

## 🔄 Migración de Datos Existentes (Opcional)

Si ya tienes productos en tu base de datos que usan el enum antiguo, necesitarás migrar los datos. Aquí hay un script para ayudarte:

### Script de Migración de Productos

```sql
-- Este script actualiza los productos existentes para usar IDs de unidades
-- en lugar de los valores del enum antiguo

-- Primero, necesitamos obtener los IDs de las unidades
DO $$
DECLARE
  id_gramos UUID;
  id_kilogramos UUID;
  id_litros UUID;
  id_mililitros UUID;
  id_onzas UUID;
  id_unidad UUID;
BEGIN
  -- Obtener IDs de las unidades
  SELECT id INTO id_gramos FROM unidades_medida WHERE nombre = 'gramos';
  SELECT id INTO id_kilogramos FROM unidades_medida WHERE nombre = 'kilogramos';
  SELECT id INTO id_litros FROM unidades_medida WHERE nombre = 'litros';
  SELECT id INTO id_mililitros FROM unidades_medida WHERE nombre = 'mililitros';
  SELECT id INTO id_onzas FROM unidades_medida WHERE nombre = 'onzas';
  SELECT id INTO id_unidad FROM unidades_medida WHERE nombre = 'unidad';

  -- Actualizar productos (ajusta según tu estructura de tabla)
  -- NOTA: Esto es un ejemplo, ajusta según tus columnas reales
  
  -- Si tu tabla productos tiene una columna 'unidad_medida' de tipo TEXT:
  UPDATE productos SET unidad_medida = id_gramos::TEXT WHERE unidad_medida = 'gramos';
  UPDATE productos SET unidad_medida = id_kilogramos::TEXT WHERE unidad_medida = 'kilogramos';
  UPDATE productos SET unidad_medida = id_litros::TEXT WHERE unidad_medida = 'litros';
  UPDATE productos SET unidad_medida = id_mililitros::TEXT WHERE unidad_medida = 'mililitros';
  UPDATE productos SET unidad_medida = id_onzas::TEXT WHERE unidad_medida = 'onzas';
  UPDATE productos SET unidad_medida = id_unidad::TEXT WHERE unidad_medida = 'unidad';
  
  RAISE NOTICE 'Migración completada exitosamente';
END $$;
```

**⚠️ IMPORTANTE**: Antes de ejecutar este script:
1. Haz un backup de tu base de datos
2. Verifica que los nombres de las columnas coincidan con tu esquema
3. Prueba primero en un ambiente de desarrollo

## 📊 Consultas Útiles

### Ver todas las unidades activas
```sql
SELECT * FROM unidades_medida WHERE activo = true ORDER BY tipo, nombre;
```

### Ver unidades por tipo
```sql
SELECT * FROM unidades_medida WHERE tipo = 'peso' AND activo = true;
```

### Agregar una nueva unidad manualmente
```sql
INSERT INTO unidades_medida (nombre, simbolo, tipo, activo)
VALUES ('nueva_unidad', 'nu', 'otro', true);
```

### Desactivar una unidad (en lugar de eliminarla)
```sql
UPDATE unidades_medida SET activo = false WHERE nombre = 'nombre_unidad';
```

## ✅ Verificación Final

Para asegurarte de que todo funciona correctamente:

1. **Verifica la tabla**: `SELECT COUNT(*) FROM unidades_medida;` → Debería retornar 13
2. **Verifica RLS**: Las políticas deben estar habilitadas
3. **Prueba desde la app**: Intenta cargar las unidades desde tu aplicación usando el hook `useUnidades`

## 🆘 Solución de Problemas

### Error: "relation unidades_medida does not exist"
- Asegúrate de haber ejecutado el script completo
- Verifica que estás en el esquema correcto (public)

### Error: "duplicate key value violates unique constraint"
- Las unidades ya existen en la base de datos
- Puedes omitir la sección de inserción de datos iniciales

### Las políticas RLS no funcionan
- Verifica que RLS está habilitado: `ALTER TABLE unidades_medida ENABLE ROW LEVEL SECURITY;`
- Verifica que las políticas existen con la consulta de verificación

## 📝 Notas Adicionales

- Las unidades tienen factores de conversión para facilitar cálculos futuros
- El campo `activo` permite "eliminar" unidades sin borrarlas de la BD
- Los triggers mantienen `updated_at` actualizado automáticamente
- Las políticas RLS permiten acceso completo a usuarios autenticados
