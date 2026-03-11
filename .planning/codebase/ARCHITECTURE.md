# Architecture

## Pattern Overview

Estetiqo CRM is a full-stack SaaS application with a **multi-tenant architecture** running on Next.js 15 (frontend), FastAPI (backend), and Supabase/PostgreSQL (database).

**Core Pattern:** Server Components + Server Actions on frontend, with FastAPI handling WhatsApp integration and external services (Evolution API, N8N).

**Deployment:** Vercel (frontend) + Supabase Cloud (database) + Docker (backend for Evolution API webhooks).

---

## Frontend Architecture (Next.js App Router)

### Tech Stack
- **Framework:** Next.js 15 (Server Components default)
- **Authentication:** Supabase Auth (JWT via cookies)
- **Styling:** Tailwind CSS v4 + custom CSS variables
- **Forms:** React with Server Actions (no external form libs)
- **UI Components:** Custom + shadcn-based (card, button, input, label, table, avatar, badge)
- **Icons:** Lucide React (18px stroke)
- **Toast Notifications:** Sonner
- **Email:** Resend (SDK integration)

### File Organization
```
frontend/src/
├── app/
│   ├── layout.tsx                   (Root: fonts, ThemeProvider)
│   ├── (auth)/                      (Auth layout group)
│   │   ├── login/page.tsx
│   │   ├── esqueceu-senha/page.tsx
│   │   ├── primeiro-acesso/page.tsx
│   │   ├── redefinir-senha/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/                 (Protected layout group + parallel slots)
│   │   ├── layout.tsx               (Main authenticated wrapper)
│   │   ├── @modal/                  (Parallel route: modals)
│   │   ├── page.tsx                 (Dashboard home)
│   │   ├── agenda/                  (Schedule module)
│   │   ├── clientes/                (Clients module)
│   │   ├── protocolos/              (Protocols module)
│   │   ├── servicos/                (Services module)
│   │   ├── salas/                   (Rooms module)
│   │   ├── relatorios/              (Reports)
│   │   ├── config/                  (Settings)
│   │   │   ├── page.tsx             (Settings home)
│   │   │   ├── perfil/              (User profile)
│   │   │   ├── clinica/             (Business info)
│   │   │   ├── agenda/              (Business hours)
│   │   │   ├── salas/               (Rooms config)
│   │   │   └── whatsapp/            (WhatsApp integration)
│   │   ├── bem-vindo/               (Onboarding)
│   │   └── rsvp/                    (RSVP admin view)
│   ├── admin/                       (Admin superadmin routes)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── clinicas/
│   │   └── planos/
│   ├── c/[token]/                   (Public: client RSVP page)
│   └── auth/callback/               (Supabase callback)
├── components/
│   ├── ui/                          (Reusable primitives)
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── ThemeProvider.tsx        (Light-only forced)
│   │   ├── SignatureCanvas.tsx      (Digital signature capture)
│   │   ├── SessionPhotosModal.tsx
│   │   ├── ClienteSearch.tsx
│   │   ├── InterceptingModal.tsx    (Parallel route helper)
│   │   ├── PasswordInput.tsx
│   │   └── SavedToast.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx              (Navigation + user menu)
│   │   └── Topbar.tsx               (Header + notifications)
│   ├── dashboard/
│   │   ├── DashboardMetrics.tsx     (KPI cards: appointments, clients, etc.)
│   │   ├── AppointmentTable.tsx     (Today's schedule)
│   │   ├── AppointmentActions.tsx   (CRUD actions on appointments)
│   │   ├── RecentActivity.tsx       (Activity feed)
│   │   ├── PopularServices.tsx      (Service rankings)
│   │   ├── OnboardingBanner.tsx     (Setup completion banner)
│   │   └── QuickCreateModal.tsx     (Quick appointment creation)
│   └── clientes/
│       ├── ClientesTable.tsx        (Main clients list, Client Component)
│       ├── ClienteNovoForm.tsx      (New client form)
│       ├── ClienteFichaClient.tsx   (Client detail view)
│       ├── ClienteFichaView.tsx     (Protocols + sessions view)
│       └── ExcluirClienteButton.tsx (Delete action)
└── utils/
    └── supabase/
        ├── client.ts                (Client-side Supabase instance)
        ├── server.ts                (Server-side Supabase instance)
        ├── middleware.ts            (Auth + session refresh)
        └── admin.ts                 (Admin operations, if needed)
```

