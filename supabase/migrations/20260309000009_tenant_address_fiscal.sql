-- Endereço da clínica
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS cep           TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logradouro    TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS numero        TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS complemento   TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS bairro        TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS cidade        TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS estado        TEXT;

-- Dados fiscais (para emissão de NFS-e)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS inscricao_municipal TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS regime_tributario   TEXT
  CHECK (regime_tributario IN ('simples_nacional', 'lucro_presumido', 'lucro_real', 'mei', 'isento'));
