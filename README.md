# Nova Analytics

Modern data analytics dashboard — real-time insights, beautiful visualizations, and powerful reporting for teams that need clarity and speed.

Built with Next.js 16, shadcn/ui, Tailwind CSS v4, TypeScript, and Clerk authentication.

---

## Tech Stack

| Category             | Technology                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------- |
| Framework            | [Next.js 16](https://nextjs.org/16) (App Router)                                         |
| Language             | [TypeScript](https://www.typescriptlang.org) 5.7 (strict mode)                            |
| Styling              | [Tailwind CSS v4](https://tailwindcss.com) + CSS custom properties (OKLCH)                |
| UI Components        | [shadcn/ui](https://ui.shadcn.com) (New York) + [Radix UI](https://www.radix-ui.com)      |
| Authentication       | [Clerk](https://clerk.com) (keyless mode, orgs, billing, RBAC)                           |
| Data Fetching        | [TanStack React Query](https://tanstack.com/query) v5                                    |
| Forms                | [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev)                      |
| Tables               | [TanStack Table](https://tanstack.com/table) v8                                           |
| Charts               | [Recharts](https://recharts.org)                                                          |
| State Management     | [Zustand](https://zustand-demo.pmnd.rs) 5 + [Nuqs](https://nuqs.47ng.com/)               |
| Command Palette      | [kbar](https://kbar.vercel.app/)                                                          |
| Error Tracking       | [Sentry](https://sentry.io/for/nextjs/)                                                   |
| Animations           | [Motion](https://motion.dev)                                                              |
| Icons                | [Tabler Icons](https://tabler.io/icons) (centralized in `src/components/icons.tsx`)       |
| Linter / Formatter   | [Oxlint](https://oxc.rs) + [Oxfmt](https://oxc.rs)                                       |
| Pre-commit           | [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged) |

---

## Features

- **Landing page** — Modern marketing page with hero, feature grid, and CTAs. Unauthenticated visitors see the landing; authenticated users go straight to the dashboard.
- **Analytics overview** — Dashboard with Recharts graphs, KPIs, and parallel-routed chart panels with independent loading and error boundaries.
- **Data tables** — Products and Users tables with TanStack Table + React Query (server prefetch + client cache), search, filter, pagination via nuqs URL state.
- **Authentication** — Sign-in and sign-up via Clerk (keyless mode, social logins, passwordless, SSO). Post-login redirect to `/dashboard/overview`.
- **Multi-tenant workspaces** — Clerk Organizations for team management (create, switch, manage members and roles).
- **Billing & subscriptions** — Clerk Billing with plan management, pricing table, and feature gating per plan.
- **RBAC navigation** — Client-side nav filtering based on organization, permissions, and roles.
- **Kanban board** — Drag-and-drop task management with dnd-kit, priority badges, assignees, and due dates.
- **Chat UI** — Real-time messaging layout with conversation list, message bubbles, file attachments, and auto-reply demo.
- **Notification center** — Bell icon badge in header, popover preview, and full page with All/Unread/Read tabs.
- **Forms** — Basic, advanced, multi-step, and sheet forms using TanStack Form + Zod validation.
- **Profile management** — Clerk-hosted account settings (security, profile, connected accounts).
- **Multi-theme** — 11 themes (Nova, Vercel, Claude, Supabase, and more) with theme selector and dark/light mode.
- **Command + K** — Global search palette via kbar (navigation, actions, quick search).
- **Infobar** — Contextual info panel on any page.
- **Responsive** — Mobile-first design with collapsible sidebar, adaptive layouts.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18 or [Bun](https://bun.sh)
- A Clerk account (optional — keyless mode works without API keys)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd nova-analytics

# Install dependencies
npm install
# or
bun install

# Copy environment variables
cp env.example.txt .env.local

# Start development server
npm run dev
# or
bun run dev
```

The app starts at [http://localhost:3000](http://localhost:3000).

### Clerk Keyless Mode

Clerk supports **keyless mode** — the app works immediately without any API keys. A setup popup appears in development; click it to claim your keys and persist them to `.env.local`. No configuration required to get started.

### Environment Variables

Create `.env.local` from `env.example.txt`:

```env
# Required for authentication (Clerk — leave empty for keyless mode)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Redirect URLs after authentication
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard/overview"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard/overview"

# Optional: Sentry error tracking
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ORG=
NEXT_PUBLIC_SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
NEXT_PUBLIC_SENTRY_DISABLED="false"
```

See [docs/clerk_setup.md](./docs/clerk_setup.md) for detailed Clerk configuration.

### Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run linter (oxlint)
npm run lint:fix     # Fix lint issues + format
npm run format       # Format code (oxfmt)
npm run format:check # Check formatting
```

---

## Deployment

### Vercel (Recommended)

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Deploy

### Docker

Production-ready Dockerfiles are included:

```bash
# Node.js
docker build --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx -t nova-analytics .

# Bun
docker build -f Dockerfile.bun --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx -t nova-analytics .

docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx \
  -e CLERK_SECRET_KEY=sk_live_xxxxx \
  --restart unless-stopped \
  --name nova-analytics \
  nova-analytics
```

---

## Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── auth/              # Sign-in, sign-up pages
│   ├── dashboard/         # Protected dashboard routes
│   ├── layout.tsx         # Root layout with all providers
│   └── page.tsx           # Landing page (public)
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── layout/            # Sidebar, header, providers
│   ├── landing/           # Landing page sections
│   ├── themes/            # Theme system (11 themes)
│   ├── kbar/              # Command palette
│   └── icons.tsx          # Centralized icon registry
├── features/              # Feature modules
│   ├── auth/              # Auth UI components
│   ├── overview/          # Dashboard analytics
│   ├── products/          # Product CRUD (React Query)
│   ├── users/             # User management (React Query)
│   ├── kanban/            # Task board
│   ├── chat/              # Messaging UI
│   └── notifications/     # Notification center
├── config/                # Navigation, RBAC, data table config
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities (api client, query client)
├── styles/                # Global CSS + theme files
└── types/                 # TypeScript definitions
```

---

## Architecture Conventions

- **Feature-based modules** — Each feature has its own `api/` layer: `types.ts` (contracts) → `service.ts` (data access) → `queries.ts` (React Query keys). Swap `service.ts` to connect a real backend.
- **Data fetching** — TanStack React Query with `void prefetchQuery()` on the server + `useSuspenseQuery` on the client. `HydrationBoundary` + `dehydrate` for streamed SSR.
- **URL state** — `nuqs` for search params. Use `searchParamsCache` on the server and `useQueryStates` on the client.
- **Icons** — All icons are centralized in `src/components/icons.tsx`. Import as `import { Icons } from '@/components/icons'`. Never import directly from `@tabler/icons-react`.
- **Themes** — 11 themes defined as CSS files in `src/styles/themes/`. Set `DEFAULT_THEME` in `src/components/themes/theme.config.ts`.
- **RBAC** — Navigation filtering via `useFilteredNavItems()` in `src/hooks/use-nav.ts`. For UX only — implement server-side checks for security.

---

## Feature Cleanup

Optional features (kanban, chat, notifications, extra themes, sentry) can be removed via the cleanup script:

```bash
node scripts/cleanup.js --list          # See available features
node scripts/cleanup.js --interactive   # Interactive removal
node scripts/cleanup.js kanban chat     # Remove specific features
```

Delete `scripts/cleanup.js` when done.

---

## License

MIT
