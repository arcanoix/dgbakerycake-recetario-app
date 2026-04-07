-- ============================================
-- MIGRACIÓN: Añadir control de visibilidad de menú a los planes
-- ============================================
-- Agrega los campos de visibilidad del menú y control de acciones
-- al campo features (JSONB) de cada plan existente.
-- Los valores se aplican solo si la clave no existe ya en el registro.

-- Plan Gratuito (free): todos los menús visibles, sin PDF/analytics
UPDATE plans
SET features = features || '{
  "menu_dashboard": true,
  "menu_productos": true,
  "menu_recetas": true,
  "menu_precios": true,
  "menu_facturacion": true,
  "menu_perfil": true,
  "menu_configuracion": true,
  "menu_unidades": true,
  "crear_productos": true,
  "crear_recetas": true
}'::jsonb
WHERE name = 'free'
  AND NOT (features ? 'menu_dashboard');

-- Plan Básico: todos los menús visibles, PDF + analytics habilitados
UPDATE plans
SET features = features || '{
  "menu_dashboard": true,
  "menu_productos": true,
  "menu_recetas": true,
  "menu_precios": true,
  "menu_facturacion": true,
  "menu_perfil": true,
  "menu_configuracion": true,
  "menu_unidades": true,
  "crear_productos": true,
  "crear_recetas": true
}'::jsonb
WHERE name = 'basico'
  AND NOT (features ? 'menu_dashboard');

-- Plan Profesional: todos los menús visibles, funcionalidades avanzadas
UPDATE plans
SET features = features || '{
  "menu_dashboard": true,
  "menu_productos": true,
  "menu_recetas": true,
  "menu_precios": true,
  "menu_facturacion": true,
  "menu_perfil": true,
  "menu_configuracion": true,
  "menu_unidades": true,
  "crear_productos": true,
  "crear_recetas": true
}'::jsonb
WHERE name = 'profesional'
  AND NOT (features ? 'menu_dashboard');

-- Plan Empresarial: acceso total incluido panel admin
UPDATE plans
SET features = features || '{
  "menu_dashboard": true,
  "menu_productos": true,
  "menu_recetas": true,
  "menu_precios": true,
  "menu_facturacion": true,
  "menu_perfil": true,
  "menu_configuracion": true,
  "menu_unidades": true,
  "menu_admin": true,
  "crear_productos": true,
  "crear_recetas": true
}'::jsonb
WHERE name = 'empresarial'
  AND NOT (features ? 'menu_dashboard');