### Authentication Flow
1. **Middleware** (`middleware.ts`) intercepts all requests and validates JWT via `updateSession()`
2. **Unauthenticated users** redirected to `/login`
3. **Login** → Supabase Auth (email/password, magic link, OAuth)
4. **Dashboard Layout** (`(dashboard)/layout.tsx`) calls `createClient()` server-side:
   - Fetches `user` from auth
   - Fetches `profile` from users table (name, role, tenant_id)
   - Fetches pending appointments (RSVP notifications)
5. **Session tokens** stored in secure httpOnly cookies, auto-refreshed by middleware
6. **User.role** checked: superadmin → `/admin`, admin/operator → `/dashboard`

### Page Structure Pattern
- **Server Components** by default (fetch data, render async)
- **Client Components** (`'use client'`) only for interactivity:
  - Forms with `useTransition` + Server Actions
  - Modals, dropdowns, client-side state
  - Sidebar, Topbar (nav interactions)
- **Server Actions** (`'use server'`) in `/actions.ts` files:
  - Mutations (create, update, delete)
  - Auto-capture `tenant_id` from user context
  - Validation + error handling → redirect or return response
  - Example: `frontend/src/app/(dashboard)/clientes/novo/actions.ts`

### Data Flow: Server Actions Pattern
```
Client Component (form)
  └─> submitAction(formData)
       └─> Server Action (createClient)
            ├─> createClient() fetches user & tenant_id
            ├─> Validates formData
            ├─> Insert to Supabase (clients + health_records)
            └─> redirect('/clientes/[id]')
```

### Design System
- **Colors (CSS variables):**
  - Background: `#F6F2EA` (light cream)
  - Card: `#FFFFFF`
  - Primary: `#B8960C` (gold)
  - Border: `#EDE5D3` (subtle)
  - Text: `#2D2319` (dark brown)
  - Muted: `#A69060` (warm gray)
- **Fonts:** Playfair Display (titles, 400-700), Urbanist (body, 300-900)
- **Icons:** Sparkles (services), Wand2 (shortcuts), Calendar, Users, FileText, Settings, BarChart3
- **Dark mode:** DISABLED (forcedTheme="light" in ThemeProvider)

### Parallel Routes (Modals)
- Uses `@modal` slot in `(dashboard)` layout
- Intercepting routes: `(.)clientes/novo`, `(.)clientes/[id]/editar`, `(.)clientes/[id]`
- Client modals can show forms without full page navigation
- Example: `frontend/src/app/(dashboard)/@modal/(.)clientes/novo/page.tsx`

### Key Components & Usage

#### DashboardMetrics.tsx
- Shows: Appointments (today), Clients (active), Protocols (active), Services count
- Data fetched server-side in dashboard `page.tsx`
- Passed as props to component

#### AppointmentTable.tsx
- **Client Component** (interactive)
- Shows appointments for selected date range
- Status badges: `pending`, `confirmed`, `cancelled` (no `noresponse`)
- Actions: RSVP, reschedule, cancel, notes
- Calls `agendaActions.ts` Server Actions

#### ClientesTable.tsx
- **Client Component** (interactive list)
- Click row → bottom sheet modal with: Ver ficha | Editar | Excluir
- Uses `ClienteFichaClient.tsx` for detail view
- `@modal` routes for edit/view in intercepting modals

#### ClienteFichaView.tsx
- Displays all protocols + sessions for a client
- Shows: Protocol name, sessions count, status, action buttons
- Links to: session detail, add new session

---

## Backend Architecture (FastAPI)

### Tech Stack
- **Framework:** FastAPI (async, typed)
- **Async:** Python 3.9+
- **Database:** Supabase SDK (async queries via Python)
- **WhatsApp:** Evolution API (webhook receiver)
- **Workflow Automation:** N8N (API calls for messaging sequences)
- **CORS:** Configured for Vercel frontend + local dev

