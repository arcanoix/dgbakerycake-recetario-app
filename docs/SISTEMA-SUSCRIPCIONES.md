# 💳 Sistema de Suscripciones - Guía Completa

## 📋 Resumen

DG Bakery Cake incluye un sistema completo de suscripciones con pagos manuales adaptado para Venezuela y Latinoamérica. Los usuarios pueden elegir entre diferentes planes y enviar solicitudes de pago que son revisadas y aprobadas por administradores.

---

## 🎯 Características Principales

### ✅ **Para Usuarios (Clientes)**
- Ver planes disponibles con precios en USD y Bs
- Solicitar upgrade de plan
- Enviar comprobantes de pago
- Ver historial de solicitudes
- Gestionar facturación

### ✅ **Para Administradores**
- Panel de administración completo
- Aprobar/rechazar solicitudes de pago
- Ver estadísticas del sistema
- Gestionar usuarios y suscripciones
- Agregar notas a las solicitudes

---

## 💎 Planes Disponibles

| Plan | Precio USD | Precio Bs | Productos | Recetas | Características |
|------|-----------|-----------|-----------|---------|-----------------|
| **Gratuito** | $0 | Bs. 0 | 50 | 20 | Soporte comunidad |
| **Básico** | $5 | Bs. 150 | 200 | 100 | Soporte email + Analytics |
| **Profesional** | $10 | Bs. 300 | 1,000 | 500 | Soporte prioritario + Exportar datos |
| **Empresarial** | $20 | Bs. 600 | Ilimitado | Ilimitado | Soporte 24/7 + API Access |

---

## 💳 Métodos de Pago Soportados

### 🇻🇪 **Venezuela**
1. **Pago Móvil**
   - Campos: Banco, Teléfono, Referencia, Fecha
   
2. **Transferencia Bancaria**
   - Campos: Banco Origen, Banco Destino, Referencia, Fecha

### 🌎 **Internacional**
3. **Binance (USDT)**
   - Campos: Wallet Address, Transaction ID, Red (BSC/ETH/TRC20)
   
4. **Zelle**
   - Campos: Email, Referencia, Fecha
   
5. **PayPal**
   - Campos: Email, Transaction ID, Fecha

---

## 🔄 Flujo de Suscripción

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario ve planes en /pricing                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Selecciona un plan y hace clic en "Seleccionar Plan"    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Completa formulario de pago en /payment                  │
│    - Selecciona método de pago                              │
│    - Ingresa detalles del pago                              │
│    - Sube comprobante (opcional)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Envía solicitud → Estado: PENDIENTE                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Admin revisa en /admin                                   │
│    - Ve detalles del pago                                   │
│    - Verifica comprobante                                   │
│    - Agrega notas (opcional)                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Admin APRUEBA → Suscripción se activa automáticamente    │
│    O                                                         │
│    Admin RECHAZA → Usuario puede intentar nuevamente        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Páginas del Sistema

### 📄 `/pricing` - Página de Planes
**Acceso:** Usuarios autenticados

**Funcionalidad:**
- Muestra todos los planes disponibles
- Indica el plan actual del usuario
- Botón para seleccionar nuevo plan
- Información de métodos de pago

**Componentes:**
- `PricingCard` - Tarjeta de cada plan
- Muestra características, precios y límites

---

### 💳 `/payment?plan={id}` - Solicitud de Pago
**Acceso:** Usuarios autenticados

**Funcionalidad:**
- Formulario dinámico según método de pago
- Validación de campos requeridos
- Opción para subir comprobante
- Envío de solicitud a base de datos

**Componentes:**
- `PaymentRequestForm` - Formulario completo
- Campos específicos por método de pago

---

### 📊 `/billing` - Facturación del Usuario
**Acceso:** Usuarios autenticados

**Funcionalidad:**
- Ver plan actual y límites
- Historial de solicitudes de pago
- Estado de cada solicitud (Pendiente/Aprobado/Rechazado)
- Notas del administrador
- Botón para cambiar plan

---

### 👑 `/admin` - Panel de Administrador
**Acceso:** Solo administradores

**Funcionalidad:**
- Dashboard con estadísticas:
  - Solicitudes pendientes
  - Solicitudes aprobadas
  - Total de usuarios
  - Suscripciones activas
- Filtros por estado
- Aprobar/Rechazar solicitudes
- Agregar notas administrativas
- Ver detalles completos de cada pago

**Componentes:**
- `PaymentRequestsTable` - Tabla de solicitudes
- Botones de acción (Aprobar/Rechazar)
- Campo de notas del admin

---

## 🔐 Roles y Permisos

### 👤 **Cliente** (Por defecto)
- ✅ Ver planes
- ✅ Solicitar pagos
- ✅ Ver su facturación
- ✅ Crear productos/recetas (según límites)
- ❌ Acceder a panel admin

### 👑 **Admin**
- ✅ Todo lo de Cliente
- ✅ Acceder a `/admin`
- ✅ Ver todas las solicitudes
- ✅ Aprobar/Rechazar pagos
- ✅ Ver estadísticas globales
- ✅ Gestionar suscripciones

---

## 🗄️ Estructura de Base de Datos

### Tabla: `user_roles`
```sql
- id: UUID
- user_id: UUID (FK a auth.users)
- role: 'admin' | 'cliente'
- created_at: TIMESTAMP
```

