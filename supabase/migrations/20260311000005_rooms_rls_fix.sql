-- Fix: RLS policy para usuários autenticados na tabela rooms
-- A tabela tinha RLS habilitado mas sem policy para authenticated (apenas anon para RSVP público)
CREATE POLICY "room_tenant_access"
  ON rooms FOR ALL
  TO authenticated
  USING (tenant_id = get_user_tenant_id());
