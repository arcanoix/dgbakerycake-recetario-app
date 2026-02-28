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

- [ ] **1.3** Inicializar repositorio Git y configurar GitHub (privado)
  - [ ] Inicializar Git
  - [ ] Crear repositorio privado en GitHub
  - [ ] Configurar .gitignore
  - [ ] Primer commit y push
  - [ ] Configurar ramas (main, develop)

### Fase 2: Fundamentos y Modelo de Datos
- [ ] **2.1** Diseñar modelo de datos
  - [ ] Definir tipos TypeScript para Productos
  - [ ] Definir tipos TypeScript para Recetas
  - [ ] Definir tipos TypeScript para Materiales
  - [ ] Definir tipos TypeScript para Unidades de Medida
  - [ ] Definir tipos TypeScript para Configuración de Mano de Obra
  - [ ] Crear enums y constantes

- [ ] **2.2** Implementar lógica de cálculos
  - [ ] Sistema de conversión de unidades (gramos, litros, onzas, unidad)
  - [ ] Cálculo de costo por material
  - [ ] Cálculo de costo total de materiales
  - [ ] Cálculo de costo de mano de obra
  - [ ] Cálculo de costo total de receta
  - [ ] Cálculo de precio de venta sugerido

### Fase 3: Gestión de Productos/Insumos
- [ ] **3.1** Implementar sistema de gestión de productos
  - [ ] Crear componente ProductoForm
  - [ ] Crear componente ProductoList
  - [ ] Implementar CRUD de productos
  - [ ] Validaciones de formulario
  - [ ] Búsqueda y filtrado de productos
  - [ ] Soporte para múltiples unidades de medida
  - [ ] Cálculo automático de precio por unidad

### Fase 4: Sistema de Mano de Obra
- [ ] **4.1** Implementar sistema de costo de mano de obra configurable
  - [ ] Crear componente ConfiguracionForm
  - [ ] Configuración global de costo por hora
  - [ ] Configuración de moneda
  - [ ] Persistencia de configuración
  - [ ] Componente CostoManoObraInput para recetas

### Fase 5: Gestión de Recetas
- [ ] **5.1** Implementar sistema de gestión de recetas
  - [ ] Crear componente RecetaForm
  - [ ] Crear componente RecetaList
  - [ ] Crear componente MaterialSelector
  - [ ] Crear componente DesgloseCostos
  - [ ] Implementar CRUD de recetas
  - [ ] Selector de materiales/insumos
  - [ ] Input de tiempo de preparación
  - [ ] Cálculo automático de costos (materiales + mano de obra)
  - [ ] Conversión automática de unidades
  - [ ] Desglose visual de costos
  - [ ] Cálculo de margen de ganancia
  - [ ] Precio de venta sugerido

### Fase 6: UI/UX
- [ ] **6.1** Crear interfaz de usuario moderna
  - [ ] Dashboard principal
  - [ ] Navegación principal (Navbar/Sidebar)
  - [ ] Página de productos
  - [ ] Página de recetas
  - [ ] Página de configuración
  - [ ] Componentes reutilizables con shadcn/ui
  - [ ] Diseño responsive (mobile, tablet, desktop)
  - [ ] Integrar iconos con Lucide React
  - [ ] Temas (light/dark) - opcional

### Fase 7: Persistencia de Datos
- [ ] **7.1** Implementar almacenamiento de datos
  - [ ] Implementar localStorage para productos
  - [ ] Implementar localStorage para recetas
  - [ ] Implementar localStorage para configuración
  - [ ] Hooks personalizados (useProductos, useRecetas)
  - [ ] Manejo de errores y validaciones
  - [ ] Sistema de backup/export (opcional)

### Fase 8: Despliegue
- [ ] **8.1** Configurar despliegue en Vercel
  - [ ] Configurar proyecto en Vercel
  - [ ] Configurar variables de entorno
  - [ ] Configurar dominio (opcional)
  - [ ] CI/CD con GitHub Actions
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

## 📝 Notas de Desarrollo

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
