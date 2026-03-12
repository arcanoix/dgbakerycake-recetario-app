# Sistema de Presentaciones de Productos

## Problema Resuelto

Anteriormente, el sistema no diferenciaba entre el tamaño de la presentación individual de un producto y la cantidad total comprada. Esto causaba confusión al manejar productos con diferentes tamaños de presentación.

## Nuevo Modelo

### Campos del Producto

1. **Tamaño de Presentación** (`tamañoPresentacion`)
   - El tamaño/peso de UNA unidad/paquete del producto
   - Ejemplo: 900 (para una bolsa de 900g)

2. **Unidad de Medida** (`unidadMedida`)
   - La unidad en que se mide el producto
   - Ejemplo: gramos, kilogramos, litros, unidad

3. **Cantidad de Presentaciones** (`cantidadPresentaciones`)
   - Cuántas unidades/paquetes se compraron
   - Ejemplo: 3 (tres bolsas)

4. **Cantidad Total** (`cantidadTotal`) - *CALCULADO*
   - Total = `tamañoPresentacion × cantidadPresentaciones`
   - Ejemplo: 900g × 3 = 2700g

5. **Precio por Unidad** (`precioPorUnidad`) - *CALCULADO*
   - Precio por unidad base (por gramo, por litro, etc.)
   - Ejemplo: $1.50 / 2700g = $0.00056 por gramo

6. **Precio por Presentación** (`precioPorPresentacion`) - *CALCULADO*
   - Precio de una presentación individual
   - Ejemplo: $1.50 / 3 bolsas = $0.50 por bolsa

## Ejemplos Prácticos

### Ejemplo 1: Harina de 900g

```
Nombre: Harina de Trigo Leudante La Lucha
Precio Total: $1.50
Tamaño Presentación: 900
Unidad de Medida: gramos
Cantidad Presentaciones: 3

CALCULADO:
- Cantidad Total: 2700g
- Precio por Unidad: $0.00056/g
- Precio por Presentación: $0.50/bolsa
```

### Ejemplo 2: Harina de 1kg

```
Nombre: Harina Todo Uso
Precio Total: $2.00
Tamaño Presentación: 1
Unidad de Medida: kilogramos
Cantidad Presentaciones: 2

CALCULADO:
- Cantidad Total: 2kg
- Precio por Unidad: $1.00/kg
- Precio por Presentación: $1.00/bolsa
```

### Ejemplo 3: Huevos por unidad

```
Nombre: Huevos
Precio Total: $3.60
Tamaño Presentación: 12
Unidad de Medida: unidad
Cantidad Presentaciones: 3

CALCULADO:
- Cantidad Total: 36 unidades
- Precio por Unidad: $0.10/unidad
- Precio por Presentación: $1.20/cartón
```

## Uso en Recetas

Cuando agregas un material a una receta, el sistema:

1. Busca el producto y obtiene su `precioPorUnidad`
2. Multiplica por la cantidad utilizada en la receta
3. Calcula el costo del material automáticamente

**Ejemplo:**
- Producto: Harina 900g ($0.00056/g)
- Receta usa: 250g
- Costo material: 250g × $0.00056/g = $0.14

## Ventajas

✅ Maneja correctamente productos con diferentes tamaños de presentación
✅ Cálculos precisos de costos en recetas
✅ Fácil de entender: separas presentación individual de cantidad comprada
✅ Flexible: funciona con cualquier unidad de medida
✅ Transparente: muestra precio por presentación y por unidad base
