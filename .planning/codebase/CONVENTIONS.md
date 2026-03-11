# Conventions
## Naming Conventions

### Files & Directories
- **Case**: camelCase for components (e.g., `ClientesTable.tsx`), snake_case for utilities (e.g., `supabase/server.ts`)
- **Components**: PascalCase (e.g., `AppointmentActions.tsx`, `InterceptingModal.tsx`)
- **Server Actions**: camelCase functions ending in "action" or verb (e.g., `criarCliente()`, `editarDadosCliente()`)
- **Utilities**: camelCase (e.g., `createClient()`)
- **Database tables**: snake_case (e.g., `clients`, `health_records`, `appointments`)
- **Database columns**: snake_case (e.g., `birth_date`, `rsvp_status`, `tenant_id`)

### Function & Variable Naming
- **Portuguese preferred**: Functions and variables use PT-BR names (e.g., `criarAgendamento`, `marcarNoShow`, `confirmarRSVPAdmin`)
- **Suffix patterns**:
  - Actions: `criarX()`, `editarX()`, `deletarX()`, `cancelarX()`, `confirmarX()`
  - Formatters: `formatar*()` (e.g., `formatarData()`, `formatarAniversario()`)
  - Getters: `get*()` (e.g., `getInitials()`)
- **Prefix patterns**:
  - Boolean states: `is*`, `has*`, `can*` (e.g., `isConfirmed`, `isCancelled`, `hasAttachments`)
  - Handlers: `handle*` (e.g., `handleAction`, `handler`)

### Types & Interfaces
- **Suffix**: `Props` for component props (e.g., `AppointmentActionsProps`)
- **Database types**: Match table names (e.g., `Client`, `Appointment`, `HealthRecord`)
- **Response types**: Explicit and descriptive (e.g., `{ error: string } | void`)

## File Organization

### Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth routes (login, signup, etc.)
│   │   ├── (dashboard)/     # Protected dashboard routes
│   │   │   ├── layout.tsx   # Main dashboard layout
│   │   │   ├── @modal/      # Parallel routes for modals
│   │   │   ├── [page]/      # Route-specific pages
│   │   │   └── [page]/actions.ts  # Server actions for that page
│   │   ├── c/[token]/       # Public RSVP pages (no auth)
│   │   └── globals.css      # Global styles & design tokens
│   ├── components/
│   │   ├── layout/          # Sidebar, Topbar, etc.
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── clientes/        # Client-specific components
│   │   ├── ui/              # Reusable UI components
│   │   └── [feature]/       # Feature-specific components
│   └── utils/
│       └── supabase/        # DB utilities (server.ts, client.ts)
└── tsconfig.json
```

### Backend Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization, middleware
│   ├── core/
│   │   └── config.py        # Settings & environment
│   ├── api/
│   │   └── v1/
│   │       ├── router.py    # Route aggregator
│   │       └── endpoints/   # Feature endpoints
│   └── services/            # Business logic (Evolution API, etc.)
└── requirements.txt
```

## Component Patterns (Server vs Client)

### Server Components (Default)
- Used for data fetching, authentication checks, layout
- Cannot use hooks (`useState`, `useEffect`, `useTransition`)
- Cannot use event listeners
- Direct database access via Supabase server client
- Example: `layout.tsx`, page components that fetch data

```typescript
// layout.tsx (Server Component)
export default async function DashboardLayout({ children, modal }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

    return <div>{children}</div>;
}
```

### Client Components (`'use client'`)
- Used for interactivity, forms, dropdowns, modals
- Must import `'use client'` at the top
- Can use hooks: `useState`, `useTransition`, `useEffect`, `useRef`
- Call Server Actions via props or form submissions
- Example: `ClientesTable.tsx`, `AppointmentActions.tsx`

```typescript
'use client'

import { useTransition, useState } from 'react';
import { criarCliente } from './actions';

export function ClienteForm() {
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<string | null>(null);

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await criarCliente(formData);
            if (result.error) {
                setFeedback('Erro: ' + result.error);
            } else {
                setFeedback('Sucesso!');
            }
        });
    }

    return <form action={handleSubmit}>...</form>;
}
```

