-- Onda 7: Fluxo de sessão completo (fotos + peso antes/depois + assinatura)

-- Separar peso em antes/depois na sessão
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS weight_before_kg DECIMAL(5,2);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS weight_after_kg DECIMAL(5,2);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS performed_at TIMESTAMPTZ DEFAULT NOW();

-- Notas no agendamento (usado no QuickCreateModal)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;

-- RLS para session_photos
ALTER TABLE session_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_session_photos_select" ON session_photos
  FOR SELECT USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN protocols p ON p.id = s.protocol_id
      JOIN users u ON u.tenant_id = p.tenant_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "tenant_session_photos_insert" ON session_photos
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN protocols p ON p.id = s.protocol_id
      JOIN users u ON u.tenant_id = p.tenant_id
      WHERE u.id = auth.uid()
    )
  );
