# Structure

## Root Layout

```
/Users/rafaeljorge/Library/Mobile Documents/com~apple~CloudDocs/Downloads/workspace_projects/estetiqo-crm/
├── README.md (not present, but standard)
├── .env.example                     Example environment variables
├── .gitignore                       Git ignore rules
├── .dockerignore                    Docker ignore rules
├── .git/                            Git repository
│
├── CLAUDE.md                        Claude AI instructions (project rules)
├── GEMINI.md                        Gemini AI instructions
├── PRD.md                           Product specification document
├── DEVLOG.md                        Development log (what's been done)
├── ROADMAP.md                       Feature roadmap
├── task.md                          Current task notes
│
├── frontend/                        Next.js web app (Vercel deployment)
├── backend/                         FastAPI server (Evolution API webhooks)
├── supabase/                        Database migrations & RLS policies
├── dashboards/                      Analytics/monitoring dashboards
├── logo-estetiqo/                   Brand assets (logo files)
├── referencias/                     Reference materials (external docs)
├── .planning/                       Planning & documentation
│   └── codebase/                    (This directory)
│       ├── ARCHITECTURE.md          Architecture & patterns
│       └── STRUCTURE.md             This file
├── docker-compose.yml               Docker composition for local dev
├── v1.0/                            Legacy/archived code
```

---

## Frontend Structure (Next.js 15)

