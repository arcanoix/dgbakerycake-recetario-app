# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu aplicación DG Bakery Cake en Vercel.

---

## 📋 Pre-requisitos

- Cuenta en [Vercel](https://vercel.com)
- Repositorio de GitHub con el código del proyecto
- Node.js 18+ instalado localmente (para pruebas)

---

## 🔧 Paso 1: Preparar el Repositorio

Asegúrate de que todos los cambios estén commiteados y pusheados a GitHub:

```bash
git add -A
git commit -m "Preparar para despliegue en Vercel"
git push origin main
```

---

## 🌐 Paso 2: Importar Proyecto en Vercel

### Opción A: Desde la Web de Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New Project"**
3. Selecciona **"Import Git Repository"**
4. Busca y selecciona tu repositorio: `dgbakerycake-recetario-app`
5. Vercel detectará automáticamente que es un proyecto Next.js

### Opción B: Usando Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Iniciar sesión
vercel login

# Desplegar
vercel
```

---

## ⚙️ Paso 3: Configuración del Proyecto

En la página de configuración de Vercel:

### **Framework Preset**
- Seleccionar: **Next.js**

### **Build Settings**
- **Build Command**: `npm run build` (detectado automáticamente)
- **Output Directory**: `.next` (detectado automáticamente)
- **Install Command**: `npm install` (detectado automáticamente)

### **Root Directory**
- Dejar en blanco (raíz del proyecto)

### **Node.js Version**
- Seleccionar: **18.x** o superior

---

## 🔐 Paso 4: Variables de Entorno

Esta aplicación **NO requiere variables de entorno** ya que utiliza localStorage para persistencia.

Si en el futuro agregas una base de datos o API externa:

1. Ve a **Settings** → **Environment Variables**
2. Agrega las variables necesarias
3. Redeploy el proyecto

---

## 🚀 Paso 5: Desplegar

1. Click en **"Deploy"**
2. Espera a que Vercel construya y despliegue tu aplicación (2-3 minutos)
3. Una vez completado, recibirás una URL de producción

**URL de ejemplo**: `https://dgbakerycake-costo-app.vercel.app`

---

## 🔄 Paso 6: Configuración de Dominio (Opcional)

Si tienes un dominio personalizado:

1. Ve a **Settings** → **Domains**
2. Click en **"Add Domain"**
3. Ingresa tu dominio (ej: `dgbakery.com`)
4. Sigue las instrucciones para configurar los DNS

---

## 🔁 Despliegues Automáticos (CI/CD)

Vercel configura automáticamente CI/CD:

- **Cada push a `main`** → Despliega a producción
- **Cada push a otras ramas** → Crea preview deployment
- **Cada Pull Request** → Crea preview deployment

### Configurar Branch de Producción

1. Ve a **Settings** → **Git**
2. En **Production Branch**, selecciona `main`

---

## 📊 Paso 7: Monitoreo y Analytics

### Ver Despliegues
- Ve a **Deployments** para ver historial
- Click en cualquier despliegue para ver logs

### Analytics (Opcional)
1. Ve a **Analytics**
2. Habilita Vercel Analytics para métricas de rendimiento

---

## 🐛 Solución de Problemas

### Error: Build Failed

**Verificar**:
```bash
# Probar build localmente
npm run build

# Si falla, revisar errores en consola
```

### Error: Module Not Found

**Solución**:
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: Environment Variables

**Verificar**:
- Esta app no requiere variables de entorno
- Si agregaste alguna, verifica que esté en Vercel Settings

---

## 🔧 Comandos Útiles de Vercel CLI

```bash
# Ver logs en tiempo real
vercel logs

# Listar despliegues
vercel ls

# Promover un deployment a producción
vercel promote [deployment-url]

# Eliminar un deployment
vercel remove [deployment-url]

# Ver información del proyecto
vercel inspect
```

---

## 📱 Probar el Despliegue

Una vez desplegado, prueba:

1. ✅ Navegación entre páginas
2. ✅ Crear productos
3. ✅ Crear recetas
4. ✅ Cambiar configuración
5. ✅ Responsive en móvil
6. ✅ Persistencia de datos (localStorage)

---

## 🔒 Seguridad

### Recomendaciones:

- ✅ El repositorio es privado
- ✅ No hay API keys expuestas
- ✅ localStorage es seguro para datos no sensibles
- ⚠️ Para datos sensibles, considera usar una base de datos

---

## 📈 Optimizaciones Post-Despliegue

### Performance
- Vercel optimiza automáticamente imágenes
- Edge caching habilitado por defecto
- Compresión Gzip/Brotli automática

### SEO
- Metadata configurada en `layout.tsx`
- Títulos descriptivos en cada página

---

## 🎉 ¡Listo!

Tu aplicación está desplegada y lista para usar en producción.

**URL de Producción**: `https://[tu-proyecto].vercel.app`

---

## 📞 Soporte

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Comunidad de Vercel](https://github.com/vercel/vercel/discussions)
