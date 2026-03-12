-- Sistema de assinaturas multi-status: trial, active, courtesy, grace, expired
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial'
    CHECK (subscription_status IN ('trial','active','courtesy','grace','expired')),
  ADD COLUMN IF NOT EXISTS grace_ends_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS courtesy_days       INTEGER,   -- -1 = infinito, >0 = X dias
  ADD COLUMN IF NOT EXISTS courtesy_starts_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS courtesy_note       TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Garante que tenants existentes tenham status definido
UPDATE tenants
SET subscription_status = 'trial'
WHERE subscription_status IS NULL;

COMMENT ON COLUMN tenants.subscription_status   IS 'trial | active | courtesy | grace | expired';
COMMENT ON COLUMN tenants.courtesy_days         IS '-1 = acesso infinito; >0 = X dias a partir de courtesy_starts_at';
COMMENT ON COLUMN tenants.grace_ends_at         IS 'Prazo da carência (ex: cancela agente IA → 7 dias)';