### Root Files
```
frontend/
├── package.json                     Dependencies (Next.js, Supabase, Tailwind, Lucide, Resend, Sonner)
├── next.config.ts                   Next.js configuration
├── tsconfig.json                    TypeScript configuration
├── tailwind.config.ts               Tailwind CSS v4 configuration
├── postcss.config.js                PostCSS configuration
├── .eslintrc.json                   ESLint rules
│
├── src/
│   ├── middleware.ts                Request auth middleware (validates JWT, redirects unauthenticated)
│   ├── app/
│   │   ├── layout.tsx               ROOT LAYOUT (fonts, ThemeProvider, global styles)
│   │   ├── globals.css              Global styles (CSS variables, Tailwind directives)
│   │   │
│   │   ├── (auth)/                  LAYOUT GROUP: Unauthenticated pages
│   │   │   ├── layout.tsx           Auth layout wrapper (centered form, light bg)
│   │   │   ├── login/
│   │   │   │   ├── page.tsx         Login form page
│   │   │   │   └── actions.ts       Login Server Action (supabase.auth.signInWithPassword)
│   │   │   ├── primeiro-acesso/
│   │   │   │   ├── page.tsx         First access / password setup page
│   │   │   │   └── actions.ts       Set password Server Action
│   │   │   ├── esqueceu-senha/
│   │   │   │   ├── page.tsx         Forgot password page
│   │   │   │   └── actions.ts       Reset password request Server Action
│   │   │   └── redefinir-senha/
│   │   │       ├── page.tsx         Password reset confirmation page
│   │   │       └── actions.ts       Complete password reset Server Action
│   │   │
│   │   ├── (dashboard)/             LAYOUT GROUP: Authenticated pages + modals
│   │   │   ├── layout.tsx           MAIN DASHBOARD LAYOUT
│   │   │   │                         - Fetches user + profile + pending appointments (server-side)
│   │   │   │                         - Renders Sidebar + Topbar
│   │   │   │                         - Handles {children} + {modal} parallel routes
│   │   │   │
│   │   │   ├── @modal/              PARALLEL SLOT: Modal routes (intercepting)
│   │   │   │   ├── (.)clientes/novo/page.tsx        "Add client" modal
│   │   │   │   ├── (.)clientes/[id]/page.tsx        "View client" modal
│   │   │   │   └── (.)clientes/[id]/editar/page.tsx "Edit client" modal
│   │   │   │
│   │   │   ├── page.tsx             HOME / Dashboard home (metrics, appointment list, onboarding banner)
│   │   │   ├── actions.ts           Shared actions for dashboard
│   │   │   │
│   │   │   ├── agenda/              SCHEDULE MODULE
│   │   │   │   ├── page.tsx         Calendar view + appointment list
│   │   │   │   ├── novo/
│   │   │   │   │   ├── page.tsx     New appointment form page
│   │   │   │   │   └── actions.ts   Create appointment Server Action
│   │   │   │   ├── agendaActions.ts Shared appointment actions (update, cancel, RSVP)
│   │   │   │   └── QuickCreateModal.tsx Client Component: quick appointment modal
│   │   │   │
│   │   │   ├── clientes/            CLIENTS MODULE
│   │   │   │   ├── page.tsx         Clients list (ClientesTable component)
│   │   │   │   ├── novo/
│   │   │   │   │   ├── page.tsx     New client form page
│   │   │   │   │   └── actions.ts   Create client Server Action (insert clients + health_records)
│   │   │   │   ├── [id]/            Client detail (dynamic route)
│   │   │   │   │   ├── page.tsx     Client detail view (ficha completa)
│   │   │   │   │   ├── editar/
│   │   │   │   │   │   ├── page.tsx Edit client form
│   │   │   │   │   │   └── actions.ts Update client Server Action
│   │   │   │   │   └── avaliacao/
│   │   │   │   │       └── nova/
│   │   │   │   │           ├── page.tsx New evaluation form
│   │   │   │   │           └── actions.ts Create evaluation Server Action
│   │   │   │   ├── clienteActions.ts Shared client mutations (delete, update rating, etc.)
│   │   │   │   └── actions.ts       Additional client actions
│   │   │   │
│   │   │   ├── protocolos/          PROTOCOLS MODULE
│   │   │   │   ├── page.tsx         Protocols list
│   │   │   │   ├── [id]/            Protocol detail
│   │   │   │   │   ├── page.tsx     Protocol overview + sessions
│   │   │   │   │   └── sessoes/
│   │   │   │   │       ├── nova/
│   │   │   │   │       │   ├── page.tsx New session form (2 steps: Info + Antes)
│   │   │   │   │       │   └── SessaoForm.tsx Form component (handles steps)
│   │   │   │   │       └── [sessionId]/
│   │   │   │   │           └── page.tsx Session detail + edit before/after measurements
│   │   │   │   └── protocoloActions.ts Shared protocol actions
│   │   │   │
│   │   │   ├── servicos/            SERVICES MODULE
│   │   │   │   ├── page.tsx         Services list
│   │   │   │   └── novo/
│   │   │   │       └── page.tsx     New service form
│   │   │   │
│   │   │   ├── salas/               ROOMS MODULE
│   │   │   │   └── page.tsx         Rooms list + add/edit
│   │   │   │
│   │   │   ├── relatorios/          REPORTS MODULE
│   │   │   │   └── page.tsx         Analytics & reports
│   │   │   │
│   │   │   ├── config/              SETTINGS / CONFIGURATION
│   │   │   │   ├── page.tsx         Settings home (cards for all config sections)
│   │   │   │   ├── perfil/
│   │   │   │   │   ├── page.tsx     User profile settings
│   │   │   │   │   ├── PerfilForm.tsx Profile form component
│   │   │   │   │   └── actions.ts   Update profile Server Action
│   │   │   │   ├── clinica/
│   │   │   │   │   ├── page.tsx     Business info settings
│   │   │   │   │   ├── ClinicaForm.tsx Clinic form component
│   │   │   │   │   └── actions.ts   Update clinic info Server Action
│   │   │   │   ├── agenda/
│   │   │   │   │   ├── page.tsx     Business hours settings
│   │   │   │   │   ├── JanelaForm.tsx Operating hours form
│   │   │   │   │   └── actions.ts   Update business hours Server Action
│   │   │   │   ├── salas/
│   │   │   │   │   └── page.tsx     Rooms configuration
│   │   │   │   └── whatsapp/
│   │   │   │       ├── page.tsx     WhatsApp instance status + QR code
│   │   │   │       └── actions.ts   Create/refresh instance Server Action
│   │   │   │
│   │   │   ├── bem-vindo/           ONBOARDING
│   │   │   │   ├── page.tsx         Welcome/setup checklist page
│   │   │   │   └── actions.ts       Mark setup step complete Server Action
│   │   │   │
│   │   │   └── rsvp/                RSVP ADMIN VIEW
│   │   │       └── page.tsx         View all RSVP statuses + responses
│   │   │
│   │   ├── admin/                   ADMIN / SUPERADMIN SECTION
│   │   │   ├── layout.tsx           Admin layout (different sidebar, auth check)
│   │   │   ├── page.tsx             Admin dashboard
│   │   │   ├── clinicas/
│   │   │   │   └── page.tsx         List all clinics (tenants) + create new
│   │   │   ├── planos/
│   │   │   │   └── page.tsx         Plans management (billing tiers)
│   │   │   └── components/
│   │   │       └── AdminSidebar.tsx Admin-specific sidebar
│   │   │
│   │   ├── auth/                    AUTH CALLBACKS
│   │   │   └── callback/
│   │   │       └── route.ts         Supabase OAuth callback handler
│   │   │
│   │   └── c/                       PUBLIC / CLIENT RSVP PAGES
│   │       └── [token]/
│   │           └── page.tsx         Public RSVP page (no auth required)
│   │                                - Fetch appointment by rsvp_token
│   │                                - Display RSVP options (confirm/cancel)
│   │                                - Server Action to update rsvp_status
│   │
│   ├── components/                  REUSABLE COMPONENTS
│   │   ├── ui/                      UI PRIMITIVES (shadcn-style)
│   │   │   ├── button.tsx           Styled button (cv variant system)
│   │   │   ├── input.tsx            Text input
│   │   │   ├── label.tsx            Form label
│   │   │   ├── card.tsx             Card container
│   │   │   ├── avatar.tsx           User avatar
│   │   │   ├── badge.tsx            Status badge
│   │   │   ├── table.tsx            Table structure
│   │   │   ├── dropdown-menu.tsx    Dropdown menu (Base UI)
│   │   │   ├── ThemeProvider.tsx    Theme context + CSS variables (light-only)
│   │   │   ├── PasswordInput.tsx    Password field with show/hide toggle
│   │   │   ├── ClienteSearch.tsx    Client autocomplete search
│   │   │   ├── InterceptingModal.tsx Parallel route modal wrapper
│   │   │   ├── SignatureCanvas.tsx  Digital signature capture (canvas)
│   │   │   ├── SessionPhotosModal.tsx Photo gallery modal (before/after)
│   │   │   ├── PhotosCell.tsx       Photo cell for appointment table
│   │   │   └── SavedToast.tsx       Success notification toast
│   │   │
│   │   ├── layout/                  LAYOUT COMPONENTS
│   │   │   ├── Sidebar.tsx          LEFT SIDEBAR (nav, user menu, logout)
│   │   │   │                         Client Component: interactive nav + user dropdown
│   │   │   └── Topbar.tsx           TOP BAR (title, notifications, pending RSVP dropdown)
│   │   │                              Client Component: interactive, shows pending appointments
│   │   │
│   │   ├── dashboard/               DASHBOARD-SPECIFIC COMPONENTS
│   │   │   ├── DashboardMetrics.tsx Display KPI cards (today's appointments, clients, etc.)
│   │   │   ├── AppointmentTable.tsx Main appointment list (Client Component)
│   │   │   │                         - Interactive: sort, filter, actions
│   │   │   │                         - Status badges: pending, confirmed, cancelled
│   │   │   │                         - Action buttons: RSVP, reschedule, cancel, notes
│   │   │   ├── AppointmentActions.tsx Appointment CRUD actions (Client Component)
│   │   │   ├── RecentActivity.tsx   Activity feed / recent changes
│   │   │   ├── PopularServices.tsx  Service usage chart
│   │   │   ├── OnboardingBanner.tsx Setup checklist with close button (saved to localStorage)
│   │   │   └── QuickCreateModal.tsx Quick appointment creation modal
│   │   │
│   │   └── clientes/                CLIENT-SPECIFIC COMPONENTS
│   │       ├── ClientesTable.tsx    Clients list table (Client Component)
│   │       │                         - Interactive: click row → modal
│   │       │                         - Shows: name, phone, rating, last appointment
│   │       │                         - Modal: Ver ficha | Editar | Excluir
│   │       ├── ClienteNovoForm.tsx  New/edit client form (reusable)
│   │       │                         - Personal info, health record checkboxes
│   │       │                         - Calls criarCliente or editarCliente Server Action
│   │       ├── ClienteFichaClient.tsx Client detail bottom sheet modal
│   │       ├── ClienteFichaView.tsx  Protocol + sessions view component
│   │       └── ExcluirClienteButton.tsx Delete client button + confirmation
│   │
│   └── utils/                       UTILITY FUNCTIONS
│       └── supabase/
│           ├── client.ts            CLIENT-SIDE Supabase instance
│           │                         - Used in Client Components
│           │                         - createClient() from '@supabase/supabase-js'
│           ├── server.ts            SERVER-SIDE Supabase instance
│           │                         - Used in Server Components + Server Actions
│           │                         - createClient() with cookie handling
│           ├── middleware.ts        AUTH + SESSION MANAGEMENT
│           │                         - updateSession(request) validates JWT
│           │                         - Auto-refreshes tokens
│           │                         - Redirects unauthenticated users to /login
│           └── admin.ts             ADMIN OPERATIONS (if needed)
│
├── public/                          Static assets
│   ├── logo.png                     Estetiqo logo
│   └── favicon.png                  Favicon
│
└── node_modules/                    Dependencies (not in repo, local only)
```

