-- ============================================
-- DIAGNOSTICAR Y CORREGIR PROBLEMA DE CONFIGURACIÓN
-- ============================================

-- 1. Verificar usuarios existentes
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Verificar configuraciones existentes
SELECT * FROM configuracion ORDER BY created_at DESC;

-- 3. Verificar si hay constraint UNIQUE en user_id
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'configuracion'::regclass;

-- 4. Eliminar configuraciones duplicadas si existen
DELETE FROM configuracion 
WHERE id NOT IN (
    SELECT MIN(id::text)::uuid
    FROM configuracion 
    GROUP BY user_id
);

-- 5. Insertar configuración para el usuario actual (forzar)
-- Primero eliminar si existe
DELETE FROM configuracion 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'gustavoh.2312@gmail.com');

-- Luego insertar nueva
INSERT INTO configuracion (user_id, costo_por_hora_defecto, moneda, margen_ganancia_defecto)
SELECT 
    id,
    10,
    'VES',
    30
FROM auth.users 
WHERE email = 'gustavoh.2312@gmail.com';

-- 6. Verificar que se creó
SELECT 
    c.*,
    u.email
FROM configuracion c
JOIN auth.users u ON c.user_id = u.id
WHERE u.email = 'gustavoh.2312@gmail.com';

SELECT 'Configuración creada manualmente. Recarga la página.' AS mensaje;
