# Testing

## Current State

**Status**: Minimal/None - No test framework installed or active
**Coverage**: 0% (no tests exist)
**Type Safety**: Partial (TypeScript strict mode enabled, catches compile errors)

## Test Framework (if any)

### Not Installed
- **Jest**: Not in dependencies
- **Vitest**: Not in dependencies
- **Playwright/Cypress**: No E2E framework
- **Testing Library**: No testing utilities
- **Pytest** (backend): Not in requirements.txt

### Development Dependencies (Current)
```json
{
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "16.1.6",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

Only ESLint (linting) is configured, no testing framework.

## What's Tested

### Compile-Time Checks (via TypeScript)
- **Type checking**: Strict mode catches type mismatches, missing properties
- **Props validation**: Component prop types enforced
- **Function signatures**: Return types and parameters validated
- **Server Action contracts**: FormData handling, return types

**Example - Caught by TypeScript:**
```typescript
// ✅ OK - types match
const { data: profile } = await supabase
    .from('users')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

// ❌ ERROR if missing field in type
console.log(profile.missing_field); // Type error
```

### ESLint Checks (via Next.js config)
- **React best practices**: Missing dependencies, stale closures
- **Next.js patterns**: Dynamic imports, Image optimization, Layout children
- **Web Vitals**: Core Web Vitals compliance
- **TypeScript**: No implicit any, no unused variables

**Example - ESLint catches:**
- Unused imports
- Missing `key` props in lists
- Async operations in event handlers without try-catch (partial)
- Missing dependency in useEffect

### Manual Testing (Current Approach)
- **Local dev server**: `npm run dev` for interactive testing
- **Browser testing**: Manual verification in browser
- **API testing**: Manual fetch calls or Postman
- **Database**: Direct Supabase console inspection

## Gaps

### Frontend (Next.js 16 / React 19)

| Area | Gap | Impact | Priority |
|------|-----|--------|----------|
| Unit Tests | No Jest/Vitest setup for components/utils | Cannot catch logic regressions | Medium |
| Component Rendering | No snapshot tests | Breaking changes undetected | Low |
| Integration Tests | No mocking of Server Actions | Cannot test client-server flow | High |
| E2E Tests | No Playwright/Cypress | Cannot test full user journeys | Medium |
| Server Actions | No tests for FormData parsing, errors | Critical logic untested | High |
| API Integration | No mocked fetch tests | Breaking changes to FastAPI uncaught | High |
| Accessibility | No axe/pa11y testing | WCAG compliance unknown | Low |
| Performance | No Lighthouse CI | LCP/CLS metrics unmonitor | Low |

### Backend (FastAPI)

| Area | Gap | Impact | Priority |
|------|-----|--------|----------|
| Unit Tests | No pytest setup | Business logic untested (rate limiting, auth) | High |
| Route Tests | No endpoint testing | API contract changes undetected | High |
| Mocking | No mocking of Evolution API calls | Cannot test offline | High |
| Integration | No Supabase DB test setup | Multi-tenant queries untested | High |
| Error Paths | No test for 429 rate limit, CORS | Edge cases unvalidated | Medium |

### Cross-System

| Gap | Impact |
|-----|--------|
| No pre-commit hooks | Bad code can be committed |
| No CI/CD pipeline | No automated testing on push |
| No database migrations testing | Schema changes untested |
| No load testing | Scalability unknown |

## Recommended Testing Strategy

### Phase 1: Foundation (Low Risk)
1. **Setup Jest + React Testing Library**
   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/dom jest-environment-jsdom
   ```
2. **Test Server Actions** (highest ROI)
   - Mock Supabase client
   - Test FormData parsing, tenant isolation, error cases
3. **Example test**:
   ```typescript
   // __tests__/criarCliente.test.ts
   import { criarCliente } from '@/app/(dashboard)/clientes/novo/actions';
   import { jest } from '@jest/globals';

   jest.mock('@/utils/supabase/server', () => ({
       createClient: jest.fn(() => ({
           auth: { getUser: jest.fn(() => ({ data: { user: { id: 'user123' } } })) },
           from: jest.fn((table) => ({
               select: jest.fn().mockReturnThis(),
               eq: jest.fn().mockReturnThis(),
               single: jest.fn(() => ({ data: { tenant_id: 'tenant123' } })),
               insert: jest.fn().mockReturnThis(),
           }))
       }))
   }));

   test('criarCliente inserts with tenant_id', async () => {
       const formData = new FormData();
       formData.append('name', 'Test Client');

       const result = await criarCliente(formData);
       expect(result).toBeUndefined(); // success redirects
   });
   ```

### Phase 2: Backend Tests (Medium Risk)
1. **Setup pytest**
   ```bash
   pip install pytest pytest-asyncio httpx
   ```
2. **Test endpoints**
   - Test rate limiting (429 status)
   - Test CORS headers
   - Test WhatsApp integration (mocked)
3. **Example**:
   ```python
   # tests/test_whatsapp.py
   import pytest
   from fastapi.testclient import TestClient
   from app.main import app

   client = TestClient(app)

   def test_rate_limit():
       for i in range(61):
           response = client.get("/api/v1/whatsapp/status")
       assert response.status_code == 429
   ```

### Phase 3: E2E Tests (Lower Priority)
1. **Setup Playwright**
   ```bash
   npm install --save-dev @playwright/test
   ```
2. **Test critical flows**
   - Login → Create Client → Schedule Appointment → RSVP
   - WhatsApp integration flow (QR code → connected)
3. **Not critical now** but important before public launch

### Phase 4: CI/CD Integration (Planned)
- Pre-commit hooks: Run linter + type check
- GitHub Actions: Run tests on push
- Coverage threshold: 70%+ for critical paths (Server Actions, API)

## Quick Start for Contributors

### Running Existing Checks
```bash
# Frontend
cd frontend
npm run lint                # ESLint only (no tests)
npm run build              # Type check + bundle
npm run dev                # Local server + browser testing

# Backend
cd backend
uvicorn app.main:app --reload  # Run with auto-reload
```

### What to Do Before Committing (Currently)
1. Run `npm run lint` (frontend) — fix any errors
2. Run `npm run build` — catch type errors
3. Manual testing in browser/API client
4. Check DEVLOG.md for migration/integration changes

### When Tests Are Added
```bash
# Run all checks
npm run lint
npm run test              # Unit + integration tests
npm run build
npm run test:e2e          # End-to-end tests
```

## Testing Debt Register

| Item | Impact | Status | Owner |
|------|--------|--------|-------|
| No Server Action tests | HIGH - Core mutation logic untested | Pending | @claude |
| No API endpoint tests | HIGH - FastAPI routes untested | Pending | @claude |
| No Supabase mock | MEDIUM - DB interactions untested | Pending | @claude |
| No E2E flow tests | MEDIUM - User journeys untested | Pending | V2.0 |
| No accessibility tests | LOW - WCAG compliance unknown | Pending | Post-launch |
| No load testing | LOW - Scalability unknown | Pending | Post-launch |

## Recommended Immediate Action

**If testing is required for next feature**:
1. Install Jest + React Testing Library (30 min)
2. Create test file for new Server Action (45 min)
3. Set up Supabase mock (60 min)
4. Write 3-5 critical path tests (2 hours)

**Effort**: ~3-4 hours to get basic unit testing running
**ROI**: Catch 70% of regressions in Server Actions + API endpoints