### Key Page Files

| Path | Purpose | Type |
|------|---------|------|
| `frontend/src/app/(dashboard)/page.tsx` | Dashboard home | Server Component |
| `frontend/src/app/(dashboard)/agenda/page.tsx` | Schedule view | Server Component |
| `frontend/src/app/(dashboard)/clientes/page.tsx` | Clients list | Server Component |
| `frontend/src/app/(dashboard)/protocolos/page.tsx` | Protocols list | Server Component |
| `frontend/src/app/(dashboard)/config/page.tsx` | Settings home | Server Component |
| `frontend/src/app/(auth)/login/page.tsx` | Login page | Server Component |
| `frontend/src/app/c/[token]/page.tsx` | Public RSVP page | Server Component |
| `frontend/src/app/(dashboard)/@modal/(.)clientes/novo/page.tsx` | Add client modal | Server Component |

### Key Component Files

| Path | Purpose | Type |
|------|---------|------|
| `frontend/src/components/dashboard/DashboardMetrics.tsx` | KPI display | Server/Client |
| `frontend/src/components/dashboard/AppointmentTable.tsx` | Appointment list | Client Component |
| `frontend/src/components/clientes/ClientesTable.tsx` | Clients list + modal | Client Component |
| `frontend/src/components/clientes/ClienteFichaView.tsx` | Client protocols view | Server/Client |
| `frontend/src/components/layout/Sidebar.tsx` | Navigation sidebar | Client Component |
| `frontend/src/components/layout/Topbar.tsx` | Top bar + notifications | Client Component |

