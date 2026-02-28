# 🏢 Arquitectura SaaS Multi-Tenant - DG Bakery Cake

## 📋 Resumen

DG Bakery Cake está implementado como un **SaaS Multi-Tenant** donde cada usuario tiene sus propios datos completamente aislados. Esto permite escalar el negocio con múltiples clientes sin que puedan ver los datos de otros usuarios.

---

## 🔐 Seguridad y Aislamiento de Datos

### Row Level Security (RLS)

Todas las tablas utilizan **Row Level Security** de Supabase para garantizar que:

- ✅ Los usuarios **solo pueden ver** sus propios datos
- ✅ Los usuarios **solo pueden crear** datos asociados a su cuenta
- ✅ Los usuarios **solo pueden modificar** sus propios datos
- ✅ Los usuarios **solo pueden eliminar** sus propios datos

### Tablas Protegidas

Todas las tablas principales tienen aislamiento por usuario:

1. **`productos`** - Ingredientes e insumos del usuario
2. **`recetas`** - Recetas creadas por el usuario
3. **`configuracion`** - Configuración personal del usuario

---

## 🗄️ Estructura de Base de Datos

### Columna `user_id`

Cada tabla tiene una columna `user_id` que referencia al usuario autenticado:

```sql
ALTER TABLE productos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE recetas ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE configuracion ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

**Características:**
- `UUID` - Identificador único del usuario
- `REFERENCES auth.users(id)` - Relación con la tabla de usuarios de Supabase Auth
- `ON DELETE CASCADE` - Si se elimina el usuario, se eliminan todos sus datos automáticamente

### Índices para Performance

```sql
CREATE INDEX idx_productos_user_id ON productos(user_id);
CREATE INDEX idx_recetas_user_id ON recetas(user_id);
CREATE INDEX idx_configuracion_user_id ON configuracion(user_id);
```

Estos índices mejoran significativamente el rendimiento de las consultas filtradas por usuario.

---

## 🛡️ Políticas RLS (Row Level Security)

### Ejemplo: Tabla Productos

```sql
-- LECTURA: Solo ver productos propios
CREATE POLICY "Usuarios pueden ver sus propios productos" ON productos
  FOR SELECT USING (auth.uid() = user_id);

-- CREACIÓN: Solo crear productos con su user_id
CREATE POLICY "Usuarios pueden crear sus propios productos" ON productos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ACTUALIZACIÓN: Solo actualizar productos propios
CREATE POLICY "Usuarios pueden actualizar sus propios productos" ON productos
  FOR UPDATE USING (auth.uid() = user_id);

-- ELIMINACIÓN: Solo eliminar productos propios
CREATE POLICY "Usuarios pueden eliminar sus propios productos" ON productos
  FOR DELETE USING (auth.uid() = user_id);
```

**¿Cómo funciona?**
- `auth.uid()` - Función de Supabase que retorna el ID del usuario autenticado
- Las políticas se aplican **automáticamente** en todas las consultas
- No es necesario agregar filtros `WHERE user_id = ...` en el código

---

## ⚙️ Asignación Automática de `user_id`

### Trigger Automático

```sql
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_productos_user_id
  BEFORE INSERT ON productos
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();
```

**Beneficios:**
- ✅ No necesitas pasar `user_id` manualmente en el código
- ✅ Imposible crear datos con `user_id` de otro usuario
- ✅ Seguridad garantizada a nivel de base de datos

---

## 💻 Implementación en el Código

### Hooks de React

Los hooks (`useProductos`, `useRecetas`, `useConfiguracion`) **no necesitan** filtrar por usuario explícitamente:

```typescript
// ✅ CORRECTO - RLS filtra automáticamente
export const obtenerProductos = async (): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false });
  
  // Supabase solo retorna productos del usuario autenticado
  return data || [];
};

// ❌ INCORRECTO - No es necesario filtrar manualmente
export const obtenerProductos = async (): Promise<Producto[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('user_id', user?.id) // ❌ Redundante, RLS ya lo hace
    .order('created_at', { ascending: false });
  
  return data || [];
};
```

### Creación de Datos

```typescript
// ✅ CORRECTO - Trigger asigna user_id automáticamente
const nuevoProducto = {
  id: generarId("prod"),
  nombre: "Harina",
  precio: 10.50,
  // NO incluir user_id - se asigna automáticamente
};

