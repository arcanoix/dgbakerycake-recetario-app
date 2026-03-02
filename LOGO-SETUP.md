# 🎨 Configuración del Logo de DG Bakery Cake

## ✅ Cambios Realizados

He preparado todo el código para usar tu logo en toda la aplicación. Aquí está lo que se ha actualizado:

### 1. Plantillas de Email ✉️
- ✅ `email-templates/confirm-signup.html` - Email de confirmación
- ✅ `email-templates/reset-password.html` - Recuperación de contraseña
- ✅ `email-templates/magic-link.html` - Acceso rápido

**Todas incluyen el logo en el header.**

### 2. Componentes de la Aplicación 🖥️
- ✅ `components/ui/logo.tsx` - Componente reutilizable creado
- ✅ `components/layout/Navbar.tsx` - Navbar actualizado
- ✅ `components/landing/LandingPage.tsx` - Landing page actualizada

### 3. Estructura de Carpetas 📁
- ✅ Carpeta `public/` creada
- ✅ Instrucciones guardadas

---

## 📝 PASOS QUE DEBES COMPLETAR

### Paso 1: Guardar el Logo Localmente

1. **Guarda la imagen que compartiste como:**
   ```
   public/logo.png
   ```

2. **Cómo hacerlo:**
   - Haz clic derecho en la imagen que me enviaste
   - "Guardar imagen como..."
   - Navega a: `f:/developer/arcanoix/dgbakerycake-costo-app/public/`
   - Guárdala con el nombre: `logo.png`

### Paso 2: Subir el Logo a Supabase Storage (Para Emails)

Los emails necesitan una URL pública para mostrar el logo. Sigue estos pasos:

#### 2.1 Crear un Bucket en Supabase

1. Ve a tu Dashboard de Supabase
2. Ve a **Storage** en el menú lateral
3. Haz clic en **"New bucket"**
4. Nombre del bucket: `public-assets`
5. Marca como **Public** (importante)
6. Haz clic en **"Create bucket"**

#### 2.2 Subir el Logo

1. Entra al bucket `public-assets`
2. Haz clic en **"Upload file"**
3. Selecciona tu archivo `logo.png`
4. Súbelo

#### 2.3 Obtener la URL Pública

1. Una vez subido, haz clic en el archivo `logo.png`
2. Copia la **URL pública**
3. Se verá algo como:
   ```
   https://riucijrbufaucwpokgyl.supabase.co/storage/v1/object/public/public-assets/logo.png
   ```

### Paso 3: Actualizar las Plantillas de Email

Reemplaza `https://TU-DOMINIO.com/logo.png` con la URL de Supabase en estos 3 archivos:

1. **email-templates/confirm-signup.html** - Línea 17
2. **email-templates/reset-password.html** - Línea 17
3. **email-templates/magic-link.html** - Línea 17

**Busca:**
```html
<img src="https://TU-DOMINIO.com/logo.png" alt="DG Bakery Cake" style="width: 150px; height: auto; margin-bottom: 15px;">
```

**Reemplaza con:**
```html
<img src="https://TU-URL-DE-SUPABASE/logo.png" alt="DG Bakery Cake" style="width: 150px; height: auto; margin-bottom: 15px;">
```

### Paso 4: Copiar las Plantillas a Supabase

1. Ve a **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Para cada plantilla (Confirm Signup, Reset Password, Magic Link):
   - Copia el contenido del archivo HTML correspondiente
   - Pégalo en el editor de Supabase
   - Guarda

---

## 🎯 Resultado Final

Una vez completados estos pasos:

### En la Aplicación Web:
- ✅ El logo aparecerá en el Navbar (esquina superior izquierda)
- ✅ El logo aparecerá en la Landing Page (hero section)
- ✅ El logo será consistente en toda la aplicación

### En los Emails:
- ✅ El logo aparecerá en todos los correos de autenticación
- ✅ Diseño profesional y consistente con la marca
- ✅ Compatible con todos los clientes de email

---

## 🔧 Componente Logo Creado

He creado un componente reutilizable en `components/ui/logo.tsx` con estas opciones:

```tsx
<Logo 
  size="sm"    // sm | md | lg
  showText={true}  // Mostrar/ocultar texto "DG Bakery Cake"
  href="/"     // Link (o undefined para sin link)
/>
```

**Tamaños:**
- `sm`: 32x32px (para iconos pequeños)
- `md`: 40x40px (para navbar)
- `lg`: 120x120px (para landing page)

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué necesito subir el logo a Supabase?**
R: Los emails no pueden acceder a archivos locales. Necesitan una URL pública accesible desde internet.

**P: ¿Puedo usar otro servicio para hospedar el logo?**
R: Sí, puedes usar:
- Cloudinary
- ImgBB
- Imgur
- Cualquier CDN público

**P: ¿El logo funcionará en desarrollo (localhost)?**
R: Sí, el logo en la aplicación web funcionará inmediatamente. Solo los emails necesitan la URL pública.

**P: ¿Qué pasa si no subo el logo a Supabase?**
R: La aplicación web funcionará perfectamente. Solo los emails no mostrarán el logo (mostrarán un icono roto).

---

## 📞 Próximos Pasos

1. ✅ Guarda `logo.png` en la carpeta `public/`
2. ✅ Sube el logo a Supabase Storage
3. ✅ Actualiza las URLs en las plantillas de email
4. ✅ Copia las plantillas a Supabase
5. ✅ ¡Listo! Tu marca estará en toda la aplicación

---

¿Necesitas ayuda con algún paso? ¡Avísame!
