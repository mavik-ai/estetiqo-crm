-- Adiciona campo email na tabela clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT;
