---
name: rn-mobile-builder
description: >
  Construye el proyecto móvil React Native (Expo) completo de DG Bakery Cake desde cero.
  Incluye setup, autenticación con Supabase, todos los módulos (productos, recetas, ventas,
  inventario, clientes, configuración) y build para Android. Usa cuando el usuario diga
  "montar la app móvil", "crear el proyecto RN", "build mobile", "inicializar expo" o
  "construir la app de repostería en React Native".
triggers:
  - montar app móvil
  - crear proyecto react native
  - build mobile dgbakery
  - inicializar expo bakery
  - construir app repostería react native
---

# Skill: RN Mobile Builder — DG Bakery Cake

## Contexto del Proyecto

Este skill construye la **app móvil React Native** (Expo) para DG Bakery Cake.
La app comparte el **mismo backend Supabase** que la web Next.js existente.

### Supabase Project
- **URL**: `https://riucijrbufaucwpokgyl.supabase.co`
- **Tablas existentes**: productos, recetas, configuracion, clientes, ordenes,
  orden_items, gastos_fijos, inventario_movimientos, config_stock_productos,
  categorias, unidades_medida, activity_logs
- **Auth**: Supabase Auth (email + password) con RLS en todas las tablas
- **RLS**: `user_id = auth.uid()` en todas las políticas

### Stack Móvil
- React Native con **Expo SDK 52+**
- **Expo Router v4** para navegación file-based
- **TypeScript** estricto
- **Supabase JS SDK v2** con AsyncStorage para sesión
- **Zustand v5** para estado global
- **React Hook Form + Zod** para formularios
- **NativeWind v4** para estilos (Tailwind en RN)
- **Victory Native** para gráficos
- **MMKV** para caché offline

---

## Fase 0: Inicialización del Proyecto

### 0.1 Crear proyecto Expo
```bash
npx create-expo-app@latest dgbakerycake-mobile --template blank-typescript
cd dgbakerycake-mobile
```

### 0.2 Instalar dependencias core
```bash
npx expo install expo-router react-native-safe-area-context react-native-screens \
  expo-linking expo-constants expo-status-bar

npx expo install @supabase/supabase-js @react-native-async-storage/async-storage

npx expo install zustand

npm install react-hook-form @hookform/resolvers zod

npx expo install expo-image-picker expo-camera

npm install nativewind
npm install --save-dev tailwindcss@3.3.2

npx expo install react-native-mmkv

npm install victory-native react-native-svg react-native-reanimated

npx expo install expo-notifications expo-device

npm install @expo/vector-icons lucide-react-native
```

### 0.3 Estructura de archivos a crear
Crear todos los directorios según la estructura en `MOBILE-APP-README.md`.

---

## Fase 1: Configuración Base

### 1.1 `app.json` — Configuración Expo
```json
{
  "expo": {
    "name": "DG Bakery Cake",
    "slug": "dgbakerycake-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "dgbakery",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#D4845A"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#D4845A"
      },
      "package": "com.arcanoix.dgbakerycake"
    },
    "plugins": [
      "expo-router",
      "expo-camera",
      [
        "expo-image-picker",
        { "photosPermission": "Permite acceder a tus fotos para las recetas." }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### 1.2 `constants/theme.ts`
```typescript
export const colors = {
  primary: '#D4845A',
  primaryDark: '#B5693E',
  primaryLight: '#E8A882',
  secondary: '#8B4513',
  accent: '#F5DEB3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  background: {
    primary: '#FAFAF8',
    secondary: '#F0EAE0',
    card: '#FFFFFF',
    dark: '#2C1810',
  },
  text: {
    primary: '#2C1810',
    secondary: '#6B4226',
    muted: '#A0856B',
    inverse: '#FFFFFF',
  },
  border: '#E8D5C4',
  divider: '#F0E8E0',
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const borderRadius = {
  sm: 6, md: 12, lg: 16, xl: 24, full: 9999,
};