### Key Server Action Files

| Path | Purpose |
|------|---------|
| `frontend/src/app/(dashboard)/clientes/novo/actions.ts` | criarCliente() |
| `frontend/src/app/(dashboard)/clientes/[id]/editar/actions.ts` | editarCliente() |
| `frontend/src/app/(dashboard)/clientes/clienteActions.ts` | deleteCliente(), updateClientRating() |
| `frontend/src/app/(dashboard)/agenda/novo/actions.ts` | criarAgendamento() |
| `frontend/src/app/(dashboard)/agenda/agendaActions.ts` | updateAppointmentRSVP(), cancelAppointment() |
| `frontend/src/app/(dashboard)/config/perfil/actions.ts` | updateProfile() |
| `frontend/src/app/(dashboard)/config/clinica/actions.ts` | updateClinicInfo() |
| `frontend/src/app/(dashboard)/config/agenda/actions.ts` | updateBusinessHours() |
| `frontend/src/app/(dashboard)/config/whatsapp/actions.ts` | createWhatsAppInstance() |

---

## Backend Structure (FastAPI)

### Root Files
```
backend/
├── Dockerfile                       Docker image definition
├── requirements.txt                 Python dependencies (fastapi, supabase, uvicorn, etc.)
├── .env.example                     Example environment variables
└── .env                             Environment config (local, not in repo)

app/
├── __init__.py                      Package init
├── main.py                          FASTAPI APP ENTRY POINT
│                                     - CORS config
│                                     - Rate limiting middleware
│                                     - Security headers
│                                     - Health check + root routes
│                                     - Router inclusion
│
├── core/
│   ├── config.py                    SETTINGS / ENVIRONMENT VARIABLES
│   │                                 - DEBUG flag
│   │                                 - CORS origins
│   │                                 - Supabase credentials
│   │                                 - Evolution API config
│   │                                 - N8N API key
│   │                                 - JWT secret
│   └── security.py                  Security utilities (if needed, for JWT validation)
│
├── api/
│   ├── __init__.py
│   └── v1/
│       ├── __init__.py
│       ├── router.py                ROUTE AGGREGATOR
│       │                             - Includes all endpoint routers
│       │                             - Prefix: /api/v1
│       │
│       └── endpoints/
│           ├── __init__.py
│           ├── dashboard.py         Dashboard metrics endpoints
│           │                         - GET /api/v1/dashboard/metrics
│           ├── whatsapp.py          WhatsApp message endpoints
│           │                         - POST /api/v1/whatsapp/send
│           │                         - POST /api/v1/whatsapp/webhook (receive messages)
│           │                         - POST /api/v1/whatsapp/confirm-appointment
│           ├── whatsapp_config.py   WhatsApp instance management
│           │                         - POST /api/v1/whatsapp/config/instance/create
│           │                         - GET /api/v1/whatsapp/config/instance/status
│           │                         - GET /api/v1/whatsapp/config/instances
│           └── n8n.py               N8N workflow triggers
│                                     - POST /api/v1/n8n/trigger
│
├── services/
│   ├── __init__.py
│   └── evolution_api.py             EVOLUTION API CLIENT
│                                     - create_instance()
│                                     - get_qr_code()
│                                     - send_message()
│                                     - register_webhook()
│
├── schemas/                         Pydantic models for validation
│   ├── __init__.py
│   └── (request/response models, if used)
│
├── crud/                            Database operations
│   ├── __init__.py
│   └── (CRUD functions, if used — may use Supabase SDK directly instead)
│
└── models/                          SQLAlchemy models (if using ORM)
    ├── __init__.py
    └── (database models, if needed)
```

