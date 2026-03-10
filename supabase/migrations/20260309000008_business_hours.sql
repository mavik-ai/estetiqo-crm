-- Tabela de horários de funcionamento por dia da semana
CREATE TABLE IF NOT EXISTS business_hours (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open      BOOLEAN NOT NULL DEFAULT true,
  open_time    TIME NOT NULL DEFAULT '08:00',
  close_time   TIME NOT NULL DEFAULT '18:00',
  UNIQUE(tenant_id, day_of_week)
);

ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON business_hours
  FOR ALL USING (tenant_id = get_user_tenant_id());
