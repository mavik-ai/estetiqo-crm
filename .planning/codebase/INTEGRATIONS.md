# Integrations

## Database

### Supabase (PostgreSQL)
**Purpose:** Primary database for all application data

**Connection Details:**
- Managed PostgreSQL 15+
- Supabase Cloud hosted
- Environment: `NEXT_PUBLIC_SUPABASE_URL` + keys

**Features Used:**
- **RLS (Row-Level Security):** Multi-tenant isolation by `tenant_id`
- **Auth Module:** JWT-based user authentication
- **Realtime:** Subscriptions for live updates
- **Storage:** Object bucket for images (accessible via HTTPS)

**Tables:**
- `tenants` — Organization/clinic data
- `users` — User accounts (linked to auth)
- `clients` — Patient profiles
- `appointments` — Scheduled sessions (with RSVP)
- `services` — Treatment offerings
- `rooms` — Treatment spaces
- `protocols` — Multi-step treatment plans
- `sessions` — Completed sessions (before/after photos)
- `evaluations` — Assessment forms
- `business_hours` — Operating hours per clinic
- `whatsapp_instances` — WhatsApp multi-tenant configuration

**Keys Required:**
- `NEXT_PUBLIC_SUPABASE_URL` — Public project URL (client-side safe)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public API key (client-side safe)
- `SUPABASE_SERVICE_ROLE_KEY` — Admin key (server-only, secret)

## Authentication

### Supabase Auth
**Purpose:** User login, registration, password reset

**Flow:**
1. User submits credentials
2. Supabase Auth validates & issues JWT
3. Frontend stores JWT in session (managed by `@supabase/ssr`)
4. Server Actions fetch `auth.user` + `auth.tenant_id`
5. Backend API validates JWT via middleware (future)

**Endpoints:**
- `/auth/signin` — Login
- `/auth/signup` — Registration (invite-only)
- `/auth/reset-password` — Password reset flow
- `/auth/callback` — OAuth/SAML callback (if configured)

**Multi-Tenant:**
- `auth.tenant_id` extracted from JWT custom claims
- All queries filtered by tenant context
- Users cannot access other clinics' data

## Storage

### Supabase Storage (Object Bucket)
**Purpose:** Hosting before/after photos, documents, other media

**Bucket:** `public` (HTTPS-accessible)
**Path Pattern:** `/storage/v1/object/public/{tenant_id}/{folder}/{filename}`

**Usage:**
- Session photos (before/after procedure)
- Protocol documents
- Client avatars

**Signed URLs:** Not needed (public bucket); direct HTTPS links work

**Remote Patterns (Next.js):**
- Allowed: `*.supabase.co/storage/v1/object/public/**`

**Keys Required:**
- Public bucket URL (no keys needed; HTTP GET)

## Email

### Resend (Transactional Email)
**Purpose:** Sending emails from application (confirmations, notifications, reports)

**Provider:** Resend.com
**Integration:** `resend` npm package (v6.9.3)

**Current Usage:**
- Account confirmations (future)
- Session reminders (future)
- Error reports (future)

**From Domain:** Default Resend domain or custom verified domain (to configure)

**Keys Required:**
- `RESEND_API_KEY` — Secret API key for sending

**Rate Limits:**
- Standard Resend tier: 10k emails/day

## External APIs

### Evolution API (WhatsApp Multi-Tenant)
**Purpose:** Send WhatsApp messages, manage instances, track RSVP responses

**Provider:** Evolution API (hosted at `https://evoapi.estetiqo.com.br`)
**Integration:**
- Backend: `app/services/evolution_api.py`
- Endpoints:
  - `POST /api/v1/whatsapp/instance/create` — Create/pair WhatsApp instance
  - `GET /api/v1/whatsapp/instance/status` — Check connection status
  - `DELETE /api/v1/whatsapp/instance` — Disconnect instance
  - `POST /api/v1/whatsapp/send-rsvp` — Send RSVP message

**Multi-Tenant Model:**
- One WhatsApp instance per tenant (clinic)
- Instance paired via QR code scan
- Status: `connected` | `disconnected` | `awaiting_scan`

**Message Format:**
- Automatic RSVP links to public page (`/c/[token]`)
- Customer responds via WhatsApp to confirm/cancel

**Keys Required:**
- `EVOLUTION_API_URL` — API endpoint
- `EVOLUTION_API_TOKEN` — Global authentication token
- `EVOLUTION_INSTANCE_NAME` — Default instance ID

### N8N (Automation Orchestrator)
**Purpose:** Workflow automation, message sequences, data transformations

