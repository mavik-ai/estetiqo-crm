-- Adiciona campo de intervalo recomendado entre sessões nos protocolos
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS interval_days INTEGER;

COMMENT ON COLUMN protocols.interval_days IS 'Intervalo recomendado em dias entre sessões. Nulo = sem restrição.';
