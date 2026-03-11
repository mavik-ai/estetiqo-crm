-- Expande campos de endereço na tabela clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS logradouro TEXT,
  ADD COLUMN IF NOT EXISTS numero     TEXT,
  ADD COLUMN IF NOT EXISTS complemento TEXT,
  ADD COLUMN IF NOT EXISTS bairro     TEXT,
  ADD COLUMN IF NOT EXISTS cidade     TEXT,
  ADD COLUMN IF NOT EXISTS uf         CHAR(2);

COMMENT ON COLUMN clients.logradouro  IS 'Rua / Avenida / etc — preenchido automaticamente via ViaCEP';
COMMENT ON COLUMN clients.numero      IS 'Número do imóvel';
COMMENT ON COLUMN clients.complemento IS 'Apto, bloco, sala, etc';
COMMENT ON COLUMN clients.bairro      IS 'Bairro — preenchido automaticamente via ViaCEP';
COMMENT ON COLUMN clients.cidade      IS 'Cidade — preenchido automaticamente via ViaCEP';
COMMENT ON COLUMN clients.uf          IS 'UF (2 letras) — preenchido automaticamente via ViaCEP';
