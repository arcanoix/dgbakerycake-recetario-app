# 🍰 DG Bakery Cake — App Móvil (React Native + Supabase)

> Versión móvil del sistema de gestión de costos de repostería.  
> Comparte el mismo backend Supabase con la app web Next.js.

---

## 📱 Descripción del Proyecto

Aplicación móvil nativa para Android e iOS que permite a pasteleros y reposteros gestionar sus costos de recetas, inventario, clientes y órdenes directamente desde el teléfono. Conecta al mismo proyecto Supabase que la versión web, garantizando sincronización en tiempo real.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework móvil | **React Native** (Expo) | SDK 52+ |
| Lenguaje | **TypeScript** | 5.x |
| Backend / DB | **Supabase** | JS SDK v2 |
| Navegación | **Expo Router** (file-based) | v4 |
| UI Components | **React Native Paper** o **NativeWind** | latest |
| Estado global | **Zustand** | v5 |
| Formularios | **React Hook Form + Zod** | latest |
| Gráficos | **Victory Native** | latest |
| Iconos | **Expo Vector Icons / Lucide RN** | latest |
| Cámara/Imagen | **Expo Image Picker** | latest |
| Almacenamiento local | **MMKV** (caché) | latest |
| Notificaciones | **Expo Notifications** | latest |
| Testing | **Jest + React Native Testing Library** | latest |

---

## 📁 Estructura del Repositorio

```
dgbakerycake-mobile/
├── app/                          # Expo Router — file-based routes
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab Navigator
│   │   ├── index.tsx             # Dashboard
│   │   ├── productos.tsx
│   │   ├── recetas.tsx
│   │   ├── inventario.tsx
│   │   ├── ventas.tsx
│   │   └── perfil.tsx
│   ├── productos/
│   │   ├── [id].tsx              # Detalle de producto
│   │   └── nuevo.tsx             # Formulario crear
│   ├── recetas/
│   │   ├── [id].tsx              # Detalle de receta
│   │   └── nueva.tsx             # Formulario crear
│   ├── clientes/
│   │   ├── [id].tsx
│   │   └── nuevo.tsx
│   ├── ordenes/
│   │   ├── [id].tsx
│   │   └── nueva.tsx
│   ├── configuracion.tsx
│   ├── _layout.tsx               # Root layout + Auth guard
│   └── +not-found.tsx
│
├── components/                   # Componentes reutilizables
│   ├── ui/                       # Átomos de diseño
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSpinner.tsx
│   ├── layout/
│   │   ├── ScreenWrapper.tsx
│   │   ├── Header.tsx
│   │   └── FAB.tsx               # Floating Action Button
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── RecentRecipes.tsx
│   │   └── CostChart.tsx
│   ├── productos/
│   │   ├── ProductoCard.tsx
│   │   ├── ProductoForm.tsx
│   │   └── ProductoList.tsx
│   ├── recetas/
│   │   ├── RecetaCard.tsx
│   │   ├── RecetaForm.tsx
│   │   ├── MaterialSelector.tsx
│   │   └── DesgloseCostos.tsx
│   ├── clientes/
│   │   ├── ClienteCard.tsx
│   │   └── ClienteForm.tsx
│   ├── ordenes/
│   │   ├── OrdenCard.tsx
│   │   ├── OrdenForm.tsx
│   │   └── OrdenStatusBadge.tsx
│   └── inventario/
│       ├── MovimientoCard.tsx
│       └── StockAlert.tsx
│
├── lib/
│   ├── supabase.ts               # Cliente Supabase singleton
│   ├── calculations.ts           # Lógica de cálculos (compartida)
│   ├── conversiones.ts           # Conversión de unidades
│   └── storage.ts                # MMKV wrapper
│
├── stores/                       # Estado global Zustand
│   ├── authStore.ts
│   ├── productosStore.ts
│   ├── recetasStore.ts
│   ├── configuracionStore.ts
│   └── uiStore.ts
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts
│   ├── useProductos.ts
│   ├── useRecetas.ts
│   ├── useConfiguracion.ts
│   ├── useClientes.ts
│   ├── useOrdenes.ts
│   ├── useInventario.ts
│   └── useGastosFijos.ts
│
├── types/
│   └── index.ts                  # Tipos TypeScript (idénticos a la web)
│
├── constants/
│   ├── theme.ts                  # Colores, tipografía, spacing
│   └── config.ts                 # URLs, constantes de app
│
├── utils/
│   ├── format.ts                 # Formateo de monedas, fechas
│   └── validators.ts             # Validaciones Zod
│
├── assets/
│   ├── images/
│   │   ├── icon.png
│   │   ├── splash.png
│   │   └── adaptive-icon.png
│   └── fonts/
│       └── (fuentes personalizadas)
│
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── .env                          # Variables de entorno (NO commitear)
├── .env.example                  # Plantilla de variables
├── app.json                      # Configuración Expo
├── babel.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🗄️ Base de Datos — Supabase (MISMO PROYECTO WEB)

> ⚠️ **Importante**: La app móvil se conecta al **mismo proyecto Supabase** que la web. No se necesita crear un nuevo proyecto de base de datos.

### Tablas Existentes

| Tabla | Descripción |
|-------|-------------|
| `productos` | Insumos/materiales con precio y unidad de medida |
| `recetas` | Recetas con materiales (JSONB), costos calculados |
| `configuracion` | Configuración global por usuario (costo/hora, moneda, margen) |
| `clientes` | Clientes para el módulo de ventas |
| `ordenes` | Órdenes/cotizaciones con estado y pagos |
| `orden_items` | Ítems detallados de cada orden |
| `gastos_fijos` | Gastos fijos mensuales para distribución de costos |
| `inventario_movimientos` | Kardex / movimientos de stock |
| `config_stock_productos` | Stock mínimo por producto |
| `categorias` | Categorías administrables para productos y recetas |
| `unidades_medida` | Unidades de medida administrables |
| `activity_logs` | Registro de auditoría de acciones |

### Variables de Entorno (`.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://riucijrbufaucwpokgyl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## 🔐 Autenticación