### Tabla: `subscription_plans`
```sql
- id: UUID
- name: 'free' | 'basico' | 'profesional' | 'empresarial'
- display_name: VARCHAR
- price_bs: DECIMAL
- price_usd: DECIMAL
- max_productos: INTEGER (-1 = ilimitado)
- max_recetas: INTEGER (-1 = ilimitado)
- features: JSONB
```

### Tabla: `user_subscriptions`
```sql
- id: UUID
- user_id: UUID
- plan_id: UUID
- status: 'active' | 'pending' | 'expired' | 'canceled'
- start_date: TIMESTAMP
- end_date: TIMESTAMP
```

### Tabla: `payment_requests`
```sql
- id: UUID
- user_id: UUID
- plan_id: UUID
- payment_method: VARCHAR
- amount: DECIMAL
- currency: 'BS' | 'USD' | 'USDT'
- payment_details: JSONB
- proof_url: TEXT
- status: 'pending' | 'approved' | 'rejected'
- admin_notes: TEXT
- reviewed_by: UUID
- reviewed_at: TIMESTAMP
```

---

## 🔧 Verificación de Límites

### Implementación Automática

El sistema verifica automáticamente los límites antes de crear productos o recetas:

```typescript
// En useProductos.ts
const verificacion = await verificarLimite('productos', productos.length);
if (!verificacion.permitido) {
  setError(verificacion.mensaje);
  return false;
}
```

### Mensajes de Error

Cuando un usuario alcanza el límite:
```
"Has alcanzado el límite de 50 productos de tu plan Plan Gratuito. 
Actualiza tu plan para continuar."
```

---

## 👨‍💼 Guía para Administradores

### Cómo Crear el Primer Admin

1. **Registrar usuario normalmente**
2. **Ejecutar en Supabase SQL Editor:**
```sql
-- Reemplaza 'email@ejemplo.com' con el email del admin
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'email@ejemplo.com'
);
```

### Aprobar una Solicitud de Pago

1. Ir a `/admin`
2. Ver solicitudes pendientes
3. Revisar detalles del pago
4. Verificar comprobante (si existe)
5. Agregar notas (opcional)
6. Hacer clic en "✓ Aprobar"
7. La suscripción se activa automáticamente

### Rechazar una Solicitud

1. Seguir pasos 1-4 anteriores
2. Agregar notas explicando el motivo
3. Hacer clic en "✗ Rechazar"
4. Usuario puede ver las notas en `/billing`

---

## 📱 Navegación del Sistema

### Navbar Actualizado

**Para Clientes:**
- 🏠 Inicio
- 📦 Productos
- 📝 Recetas
- 💎 Planes
- 💳 Facturación
- ⚙️ Configuración

**Para Admins (adicional):**
- 👑 Admin (botón rojo)

---

## 🚀 Activación Automática

Cuando un admin aprueba un pago:

1. **Trigger SQL se ejecuta automáticamente**
2. **Actualiza `user_subscriptions`:**
   - `status` → 'active'
   - `start_date` → NOW()
   - `end_date` → NOW() + 1 mes
3. **Usuario obtiene acceso inmediato** a los nuevos límites

---

## 📊 Estadísticas del Admin

El panel muestra:
- **Solicitudes Pendientes:** Requieren atención
- **Solicitudes Aprobadas:** Total histórico
- **Total Usuarios:** Registrados en el sistema
- **Suscripciones Activas:** Planes pagos activos

---

## 🔍 Filtros en Panel Admin

- **Pendientes:** Solo solicitudes sin revisar
- **Aprobadas:** Historial de aprobaciones
- **Rechazadas:** Historial de rechazos
- **Todas:** Vista completa

---

## 💡 Mejores Prácticas

### Para Usuarios
1. Subir comprobante claro y legible
2. Verificar datos antes de enviar
3. Usar el método de pago más conveniente
4. Revisar `/billing` para ver estado

### Para Admins
1. Revisar solicitudes diariamente
2. Agregar notas claras en rechazos
3. Verificar comprobantes cuidadosamente
4. Mantener comunicación con usuarios

---

## 🐛 Solución de Problemas

### Usuario no puede crear productos/recetas

**Causa:** Límite del plan alcanzado

**Solución:**
1. Ir a `/pricing`
2. Seleccionar plan superior
3. Completar pago
4. Esperar aprobación

### Solicitud de pago no aparece

**Causa:** Error en envío

**Solución:**
1. Verificar en `/billing`
2. Si no aparece, intentar nuevamente
3. Contactar soporte si persiste

### Admin no puede acceder a `/admin`

**Causa:** Rol no asignado

**Solución:**
```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'user-id-aqui';
```

---

## 📝 Notas Importantes

1. **Todos los pagos son manuales** - Requieren aprobación de admin
2. **Suscripciones duran 1 mes** - Desde la fecha de aprobación
3. **Plan gratuito es automático** - Todos los nuevos usuarios lo tienen
4. **Límites se verifican en tiempo real** - Antes de cada creación
5. **Datos aislados por usuario** - RLS garantiza privacidad

---

## 🔮 Futuras Mejoras

- [ ] Notificaciones por email
- [ ] Renovación automática
- [ ] Integración con Stripe (internacional)
- [ ] Dashboard de analytics por plan
- [ ] Sistema de referidos
- [ ] Descuentos y cupones

---

**✨ El sistema está completamente funcional y listo para producción!**
