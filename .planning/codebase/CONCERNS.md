# Concerns & Technical Debt

## Known Bugs

### 1. Rooms Query Field Mismatch (CRITICAL)
**Location:** Multiple files
- **Schema** (`20260308000000_initial_schema.sql`): rooms table uses `active` field
- **Frontend queries** (`agenda/novo/page.tsx`, `agenda/page.tsx`, `config/salas/page.tsx`): using `is_active` field
- **Impact:** Rooms list queries will return null or fail silently; room filtering won't work correctly
- **Code Evidence:**
  - Schema: `active BOOLEAN DEFAULT TRUE` (line 88)
  - Client: `.eq("is_active", true)` (agenda/novo/page.tsx)
  - Client: `.select("id, name, is_active")` (config/salas/page.tsx line 59)

**Fix Required:** Either rename column in migration or update all client queries to use `.active`

### 2. Services Query Field Mismatch
**Location:** `QuickCreateModal.tsx` and `agenda/novo/page.tsx`
- **Schema:** services table uses `active` field
- **Frontend:** `.eq("is_active", true)` query
- **Impact:** Services filter won't work; may show inactive services or return empty list
- **Code Evidence:** `QuickCreateModal.tsx` line 118: `.eq("is_active", true)`

### 3. Slot Liberation Bug - Cancelled Appointments Still Block Slots
**Location:** `agenda/QuickCreateModal.tsx` (lines 137-142)
- **Issue:** When querying appointments for availability, the query does NOT filter out cancelled appointments
- **Query:** `.eq("is_block", false).eq("no_show", false)` — Missing `.neq("rsvp_status", "cancelled")`
- **Impact:** When an appointment is cancelled, the time slot remains occupied and cannot be booked by others
- **Code Path:**
  1. User cancels appointment → `cancelarAgendamento()` sets `rsvp_status = 'cancelled'`
  2. User tries to create new appointment in same slot
  3. Cancelled appointment is still in availability check
  4. Slot appears occupied → cannot book

**Fix Required:** Add filter `.neq("rsvp_status", "cancelled")` to availability query

## Incomplete Features

### 1. Session Form Step 3 (Incomplete)
**Location:** `frontend/src/app/(dashboard)/protocolos/[id]/sessoes/nova/SessaoForm.tsx`
- **Status:** Only 2 of 3 steps fully implemented
- **What's Missing:**
  - Step 3 (Depois) for post-procedure data collection
  - Weight after procedure
  - Post-procedure photo upload
  - Comparison visualization (weight before/after)
- **Impact:** Cannot fully record complete session data; incomplete protocol tracking
- **Note:** From DEVLOG: "Depois fica para próxima sessão"

### 2. RSVP Admin Page (Placeholder)
**Location:** `frontend/src/app/(dashboard)/rsvp/page.tsx`
- **Status:** Display-only page with future WhatsApp integration notice
- **Missing Features:**
  - No action buttons to confirm/decline RSVPs
  - No inline status change capability
  - Just displays pending appointments
- **Code Evidence:** Lines 84-123 show "Automação WhatsApp em breve" notice
- **Impact:** RSVP must be managed from Agenda page, not centralized management

### 3. Relatórios Page (Functional but Minimal)
**Location:** `frontend/src/app/(dashboard)/relatorios/page.tsx`
- **Status:** Basic metrics only, no advanced analysis
- **What's Available:**
  - Appointment count, sessions count, revenue
  - No-show rate, new clients, service rankings
- **What's Missing:**
  - Export functionality (CSV/PDF)
  - Advanced filters (date range picker, client filter)
  - Trend analysis (week-over-week, month-over-month)
  - Dashboard graphs/charts
  - Protocol completion metrics
  - Client retention analysis
- **Impact:** Limited business intelligence; reports hard to action on

### 4. WhatsApp Integration (Framework Only)
**Location:** `config/whatsapp/page.tsx` and `config/whatsapp/actions.ts`
- **Status:** UI skeleton with N/A backend endpoints
- **What's Built:**
  - QR code display for pairing
  - Connection status polling (5-second intervals)
  - Phone number input/validation
  - Disconnect button
- **What's Missing:**
  - Backend FastAPI endpoints (expects `NEXT_PUBLIC_API_URL/api/v1/whatsapp/...`)
  - No Evolution API integration yet
  - No message sending logic
  - No webhook handler for incoming confirmations
  - No RSVP confirmation flow via WhatsApp
  - Connection persistence (not stored in DB)
- **Code Evidence:**
  - `actions.ts` line 16-17: Calls `${backendUrl}/api/v1/whatsapp/instance/create`
  - Lines 46-47: Calls `/api/v1/whatsapp/instance/status`
  - Backend not in repo (expected external service)

