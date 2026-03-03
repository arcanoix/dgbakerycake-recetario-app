# 💱 Sistema de Conversión de Monedas

## Resumen

El sistema de DG Bakery Cake ahora trabaja con **USD como moneda base** pero muestra los valores convertidos a **Bolívares (BS)** usando la tasa de cambio configurada.

## 🎯 Concepto Principal

- **Almacenamiento**: Todos los valores se guardan en **USD** en la base de datos
- **Visualización**: Los valores se muestran en **ambas monedas** (BS destacado, USD secundario)
- **Tasa de cambio**: Configurable manualmente desde el módulo de Configuración

## 📊 Cómo Funciona

### 1. Configuración de la Tasa de Cambio

En el módulo **Configuración**, existe el campo:
- **Tasa de Cambio USD**: Valor manual del BCV (Banco Central de Venezuela)
- Por defecto: 50 Bs/USD

### 2. Almacenamiento en Base de Datos

Todos los precios y costos se guardan en USD:
```typescript
// Ejemplo de producto
{
  precioTotal: 10.50,        // USD
  precioPorUnidad: 2.10      // USD
}

// Ejemplo de receta
{
  costoMateriales: 15.00,    // USD
  costoManoObra: 5.00,       // USD
  costoTotal: 20.00,         // USD
  precioVentaSugerido: 30.00 // USD
}
```

### 3. Visualización Dual

Los valores se muestran automáticamente en ambas monedas:

**Formato**: `Bs. 525.00 • $10.50`

- **Bs. 525.00** - Destacado en verde (valor principal)
- **$10.50** - En gris (valor de referencia)

## 🔧 Componentes Creados

### 1. Utilidades de Conversión (`lib/currency.ts`)

```typescript
// Convertir USD a BS
convertirUSDaBS(valorUSD, tasaCambio)

// Convertir BS a USD
convertirBSaUSD(valorBS, tasaCambio)

// Formatear valores
formatearUSD(valor)      // "$10.50"
formatearBS(valor)       // "Bs. 525.00"
formatearDualMoneda()    // "$10.50 (Bs. 525.00)"
```

### 2. Componente Visual (`components/ui/precio-dual.tsx`)

```typescript
<PrecioDual 
  valorUSD={10.50} 
  tasaCambio={50}
  destacarBS={true}
  className="text-sm font-bold"
/>
```

**Resultado**: Bs. 525.00 • $10.50

## 📱 Dónde se Aplica

### ✅ Módulo de Productos
- Precio Total
- Precio por Unidad

### ✅ Módulo de Recetas
- Costo de Materiales
- Costo de Mano de Obra
- Costo Total
- Precio de Venta Sugerido

### ✅ Dashboard
- Valor Total de Inventario
- Costos Promedio
- Estadísticas Generales

## 🎨 Diseño Visual

### Colores
- **Bolívares (BS)**: Verde (#16a34a) - Destacado
- **Dólares (USD)**: Gris (#6b7280) - Secundario
- **Separador**: • (punto medio)

### Ejemplo Visual

```
Precio Total:     Bs. 525.00 • $10.50
                  ^^^^^^^^^^^   ^^^^^^^
                  (destacado)   (gris)
```

## 💡 Ventajas del Sistema

1. **Flexibilidad**: Fácil actualización de la tasa de cambio
2. **Precisión**: Los cálculos se hacen en USD (más estable)
3. **Claridad**: El usuario ve ambas monedas simultáneamente
4. **Actualización**: Cambiar la tasa actualiza todos los valores automáticamente

## 🔄 Flujo de Trabajo

### Para el Usuario

1. **Configurar tasa de cambio**
   - Ir a Configuración
   - Actualizar "Tasa de Cambio USD"
   - Guardar

2. **Ingresar productos/recetas**
   - Ingresar valores en USD
   - El sistema muestra automáticamente en BS

3. **Ver reportes**
   - Todos los valores se muestran en ambas monedas
   - BS destacado para facilitar lectura

### Para el Desarrollador

1. **Siempre trabajar en USD** en la lógica
2. **Usar `PrecioDual`** para mostrar valores
3. **Obtener tasa** desde `configuracion.tasaCambioUSD`

## 📝 Ejemplos de Uso

### En un Componente

```typescript
import { PrecioDual } from "@/components/ui/precio-dual";
import { useConfiguracion } from "@/hooks/useConfiguracion";

const MiComponente = () => {
  const { configuracion } = useConfiguracion();
  const precioUSD = 10.50;

  return (
    <div>
      <span>Precio: </span>
      <PrecioDual 
        valorUSD={precioUSD} 
        tasaCambio={configuracion?.tasaCambioUSD || 50}
      />
    </div>
  );
};
```

### Cálculos Manuales

```typescript
import { convertirUSDaBS, formatearBS } from "@/lib/currency";

const precioUSD = 10.50;
const tasa = 50;
const precioBS = convertirUSDaBS(precioUSD, tasa); // 525
const formateado = formatearBS(precioBS); // "Bs. 525.00"
```

## ⚙️ Configuración

### Cambiar Tasa de Cambio

1. Acceder a `/configuracion`
2. Modificar campo "Tasa de Cambio USD"
3. Guardar cambios
4. Todos los valores se actualizan automáticamente

### Valor por Defecto

Si no hay configuración, se usa **50 Bs/USD** como valor por defecto.

## 🚀 Próximas Mejoras

- [ ] API automática para obtener tasa del BCV
- [ ] Historial de tasas de cambio
- [ ] Gráficos de evolución de costos en BS
- [ ] Exportar reportes en ambas monedas

## 📞 Soporte

Para más información sobre el sistema de monedas, consulta:
- `lib/currency.ts` - Utilidades de conversión
- `components/ui/precio-dual.tsx` - Componente visual
- `types/index.ts` - Interface ConfiguracionGlobal

---

**Última actualización**: Marzo 2026