export const fontSize = {
  xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, xxl: 30, xxxl: 36,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
```

### 1.3 `lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 1.4 `.env` (no commitear)
```env
EXPO_PUBLIC_SUPABASE_URL=https://riucijrbufaucwpokgyl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key_del_proyecto>
```

---

## Fase 2: Autenticación

### 2.1 `stores/authStore.ts`
```typescript
import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  setSession: (session) => set({ session, user: session?.user ?? null, loading: false }),
  
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },
  
  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
```

### 2.2 `app/_layout.tsx` — Root Layout con Auth Guard
```typescript
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout() {
  const { session, loading, setSession } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) router.replace('/(auth)/login');
    if (session && inAuthGroup) router.replace('/(tabs)');
  }, [session, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

### 2.3 `app/(auth)/login.tsx`
Crear pantalla de login con:
- Logo DG Bakery Cake
- Input email + password (react-hook-form + zod)
- Botón "Iniciar Sesión" con loading state
- Link a registro
- Link a recuperar contraseña
- Manejo de errores con toast/alert
- Diseño con colores del theme (terracota + crema)

### 2.4 `app/(auth)/register.tsx`
Pantalla de registro con:
- Nombre, email, contraseña, confirmar contraseña
- Validación Zod completa
- Mensaje de verificación de email

### 2.5 `app/(auth)/forgot-password.tsx`
- Input email
- Llama `supabase.auth.resetPasswordForEmail()`
- Mensaje de confirmación

---

## Fase 3: Tab Navigator y Dashboard

### 3.1 `app/(tabs)/_layout.tsx`
```typescript
import { Tabs } from 'expo-router';
import { colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.background.card,
          borderTopColor: colors.border,
          paddingBottom: 8,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ... }} />
      <Tabs.Screen name="productos" options={{ title: 'Productos', tabBarIcon: ... }} />
      <Tabs.Screen name="recetas" options={{ title: 'Recetas', tabBarIcon: ... }} />
      <Tabs.Screen name="ventas" options={{ title: 'Ventas', tabBarIcon: ... }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ... }} />
    </Tabs>
  );
}
```

### 3.2 `app/(tabs)/index.tsx` — Dashboard
Debe mostrar:
- Saludo personalizado con nombre del usuario
- Estadísticas del mes: total recetas, productos activos, órdenes pendientes
- Gráfico de costos por categoría (Victory Native Pie Chart)
- Lista de últimas 3 recetas
- Alertas de stock crítico
- Tarjeta de órdenes pendientes de entrega

---

## Fase 4: Módulo Productos

### 4.1 Hook `hooks/useProductos.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Producto } from '@/types';

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        unidades_medida:unidad_medida(id, nombre, simbolo)
      `)
      .order('nombre');
    if (error) setError(error.message);
    else setProductos(mapProductos(data ?? []));
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
    const channel = supabase.channel('productos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, cargar)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [cargar]);

  const crear = async (data: ProductoFormData) => { ... };
  const actualizar = async (id: string, data: Partial<ProductoFormData>) => { ... };
  const eliminar = async (id: string) => { ... };

  return { productos, loading, error, cargar, crear, actualizar, eliminar };
}
```

### 4.2 Pantallas de Productos
- `app/(tabs)/productos.tsx`: FlatList con búsqueda, filtro categoría, FAB para crear
- `app/productos/[id].tsx`: Detalle + editar + eliminar (swipe actions)
- `app/productos/nuevo.tsx`: Formulario con RHF + Zod

### 4.3 Componentes Productos
- `ProductoCard`: nombre, precio, unidad, precio/unidad, categoría badge
- `ProductoForm`: campos nombre, precio, presentación, unidad, categoría, proveedor, notas
- Selector de unidades desde tabla `unidades_medida` de Supabase

---

## Fase 5: Módulo Recetas

### 5.1 Hook `hooks/useRecetas.ts`
Similar a useProductos pero con lógica de cálculo de costos.
Incluir función `calcularCostos(materiales, horas, config)` que replica `lib/calculations.ts`.

### 5.2 Cálculos de Costos (replicar de web)
```typescript
// lib/calculations.ts
export function calcularCostoMaterial(
  precioTotal: number,
  cantidadTotal: number,
  cantidadUsada: number
): number {
  if (cantidadTotal === 0) return 0;
  return (precioTotal / cantidadTotal) * cantidadUsada;
}

export function calcularCostoManoObra(horas: number, costoPorHora: number): number {
  return horas * costoPorHora;
}

export function calcularPrecioVenta(costoTotal: number, margen: number): number {
  return costoTotal * (1 + margen / 100);
}
```

### 5.3 MaterialSelector — Búsqueda inline
Componente modal que:
- Muestra FlatList de productos
- Tiene SearchBar
- Al seleccionar, muestra input de cantidad + selector de unidad
- Calcula costo en tiempo real
- Devuelve `MaterialReceta` completamente calculado

### 5.4 DesgloseCostos
Componente que muestra:
- Barra de progreso por tipo de costo (materiales, mano de obra, gastos fijos)
- Pie chart con Victory Native
- Tabla de materiales con porcentajes
- Precio de venta sugerido destacado

---

## Fase 6: Módulo Ventas (Clientes + Órdenes)

### 6.1 Clientes
Hook `useClientes.ts` + pantallas CRUD básico.

### 6.2 Órdenes
Hook `useOrdenes.ts`:
- Listar órdenes con join a clientes
- Crear orden con items (array de recetas + cantidad + precio)
- Cambiar estado
- Calcular totales, descuentos, saldo pendiente

