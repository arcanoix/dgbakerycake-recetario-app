# Plantillas de Email para DG Bakery Cake

Este directorio contiene las plantillas HTML personalizadas para los correos electrónicos de Supabase Auth.

## Plantillas Disponibles

### 1. confirm-signup.html
**Uso:** Email de confirmación de registro
**Asunto sugerido:** `¡Bienvenido a DG Bakery Cake! 🍰 Confirma tu cuenta`

Características:
- Diseño profesional con gradiente morado
- Lista de funcionalidades del sistema
- Botón de confirmación destacado
- Enlace alternativo por si el botón no funciona
- Nota de seguridad
- Responsive para móviles

### 2. reset-password.html
**Uso:** Email de recuperación de contraseña
**Asunto sugerido:** `Recupera tu contraseña - DG Bakery Cake 🔐`

Características:
- Diseño consistente con la marca
- Advertencia de seguridad destacada
- Consejos de seguridad
- Botón de restablecimiento
- Información sobre expiración del enlace

### 3. magic-link.html
**Uso:** Email de acceso rápido sin contraseña
**Asunto sugerido:** `Tu enlace de acceso rápido - DG Bakery Cake ✨`

Características:
- Diseño simple y directo
- Botón de acceso rápido
- Nota de seguridad
- Información de expiración

## Cómo Implementar en Supabase

### Paso 1: Acceder al Dashboard
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Email Templates**

### Paso 2: Configurar cada plantilla

#### Para Confirm Signup:
1. Selecciona **"Confirm signup"**
2. Copia el contenido de `confirm-signup.html`
3. Pégalo en el editor
4. Cambia el **Subject** a: `¡Bienvenido a DG Bakery Cake! 🍰 Confirma tu cuenta`
5. Haz clic en **Save**

#### Para Reset Password:
1. Selecciona **"Reset Password"**
2. Copia el contenido de `reset-password.html`
3. Pégalo en el editor
4. Cambia el **Subject** a: `Recupera tu contraseña - DG Bakery Cake 🔐`
5. Haz clic en **Save**

#### Para Magic Link:
1. Selecciona **"Magic Link"**
2. Copia el contenido de `magic-link.html`
3. Pégalo en el editor
4. Cambia el **Subject** a: `Tu enlace de acceso rápido - DG Bakery Cake ✨`
5. Haz clic en **Save**

### Paso 3: Probar las plantillas
1. En cada plantilla, usa el botón **"Send test email"**
2. Ingresa tu email
3. Verifica que el diseño se vea correctamente
4. Prueba los enlaces

## Variables Disponibles

Las plantillas usan estas variables de Supabase:

- `{{ .ConfirmationURL }}` - URL completa de confirmación/acción
- `{{ .Token }}` - Token de confirmación
- `{{ .TokenHash }}` - Hash del token
- `{{ .SiteURL }}` - URL de tu sitio configurada en Supabase
- `{{ .Email }}` - Email del usuario

## Personalización

### Cambiar Colores
El gradiente principal usa:
- Color 1: `#667eea` (azul-morado)
- Color 2: `#764ba2` (morado)

Para cambiar, busca y reemplaza estos valores en las plantillas.

### Cambiar Logo/Emoji
Actualmente usa 🍰. Para cambiar:
1. Busca `🍰` en las plantillas
2. Reemplaza con tu emoji o texto preferido

### Agregar Logo de Imagen
Reemplaza:
```html
<h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
  🍰 DG Bakery Cake
</h1>
```

Con:
```html
<img src="URL_DE_TU_LOGO" alt="DG Bakery Cake" style="max-width: 200px; height: auto;">
```

## Compatibilidad

Las plantillas están optimizadas para:
- ✅ Gmail
- ✅ Outlook
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Dispositivos móviles
- ✅ Modo oscuro (parcial)

## Notas Importantes

1. **Estilos inline**: Los estilos están inline para máxima compatibilidad
2. **Tablas**: Se usan tablas para el layout (estándar en emails HTML)
3. **Ancho fijo**: 600px es el estándar para emails
4. **Sin JavaScript**: Los emails no soportan JavaScript
5. **Imágenes**: Si usas imágenes, hospédalas en un CDN público

## Soporte

Si necesitas ayuda con las plantillas o quieres personalizarlas más, consulta la documentación de Supabase:
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