## Server Actions Pattern

### Location & Structure
- Stored in `[page]/actions.ts` alongside the page using them
- Always marked with `'use server'` directive at top
- Imported and called from Client Components via `useTransition`

### Mandatory Checks
1. **Authentication**: Always check user exists at start
2. **Tenant Isolation**: Always fetch `tenant_id` from user record, use in all queries
3. **Authorization**: Verify user role if needed (admin vs operator)
4. **Validation**: Validate FormData inputs before DB operations

### Pattern Template
```typescript
'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function criarRecurso(formData: FormData) {
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 2. Get tenant_id
    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();
    const tenantId = profile!.tenant_id;

    // 3. Validate inputs
    const name = (formData.get('name') as string)?.trim();
    if (!name) return { error: 'Nome é obrigatório.' };

    // 4. Database operation
    const { data, error } = await supabase
        .from('resources')
        .insert({
            tenant_id: tenantId,
            name: name,
            // ... other fields
        })
        .select('id')
        .single();

    if (error) return { error: 'Erro ao criar recurso.' };

    // 5. Cache revalidation
    revalidatePath('/recursos');

    // 6. Redirect or return
    redirect(`/recursos/${data.id}`);
}
```

### Error Handling
- Return `{ error: string }` for recoverable errors
- Use `redirect()` for fatal errors (not authenticated, etc.)
- Never throw exceptions in Server Actions
- Errors displayed via `toast` in Client Component or inline feedback

### Tenant Isolation
- **Critical**: All queries must filter by `tenant_id`
- Do **NOT** trust client-provided `tenant_id`—always fetch from user record
- Insert always includes `tenant_id: tenantId`
- Update/Select always filters `.eq('tenant_id', tenantId)`

## Styling Approach (Tailwind + inline styles)

### Design System (CSS Variables)
Defined in `frontend/src/app/globals.css`:

**Light Mode (default, forced via `forcedTheme="light"`)**
```css
--background: #F6F2EA    /* Beige background */
--foreground: #2D2319    /* Dark brown text */
--card: #FFFFFF          /* White cards */
--primary: #B8960C       /* Gold accent */
--secondary: #EDE5D3     /* Light border/accent */
--muted-foreground: #A69060  /* Gray text */
--border: #EDE5D3        /* Light border */
--input: #EDE5D3         /* Input background */
--destructive: #D94444   /* Red for errors */
```

### Styling Priority
1. **Tailwind classes**: Preferred for responsive design (e.g., `flex`, `gap-4`, `p-6`)
2. **Inline styles**: Used for component-specific spacing, colors, hover states
3. **CSS classes**: Rarely used, mostly for modal animations

### Inline Style Patterns
```typescript
// Table header styling
const thStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.07em",
    color: "#BBA870",
    borderBottom: "1px solid var(--border)",
};

// Dynamic background
style={{
    background: open ? "var(--accent)" : "var(--card)",
    transition: "all 0.15s",
}}

// Hover effects
onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#FBF5EA"}
onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
```

