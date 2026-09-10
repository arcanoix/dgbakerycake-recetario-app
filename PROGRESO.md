# 📊 Estado del Proyecto — DGcost

**Última actualización**: 1 de septiembre de 2026
**Estado de la plataforma**: **BETA · ACCESO ANTICIPADO**

---

## ✅ Producto disponible

### Operación del negocio
- Gestión de productos, presentaciones, unidades y categorías.
- Costeo de recetas, mermas, mano de obra y gastos fijos.
- Inventario con alertas y movimientos asociados a producción y ventas.
- Gestión de ventas, pedidos y clientes.
- Dashboard con métricas, comparativas y gráficos de rentabilidad.
- Visualización dual de USD y bolívares con tasa BCV configurable.

### Plataforma
- Autenticación con Supabase y soporte multi-tenant.
- Roles de usuario y controles de acceso por plan.
- Suscripciones, planes y límites de uso.
- Panel administrativo para gestión de planes y contenido del blog.
- Landing pública, blog, términos, privacidad y mantenimiento.
- API routes con rate limiting y tareas cron autenticadas.
- Pruebas unitarias con Jest y pruebas E2E con Playwright.

---

## 🚧 Pendientes priorizados

### Seguridad y estabilidad
1. **#19 — Auditoría de Row Level Security (RLS) en Supabase**
   - Revisar políticas por tabla y validar el aislamiento entre tenants.
2. **Restaurar el flujo de lint local**
   - La migración a Next.js 16 requiere usar ESLint CLI en lugar de `next lint`.
   - El directorio `node_modules` debe pertenecer al usuario de desarrollo para reinstalar dependencias correctamente.

### Funcionalidades de producto
3. **#51 — Cargar recetas desde una fotografía**
4. **#33 — Módulo API REST con autenticación mediante API key y secret**
5. **#14 — Integrar IA como funcionalidad Premium**
6. Completar la demostración guiada de la landing, actualmente marcada como próxima.

### Producto y marca
7. **#9 — Actualizar el footer con créditos de la empresa desarrolladora**
8. La aplicación móvil sigue planificada como proyecto independiente; su alcance está documentado en `MOBILE-APP-README.md`.

---

## 🎯 Siguiente foco recomendado

1. Completar la auditoría RLS antes de ampliar integraciones externas o IA.
2. Corregir el entorno de lint y mantener TypeScript como verificación obligatoria.
3. Definir el alcance de la carga de recetas desde fotografía para la etapa Beta.
4. Recoger feedback de usuarios de acceso anticipado y priorizar mejoras de flujo.

---

## 🔗 Referencias

- **Desarrollo**: `http://localhost:3000`
- **Repositorio**: `https://github.com/arcanoix/dgbakerycake-recetario-app`
- **Aplicación móvil**: `MOBILE-APP-README.md` (proyecto independiente)
