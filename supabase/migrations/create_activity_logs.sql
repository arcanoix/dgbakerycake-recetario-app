-- ============================================================
-- Activity Logs System
-- ============================================================

-- 1. Tabla activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,           -- create | update | delete | login | logout | view
  module        TEXT NOT NULL,           -- recetas | productos | auth | configuracion | etc.
  description   TEXT,
  entity_id     TEXT,
  entity_name   TEXT,
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id    ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_module     ON activity_logs(module);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action     ON activity_logs(action);

-- 2. RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_activity_logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "users_insert_own_activity_logs"
  ON activity_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 3. Function: get_activity_logs_with_user_info
CREATE OR REPLACE FUNCTION get_activity_logs_with_user_info(
  p_limit   INT     DEFAULT 200,
  p_offset  INT     DEFAULT 0,
  p_user_id UUID    DEFAULT NULL,
  p_module  TEXT    DEFAULT NULL,
  p_action  TEXT    DEFAULT NULL
)
RETURNS TABLE (
  id          UUID,
  user_id     UUID,
  email       TEXT,
  action      TEXT,
  module      TEXT,
  description TEXT,
  entity_id   TEXT,
  entity_name TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    au.email::TEXT,
    al.action,
    al.module,
    al.description,
    al.entity_id,
    al.entity_name,
    al.ip_address,
    al.user_agent,
    al.created_at
  FROM activity_logs al
  LEFT JOIN auth.users au ON au.id = al.user_id
  WHERE
    (p_user_id IS NULL OR al.user_id = p_user_id)
    AND (p_module IS NULL OR al.module = p_module)
    AND (p_action IS NULL OR al.action = p_action)
  ORDER BY al.created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$;
