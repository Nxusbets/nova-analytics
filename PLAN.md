# Nova Analytics — Round 2 Implementation Plan

## Overview

This plan covers implementation of authentication, the "Ask Nova" AI assistant,
testing, CI, and verification for the Nova Analytics dashboard.

---

## PART A — REPAIR ROUND 1

### A1. Real Authentication

**Goal:** Replace demo-mode cookie bypass with working Clerk authentication.

**Current state:**
- `src/proxy.ts`: Dual-mode middleware — Clerk OR `demo_session=demo_user_nova` cookie
- `src/lib/demo-auth.ts`: Constants + `isClerkConfigured()` guard
- `src/lib/demo-auth-server.ts`: Server-side cookie reader
- `src/features/auth/components/demo-sign-in.tsx`: Client cookie setter
- `src/components/layout/demo-provider.tsx`: Dead demo context (unmounted)
- `src/hooks/use-auth.tsx`: Branches on `isClerkConfigured()`
- `src/app/page.tsx`: Branches on `isClerkConfigured()`

**Steps:**

1. Obtain real Clerk API keys (publishable + secret)
2. Remove demo-auth system:
   - Delete `src/lib/demo-auth.ts`
   - Delete `src/lib/demo-auth-server.ts`
   - Delete `src/features/auth/components/demo-sign-in.tsx`
   - Delete `src/components/layout/demo-provider.tsx`
3. Rewrite `src/proxy.ts` — Clerk-only middleware, no cookie fallback
4. Rewrite `src/hooks/use-auth.tsx` — Clerk-only auth provider, remove DemoAuthProvider
5. Rewrite `src/app/page.tsx` — Clerk-only auth check
6. Rewrite `src/features/auth/components/sign-in-view.tsx` — Always show Clerk, remove `isClerkConfigured()` branch
7. Verify: `demo_session=demo_user_nova` grants zero access to `/dashboard`

**Files changed:** 4 deleted, 4 rewritten

### A2. Fix Signup Page

**Root cause:** `sign-up-view.tsx` renders `<ClerkSignUpForm>` unconditionally. Without valid Clerk keys, the Clerk SDK throws at runtime.

**Fix:**
- With real Clerk keys (A1), the component works natively
- Add an `ErrorBoundary` wrapper around the Clerk form for edge cases

**Files changed:** `src/features/auth/components/sign-up-view.tsx`

### A3. Reviewer Credentials

- **Email:** `reviewer@novaanalytics.io`
- **Password:** Set via Clerk Dashboard > Users > Create user
- Pre-seeded before deployment

---

## PART B — AI AGENT FEATURE

### B1-B2. "Ask Nova" AI Assistant

**Architecture:**

```
Chat UI (client)
  → fetch POST /api/ask-nova (stream: true)
    → Route handler:
      1. Verifies Clerk auth
      2. Loads dashboard data context (products, stats, sales)
      3. Builds system prompt + conversation history
      4. Calls OpenAI API with stream: true
      5. Saves messages to Supabase
      6. Returns ReadableStream response
  → UI reads stream chunks, renders progressively
  → On completion: saves full assistant message to Supabase
```

#### Step 1: Supabase Setup

**New dep:** `@supabase/supabase-js`

**Schema:**

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conv_id ON messages(conversation_id);
```

**File created:** `src/lib/supabase.ts` — server-side service role client

#### Step 2: API Route — OpenAI Proxy

**File:** `src/app/api/ask-nova/route.ts`

```
POST /api/ask-nova
Body: { conversationId?: string, message: string }
Auth: Clerk auth() required
Response: ReadableStream (SSE-like text/event-stream)

Flow:
1. auth() check → 401 if unauthenticated
2. If no conversationId → create new conversation in Supabase
3. Save user message to messages table
4. Build dashboard context:
   - Products: all 20 products with categories, prices
   - Overview: revenue ($1,250), customers (1,234), accounts (45,678), growth (4.5%)
   - Sales: 5 recent transactions with amounts
   - Chart data: bar (6 months), area (12 months), pie (browser breakdown)
5. Assemble messages array:
   - System prompt (guardrails)
   - Dashboard context as system message
   - Previous conversation history
   - User's new message
6. Call OpenAI with stream: true
7. Stream response chunks via ReadableStream
8. After stream ends, save assistant message to Supabase

System prompt:
"You are Nova AI, an analytics assistant for the Nova Analytics dashboard.
Your role is to help users understand their dashboard data. You are given
context about products, revenue, customer metrics, and sales data.
Only answer questions based on the data provided. Do not make up data.
If asked off-topic, politely redirect to dashboard analytics. Be concise
and reference specific data points. Format numbers clearly."
```

#### Step 3: Feature Module — Ask Nova

```
src/features/ask-nova/
  api/
    types.ts          — ChatMessage, Conversation, API types
    service.ts        — CRUD for conversations + messages in Supabase
                        getDashboardContext() — aggregates mock data
    queries.ts        — React Query key factory + queryOptions
  components/
    ask-nova-page.tsx     — Page layout (sidebar + chat area)
    conversation-list.tsx — Sidebar list of past conversations
    chat-messages.tsx     — Scrollable message area
    message-bubble.tsx    — Single message (user/assistant styling)
    chat-input.tsx        — Text input + send with loading state
    ask-nova-listing.tsx  — Server component with prefetch + HydrationBoundary
