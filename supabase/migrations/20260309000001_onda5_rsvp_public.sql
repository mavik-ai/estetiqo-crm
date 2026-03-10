-- Onda 5 — RSVP público + preparações de serviço
-- Data: 2026-03-09

-- Adiciona campo de recomendações de preparo nos serviços
ALTER TABLE services ADD COLUMN IF NOT EXISTS preparation_notes TEXT;

-- Adiciona telefone e email na tabela de tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS email TEXT;

-- Adiciona campo de notas no agendamento (se não existir)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Onda 8 — Onboarding + dados do negócio (executar junto para simplicidade)
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS business_hours JSONB;

-- Garante que rsvp_token tem index para lookup rápido na página pública
CREATE INDEX IF NOT EXISTS idx_appointments_rsvp_token ON appointments(rsvp_token);
