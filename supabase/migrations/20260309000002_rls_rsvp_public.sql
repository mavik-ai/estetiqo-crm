-- RLS policies para acesso público à página RSVP
-- Permite lookup sem autenticação via rsvp_token
-- Data: 2026-03-09

-- Appointments: anon pode SELECT pelo rsvp_token
CREATE POLICY "rsvp_public_select"
  ON appointments FOR SELECT
  TO anon
  USING (rsvp_token IS NOT NULL);

-- Appointments: anon pode UPDATE o rsvp_status pelo rsvp_token
CREATE POLICY "rsvp_public_update_status"
  ON appointments FOR UPDATE
  TO anon
  USING (rsvp_token IS NOT NULL)
  WITH CHECK (rsvp_token IS NOT NULL);

-- RSVP responses: anon pode INSERT (log de resposta)
CREATE POLICY "rsvp_public_insert_response"
  ON rsvp_responses FOR INSERT
  TO anon
  WITH CHECK (true);

-- Clients: anon pode SELECT nome via tenant appointment (para mostrar na página)
CREATE POLICY "rsvp_public_client_name"
  ON clients FOR SELECT
  TO anon
  USING (id IN (
    SELECT client_id FROM appointments WHERE rsvp_token IS NOT NULL
  ));

-- Services: anon pode SELECT nome e preparation_notes
CREATE POLICY "rsvp_public_service_info"
  ON services FOR SELECT
  TO anon
  USING (id IN (
    SELECT service_id FROM appointments WHERE rsvp_token IS NOT NULL
  ));

-- Rooms: anon pode SELECT nome
CREATE POLICY "rsvp_public_room_name"
  ON rooms FOR SELECT
  TO anon
  USING (id IN (
    SELECT room_id FROM appointments WHERE rsvp_token IS NOT NULL AND room_id IS NOT NULL
  ));

-- Tenants: anon pode SELECT nome e phone para o footer
CREATE POLICY "rsvp_public_tenant_info"
  ON tenants FOR SELECT
  TO anon
  USING (id IN (
    SELECT tenant_id FROM appointments WHERE rsvp_token IS NOT NULL
  ));
