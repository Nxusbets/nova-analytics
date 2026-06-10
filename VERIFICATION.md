# VERIFICATION.md — Live Deployment Checklist

> **Live URL:** https://[your-vercel-url].vercel.app
> **Date of verification:** 2026-06-10
>
> All items below must be verified against the live deployment (not localhost).
> Open an incognito/private window before verifying each flow.

---

## 1. Landing Page CTAs

| # | Item | Status | Date | Time | Notes |
|---|------|--------|------|------|-------|
| 1.1 | Landing page loads without errors | ⬜ Not checked | — | — | |
| 1.2 | "Turn data into decisions" headline visible | ⬜ Not checked | — | — | |
| 1.3 | "Start free trial" button visible and links to `/auth/sign-up` | ⬜ Not checked | — | — | |
| 1.4 | "Sign in" button visible and links to `/auth/sign-in` | ⬜ Not checked | — | — | |
| 1.5 | Features section renders with cards | ⬜ Not checked | — | — | |
| 1.6 | Header navigation visible | ⬜ Not checked | — | — | |

## 2. Signup Flow

| # | Item | Status | Date | Time | Notes |
|---|------|--------|------|------|-------|
| 2.1 | `/auth/sign-up` loads without HTTP 500 | ⬜ Not checked | — | — | |
| 2.2 | Sign-up form renders with email/password fields | ⬜ Not checked | — | — | |
| 2.3 | "Sign in" link navigates to `/auth/sign-in` | ⬜ Not checked | — | — | |

## 3. Login with Reviewer Account

| # | Item | Status | Date | Time | Notes |
|---|------|--------|------|------|-------|
| 3.1 | `/auth/sign-in` loads with form | ⬜ Not checked | — | — | |
| 3.2 | Login with reviewer credentials succeeds | ⬜ Not checked | — | — | |
| 3.3 | After login, redirects to `/dashboard/overview` | ⬜ Not checked | — | — | |
| 3.4 | Dashboard loads with welcome message | ⬜ Not checked | — | — | |

## 4. Dashboard Sections

| # | Item | Status | Date | Time | Notes |
|---|------|--------|------|------|-------|
| 4.1 | Overview page renders with stat cards and charts | ⬜ Not checked | — | — | |
| 4.2 | Product page loads with data table | ⬜ Not checked | — | — | |
| 4.3 | Users page loads with data table | ⬜ Not checked | — | — | |
| 4.4 | Kanban page loads | ⬜ Not checked | — | — | |
| 4.5 | Chat page loads | ⬜ Not checked | — | — | |
| 4.6 | Profile page loads | ⬜ Not checked | — | — | |

## 5. Ask Nova Chat

| # | Item | Status | Date | Time | Notes |
|---|------|--------|------|------|-------|
| 5.1 | `/dashboard/ask-nova` loads without errors | ⬜ Not checked | — | — | |
| 5.2 | Empty state shows suggested questions | ⬜ Not checked | — | — | |
| 5.3 | Clicking "What was the best-selling category?" gets a grounded response | ⬜ Not checked | — | — | Must reference actual data (e.g., Furniture) |
| 5.4 | Clicking "What is the total revenue?" gets grounded response | ⬜ Not checked | — | — | Must reference $1,250.00 |
| 5.5 | Streaming animation visible during response | ⬜ Not checked | — | — | |
| 5.6 | Chat history persists on page refresh | ⬜ Not checked | — | — | |
| 5.7 | Off-topic question is politely redirected | ⬜ Not checked | — | — | e.g., "What's the weather?" |

## 6. Logout

| # | Item | Status | Date | Time | Notes |
|---|------|--------|------|------|-------|
| 6.1 | Logout button visible in sidebar/header | ⬜ Not checked | — | — | |
| 6.2 | Clicking logout redirects to landing page | ⬜ Not checked | — | — | |
| 6.3 | After logout, navigating to `/dashboard` redirects to sign-in | ⬜ Not checked | — | — | |

## 7. Demo Cookie Blocking

| # | Item | Status | Date | Time | Notes |
|---|------|--------|------|------|-------|
| 7.1 | Setting `demo_session=demo_user_nova` cookie and visiting `/dashboard` redirects to sign-in | ⬜ Not checked | — | — | Use browser dev tools |
| 7.2 | No demo bypass mechanism exists on the live site | ⬜ Not checked | — | — | |

---

## Known Limitations

| # | Limitation | Notes |
|---|------------|-------|
| 1 | **Chat history persistence requires Supabase setup** | The SQL migration in `supabase/migrations/001_create_chat_tables.sql` must be run against a Supabase project. The app handles missing env vars gracefully by showing the chat UI without persistence. |
| 2 | **Ask Nova requires OPENAI_API_KEY** | Without this env var, the assistant returns a fallback message: "The AI assistant is not configured yet." |
| 3 | **Clerk API keys required** | The app no longer supports demo mode. Valid `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are required for authentication. |
| 4 | **E2E tests run against live deployment** | Tests in `e2e/` assume Clerk is configured on the target URL. The auth tests use the sign-in page UI, not mocked auth. |
| 5 | **No rate limiting on Ask Nova API** | The `/api/ask-nova` endpoint does not implement rate limiting. For production, add rate limiting to control costs. |
| 6 | **Conversation titles are first message preview** | New conversations are titled with the first 60 characters of the user's first message. No AI-generated titles. |

---

## Setup Required Before Verification

Before running the checklist, the reviewer must:

1. **Create a Clerk application** at https://dashboard.clerk.com
2. **Set environment variables** in Vercel:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `OPENAI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. **Run the SQL migration** in Supabase SQL editor:
   - Copy contents of `supabase/migrations/001_create_chat_tables.sql`
   - Paste and run in Supabase SQL editor
4. **Create reviewer account** in Clerk Dashboard > Users > Add user:
   - Email: `reviewer@novaanalytics.io`
   - Set a password
5. **Deploy to Vercel** — connect repo, add env vars, deploy