### Key Endpoint Files

| Path | Purpose | Main Functions |
|------|---------|-----------------|
| `backend/app/main.py` | FastAPI app setup | health_check(), root() |
| `backend/app/api/v1/router.py` | Route aggregator | api_router.include_router(...) |
| `backend/app/api/v1/endpoints/dashboard.py` | Dashboard API | GET /metrics |
| `backend/app/api/v1/endpoints/whatsapp.py` | WhatsApp messages | POST /send, /webhook, /confirm-appointment |
| `backend/app/api/v1/endpoints/whatsapp_config.py` | Instance management | POST /instance/create, GET /status |
| `backend/app/api/v1/endpoints/n8n.py` | N8N workflows | POST /trigger |

### Environment Variables (backend/.env)
```
DEBUG=false
BACKEND_CORS_ORIGINS=http://localhost:3000,https://estetiqo.com.br

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx...

EVOLUTION_API_URL=https://evoapi.estetiqo.com
EVOLUTION_API_TOKEN=xxx_token_xxx
EVOLUTION_INSTANCE_NAME=estetiqo_instance

N8N_API_KEY=xxx_key_xxx

SECRET_KEY=<generate with: openssl rand -hex 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

---

## Database Migrations

### Location & Naming
```
supabase/migrations/
├── 20260308000000_initial_schema.sql
├── 20260309000001_onda5_rsvp_public.sql
├── 20260309000002_rls_rsvp_public.sql
├── 20260309000003_onda4_avaliacao.sql
├── 20260309000006_add_client_email.sql
├── 20260309000007_sessao_completa.sql
├── 20260309000008_business_hours.sql
├── 20260309000009_tenant_address_fiscal.sql
└── 20260309000010_services_image_tenant_logo.sql
```

**Naming Convention:** `YYYYMMDDhhmmss_description.sql`
- Date: UTC timestamp
- Description: snake_case, brief (max 50 chars)

### Migration Contents

Each migration:
1. `CREATE TABLE` or `ALTER TABLE`
2. `CREATE INDEX` for performance
3. `ALTER TABLE ... ADD CONSTRAINT` for FKs
4. `CREATE POLICY` for RLS (Row Level Security)
5. `GRANT` / `REVOKE` for permissions (if multi-role)

**Example: 20260308000000_initial_schema.sql**
- Creates: tenants, users, clients, health_records, services, rooms, protocols, sessions, appointments, rsvp_responses, digital_signatures, session_photos, activity_log tables
- Includes: FKs, indexes, constraints

**Example: 20260309000001_onda5_rsvp_public.sql**
- Adds: `rsvp_public` table for public RSVP tracking

**Example: 20260309000008_business_hours.sql**
- Creates: `business_hours` table (day_of_week, start_time, end_time, is_available)

### Applying Migrations
```bash
# Via Supabase CLI
supabase db push