```

#### Step 4: Streaming UI

- Use `fetch` with `response.body.getReader()`
- Decode `TextDecoder` chunks
- Append tokens progressively to assistant message state
- Show typing indicator during streaming
- On error: toast notification, no blank screen

#### Step 5: Page Route + Navigation

- `src/app/dashboard/ask-nova/page.tsx` — server component with Suspense
- Add to `src/config/nav-config.ts`:
  ```ts
  { title: 'Ask Nova', url: '/dashboard/ask-nova', icon: 'chat', shortcut: ['a', 'n'], items: [] }
  ```

#### Step 6: Guardrails

- Server: System prompt restricts topic to dashboard data
- Client: Error boundary wraps chat component
- API: Returns 400 for empty messages, 401 for unauthenticated, 500 with message for OpenAI errors
- Rate limiting: n/a for demo

---

## PART C — ENGINEERING DISCIPLINE

### C1. E2E Tests (Playwright)

**Setup:**
```bash
bun add -D @playwright/test
npx playwright install chromium
```

**Files:**

- `e2e/playwright.config.ts`
- `e2e/landing.spec.ts` — Landing loads, CTAs visible
- `e2e/auth.spec.ts` — Sign-in with reviewer, dashboard access, logout
- `e2e/ask-nova.spec.ts` — Chat loads, question sent, response received

```ts
// e2e/auth.spec.ts example structure
test('reviewer can log in', async ({ page }) => {
  await page.goto('/auth/sign-in');
  await page.fill('input[name=identifier]', 'reviewer@novaanalytics.io');
  await page.fill('input[name=password]', process.env.REVIEWER_PASSWORD!);
  await page.click('button[type=submit]');
  await page.waitForURL('/dashboard/overview');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});
```

### C2. GitHub Actions CI

**File:** `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
      CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run build
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --project=chromium
```

### C3. VERIFICATION.md

Checklist at repository root covering every public flow with checked status, date, and time.

**Sections:**
1. Landing Page CTAs
2. Signup flow
3. Login with reviewer
4. Dashboard access
5. Ask Nova chat
6. Logout
7. Demo cookie blocking

### C4. CLAUDE_PROCESS.md — Append Round 2

Append detailed development log with:
- Raw prompts used for each task
- Claude Code transcripts (key excerpts)
- Terminal commands run
- Failed attempts and how they were corrected
- Design decisions and rationale for each major choice

---

## PART D — SUBMISSION

1. **Repository:** Public GitHub
2. **Deployment:** Vercel HTTPS URL
3. **Reviewer Credentials:** `reviewer@novaanalytics.io` + password
4. **Demo Video:** 5-10 min Loom/YouTube — signup, login, 2 Ask Nova questions, logout, architecture walkthrough
5. **Known Limitations:** Documented in VERIFICATION.md

---

## Execution Order

| # | Area | Task | Depends On |
|---|------|------|-----------|
| 1 | A1 | Create Clerk project, get API keys | — |
| 2 | A1 | Remove demo-auth code | 1 |
| 3 | A1 | Rewrite middleware + auth for Clerk-only | 2 |
| 4 | A2 | Deploy to Vercel, test sign-up | 3 |
| 5 | A3 | Create reviewer in Clerk Dashboard | 1 |
| 6 | B3 | Create Supabase project + tables | — |
| 7 | B2 | Create `src/lib/supabase.ts` | 6 |
| 8 | B2 | Create `/api/ask-nova` route (OpenAI proxy) | 7 |
| 9 | B1 | Create feature module (types/service/queries) | 8 |
| 10 | B1 | Build chat UI + streaming | 9 |
| 11 | B1 | Add page route + nav item | 10 |
| 12 | C1 | Install Playwright + write E2E tests | 11 |
| 13 | C2 | Create GitHub Actions CI | 12 |
| 14 | C3 | Write VERIFICATION.md | 13 |
| 15 | C4 | Append CLAUDE_PROCESS.md | 14 |
| 16 | D | Deploy + verify everything | 15 |

---

## Environment Variables

| Variable | Source | Used In |
|----------|--------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard | Client + Server |
| `CLERK_SECRET_KEY` | Clerk Dashboard | Server |
| `OPENAI_API_KEY` | OpenAI Dashboard | Server (API route) |
| `SUPABASE_URL` | Supabase Dashboard | Server |
| `SUPABASE_ANON_KEY` | Supabase Dashboard | Client (if needed) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | Server |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Already set | Client |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Already set | Client |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Already set | Client |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Already set | Client |

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Clerk sign-up 500 persists | Low | Proper API keys + error boundary |
| OpenAI key exposed | None | Server-only, never in client bundle |
| Streaming fails mid-response | Medium | Error toast, save partial message, retry |
| Supabase connection issues | Low | Connection pooling, retry logic |
| Playwright flaky on CI | Medium | Use `--retries 2`, stable selectors |