### 6.3 Compartir Cotización
```typescript
import * as Sharing from 'expo-sharing';

// Generar texto de cotización y abrir share sheet nativo
const compartirCotizacion = async (orden: Orden) => {
  const texto = generarTextoCotizacion(orden);
  // Intentar abrir WhatsApp directamente
  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(texto)}`;
  const canOpen = await Linking.canOpenURL(whatsappUrl);
  if (canOpen) await Linking.openURL(whatsappUrl);
  else await Sharing.shareAsync('', { dialogTitle: 'Compartir Cotización', mimeType: 'text/plain' });
};
```

---

## Fase 7: Inventario y Gastos Fijos

### 7.1 Gastos Fijos
- Lista de gastos: nombre, monto mensual, unidades estimadas, costo asignado
- CRUD completo
- Costo asignado calculado: `monto_mensual / unidades_estimadas`

### 7.2 Inventario / Kardex
- Listado de movimientos filtrado por producto
- Crear movimiento (compra, uso, merma, ajuste)
- Calcular stock actual por producto
- Alerta visual si `stock_actual < stock_minimo`

---

## Fase 8: Configuración y Perfil

### 8.1 Configuración
- Formulario RHF para `configuracion` table:
  - `costo_por_hora_defecto`
  - `moneda` (VES / USD)
  - `margen_ganancia_defecto`
  - `tasa_cambio_usd`
  - `porcentaje_gastos_fijos`
- Upsert: si existe actualizar, sino insertar

### 8.2 Perfil
- Mostrar email del usuario
- Cambiar contraseña (`supabase.auth.updateUser`)
- Botón cerrar sesión
- Versión de la app

---

## Fase 9: Componentes UI Reutilizables

### Implementar estos componentes en `components/ui/`:

```typescript
// Button.tsx — variantes: primary, secondary, outline, ghost, danger
// Card.tsx — con shadow y border-radius del theme
// Input.tsx — wrapper de TextInput con label, error y estilo unificado
// Badge.tsx — colored pill para estados y categorías
// Skeleton.tsx — loading placeholder animado
// EmptyState.tsx — ilustración + mensaje + CTA button
// LoadingSpinner.tsx — ActivityIndicator con overlay
// SearchBar.tsx — TextInput con icono y debounce 300ms
// SwipeableRow.tsx — react-native-gesture-handler swipe to delete/edit
// ConfirmDialog.tsx — Alert nativo o modal personalizado
// FAB.tsx — FloatingActionButton con shadow
// ScreenWrapper.tsx — SafeAreaView + KeyboardAvoidingView + ScrollView
```

---

## Fase 10: Build y Distribución

### 10.1 `eas.json`
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
  }
}
```

### 10.2 Comandos de Build
```bash
# Configurar EAS
eas build:configure

# APK para testing (Android)
eas build --platform android --profile preview

# Bundle para Play Store
eas build --platform android --profile production

# Enviar a Play Store
eas submit --platform android
```

---

## Checklist de Implementación Completa

### Setup
- [ ] Proyecto Expo creado con TypeScript
- [ ] Expo Router configurado
- [ ] Todas las dependencias instaladas
- [ ] Variables de entorno configuradas
- [ ] Cliente Supabase conectado y probado
- [ ] Theme y design tokens creados

### Auth
- [ ] Login funcional con manejo de errores
- [ ] Registro con verificación email
- [ ] Recuperar contraseña
- [ ] Guard de rutas (redirect no autenticados)
- [ ] Persistencia de sesión entre reinicios

### Dashboard
- [ ] Estadísticas del mes
- [ ] Gráfico de costos
- [ ] Recetas recientes
- [ ] Alertas de stock

### Productos
- [ ] Listado con búsqueda y filtro
- [ ] CRUD completo con validaciones Zod
- [ ] Suscripción tiempo real

### Recetas
- [ ] Listado con búsqueda y filtro
- [ ] CRUD completo
- [ ] MaterialSelector funcional
- [ ] Cálculo de costos en tiempo real
- [ ] DesgloseCostos visual
- [ ] Imagen con cámara

### Ventas
- [ ] CRUD Clientes
- [ ] CRUD Órdenes con items
- [ ] Cambio de estado
- [ ] Compartir cotización WhatsApp

### Inventario
- [ ] Movimientos CRUD
- [ ] Alertas stock mínimo

### Gastos Fijos
- [ ] CRUD gastos fijos
- [ ] Cálculo costo asignado

### Configuración
- [ ] Formulario configuración global
- [ ] Perfil y cerrar sesión

### Build
- [ ] APK preview generado
- [ ] Probado en dispositivo físico Android

---

## Reglas de Implementación (Project Standards)

1. **TypeScript estricto**: `strict: true` en `tsconfig.json`. Sin `any`.
2. **Supabase pattern**: Siempre verificar `error` antes de usar `data`.
3. **RLS**: Nunca usar `service_role_key`. Dejar que RLS filtre automáticamente.
4. **Formularios**: Siempre usar `react-hook-form` + `zodResolver`. Sin estado manual de formulario.
5. **Estilo**: Usar `StyleSheet.create()` o NativeWind. Sin estilos inline ad-hoc.
6. **Hooks**: Cada módulo tiene su propio hook (useProductos, useRecetas, etc.).
7. **Tiempo real**: Usar `supabase.channel()` con `postgres_changes` para sincronización.
8. **Manejo de errores**: Mostrar errores al usuario. Nunca silenciar errores.
9. **Loading states**: Todo fetch debe tener `loading: true` mientras carga.
10. **Nombres en español**: Variables, funciones y componentes en español (consistente con web).