# Or manually in Supabase dashboard:
# 1. Navigate to SQL Editor
# 2. Paste migration SQL
# 3. Execute
```

---

## Key Files Reference

### Most Important Files for Understanding Flow

| File | Purpose | Lines | Read First? |
|------|---------|-------|-----------|
| `frontend/src/middleware.ts` | Auth + session refresh | 56 | **YES** |
| `frontend/src/app/(dashboard)/layout.tsx` | Main dashboard layout | 83 | **YES** |
| `frontend/src/utils/supabase/server.ts` | Server-side DB client | 29 | **YES** |
| `frontend/src/app/(dashboard)/clientes/novo/actions.ts` | Server Action pattern | 62 | **YES** |
| `frontend/src/components/layout/Sidebar.tsx` | Navigation + user menu | 80+ | YES |
| `backend/app/main.py` | FastAPI setup | 92 | YES |
| `backend/app/core/config.py` | Backend config | 55 | YES |
| `supabase/migrations/20260308000000_initial_schema.sql` | DB schema | 200+ | YES |

### Secondary Reference Files

| File | Purpose | Lines |
|------|---------|-------|
| `frontend/src/components/dashboard/AppointmentTable.tsx` | Appointment list UI | 100+ |
| `frontend/src/components/clientes/ClientesTable.tsx` | Clients list UI | 100+ |
| `frontend/src/app/(dashboard)/agenda/page.tsx` | Schedule page | 50+ |
| `backend/app/services/evolution_api.py` | WhatsApp integration | 100+ |
| `frontend/src/app/c/[token]/page.tsx` | Public RSVP page | 80+ |

---

## Naming Conventions

### Database Tables
- **Pattern:** singular, snake_case (users, clients, appointments, health_records)
- **Fields:** snake_case (first_name, birth_date, rsvp_status)
- **IDs:** Always `id UUID PRIMARY KEY` with `DEFAULT gen_random_uuid()`
- **Foreign Keys:** `{table_singular}_id` (user_id, client_id, protocol_id)
- **Timestamps:** `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ`
- **Status fields:** ALL_CAPS enum ('active', 'completed', 'cancelled')

### Frontend Files
- **Pages:** `page.tsx` (routing via Next.js App Router)
- **Components:** PascalCase.tsx (e.g., `DashboardMetrics.tsx`)
- **Server Actions:** `actions.ts` (e.g., `frontend/src/app/(dashboard)/clientes/novo/actions.ts`)
- **Client Components:** Mark with `'use client'` directive
- **Server Components:** Default (no directive needed)
- **Utilities:** camelCase.ts (e.g., `formatDate.ts`, `fetchWithAuth.ts`)

### Backend Files
- **Endpoints:** snake_case.py in `endpoints/` folder
- **Functions:** snake_case (def create_appointment(), def send_message())
- **Classes:** PascalCase (class User, class WhatsAppInstance)
- **Environment variables:** SCREAMING_SNAKE_CASE (SUPABASE_URL, EVOLUTION_API_KEY)

### Routes
- **Frontend:** kebab-case URL paths (`/bem-vindo`, `/primeiro-acesso`, `/c/[token]`)
- **Backend:** kebab-case API paths (`/api/v1/whatsapp/config/instance/create`)
- **Dynamic params:** `[paramName]` (e.g., `[id]`, `[token]`)
- **Parallel slots:** `@slotName` (e.g., `@modal`)
- **Layout groups:** `(groupName)` (e.g., `(auth)`, `(dashboard)`)

### Variables & Functions
- **Boolean fields:** `is_*` or `has_*` (is_block, has_attachment)
- **Status fields:** `*_status` (rsvp_status, appointment_status)
- **Timestamps:** `*_at` (created_at, updated_at, signed_at)
- **Server Actions:** verb + noun (criarCliente, editarCliente, cancelAppointment)

---

## Configuration Files

### Frontend Config

**next.config.ts**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Image optimization
  images: {
    domains: ['supabase-storage-url'],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
```

