# 🍰 DG Bakery Cake - Sistema de Gestión de Costos de Recetas

Sistema web para calcular y gestionar costos de recetas de repostería y pastelería, incluyendo materiales, insumos y mano de obra.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js + Vite
- **Estilos**: TailwindCSS + shadcn/ui
- **Lenguaje**: TypeScript
- **Desarrollo Local**: Docker
- **Repositorio**: GitHub (privado)
- **Despliegue**: Vercel
- **Iconos**: Lucide React

---

## 📋 Plan de Desarrollo

### Fase 1: Configuración Inicial
- [x] **1.1** Configurar estructura inicial del proyecto Next.js con Vite
  - [x] Inicializar proyecto Next.js
  - [x] Configurar Vite
  - [x] Instalar y configurar TailwindCSS
  - [x] Configurar shadcn/ui
  - [x] Configurar TypeScript
  - [x] Crear estructura de carpetas base

- [x] **1.2** Configurar Docker para ambiente local de desarrollo
  - [x] Crear Dockerfile
  - [x] Crear docker-compose.yml
  - [x] Configurar variables de entorno
  - [x] Documentar comandos Docker

- [x] **1.3** Inicializar repositorio Git y configurar GitHub (privado)
  - [x] Inicializar Git
  - [x] Crear repositorio privado en GitHub
  - [x] Configurar .gitignore
  - [x] Primer commit y push
  - [ ] Configurar ramas (main, develop)

### Fase 2: Fundamentos y Modelo de Datos
- [x] **2.1** Diseñar modelo de datos
  - [x] Definir tipos TypeScript para Productos
  - [x] Definir tipos TypeScript para Recetas
  - [x] Definir tipos TypeScript para Materiales
  - [x] Definir tipos TypeScript para Unidades de Medida
  - [x] Definir tipos TypeScript para Configuración de Mano de Obra
  - [x] Crear enums y constantes

- [x] **2.2** Implementar lógica de cálculos
  - [x] Sistema de conversión de unidades (gramos, litros, onzas, unidad)
  - [x] Cálculo de costo por material
  - [x] Cálculo de costo total de materiales
  - [x] Cálculo de costo de mano de obra
  - [x] Cálculo de costo total de receta
  - [x] Cálculo de precio de venta sugerido

### Fase 3: Gestión de Productos/Insumos
- [x] **3.1** Implementar sistema de gestión de productos
  - [x] Crear componente ProductoForm
  - [x] Crear componente ProductoList
  - [x] Implementar CRUD de productos
  - [x] Validaciones de formulario
  - [x] Búsqueda y filtrado de productos
  - [x] Soporte para múltiples unidades de medida
  - [x] Cálculo automático de precio por unidad

### Fase 4: Sistema de Mano de Obra
- [x] **4.1** Implementar sistema de costo de mano de obra configurable
  - [x] Crear componente ConfiguracionForm
  - [x] Configuración global de costo por hora
  - [x] Configuración de moneda
  - [x] Persistencia de configuración
  - [x] Componente CostoManoObraInput para recetas

### Fase 5: Gestión de Recetas
- [x] **5.1** Implementar sistema de gestión de recetas
  - [x] Crear componente RecetaForm
  - [x] Crear componente RecetaList
  - [x] Crear componente MaterialSelector
  - [x] Crear componente DesgloseCostos
  - [x] Implementar CRUD de recetas
  - [x] Selector de materiales/insumos
  - [x] Input de tiempo de preparación
  - [x] Cálculo automático de costos (materiales + mano de obra)
  - [x] Cálculo de precio de venta sugerido
  - [x] Búsqueda y filtrado de recetas
  - [x] Cálculo de margen de ganancia
  - [x] Precio de venta sugerido

### Fase 6: UI/UX
- [x] **6.1** Crear interfaz de usuario moderna
  - [x] Dashboard principal
  - [x] Navegación principal (Navbar/Sidebar)
  - [x] Página de productos
  - [x] Página de recetas
  - [x] Página de configuración
  - [x] Componentes reutilizables con shadcn/ui
  - [x] Diseño responsive (mobile, tablet, desktop)
  - [x] Integrar iconos con Lucide React
  - [ ] Temas (light/dark) - opcional

### Fase 7: Persistencia de Datos
- [x] **7.1** Implementar almacenamiento de datos
  - [x] Implementar localStorage para productos
  - [x] Implementar localStorage para recetas
  - [x] Implementar localStorage para configuración
  - [x] Hooks personalizados (useProductos, useRecetas)
  - [x] Manejo de errores y validaciones
  - [ ] Sistema de backup/export (opcional)

### Fase 8: Despliegue
- [x] **8.1** Configurar despliegue en Vercel
  - [x] Configurar proyecto en Vercel
  - [x] Configurar variables de entorno
  - [x] Documentación de despliegue
  - [x] CI/CD automático con Vercel
  - [ ] Configurar dominio personalizado (opcional)
  - [ ] Testing en producción