### File Organization
```
backend/app/
├── main.py                         (FastAPI app, middleware, routes)
├── api/
│   └── v1/
│       ├── router.py               (Route aggregator)
│       └── endpoints/
│           ├── dashboard.py        (Dashboard metrics API)
│           ├── whatsapp.py         (WhatsApp webhooks + actions)
│           ├── whatsapp_config.py  (Instance management)
│           └── n8n.py              (N8N trigger endpoints)
├── services/
│   └── evolution_api.py            (WhatsApp Evolution API client)
├── core/
│   ├── config.py                   (Settings from .env)
│   └── security.py                 (JWT validation, if needed)
├── schemas/
│   └── (data validation models)
├── crud/
│   └── (database operations, if any)
└── models/
    └── (SQLAlchemy models, if used)
```

### Key Endpoints

#### Dashboard (`/api/v1/dashboard`)
- `GET /metrics` → KPIs (appointments today, clients, revenue, etc.)
- Data queried from Supabase, formatted for frontend

#### WhatsApp Config (`/api/v1/whatsapp/config`)
- `POST /instance/create` → Create Evolution API instance
- `GET /instance/status` → Get QR code, connection status
- `GET /instances` → List all instances for tenant

#### WhatsApp Messages (`/api/v1/whatsapp`)
- `POST /send` → Send RSVP message to client
- `POST /webhook` → Receive message confirmations, client responses
- `POST /confirm-appointment` → Process RSVP from message

#### N8N Triggers (`/api/v1/n8n`)
- `POST /trigger` → Call N8N workflow (message sequences, agent-based actions)
- Used for: Appointment reminders, follow-ups, cancellation flows

### Middleware & Security
- **CORS:** `http://localhost:3000` (dev), `https://estetiqo.com.br` (prod)
- **Rate Limiting:** 60 requests per 60 seconds per IP (in-memory)
- **Security Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`
- **Docs:** `/docs` only in DEBUG mode (off in production)

### Service: Evolution API Integration
- Location: `backend/app/services/evolution_api.py`
- Handles:
  - Create/list WhatsApp instances
  - QR code generation for pairing
  - Send messages (text, media)
  - Webhook registration for message webhooks
- Config: `EVOLUTION_API_URL`, `EVOLUTION_API_TOKEN` from .env

### Data Flow: Appointment RSVP via WhatsApp
```
1. Admin creates appointment in dashboard
   → Trigger: N8N workflow (Resend email + Evolution API send message)

2. Client receives WhatsApp message with RSVP link
   → Message triggers Evolution webhook

3. Client clicks RSVP link in message
   → Opens frontend `/c/[token]` public page

4. Client submits RSVP response (confirm/cancel)
   → Frontend calls Server Action (updateAppointmentRSVP)
   → Updates appointments.rsvp_status, records response in rsvp_responses

5. (Optional) Webhook confirms delivery back to Evolution API
   → Log recorded in N8N / activity_log