**Integration:**
- Backend: `app/api/v1/endpoints/n8n.py`
- Webhooks triggered by application events (future)

**Potential Workflows:**
- Auto-send appointment confirmations
- Reminder sequences (1 day before, 2 hours before)
- Post-session follow-up
- Cancellation notifications

**Keys Required:**
- `N8N_API_KEY` — Webhook authentication token

**Hosting:** Self-hosted or N8N Cloud (to configure)

### Stripe (Payment Processing - Future)
**Purpose:** SaaS subscription billing, plan management

**Integration:** Backend webhook receivers (not yet fully implemented)
**Models:**
- Products (plans: Básico, Pro, Premium)
- Prices (monthly/quarterly/semi-annual)
- Subscriptions
- Webhooks for events (charge.succeeded, invoice.payment_failed, etc.)

**Keys Required:**
- `STRIPE_SECRET_KEY` — Secret API key
- `STRIPE_WEBHOOK_SECRET` — Webhook signing secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Client-side key (future checkout)

**Status:** Framework ready; feature in backlog

### Hotmart (Payment Processing - Alternative)
**Purpose:** Alternative to Stripe for Brazilian market

**Integration:** Webhook receivers in backend (not yet implemented)

**Keys Required:**
- `HOTMART_WEBHOOK_TOKEN` — Webhook signature verification

**Status:** Future integration; not actively used

## API Communication Pattern

### Frontend → Backend
**Base URL:** `process.env.NEXT_PUBLIC_API_URL` (Docker: `http://api:8000`, production: `https://api.estetiqo.com.br`)

**Endpoints:**
```
/api/v1/whatsapp/instance/create     POST   Create/pair WhatsApp
/api/v1/whatsapp/instance/status     GET    Check connection
/api/v1/whatsapp/instance            DELETE Disconnect
/api/v1/whatsapp/send-rsvp          POST   Send RSVP message
/api/v1/dashboard/metrics           GET    Dashboard KPIs
/api/v1/n8n/webhook/*               POST   N8N automation webhooks
```

**Authentication:**
- JWT token in `Authorization: Bearer <token>` (if implemented)
- CORS headers validated by backend

**Rate Limiting:**
- Backend enforces 60 requests per 60 seconds per client IP
- Health check + root exempt

### Backend → Supabase
**Client:** `@supabase/supabase-js` (Python SDK)
**Auth:** Service role key (server-only)
**Flow:**
1. Connect with `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
2. Execute SQL queries or use ORM (if implemented)
3. RLS policies enforce tenant isolation

### Frontend → Supabase (Client-side)
**Client:** `@supabase/ssr` (Next.js specific)
**Auth:** Public anon key
**Middleware:** `middleware.ts` refreshes session on every request

## Environment Variables Required

### Frontend Production
```
NEXT_PUBLIC_APP_URL                 https://estetiqo.com.br
NEXT_PUBLIC_SUPABASE_URL            https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY           eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (server-only)
NEXT_PUBLIC_API_URL                 https://api.estetiqo.com.br (or internal Docker URL)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  pk_live_... (future)
```

### Backend Production
```
SUPABASE_URL                        https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY           eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EVOLUTION_API_URL                   https://evoapi.estetiqo.com.br
EVOLUTION_API_TOKEN                 <global-evolution-token>
EVOLUTION_INSTANCE_NAME             default-instance-name
N8N_API_KEY                         <n8n-webhook-token>
RESEND_API_KEY                      re_... (if email enabled)
STRIPE_SECRET_KEY                   sk_live_... (if Stripe enabled)
STRIPE_WEBHOOK_SECRET               whsec_... (if Stripe enabled)
HOTMART_WEBHOOK_TOKEN               <hotmart-token> (if Hotmart enabled)
SECRET_KEY                          <32+ char random string>
ALGORITHM                           HS256
ACCESS_TOKEN_EXPIRE_MINUTES         10080
DEBUG                               false (in production)
BACKEND_CORS_ORIGINS                https://estetiqo.com.br, https://www.estetiqo.com.br
```

## Data Flow Summary

```
Client Browser
    ↓
[Supabase Auth] ← JWT Session
    ↓
Next.js Frontend (SSR)
    ├→ [Supabase] (RLS-protected queries, client-side safe)
    ├→ [Backend FastAPI] (WhatsApp, N8N orchestration)
         ├→ [Evolution API] (WhatsApp messages)
         ├→ [Supabase] (DB updates)
         └→ [N8N] (Workflows)
    └→ [Resend] (Email transactional)

[Public Pages] (/c/[token])
    └→ [Supabase RLS] (RSVP updates without auth)
```

