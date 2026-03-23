# ProPilot — Claude Code Instructions

## Project Overview

ProPilot is an AI-powered proposal intelligence platform for consultants and agencies. It tracks
proposal opens, section engagement, and uses AI coaching to improve win rates.

## Architecture

- **Framework**: Next.js 15 App Router (Server Components + Client Components)
- **API**: tRPC v11 with SuperJSON, all procedures Zod-validated
- **Database**: Supabase (PostgreSQL) — NO Prisma, direct client queries only
- **Auth**: Supabase Auth via `@supabase/ssr`
- **Styling**: Tailwind CSS + shadcn/ui (CVA + Radix UI primitives)
- **State**: TanStack Query (server state) + Zustand (UI state)

## Critical Rules

1. **NEVER use `any` type** — use `unknown` + type guards
2. **ALL Supabase queries go through the RLS client** — use `createClient()` from `@/lib/supabase/server` in server components/tRPC, `createServiceRoleClient()` only for webhooks and public proposal reads
3. **Zod validates all tRPC inputs** — every procedure has `.input(SomeZodSchema)`
4. **Every page needs a loading skeleton** — use `<Skeleton>` from `@/components/ui/skeleton`
5. **React Hook Form + Zod resolvers** for all forms — `zodResolver` from `@hookform/resolvers/zod`

## Route Groups

- `(auth)` — unauthenticated: `/login`, `/signup`, `/callback`
- `(app)` — authenticated: redirects to `/login` if no session (enforced in layout)
- `p/[slug]` — public proposal viewer — NO auth required, uses service role client

## tRPC Pattern

```typescript
// Server component (RSC)
import { api } from '@/trpc/server';
const data = await api.proposals.list({ orgId, ... });

// Client component
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
const trpc = useTRPC();
const { data } = useQuery(trpc.proposals.list.queryOptions({ orgId, ... }));
```

## Supabase Client Selection

| Context | Client to use |
|---|---|
| Server Components / tRPC ctx | `createClient()` from `@/lib/supabase/server` |
| Client Components | `createClient()` from `@/lib/supabase/client` |
| Stripe webhooks | `createServiceRoleClient()` — bypasses RLS |
| Public proposal view | `createServiceRoleClient()` — bypasses RLS |
| Tracking pixel | `createServiceRoleClient()` — no auth context |

## Component Conventions

- All shadcn/ui components live in `src/components/ui/`
- Domain components in `src/components/{domain}/`
- Use `cn()` from `@/lib/utils` for conditional classes
- CVA for components with multiple variants

## Database Schema

10 tables: `users`, `organizations`, `organization_members`, `subscriptions`, `templates`,
`template_sections`, `proposals`, `proposal_sections`, `tracking_events`, `ai_coaching_logs`

RLS is enabled on all tables. See `supabase/migrations/` for full schema + policies.

## Environment Variables

See `env.example` for all required vars. The `src/lib/env.ts` file validates them at startup
using Zod. Server vars are never exposed to the client.

## Testing

- Unit tests: `pnpm test` (Vitest)
- Type check: `pnpm typecheck`
- E2E: `pnpm test:e2e` (Playwright)
- Lint: `pnpm lint`

## Common Gotchas

- `NEXTAUTH_URL` was used in older code — the correct env var is `NEXT_PUBLIC_APP_URL`
- The `cuid2` package exports `createId` directly — import as `import { createId } from 'cuid2'`
- Tracking events use `sendBeacon` for reliability on page unload
- Stripe webhook handler needs raw body — do NOT use `await req.json()` before `constructEvent`
