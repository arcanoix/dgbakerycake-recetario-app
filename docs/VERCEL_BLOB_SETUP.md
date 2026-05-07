# Configuración de Vercel Blob Storage

Este proyecto utiliza **Vercel Blob** para almacenar las imágenes del blog de forma segura y eficiente.

## 🚀 Pasos para Configurar

### 1. Instalar el paquete de Vercel Blob

```bash
npm install @vercel/blob
```

### 2. Crear un Blob Store en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Navega a la pestaña **Storage**
3. Haz clic en **Create Database**
4. Selecciona **Blob**
5. Dale un nombre (por ejemplo: `dgbakerycake-images`)
6. Haz clic en **Create**

### 3. Conectar el Blob Store a tu proyecto

Vercel automáticamente agregará las variables de entorno necesarias:
- `BLOB_READ_WRITE_TOKEN`

Estas variables estarán disponibles tanto en producción como en desarrollo local.

### 4. Configurar variables de entorno locales

Para desarrollo local, ejecuta:

```bash
vercel env pull .env.local
```

Esto descargará las variables de entorno de tu proyecto de Vercel.

### 5. Verificar la configuración

Las siguientes variables deben estar en tu `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

## 📁 Estructura de Archivos

Las imágenes se almacenan con la siguiente estructura:

```
blog/
  ├── 1234567890-abc123.jpg
  ├── 1234567891-def456.png
  └── ...
```

Cada archivo tiene:
- Timestamp para unicidad
- String aleatorio para evitar colisiones
- Extensión original del archivo

## 🔒 Seguridad

- **Validación de tipo**: Solo se permiten archivos de imagen
- **Límite de tamaño**: Máximo 5MB por imagen
- **Acceso público**: Las URLs son públicas pero impredecibles
- **Edge Runtime**: Procesamiento rápido en el edge

## 💰 Límites y Precios

### Plan Hobby (Gratis)
- 1 GB de almacenamiento
- 100 GB de transferencia/mes
- Perfecto para empezar

### Plan Pro
- 100 GB de almacenamiento incluido
- 1 TB de transferencia/mes
- $0.15/GB adicional de almacenamiento
- $0.40/GB adicional de transferencia

## 🛠️ Uso en el Código

### Componente ImageUpload

```tsx
<ImageUpload
  value={form.cover_image}
  onChange={(url) => handleChange("cover_image", url)}
  onRemove={() => handleChange("cover_image", "")}
  maxSize={5}
/>
```

### API Route (`/api/upload`)

```ts
import { put } from '@vercel/blob';

const blob = await put(filename, file, {
  access: 'public',
  addRandomSuffix: false,
});

return blob.url; // https://xxxxx.public.blob.vercel-storage.com/blog/...
```

## 🔄 Migración desde URLs Externas

Si ya tienes posts con URLs externas de imágenes:

1. Las URLs externas seguirán funcionando
2. Nuevas imágenes se subirán a Vercel Blob
3. Opcionalmente, puedes migrar imágenes antiguas manualmente

## 📊 Monitoreo

Puedes ver el uso de almacenamiento en:
- Vercel Dashboard → Storage → Blob
- Métricas de uso
- Lista de archivos almacenados

## 🐛 Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN is not defined"

**Solución**: Ejecuta `vercel env pull .env.local`

### Error: "File too large"

**Solución**: El límite es 5MB. Comprime la imagen antes de subirla.

### Error: "Invalid file type"

**Solución**: Solo se permiten imágenes (jpg, png, gif, webp, etc.)

## 📚 Recursos

- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Pricing](https://vercel.com/docs/storage/vercel-blob/usage-and-pricing)
- [API Reference](https://vercel.com/docs/storage/vercel-blob/using-blob-sdk)
