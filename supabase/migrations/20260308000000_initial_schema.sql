-- ============================================
-- MULTI-TENANCY
-- ============================================

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'operator')),
  avatar_initials TEXT,
  allowed_modules JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTES (PACIENTES)
-- ============================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  sex TEXT,
  phone TEXT,
  address TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  smoker BOOLEAN DEFAULT FALSE,
  allergy BOOLEAN DEFAULT FALSE,
  pregnancy BOOLEAN DEFAULT FALSE,
  heart_disease BOOLEAN DEFAULT FALSE,
  anemia BOOLEAN DEFAULT FALSE,
  depression BOOLEAN DEFAULT FALSE,
  hypertension BOOLEAN DEFAULT FALSE,
  previous_aesthetic_treatment BOOLEAN DEFAULT FALSE,
  herpes BOOLEAN DEFAULT FALSE,
  keloid BOOLEAN DEFAULT FALSE,
  diabetes BOOLEAN DEFAULT FALSE,
  hepatitis BOOLEAN DEFAULT FALSE,
  hiv BOOLEAN DEFAULT FALSE,
  skin_disease BOOLEAN DEFAULT FALSE,
  cancer BOOLEAN DEFAULT FALSE,
  contraceptive BOOLEAN DEFAULT FALSE,
  other_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SERVIÇOS
-- ============================================

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2),
  duration_minutes INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SALAS
-- ============================================

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- PROTOCOLOS
-- ============================================

CREATE TABLE protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  total_sessions INTEGER NOT NULL,
  completed_sessions INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  target_weight DECIMAL(5,2),
  expected_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID REFERENCES protocols(id) ON DELETE CASCADE,
  appointment_id UUID, -- Will define foreign key later to avoid circular logic
  session_number INTEGER NOT NULL,
  procedure_notes TEXT,
  abs_cm DECIMAL(5,1),
  abi_cm DECIMAL(5,1),
  weight_kg DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AGENDAMENTOS
-- ============================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  service_id UUID REFERENCES services(id),
  protocol_id UUID REFERENCES protocols(id),
  room_id UUID REFERENCES rooms(id),
  professional_id UUID REFERENCES users(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'noresponse', 'cancelled')),
  rsvp_token TEXT UNIQUE,
  rsvp_sent_at TIMESTAMPTZ,
  rsvp_responded_at TIMESTAMPTZ,
  gcal_event_id TEXT,
  is_block BOOLEAN DEFAULT FALSE,
  no_show BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resolve cyclic dependency between sessions and appointments
ALTER TABLE sessions ADD CONSTRAINT fk_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id);

-- ============================================
-- RSVP
-- ============================================

CREATE TABLE rsvp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('confirmed', 'reschedule', 'cancelled')),
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

-- ============================================
-- ASSINATURAS DIGITAIS
-- ============================================

CREATE TABLE digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('initial_assessment', 'protocol_start', 'session')),
  session_id UUID REFERENCES sessions(id),
  authorization_text TEXT NOT NULL,
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- ============================================
-- FOTOS
-- ============================================

CREATE TABLE session_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('before', 'after', 'during')),
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ATIVIDADE / LOGS
-- ============================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_appointments_tenant_date ON appointments(tenant_id, starts_at);
CREATE INDEX idx_appointments_rsvp_token ON appointments(rsvp_token);
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_protocols_client ON protocols(client_id);
CREATE INDEX idx_sessions_protocol ON sessions(protocol_id);
CREATE INDEX idx_activity_tenant ON activity_log(tenant_id, created_at DESC);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