### 5. N8N Integration (Referenced but Missing)
**Location:** Referenced in DEVLOG but no implementation found
- **Status:** Not found in codebase
- **Expected From DEVLOG:**
  - N8N endpoints for message triggers
  - Automatic RSVP messaging on appointment creation
  - Webhook handling for WhatsApp confirmations
- **What's Missing:**
  - N8N workflow definitions
  - Webhook setup documentation
  - Message template configuration
  - Trigger logic (what fires N8N workflows)

## Code to Remove (Out of Scope)

### 1. RSVP Status "noresponse"
**Location:** Schema + Code
- **Status:** Removed from DEVLOG but check if fully cleaned
- **Code Evidence:**
  - Schema line 134: `CHECK (rsvp_status IN ('pending', 'confirmed', 'noresponse', 'cancelled'))`
  - This should be updated to remove 'noresponse' option
- **Note:** Code already uses only confirmed/pending/cancelled, but schema constraint should be updated

## Security Considerations

### 1. Backend API Credentials Not Protected
**Location:** `config/whatsapp/actions.ts` (lines 21, 50, 78)
- **Issue:** Access token passed to external service in Authorization header
- **Risk:** If backend URL is compromised or misconfigured, token could be exposed
- **Mitigation:** Ensure NEXT_PUBLIC_API_URL is production HTTPS only; consider token rotation strategy
- **Code:** `'Authorization': 'Bearer ${session.access_token}'`

### 2. Phone Number Input Not Validated
**Location:** `config/whatsapp/page.tsx` (line 188)
- **Issue:** Phone input stripped of non-digits but no format validation
- **Example:** Could accept "123456789" (9 digits) instead of requiring 11+ for Brazil
- **Impact:** Invalid phone numbers could be stored; WhatsApp API would reject them later
- **Fix:** Validate length >= 11 for Brazil format before submission

### 3. Missing Tenant Isolation on WhatsApp Operations
**Location:** `config/whatsapp/actions.ts`
- **Issue:** Server actions don't validate tenant_id context when fetching auth token
- **Risk:** If backend accepts invalid tenant mapping, could manipulate another tenant's WhatsApp
- **Note:** Backend should enforce this, but frontend should also validate tenant context

### 4. No Rate Limiting on Polling
**Location:** `config/whatsapp/page.tsx` (line 33)
- **Issue:** 5-second polling with no maximum retry count
- **Risk:** Could cause excessive API calls if user leaves page open for hours
- **Mitigation:** Add max attempt counter (e.g., stop after 30 min of pending status)

## Performance Concerns

### 1. Short Polling Without Backoff
**Location:** `config/whatsapp/page.tsx` (useEffect, lines 30-38)
- **Issue:** Fixed 5-second interval polling with no exponential backoff
- **Impact:** Network overhead; could spike API usage if many users connecting simultaneously
- **Suggestion:** Implement exponential backoff or switch to webhook-based updates

### 2. Availability Query Not Indexed
**Location:** `agenda/QuickCreateModal.tsx` (lines 137-142)
- **Query:** Fetches all appointments for a day without indexes
- **Fields:** `starts_at`, `is_block`, `no_show`, `rsvp_status`
- **Impact:** Slow queries as appointment count grows (10k+ records)
- **Fix:** Add composite index on (tenant_id, starts_at, is_block)

### 3. Daily Appointments Fetched Every Step Change
**Location:** `QuickCreateModal.tsx` (useEffect, lines 134-144)
- **Issue:** Refetches all day appointments when `step` changes (even if not related to slots)
- **Impact:** Unnecessary DB queries when navigating steps 1-2
- **Fix:** Only fetch when entering step 3 (slot selection) and when date changes

### 4. Rooms Query Missing RLS Filtering
**Location:** Multiple agenda views
- **Issue:** Rooms filtered by `is_active` but not by `tenant_id` in some queries
- **Example:** `agenda/page.tsx` line 287-290 selects rooms but no tenant_id filter visible
- **Risk:** If RLS not enforced on rooms table, could see other tenants' rooms
- **Note:** Verify RLS policies on rooms table exist

## Fragile Areas

### 1. Time Slot Calculation Uses String Parsing
**Location:** `agenda/page.tsx` (lines 94-99, 81-82) and `QuickCreateModal.tsx` (lines 52-61)
- **Issue:** Time slots calculated with string manipulation (`split()`, `padStart()`, `slice()`)
- **Fragility:** Timezone issues not handled; DST changes could cause 1-hour drift
- **Example:** `formatTime()` uses client timezone without explicit handling
- **Risk:** Appointments could be created in wrong slots if user's timezone differs from server

### 2. Room/Service Relationship Not Enforced
**Location:** Database schema
- **Issue:** `services` table has no `room_id`; rooms not matched to services
- **Impact:** Any service can be booked in any room (no service → room restrictions)
- **Real-world Problem:** Could book "hair removal" service in wrong room type if business logic assumes otherwise

