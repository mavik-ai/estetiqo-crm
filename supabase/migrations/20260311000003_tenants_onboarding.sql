-- Controle de onboarding por tenant
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN tenants.onboarding_completed_at IS 'NULL = onboarding pendente; data = onboarding concluído';