### Fase 9: Testing y Ajustes
- [ ] **9.1** Testing y ajustes finales
  - [ ] Pruebas de funcionalidad
  - [ ] Validación de cálculos
  - [ ] Pruebas de responsive
  - [ ] Pruebas de rendimiento
  - [ ] Corrección de bugs
  - [ ] Optimizaciones
  - [ ] Documentación final

---

## 📊 Modelo de Datos

### Producto/Insumo
```typescript
{
  id: string
  nombre: string
  precioTotal: number
  cantidadTotal: number
  unidadMedida: 'gramos' | 'litros' | 'onzas' | 'unidad' | 'mililitros' | 'kilogramos'
  precioPorUnidad: number // calculado
  categoria?: string
  proveedor?: string
  fechaActualizacion: Date
}
```

### Receta
```typescript
{
  id: string
  nombre: string
  descripcion: string
  materiales: MaterialReceta[]
  
  // Mano de Obra
  tiempoPreparacion: number // minutos
  costoPorHora: number
  costoManoObra: number // calculado
  
  // Costos
  costoMateriales: number // calculado
  costoTotal: number // calculado
  
  // Opcional
  margenGanancia?: number
  precioVentaSugerido?: number
  rendimiento?: number
  unidadRendimiento?: string
  
  fechaCreacion: Date
  fechaActualizacion: Date
}
```

### Material de Receta
```typescript
{
  id: string
  productoId: string
  nombreProducto: string
  cantidadUtilizada: number
  unidadMedida: string
  costoUnitario: number
  costoMaterial: number // calculado
}
```

---

## 🧮 Fórmulas de Cálculo

### Costo de Material
```
costoMaterial = (precioProducto / cantidadTotalProducto) * cantidadUtilizada
```

### Costo Total de Materiales
```
costoMateriales = Σ(costoMaterial)
```

### Costo de Mano de Obra
```
costoManoObra = (tiempoPreparacion / 60) * costoPorHora
```

### Costo Total de Receta
```
costoTotal = costoMateriales + costoManoObra
```

### Precio de Venta Sugerido
```
precioVentaSugerido = costoTotal * (1 + margenGanancia / 100)
```

---

## 🏗️ Estructura del Proyecto

```
dgbakerycake-costo-app/
├── .docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── productos/
│   │   │   └── page.tsx
│   │   ├── recetas/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── configuracion/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/ (shadcn/ui)
│   │   ├── productos/
│   │   │   ├── ProductoForm.tsx
│   │   │   └── ProductoList.tsx
│   │   ├── recetas/
│   │   │   ├── RecetaForm.tsx
│   │   │   ├── RecetaList.tsx
│   │   │   ├── MaterialSelector.tsx
│   │   │   ├── CostoManoObraInput.tsx
│   │   │   └── DesgloseCostos.tsx
│   │   └── configuracion/
│   │       └── ConfiguracionForm.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── storage.ts
│   │   └── calculations.ts
│   ├── types/
│   │   └── index.ts
│   └── hooks/
│       ├── useProductos.ts
│       └── useRecetas.ts
├── public/
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── vite.config.ts
└── README.md
```

---

## 🐳 Comandos Docker

```bash
# Construir imagen
docker-compose build

# Iniciar contenedor
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Detener contenedor
docker-compose down

# Ver logs
docker-compose logs -f
```

---

## 🔧 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build producción
npm run build

# Iniciar producción
npm start
```

---

## � Despliegue en Vercel

### Opción 1: Desde la Web de Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New Project"**
3. Importa el repositorio: `dgbakerycake-recetario-app`
4. Vercel detectará automáticamente Next.js
5. Click en **"Deploy"**

### Opción 2: Usando Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel
```

**📖 Guía completa**: Ver [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## �📝 Notas de Desarrollo

### Unidades de Medida Soportadas
- **Peso**: gramos (g), kilogramos (kg), onzas (oz)
- **Volumen**: mililitros (ml), litros (l)
- **Cantidad**: unidad (u)

### Conversiones Automáticas
- 1 kg = 1000 g
- 1 l = 1000 ml
- 1 oz = 28.35 g

---

## 🎯 Funcionalidades Futuras (Post-MVP)

- [ ] Exportación de recetas a PDF
- [ ] Exportación a Excel
- [ ] Historial de precios de productos
- [ ] Gráficos de costos
- [ ] Multi-moneda
- [ ] Sistema de usuarios y autenticación
- [ ] Base de datos real (Vercel Postgres/Supabase)
- [ ] API REST
- [ ] Categorías de recetas
- [ ] Etiquetas y filtros avanzados
- [ ] Calculadora de porciones
- [ ] Modo offline (PWA)

---

## 📄 Licencia

Proyecto privado - DG Bakery Cake © 2026

---

## 👤 Autor

**DG Bakery Cake Team**

---

**Última actualización**: 28 de Febrero, 2026