### 3. Slot Availability Logic Doesn't Account for Service Duration
**Location:** `agenda/QuickCreateModal.tsx` (lines 52-61)
- **Calculation:** Uses `durationMin` from selected service
- **Issue:** But this is called BEFORE service is selected in step 1 flow
- **Bug:** `slotAvailability` computed with potentially undefined duration (defaults to 60 min)
- **Impact:** Availability shown for wrong slot count if service duration changes after slot display

### 4. No Conflict Detection on Room Assignment
**Location:** Appointment creation
- **Issue:** While checking availability works, no final validation before insert
- **Risk:** Race condition: two concurrent requests could book same slot
- **Mitigation Needed:** Database-level unique constraint or transaction with lock

### 5. Cancelled Appointments Leak Protocol Context
**Location:** Schema + queries
- **Issue:** Cancelling appointment doesn't unmark `protocol_id`
- **Risk:** Protocol completion percentage could be wrong if linked appointment is cancelled
- **Question:** Should cancelled appointment still count toward protocol progress?

## Missing Validations

### 1. No Business Hours Enforcement
**Location:** Appointment creation
- **Issue:** Can create appointments outside configured business hours
- **Query Exists:** `business_hours` table loaded in agenda/page.tsx (lines 291-294)
- **But:** QuickCreateModal doesn't check business hours when creating
- **Impact:** Appointments scheduled at 11 PM if timezone timezone misaligned

### 2. No Double-Booking Prevention at DB Level
**Location:** Schema
- **Issue:** No unique constraint on (room_id, starts_at, ends_at, tenant_id)
- **Risk:** Two concurrent inserts could create overlapping appointments
- **Current Check:** Only application-level (JavaScript in browser)

### 3. No Minimum Duration Validation
**Location:** Services table
- **Issue:** `duration_minutes` can be NULL or 0
- **Query:** `QuickCreateModal` defaults to 60 if null (line 161)
- **Problem:** Inconsistency; could accept 0-minute services
- **Fix:** Add CHECK constraint: `duration_minutes > 0`

### 4. No Maximum Booking Window
**Location:** Agenda
- **Issue:** Can book appointments arbitrarily far in future or past
- **Typical Issue:** No validation like "must be within 30 days"
- **Risk:** Could accidentally create very old appointments

### 5. No Validation of Client Phone Format
**Location:** `clientes/novo/page.tsx` (if exists)
- **Issue:** Phone field accepted as text without format
- **Related Bug:** WhatsApp integration needs valid +55-formatted number
- **Missing:** Client phone doesn't validate international format

## Areas of High Technical Debt

### 1. Field Name Inconsistency (active vs is_active)
**Scope:** Widespread
- **active:** services, rooms (schema)
- **is_active:** services, rooms (frontend code)
- **Result:** Silent failures or null values across multiple features
- **Refactor Needed:** Standardize on one naming convention across schema + code

### 2. WhatsApp Integration Incomplete
**Scope:** 3 files (page, actions, + missing backend)
- **Status:** Frontend skeleton waiting for backend that doesn't exist
- **Dependencies:** NEXT_PUBLIC_API_URL, Evolution API credentials, N8N workflows
- **Effort to Complete:** High (requires backend + third-party integration)

### 3. Manual RSVP Management
**Scope:** agenda/page.tsx, rsvp/page.tsx, agendaActions.ts
- **Issue:** All confirmations manual; no automation
- **Workaround Mentioned:** "Automação WhatsApp em breve" (line 101 of rsvp/page.tsx)
- **Impact:** No SMS/WhatsApp reminders; client no-show rate high

### 4. Session Recording Incomplete
**Scope:** Protocols section
- **Steps 1-2:** Implemented (info + before data)
- **Step 3:** Placeholder only (after data + photos)
- **Impact:** Cannot track before/after transformation; limited reporting

### 5. Reporting Limited
**Scope:** relatorios/page.tsx
- **Current:** Static metrics only
- **Needed:** Visualizations, trends, export, advanced filters
- **Blocker:** For v2.0 IA features (growth analysis, reactivation suggestions)

## Recommendations (Priority Order)

1. **URGENT: Fix rooms/services field mismatch** — impacts core scheduler
2. **Fix slot liberation bug** — impacts booking availability
3. **Add RSVP filtering to availability query** — prevents double-bookings
4. **Remove RSVP status "noresponse" from schema** — clean up constraints
5. **Implement WhatsApp backend** — required for automation roadmap
6. **Complete session recording step 3** — required for full protocol tracking
7. **Add business hours enforcement** — prevents out-of-hours bookings
8. **Implement DB-level double-booking prevention** — race condition safety
9. **Enhance reporting with visualizations** — for business intelligence
10. **Add polling backoff to WhatsApp status check** — performance improvement
