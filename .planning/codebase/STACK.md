# Stack

## Runtime & Languages

### Frontend
- **Runtime:** Node.js 20 (Alpine Linux in production)
- **Language:** TypeScript 5.x
- **Framework:** Next.js 16.1.6 (App Router with Server Components & Server Actions)
- **Build Output:** Standalone (optimized for containerization)

### Backend
- **Runtime:** Python 3.11 (Slim image in production)
- **Language:** Python 3.11+
- **Framework:** FastAPI 0.111.0+
- **Server:** Uvicorn 0.30.1+ (async ASGI)

## Frontend Framework

**Next.js 16.1.6** — React 19.2.3 + React DOM 19.2.3
- Server Components for data fetching
- Server Actions (`'use server'`) for mutations
- App Router with nested layouts
- Static rendering + ISR (Incremental Static Regeneration)
- Image optimization with remote patterns (Supabase Storage)

### Frontend Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.6 | Framework |
| react | 19.2.3 | UI library |
| react-dom | 19.2.3 | DOM rendering |
| @supabase/ssr | 0.9.0 | Auth middleware (SSR) |
| @supabase/supabase-js | 2.98.0 | Supabase client |
| tailwindcss | 4.0 | Utility-first CSS |
| @tailwindcss/postcss | 4.0 | PostCSS processor |
| lucide-react | 0.577.0 | Icon library |
| next-themes | 0.4.6 | Theme provider (forced light mode) |
| resend | 6.9.3 | Email client (transactional) |
| sonner | 2.0.7 | Toast notifications |
| clsx | 2.1.1 | Conditional class names |
| class-variance-authority | 0.7.1 | CSS variant management |
| tailwind-merge | 3.5.0 | Tailwind class merging |
| @base-ui/react | 1.2.0 | Headless UI components |

### Frontend Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| eslint | 9.x | Code linting |
| eslint-config-next | 16.1.6 | Next.js ESLint config |
| @types/react | 19.x | React type definitions |
| @types/react-dom | 19.x | React DOM types |
| @types/node | 20.x | Node.js types |
| typescript | 5.x | TypeScript compiler |

## Backend Framework

**FastAPI 0.111.0+** — Async Python web framework
- ASGI-compatible (Uvicorn)
- Automatic OpenAPI documentation
- Pydantic validation
- Dependency injection system

### Backend Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | >=0.111.0 | Web framework |
| uvicorn[standard] | >=0.30.1 | ASGI server |
| pydantic-settings | >=2.2.1 | Environment config validation |
| supabase | >=2.5.0 | Supabase Python SDK |
| python-multipart | >=0.0.9 | Form data parsing |

## Database & Auth

### Supabase (Primary)
- **PostgreSQL 15+** (managed by Supabase)
- **Supabase Auth:** JWT-based user authentication
- **Row-Level Security (RLS):** Multi-tenant data isolation
- **Realtime:** Subscriptions for live updates (configured)
- **Storage:** Object storage for images (Supabase Storage)

### Database Schema
- `tenants` — Multi-tenant organization data
- `clients` — Client/patient profiles (with CEP, email fields)
- `appointments` — Agenda entries (with RSVP status)
- `services` — Available services/treatments
- `rooms` — Treatment rooms
- `protocols` — Treatment protocols/sequences
- `sessions` — Completed sessions (with before/after photos)
- `evaluations` — Multi-step evaluation forms
- `business_hours` — Clinic operating hours
- `whatsapp_instances` — Multi-tenant WhatsApp instance management

### Auth Flow
1. Supabase Auth handles user login/registration
2. Frontend uses `@supabase/ssr` for SSR-compatible auth
3. Server Actions fetch tenant context from `auth.tenant_id`
4. Backend API validates requests via JWT

## Configuration & Environment

### Frontend Configuration
**next.config.ts:**
- Output: `standalone` (optimized for Docker)
- Remote image patterns: `*.supabase.co/storage/v1/object/public/**`
- No external build steps

### Backend Configuration
**FastAPI:**
- Debug mode controlled by `DEBUG` env var
- CORS origins: `http://localhost:3000`, `https://estetiqo.com.br`
- Rate limiting: 60 requests per 60 seconds per IP
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`

**Pydantic Settings:**
- Reads from `.env` file automatically
- Case-sensitive environment variables
- Validation on startup (missing `SECRET_KEY` blocks initialization)

### Environment Variables Required

**Frontend (.env.local or in deployment):**
```
NEXT_PUBLIC_APP_URL                 # App base URL
NEXT_PUBLIC_SUPABASE_URL            # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY       # Public Supabase API key
SUPABASE_SERVICE_ROLE_KEY           # Server-side Supabase admin key
NEXT_PUBLIC_API_URL                 # Backend API URL (internal: http://api:8000)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # Stripe public key (future)
```

**Backend (.env):**
```
SUPABASE_URL                  # Supabase project URL
SUPABASE_KEY                  # Supabase service role key
SUPABASE_SERVICE_ROLE_KEY     # Alternative naming
BACKEND_PORT                  # Uvicorn port (default 8000)
BACKEND_HOST                  # Uvicorn host (default 0.0.0.0)
SECRET_KEY                    # JWT signing key (min 32 chars)
ALGORITHM                     # JWT algorithm (HS256)
ACCESS_TOKEN_EXPIRE_MINUTES   # Token TTL (default 10080 = 7 days)
EVOLUTION_API_URL             # WhatsApp Evolution API endpoint
EVOLUTION_API_TOKEN           # Evolution API authentication token
EVOLUTION_INSTANCE_NAME       # Default WhatsApp instance ID
N8N_API_KEY                   # N8N automation webhook token
STRIPE_SECRET_KEY             # Stripe API key (future)
STRIPE_WEBHOOK_SECRET         # Stripe webhook signing secret (future)
HOTMART_WEBHOOK_TOKEN         # Hotmart payment webhook token (future)
DEBUG                         # Enable/disable FastAPI docs (true/false)
BACKEND_CORS_ORIGINS          # Comma-separated CORS origins
```

## Build & Deploy

### Frontend Build
```bash
npm ci                        # Install dependencies
npm run build                 # Production build
npm start                     # Start server
```

**Docker (Multi-stage):**
1. Builder stage: Node 20-Alpine, npm ci, npm run build
2. Runner stage: Node 20-Alpine, copy .next/standalone + static

**Output:** Standalone Node.js server (port 3000)

### Backend Build
```bash
pip install -r requirements.txt   # Install Python dependencies
uvicorn app.main:app             # Development server
# Production: managed by Dockerfile (uvicorn with host 0.0.0.0)
```

**Docker:**
1. Python 3.11-slim base
2. Install system deps (gcc for wheel builds)
3. Pip install requirements
4. Uvicorn ASGI server (port 8000)

### Docker Compose
**Services:**
1. `api` — Backend (FastAPI on port 8000)
2. `web` — Frontend (Next.js on port 3000)

**Dependencies:** Frontend depends on backend startup (ordered)
**Networking:** Internal Docker network for inter-service communication

### Deployment Targets
- **Frontend:** Vercel (configured)
- **Backend:** VPS or containerized environment (Coolify/Hostinger)
- **Database:** Supabase Cloud (managed PostgreSQL)