Usa el mismo sistema de auth de Supabase que la web:

- Email + Password (Supabase Auth)
- Persistencia de sesión con AsyncStorage / MMKV
- Guard de rutas con `useSegments` + `useRouter` de Expo Router
- Auto-refresh de tokens

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

---

## 🧮 Módulos / Pantallas

### 1. 📊 Dashboard
- Resumen de costos del mes
- Recetas recientes
- Órdenes pendientes
- Alertas de stock crítico
- Gráfico de costos por categoría (Victory Native)

### 2. 📦 Productos / Insumos
- Listado con búsqueda y filtro por categoría
- CRUD completo
- Cálculo automático de precio por unidad
- Multi-unidad de medida

### 3. 🍰 Recetas
- Listado con búsqueda y filtro
- CRUD completo
- Selector de materiales (búsqueda inline)
- Cálculo automático de costos:
  - Costo materiales
  - Costo mano de obra (horas × tarifa)
  - Gastos fijos prorrateados
  - Precio de venta sugerido con margen
- Desglose visual de costos (gráfico de pastel)
- Captura de imagen con cámara

### 4. 📋 Inventario / Kardex
- Movimientos de stock (compra, uso, merma, ajuste)
- Alertas de stock mínimo
- Historial por producto

### 5. 👥 Clientes
- Listado y CRUD de clientes
- Historial de órdenes por cliente

### 6. 🛒 Ventas / Órdenes
- Crear cotizaciones con recetas existentes
- Flujo de estados: cotización → confirmada → en proceso → entregada
- Descuentos, pago adelantado, saldo pendiente
- Enviar cotización por WhatsApp / email

### 7. ⚙️ Configuración
- Costo por hora (mano de obra)
- Moneda (VES / USD)
- Margen de ganancia por defecto
- Tasa de cambio USD
- Porcentaje de gastos fijos
- Perfil del usuario
- Suscripción y plan

### 8. 👤 Perfil
- Datos del usuario
- Cambiar contraseña
- Cerrar sesión

---

## 🛠️ Setup y Desarrollo

### Prerequisitos
```bash
node >= 18.x
npm >= 9.x
expo-cli (instalado globalmente)
Android Studio (para emulador Android)
Xcode (para emulador iOS — solo macOS)
```

### Instalación
```bash
# 1. Clonar repositorio
git clone https://github.com/arcanoix/dgbakerycake-mobile.git
cd dgbakerycake-mobile

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales de Supabase

# 4. Iniciar servidor de desarrollo
npx expo start

# 5. Abrir en dispositivo/emulador
# Presionar 'a' para Android
# Presionar 'i' para iOS
# Escanear QR con Expo Go para dispositivo físico
```

### Scripts NPM
```bash
npm start          # Iniciar servidor Expo
npm run android    # Abrir en Android
npm run ios        # Abrir en iOS
npm run test       # Ejecutar tests
npm run lint       # Lint con ESLint
npm run typecheck  # Verificación de tipos TypeScript
```

---

## 🎨 Sistema de Diseño

### Paleta de Colores
```typescript
// constants/theme.ts
export const colors = {
  primary: '#D4845A',       // Terracota — color de marca
  secondary: '#8B4513',     // Marrón oscuro — acento
  accent: '#F5DEB3',        // Trigo — fondos cálidos
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: {
    primary: '#FAFAF8',     // Fondo principal (warm off-white)
    secondary: '#F0EAE0',   // Fondo secundario
    card: '#FFFFFF',
  },
  text: {
    primary: '#2C1810',     // Marrón muy oscuro
    secondary: '#6B4226',
    muted: '#A0856B',
  }
};
```

### Tipografía
- **Heading**: `Playfair Display` (elegante para marca)
- **Body**: `Inter` (legible, moderno)
- **Monospace**: `JetBrains Mono` (para números/precios)

---

## 🔄 Flujo de Datos