```

---

## Database Layer (Supabase/PostgreSQL)

### Multi-Tenancy Model
- **tenants** table: Base unit (clinic)
- **users** table: Has `tenant_id` FK, role (superadmin/admin/operator)
- **Row Level Security (RLS):** All tables filtered by `tenant_id` for data isolation

### Core Tables

#### tenants
```sql
id (UUID PK)
name TEXT
slug TEXT UNIQUE
plan TEXT ('trial' | 'basic' | 'pro' | 'premium')
trial_ends_at TIMESTAMPTZ
stripe_customer_id TEXT
created_at TIMESTAMPTZ
```

#### users
```sql
id (UUID PK) — synced with auth.users
tenant_id (UUID FK → tenants)
email TEXT UNIQUE
name TEXT
role TEXT ('superadmin' | 'admin' | 'operator')
avatar_initials TEXT
must_change_password BOOLEAN (for onboarding)
created_at TIMESTAMPTZ
```

#### clients
```sql
id (UUID PK)
tenant_id (UUID FK)
name TEXT
birth_date DATE
sex TEXT
phone TEXT
email TEXT (added in Onda 5)
address TEXT
cep TEXT (added in Onda 7)
rating INTEGER (1-5, starts at 1, renamed to "Potencial da cliente")
created_at TIMESTAMPTZ
```

#### services
```sql
id (UUID PK)
tenant_id (UUID FK)
name TEXT
price DECIMAL(10,2)
duration_minutes INTEGER
image_url TEXT (for service photos)
preparation_notes TEXT (special instructions)
active BOOLEAN
created_at TIMESTAMPTZ
```

#### protocols
```sql
id (UUID PK)
tenant_id (UUID FK)
client_id (UUID FK)
service_id (UUID FK)
total_sessions INTEGER
completed_sessions INTEGER
status TEXT ('active' | 'completed' | 'cancelled')
target_weight DECIMAL(5,2)
expected_end_date DATE
created_at TIMESTAMPTZ
```

#### appointments
```sql
id (UUID PK)
tenant_id (UUID FK)
client_id (UUID FK)
service_id (UUID FK)
protocol_id (UUID FK)
room_id (UUID FK)
professional_id (UUID FK → users)
starts_at TIMESTAMPTZ
ends_at TIMESTAMPTZ
rsvp_status TEXT ('pending' | 'confirmed' | 'cancelled') — no 'noresponse'
rsvp_token TEXT UNIQUE (for public RSVP link)
rsvp_sent_at TIMESTAMPTZ
rsvp_responded_at TIMESTAMPTZ
gcal_event_id TEXT (Google Calendar integration)
is_block BOOLEAN (time blocker for unavailability)
no_show BOOLEAN (client didn't show up)
created_at TIMESTAMPTZ
```

#### sessions
```sql
id (UUID PK)
protocol_id (UUID FK)
appointment_id (UUID FK)
session_number INTEGER
procedure_notes TEXT (notes from Onda 7, Step 1)
abs_cm DECIMAL(5,1) (before measurements)
abi_cm DECIMAL(5,1)
weight_kg DECIMAL(5,2)
created_at TIMESTAMPTZ
```

#### rsvp_responses (for audit)
```sql
id (UUID PK)
appointment_id (UUID FK)
token TEXT
action TEXT ('confirmed' | 'reschedule' | 'cancelled')
responded_at TIMESTAMPTZ
ip_address TEXT
```

#### business_hours (Onda 5: Window configuration)
```sql
id (UUID PK)
tenant_id (UUID FK)
day_of_week INTEGER (0-6)
start_time TIME
end_time TIME
is_available BOOLEAN
created_at TIMESTAMPTZ
```

#### health_records
```sql
id (UUID PK)
client_id (UUID FK)
smoker, allergy, pregnancy, heart_disease, anemia, depression, hypertension BOOLEAN
previous_aesthetic_treatment BOOLEAN
herpes, keloid, diabetes, hepatitis, hiv, skin_disease, cancer BOOLEAN
contraceptive BOOLEAN
other_conditions TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

#### digital_signatures
```sql
id (UUID PK)
tenant_id (UUID FK)
client_id (UUID FK)
type TEXT ('initial_assessment' | 'protocol_start' | 'session')
session_id (UUID FK, optional)
authorization_text TEXT (form text that was signed)
signature_data TEXT (PNG/SVG canvas data)
signed_at TIMESTAMPTZ
ip_address TEXT
user_agent TEXT
```

#### session_photos
```sql
id (UUID PK)
session_id (UUID FK)
storage_path TEXT (Supabase Storage path)
photo_type TEXT ('before' | 'after' | 'during')
captured_at TIMESTAMPTZ
```

#### activity_log (audit trail)
```sql
id (UUID PK)
tenant_id (UUID FK)
user_id (UUID FK)
action TEXT ('create_client' | 'update_appointment' | 'cancel_appointment' | etc.)
entity_type TEXT ('client' | 'appointment' | 'protocol' | etc.)
entity_id UUID
changes JSONB (before/after if needed)
created_at TIMESTAMPTZ
```

### Row Level Security (RLS)
- All user-facing queries: `WHERE tenant_id = (auth.jwt() -> 'custom_claims' ->> 'tenant_id')`
- Public RSVP page (`/c/[token]`): SELECT from `appointments` WHERE `rsvp_token = token` (no auth required)
- Admin queries: Superadmin can query multiple tenants via `user.role = 'superadmin'`

### Migrations
```
supabase/migrations/
├── 20260308000000_initial_schema.sql          (Core tables)
├── 20260309000001_onda5_rsvp_public.sql       (Public RSVP table)
├── 20260309000002_rls_rsvp_public.sql         (RLS for public)
├── 20260309000003_onda4_avaliacao.sql         (Evaluation forms)
├── 20260309000006_add_client_email.sql        (Email field)
├── 20260309000007_sessao_completa.sql         (Session complete form)
├── 20260309000008_business_hours.sql          (Operating hours)
├── 20260309000009_tenant_address_fiscal.sql   (Fiscal address)
└── 20260309000010_services_image_tenant_logo.sql (Media fields)
```

---

## Auth Flow

### User Registration (First Access)
1. Superadmin creates user in `/admin/clinicas`
2. Sends invite email (Resend) with temporary password + first-access link
3. User lands on `/primeiro-acesso` with token
4. Sets new password → Supabase creates auth user + sets `must_change_password = false`
5. Redirected to `/` (dashboard home)

### Session Management
1. Login page (`/login`) → Email + password
2. Supabase Auth returns JWT token
3. Token stored in httpOnly cookie by middleware
4. Every request: Middleware calls `supabase.auth.getUser()` to validate JWT
5. If expired: Middleware auto-refreshes via `updateSession()`
6. If invalid: User redirected to `/login`

### Multi-Tenant Isolation
1. User signs in → JWT contains `user_id` + custom claim `tenant_id`
2. Server Actions fetch `user.tenant_id` from users table
3. All queries: `WHERE tenant_id = user.tenant_id` (implicit filtering)
4. No cross-tenant data leakage possible

---

## Data Flow (Server Actions Pattern)

### Example: Create Appointment
```
Flow:
1. Dashboard → Agenda Novo button
2. Opens form component (Client Component, interactive)
3. Form submits → Server Action: criarAgendamento()
4. Server Action:
   a. Get authenticated user
   b. Fetch user.tenant_id
   c. Validate form inputs
   d. Insert to appointments table (includes tenant_id)
   e. Trigger N8N webhook (send RSVP message to client)
   f. Redirect to /agenda or return success
5. Client page refetches appointments (Server Component)
6. New appointment visible in agenda

Code locations:
- Form: frontend/src/app/(dashboard)/agenda/novo/page.tsx
- Server Action: frontend/src/app/(dashboard)/agenda/novo/actions.ts
- Dashboard revalidation: Next.js automatic ISR
```

### Example: Update Client
```
Flow:
1. Client detail page → Edit button
2. Opens modal or edit page
3. Form pre-filled with current data (Server Component fetch)
4. Submit → Server Action: editarCliente()
5. Server Action:
   a. Validate tenant_id matches
   b. Update clients table
   c. Update health_records if needed
   d. Redirect or return success
6. Client detail page refetches (ISR)

Code locations:
- Form: frontend/src/components/clientes/ClienteNovoForm.tsx (reused)
- Page: frontend/src/app/(dashboard)/clientes/[id]/editar/page.tsx
- Server Action: frontend/src/app/(dashboard)/clientes/[id]/editar/actions.ts
```

### Example: RSVP via Public Link
```
Flow:
1. Client receives WhatsApp message: "Confirme sua presença: [link]"
2. Clicks link → /c/[token]?action=confirm
3. Public page (no auth required):
   a. Fetch appointment by rsvp_token (RLS allows public read)
   b. Display appointment details + RSVP options
   c. Client clicks "Confirmar" or "Cancelar"
4. Form submits → Server Action: responderRSVP()
5. Server Action:
   a. Validate token exists + not expired
   b. Update appointments.rsvp_status
   c. Insert to rsvp_responses (audit trail)
   d. Call N8N webhook (send confirmation message back)
   e. Return success message
6. Page shows: "Confirmado! Obrigado." or "Cancelado."

Code locations:
- Page: frontend/src/app/c/[token]/page.tsx
- Server Action: frontend/src/app/(dashboard)/clientes/actions.ts (shared)
```

---

## Multi-Tenancy

### Implementation
- **Database level:** All tables have `tenant_id` FK to tenants table
- **App level:** Every Server Action fetches `user.tenant_id` and passes it to queries
- **Auth level:** Supabase RLS enforces: `tenant_id = (current_user.tenant_id)`
- **API level:** Backend WhatsApp endpoints receive `tenant_id` from request body or auth headers

### Tenant Identification
1. User authenticates → Supabase JWT contains user_id
2. Query `users.tenant_id` WHERE `id = user_id`
3. Use tenant_id for all subsequent queries
4. Frontend Server Actions + Backend API both filter by tenant_id

### Admin SuperUser Access
- Superadmins have `role = 'superadmin'` in users table
- Can see all tenants in `/admin` section
- List tenants via `/admin/clinicas` (queries tenants table directly)
- Can impersonate tenant or view metrics across all tenants

---

## Key Entry Points

### Frontend Entry Points
- **Root:** `frontend/src/app/layout.tsx` (fonts, theme)
- **Auth:** `frontend/src/app/(auth)/login/page.tsx` (login page)
- **Dashboard:** `frontend/src/app/(dashboard)/layout.tsx` (protected, fetches user + pending RSVP)
- **Modules:**
  - Agenda: `frontend/src/app/(dashboard)/agenda/page.tsx`
  - Clientes: `frontend/src/app/(dashboard)/clientes/page.tsx`
  - Protocolos: `frontend/src/app/(dashboard)/protocolos/page.tsx`
  - Config: `frontend/src/app/(dashboard)/config/page.tsx`
- **Public RSVP:** `frontend/src/app/c/[token]/page.tsx`

### Backend Entry Points
- **Health Check:** `GET /health-check` → `{"status": "ok"}`
- **Dashboard API:** `GET /api/v1/dashboard/metrics` → KPI data
- **WhatsApp Webhooks:**
  - `POST /api/v1/whatsapp/webhook` (message delivery/response)
  - `POST /api/v1/whatsapp/send` (send message to client)
- **Instance Management:**
  - `POST /api/v1/whatsapp/config/instance/create` (new WhatsApp instance)
  - `GET /api/v1/whatsapp/config/instance/status` (get QR code)
- **N8N Triggers:**
  - `POST /api/v1/n8n/trigger` (call N8N workflow)

### Middleware Entry Point
- `frontend/src/middleware.ts` → All requests go through auth check
- Redirects unauthenticated users to `/login`
- Refreshes JWT tokens automatically

---

## Development Workflow

### Local Development
1. **Frontend:** `npm run dev` → localhost:3000 (Next.js SSR + API routes)
2. **Backend:** `python -m uvicorn app.main:app --reload` → localhost:8000
3. **Database:** Supabase Cloud (shared dev project)
4. **Env vars:** `.env.local` with NEXT_PUBLIC_SUPABASE_URL, API_KEY, etc.

### Database Migrations
- Migrations stored in `supabase/migrations/` (version + description)
- Apply via Supabase CLI: `supabase db push`
- Or manually in Supabase dashboard SQL editor

### Deployment
- **Frontend:** `npm run build` → Vercel automatic deployment from `main` branch
- **Backend:** Docker image (not currently deployed, running locally or via Coolify)
- **Database:** Supabase Cloud (managed, no manual deploy needed)

---

## Security Principles

1. **Session & Auth:** JWT in httpOnly cookies, auto-refresh, no localStorage
2. **Secrets:** All API keys, DB credentials in `.env`, never in code
3. **Multi-tenancy:** RLS enforces tenant isolation at DB level
4. **CORS:** Restricted to frontend domain only
5. **Rate Limiting:** 60 req/min per IP on backend
6. **Signatures:** Digital signatures stored with IP + user_agent for audit trail
7. **Photos:** Supabase Storage (secure bucket rules, no public access by default)