### Color Usage
- **Gold (#B8960C)**: Primary actions, focus rings, highlights
- **Beige (#F6F2EA)**: Main background
- **White (#FFFFFF)**: Cards, popovers
- **Brown (#2D2319)**: Text, foreground
- **Gray (#A69060)**: Muted text, disabled states
- **Red (#D94444)**: Errors, destructive actions

### Responsive Design
- Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Mobile-first approach
- Test on viewport sizes: 375px (mobile), 768px (tablet), 1024px (desktop)

## TypeScript Usage

### Strictness
- **Enabled**: `strict: true` in `tsconfig.json`
- **Required**: Type all function params and returns
- **No implicit any**: Always explicit types

### Patterns

**Function Types**
```typescript
// Server Action return types
export async function criarCliente(formData: FormData): Promise<{ error: string } | void>

// Component props
interface AppointmentActionsProps {
    appointmentId: string;
    rsvpStatus: string;
    noShow: boolean;
}

// Helper functions with explicit return
function formatarData(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR");
}
```

**Database Type Safety**
- Use Supabase's auto-generated types when available
- Explicitly type responses:
```typescript
const { data: profile } = await supabase
    .from('users')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single() as { data: { tenant_id: string; role: string } };
```

**Casting (rare)**
- Used for FormData handling and nested joins:
```typescript
const name = formData.get('name') as string;
//@ts-ignore - nested join type difficulty (Evolution API join)
const instanceName = profile?.tenants?.evolution_instance_name || '';
```

## Error Handling

### Frontend (Next.js)
**Server Actions Pattern**
- Return `{ error: string }` for user-facing errors
- Display via `setFeedback()` state or `toast()` from Sonner
- Redirect on auth failure

```typescript
// Client Component calling Server Action
function handleAction(fn: () => Promise<{ error?: string }>) {
    startTransition(async () => {
        const result = await fn();
        if (result.error) {
            setFeedback("Erro: " + result.error);
        } else {
            setFeedback("Sucesso!");
        }
        setTimeout(() => setFeedback(null), 3000);
    });
}
```

**API Fetch Errors (e.g., WhatsApp Integration)**
- Graceful fallback: Log to console, do not block main flow
```typescript
// Frontend/Server Action calling FastAPI backend
try {
    await fetch(`${backendUrl}/api/v1/whatsapp/send-rsvp`, { ... });
} catch (error) {
    console.error('Falha ao acionar webhook:', error);
    // Agendamento salvo mesmo assim
}
```

### Backend (FastAPI)
**Middleware & Validation**
- Rate limiting: 60 requests per 60 seconds per IP
- CORS: Whitelist only frontend domains
- Security headers: NoSniff, XFrame, ReferrerPolicy

**Endpoint Response Pattern**
```python
# Return error details consistently
if not response.ok:
    errorData = await response.json().catch(() => ({}));
    return { error: errorData.detail || "Erro ao conectar backend" };

# For no_show/conflict checks: return error string, not exception
if conflicts.length > 0:
    return { error: "Sala já ocupada neste horário..." };
```

### Logging
- **Frontend**: `console.error()`, `console.log()` for debugging
- **Backend**: Standard logging to stdout (FastAPI/Uvicorn)
- **Production**: No stack traces exposed to clients

## Design Tokens & Colors

### Typography
- **Font Sans**: Urbanist (body text, UI)
- **Font Serif**: Playfair Display (titles, branding)
- **Size scale**: 10px (labels), 12px (small), 13px (body), 14px (default), 16px+ (headings)
- **Weight scale**: 400 (normal), 600 (semibold), 700 (bold)
- **Letter spacing**: 0.07em (uppercase labels)

### Spacing Scale (Tailwind)
- `4px` (gap-1), `8px` (gap-2), `12px` (gap-3), `16px` (gap-4), `24px` (gap-6), `32px` (gap-8)
- Padding/margin follow same scale
- Use Tailwind shortcuts: `p-4`, `gap-3`, `mb-6`

### Borders & Radius
- **Border radius**: 0.625rem (10px) default, 12px for large elements, 18px for modals
- **Border width**: 1px (standard), use `var(--border)` for color
- **Border style**: Solid only

### Shadow & Depth
- **Card**: Minimal shadow or none, use border only
- **Modal**: `shadow-2xl` (0 25px 50px -12px rgba(0,0,0,0.25))
- **Dropdown**: `shadow-md` (0 4px 6px -1px rgba(0,0,0,0.1))
- **Tooltip**: `shadow-sm` (0 1px 2px 0 rgba(0,0,0,0.05))

### Interaction States
- **Hover**: Subtle background change, border highlight on focus
- **Focus ring**: `var(--ring)` (#B8960C, 3px offset)
- **Disabled**: `opacity: 0.5`, `cursor: not-allowed`
- **Loading**: `isPending` state disables button, shows subtle opacity change
- **Transitions**: `transition: all 0.15s` (fast), `0.2s` (modals)

### Status Colors
- **Pending**: Gray (#A69060)
- **Confirmed**: Green (#2D8C4E)
- **Cancelled**: Red (#D94444)
- **Active/Available**: Gold (#B8960C)