**tsconfig.json**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

**tailwind.config.ts**
- Tailwind v4 (PostCSS)
- Custom CSS variables for colors (--bg-background, --text-primary, etc.)
- Light-only theme

### Backend Config

**backend/app/core/config.py**
- Loads .env via pydantic_settings
- Validates required secrets (SECRET_KEY must be 32+ chars)
- CORS origins restricted
- DEBUG mode toggles /docs endpoint

---

## Development Hints

### Adding a New Page
1. Create folder: `frontend/src/app/(dashboard)/new-module/`
2. Create `page.tsx` (Server Component by default)
3. Add to Sidebar navItems if main module
4. If needs data fetching: use `createClient()` in page component
5. If needs forms: create Client Component with `useTransition` + Server Action

### Adding a New Server Action
1. Create `actions.ts` next to page or in dedicated file
2. Mark `'use server'` at top
3. Fetch `user` + `tenant_id` from Supabase
4. Validate inputs
5. Execute mutation (insert/update/delete)
6. `redirect()` or return response object
7. Call from Client Component with `useTransition`

### Adding a New Backend Endpoint
1. Create function in `endpoints/filename.py`
2. Use FastAPI decorators (`@router.get()`, `@router.post()`)
3. Validate request body with Pydantic
4. Query Supabase or call external service
5. Return JSON response
6. Add router to `router.py` with `api_router.include_router()`

### Debugging Multi-Tenancy Issues
1. Check middleware is running: `middleware.ts`
2. Verify `user.tenant_id` in dashboard layout
3. Ensure all Server Actions query by `tenant_id`
4. Check Supabase RLS policies: SELECT/INSERT/UPDATE/DELETE filtered by tenant_id
5. Test with 2 separate users in different tenants