await supabase.from('productos').insert([nuevoProducto]);
```

---

## 🚀 Ventajas del Modelo SaaS Multi-Tenant

### 1. **Escalabilidad**
- ✅ Agregar nuevos usuarios es instantáneo
- ✅ Cada usuario tiene su propio espacio de datos
- ✅ No hay límite de usuarios

### 2. **Seguridad**
- ✅ Aislamiento total de datos a nivel de base de datos
- ✅ Imposible acceder a datos de otros usuarios
- ✅ Políticas aplicadas automáticamente

### 3. **Mantenimiento**
- ✅ Una sola base de datos para todos los usuarios
- ✅ Actualizaciones de esquema afectan a todos
- ✅ Backups centralizados

### 4. **Costos**
- ✅ Infraestructura compartida
- ✅ Menor costo por usuario
- ✅ Fácil implementar planes de suscripción

---

## 💳 Preparado para Suscripciones

### Tabla de Suscripciones (Futura)

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL, -- 'free', 'pro', 'enterprise'
  status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'expired'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS para suscripciones
CREATE POLICY "Usuarios pueden ver su propia suscripción" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

### Límites por Plan

```typescript
const PLAN_LIMITS = {
  free: {
    maxProductos: 50,
    maxRecetas: 20,
  },
  pro: {
    maxProductos: 500,
    maxRecetas: 200,
  },
  enterprise: {
    maxProductos: -1, // Ilimitado
    maxRecetas: -1,   // Ilimitado
  },
};
```

---

## 🧪 Pruebas de Aislamiento

### Cómo Verificar que Funciona

1. **Crear dos usuarios diferentes:**
   - Usuario A: `usuario-a@example.com`
   - Usuario B: `usuario-b@example.com`

2. **Usuario A crea productos:**
   - Iniciar sesión como Usuario A
   - Crear 3 productos

3. **Usuario B no ve productos de A:**
   - Cerrar sesión
   - Iniciar sesión como Usuario B
   - Verificar que la lista de productos está vacía

4. **Usuario B crea sus propios productos:**
   - Crear 2 productos como Usuario B
   - Verificar que solo ve sus 2 productos

5. **Usuario A no ve productos de B:**
   - Cerrar sesión
   - Iniciar sesión como Usuario A
   - Verificar que solo ve sus 3 productos originales

---

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    Usuario se Registra                       │
│                  (Supabase Auth crea user)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Usuario Inicia Sesión                           │
│           (JWT token con user_id incluido)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         Usuario Crea/Lee/Actualiza/Elimina Datos             │
│                                                              │
│  Frontend → Supabase Client → Supabase Backend              │
│                                                              │
│  1. Supabase valida JWT token                                │
│  2. Extrae user_id del token                                 │
│  3. Aplica políticas RLS automáticamente                     │
│  4. Filtra/valida datos por user_id                          │
│  5. Retorna solo datos del usuario                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Comandos de Mantenimiento

### Verificar Políticas RLS

```sql
-- Ver todas las políticas de una tabla
SELECT * FROM pg_policies WHERE tablename = 'productos';
```

### Verificar Datos por Usuario

```sql
-- Contar productos por usuario
SELECT user_id, COUNT(*) as total_productos
FROM productos
GROUP BY user_id;

-- Ver usuarios sin datos
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN productos p ON u.id = p.user_id
WHERE p.id IS NULL;
```

### Migrar Datos Existentes

Si tienes datos sin `user_id`, asígnalos a un usuario:

```sql
-- Asignar todos los productos sin user_id a un usuario específico
UPDATE productos 
SET user_id = 'uuid-del-usuario-aqui' 
WHERE user_id IS NULL;
```

---

## 📝 Checklist de Implementación SaaS

- [x] Autenticación con Supabase Auth
- [x] Columna `user_id` en todas las tablas
- [x] Políticas RLS configuradas
- [x] Triggers para asignar `user_id` automáticamente
- [x] Índices para performance
- [x] Landing page para usuarios no autenticados
- [x] Protección de rutas en frontend
- [ ] Sistema de suscripciones (Stripe/Paddle)
- [ ] Límites por plan
- [ ] Página de billing
- [ ] Webhooks para eventos de pago
- [ ] Analytics por usuario

---

## 🎯 Próximos Pasos para Monetización

1. **Integrar Stripe o Paddle**
   - Crear planes de suscripción
   - Implementar checkout
   - Manejar webhooks

2. **Implementar Límites**
   - Verificar límites antes de crear datos
   - Mostrar mensajes de upgrade

3. **Dashboard de Admin**
   - Ver todos los usuarios
   - Estadísticas de uso
   - Gestión de suscripciones

4. **Analytics**
   - Tracking de uso por usuario
   - Métricas de retención
   - Conversión de free a paid

---

## 📚 Recursos

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Multi-Tenancy Best Practices](https://supabase.com/docs/guides/database/multi-tenancy)

---

**✨ Tu aplicación ya está lista para ser un SaaS multi-tenant escalable y seguro!**
