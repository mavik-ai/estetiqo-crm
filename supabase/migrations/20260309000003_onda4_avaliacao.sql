-- Onda 4 — Ficha de Avaliação (Anamnese completa + medidas + objetivos)
-- Data: 2026-03-09

-- Adiciona campos de medidas e objetivos na ficha de saúde
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2);
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS abs_cm    DECIMAL(5,1);
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS abi_cm    DECIMAL(5,1);
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS aesthetic_notes TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS objectives       TEXT;