```
Supabase (PostgreSQL)
        ↕ (RLS: user_id)
  Supabase JS Client
        ↕
  Custom Hooks (useProductos, useRecetas, etc.)
        ↕
  Zustand Stores (estado global)
        ↕
  Componentes React Native
```

### Patrón de Hooks
```typescript
// hooks/useProductos.ts
export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre');
    
    if (error) setError(error.message);
    else setProductos(data ?? []);
    setLoading(false);
  }, []);

  // Suscripción en tiempo real
  useEffect(() => {
    cargar();
    const channel = supabase
      .channel('productos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, cargar)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [cargar]);

  return { productos, loading, error, refetch: cargar };
}
```

---

## 📋 Plan de Desarrollo por Fases

### Fase 0 — Setup (Semana 1)
- [ ] Inicializar proyecto con `npx create-expo-app`
- [ ] Configurar Expo Router
- [ ] Instalar dependencias core
- [ ] Configurar cliente Supabase
- [ ] Configurar TypeScript estricto
- [ ] Configurar ESLint + Prettier
- [ ] Configurar theme y design tokens
- [ ] Crear sistema de componentes UI base

### Fase 1 — Autenticación (Semana 1)
- [ ] Pantalla de Login
- [ ] Pantalla de Registro
- [ ] Pantalla de Recuperar contraseña
- [ ] Guard de rutas (redirect si no autenticado)
- [ ] Persistencia de sesión
- [ ] Manejo de errores de auth

### Fase 2 — Dashboard + Productos (Semana 2)
- [ ] Pantalla Dashboard con métricas
- [ ] Listado de Productos con búsqueda
- [ ] Formulario Crear/Editar Producto
- [ ] Eliminar Producto (con confirmación)
- [ ] Filtros por categoría

### Fase 3 — Recetas (Semana 3)
- [ ] Listado de Recetas
- [ ] Formulario Crear/Editar Receta
- [ ] Selector de Materiales (search inline)
- [ ] Cálculo de costos en tiempo real
- [ ] Desglose visual de costos
- [ ] Captura de imagen con cámara

### Fase 4 — Ventas (Semana 4)
- [ ] Listado de Clientes
- [ ] CRUD Clientes
- [ ] Listado de Órdenes
- [ ] Crear Orden (selector de recetas)
- [ ] Cambio de estado de órdenes
- [ ] Compartir cotización (WhatsApp/Email)

### Fase 5 — Inventario + Config (Semana 5)
- [ ] Gastos Fijos (CRUD)
- [ ] Movimientos de Inventario/Kardex
- [ ] Alertas de stock mínimo
- [ ] Configuración global
- [ ] Perfil de usuario

### Fase 6 — Pulido y Deploy (Semana 6)
- [ ] Modo offline con caché MMKV
- [ ] Notificaciones push (órdenes)
- [ ] Animaciones y transiciones
- [ ] Testing (unit + integration)
- [ ] Build de producción (EAS Build)
- [ ] Publicar en Play Store (Android)

---

## 🏗️ Arquitectura de Componentes

```
ScreenWrapper (SafeArea + scroll)
└── Header (título + acciones)
└── Content
    ├── SearchBar (filtros)
    ├── FlatList / SectionList
    │   └── ItemCard (swipe-to-delete)
    └── FAB (FloatingActionButton → crear)
```

---

## 🔒 Seguridad

- Todas las tablas tienen **RLS habilitado** — los usuarios solo ven sus propios datos
- El `anon_key` es seguro para exponer en el cliente (por diseño de Supabase)
- Las credenciales de Supabase se leen de variables de entorno `EXPO_PUBLIC_*`
- No hay `service_role_key` en la app móvil
- Validación de inputs con **Zod** en todos los formularios

---

## 🧪 Testing

```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Estrategia de Testing
- **Utilidades** (calculations.ts, conversiones.ts): 100% cobertura
- **Custom Hooks**: Mock de Supabase client
- **Componentes**: React Native Testing Library
- **E2E**: Detox (opcional, fase 6)

---

## 📦 Build y Distribución

### Android (EAS Build)
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Configurar proyecto
eas build:configure

# Build para Android (APK para testing)
eas build --platform android --profile preview

# Build para Play Store (AAB)
eas build --platform android --profile production
```

### Configuración `eas.json`
```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🔗 Relación con App Web

| Aspecto | App Web (Next.js) | App Móvil (RN) |
|---------|-------------------|-----------------|
| Backend | Supabase (mismo) | Supabase (mismo) |
| Auth | Supabase Auth | Supabase Auth |
| RLS | ✅ Habilitado | ✅ Habilitado |
| Datos | Tiempo real | Tiempo real + caché |
| Offline | ❌ No | ✅ MMKV caché |
| Módulos | Todos | Todos |
| Deploy | Vercel | Play Store / EAS |

---

## 📄 Licencia

Proyecto privado — DG Bakery Cake © 2026

---

## 👤 Autor

**DG Bakery Cake Team** — Arcanoix  
GitHub: [@arcanoix](https://github.com/arcanoix)

---

*Última actualización: Mayo 2026*
